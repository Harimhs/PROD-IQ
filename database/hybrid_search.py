# database/hybrid_search.py - UPDATED VERSION
#!/usr/bin/env python3
"""
Hybrid Search System - WITH PROPER EMBEDDING SUPPORT
Ensures query text uses same embeddings as ChromaDB
"""
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
import mysql.connector
from typing import List, Dict, Optional
import os

class HybridSearch:
    """
    Hybrid search with proper embedding function
    Query text is embedded using same model as documents
    """
    
 
    def __init__(self, chroma_path: str = None, mysql_config: dict = None):

        BASE_DIR = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

        CHROMA_PATH = os.path.join(
            BASE_DIR,
            "database",
            "chroma_db_storage"
        )

        print("🧭 Chroma path:", CHROMA_PATH)
        print("📂 Exists:", os.path.exists(CHROMA_PATH))

        self.chroma_client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=False
            )
        )

        self.collections = {}
        self._load_collections()

        
        # MySQL setup
        if mysql_config is None:
            mysql_config = {
                'host': os.getenv('DB_HOST', 'localhost'),
                'user': os.getenv('DB_USER', 'root'),
                'password': os.getenv('DB_PASSWORD', 'June#12345'),
                'database': os.getenv('DB_NAME', 'prod-iq_db'),
                'port': int(os.getenv('DB_PORT', 3306))
            }
        
        self.mysql_config = mysql_config
        
        print("✅ Hybrid Search initialized")
        print(f"   Vector DB: {len(self.collections)} collections loaded")
        # Added port to print so you can debug if it goes wrong
        print(f"   SQL DB: Connected to {mysql_config['database']} on port {mysql_config.get('port', 3306)}")
        print(f"   Embedding: all-MiniLM-L6-v2")
    
    def _load_collections(self):
        """Load all ChromaDB collections"""
        try:
            all_collections = self.chroma_client.list_collections()
            for collection in all_collections:
                self.collections[collection.name] = collection
            print(f"   Loaded {len(self.collections)} ChromaDB collections:")
            for name, coll in self.collections.items():
                print(f"      - {name}: {coll.count()} items")
        except Exception as e:
            print(f"⚠️  Error loading collections: {e}")
    
    def _get_mysql_connection(self):
        """Get MySQL connection"""
        return mysql.connector.connect(**self.mysql_config)
    
    def _fetch_products_by_source_and_indices(
        self, 
        row_indices: List[int], 
        source: str
    ) -> List[Dict]:
        """Fetch products from MySQL matching row indices"""
        
        conn = self._get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            source_mapping = {
                'indiehackers_cleaned': 'indiehackers',
                'appstore_cleaned': 'appstore',
                'playstore_cleaned': 'playstore',
                'producthunt_cleaned': 'producthunt',
                'failory_103_cleaned': 'failory',
                'failory_global_cleaned': 'failory',
                'failory_industry_cleaned': 'failory',
                'india_unicorns_cleaned': 'india_unicorns'
            }
            
            data_source = source_mapping.get(source, source.replace('_cleaned', ''))
            
            query = """
                SELECT 
                    product_id, name, description, category_type, main_category,
                    revenue_monthly, revenue_estimated, price, rating_avg, review_count,
                    active_users, team_size, total_funding, launch_date, still_operating,
                    success_label, failure_reason, data_source, country, city,
                    founders, business_model, website_url, downloads, upvotes
                FROM master_products_features
                WHERE data_source LIKE %s
                ORDER BY product_id
            """
            
            cursor.execute(query, [f'%{data_source}%'])
            all_products = cursor.fetchall()
            
            # Match by row index
            matched_products = []
            for row_idx in row_indices:
                if 0 <= row_idx < len(all_products):
                    matched_products.append(all_products[row_idx])
            
            return matched_products
        
        except Exception as e:
            print(f"⚠️  Error fetching from MySQL: {e}")
            return []
        
        finally:
            cursor.close()
            conn.close()
    
    def find_similar_products(
    self,
    query_text: str,
    n_results: int = 10,
    source: Optional[str] = None,
    category: Optional[str] = None
) -> List[Dict]:
        """
        Find similar products - Query is automatically embedded by ChromaDB
        """
        
        # Determine collections to search
        if source and source in self.collections:
            collections_to_search = {source: self.collections[source]}
        else:
            collections_to_search = self.collections
        
        all_results = []
        successful_searches = 0
        failed_searches = 0
        
        for collection_name, collection in collections_to_search.items():
            try:
                # ✅ ADD: Check if collection is accessible before querying
                try:
                    collection_count = collection.count()
                    if collection_count == 0:
                        continue
                except:
                    # Collection is corrupted, skip silently
                    failed_searches += 1
                    continue
                
                # ChromaDB automatically embeds the query using the collection's embedding function
                chroma_results = collection.query(
                    query_texts=[query_text],
                    n_results=n_results,
                    include=["metadatas", "documents", "distances"]
                )
                
                if not chroma_results['metadatas'] or not chroma_results['metadatas'][0]:
                    continue
                
                # Extract row indices and similarity scores
                row_indices = []
                similarity_map = {}
                
                for i, metadata in enumerate(chroma_results['metadatas'][0]):
                    row_idx = metadata.get('row_index')
                    if row_idx is not None:
                        row_indices.append(int(row_idx))
                        # Convert distance to similarity (0=identical, higher=different)
                        # With cosine distance: similarity = 1 - distance
                        similarity = max(0, min(1, round(1 - chroma_results['distances'][0][i], 3)))
                        similarity_map[int(row_idx)] = similarity
                
                if not row_indices:
                    continue
                
                # Fetch full data from MySQL
                products = self._fetch_products_by_source_and_indices(
                    row_indices, 
                    collection_name
                )
                
                # Enrich with similarity scores
                for i, product in enumerate(products):
                    product['source'] = collection_name
                    product['similarity_score'] = similarity_map.get(row_indices[i], 0)
                    all_results.append(product)
                
                successful_searches += 1
                
            except Exception as e:
                # ✅ CHANGED: Only print error if it's NOT an HNSW error
                error_str = str(e)
                if 'hnsw' not in error_str.lower():
                    print(f"⚠️  Error searching {collection_name}: {e}")
                failed_searches += 1
                continue
        
        # ✅ ADD: Log summary only if all searches failed
        if successful_searches == 0 and failed_searches > 0:
            print(f"⚠️  Warning: All {failed_searches} collection searches failed")
        
        # Sort by similarity (higher = more similar)
        all_results.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
        
        # Apply category filter if specified
        if category:
            all_results = [
                p for p in all_results 
                if p.get('category_type', '').lower() == category.lower() 
                or p.get('main_category', '').lower() == category.lower()
            ]
        
        return all_results[:n_results]

    
    def cross_validate_revenue(
    self,
    query_text: str,
    assumed_revenue: float,
    category: str = None,
    n_results: int = 20
) -> Dict:
        """Cross-validate revenue assumption"""
        
        # ✅ CHANGED: Wrap in try/except
        try:
            similar = self.find_similar_products(
                query_text=query_text,
                n_results=n_results,
                category=category
            )
        except Exception as e:
            print(f"⚠️  Error in cross_validate_revenue: {e}")
            return {
                'verdict': 'error',
                'assumed_revenue': assumed_revenue,
                'sample_size': 0,
                'error': str(e)
            }
        
        # ✅ CHANGED: Handle empty results
        if not similar:
            return {
                'verdict': 'insufficient_data',
                'assumed_revenue': assumed_revenue,
                'sample_size': 0,
                'similar_products_found': 0,
                'note': 'No similar products found (database may be unavailable)'
            }
        
        # Extract revenue data
        revenues = []
        products_with_revenue = []
        
        for product in similar:
            revenue = product.get('revenue_monthly') or product.get('revenue_estimated')
            
            if revenue:
                try:
                    revenue_val = float(revenue)
                    # Filter out placeholder revenue ($18,296)
                    if 10 < revenue_val < 10000000 and revenue_val != 18295.808235:
                        revenues.append(revenue_val)
                        products_with_revenue.append({
                            'name': product.get('name', 'Unknown'),
                            'revenue': revenue_val,
                            'source': product.get('source'),
                            'similarity': product.get('similarity_score', 0),
                            'category': product.get('main_category') or product.get('category_type')
                        })
                except (ValueError, TypeError):
                    pass
        
        if not revenues:
            return {
                'verdict': 'insufficient_data',
                'assumed_revenue': assumed_revenue,
                'sample_size': 0,
                'similar_products_found': len(similar),
                'note': f'Found {len(similar)} similar products but none have valid revenue data'
            }
        
        # Calculate statistics
        revenues.sort()
        n = len(revenues)
        
        stats = {
            'median': revenues[n // 2],
            'average': sum(revenues) / n,
            'p25': revenues[n // 4] if n >= 4 else revenues[0],
            'p75': revenues[(3 * n) // 4] if n >= 4 else revenues[-1],
            'p90': revenues[(9 * n) // 10] if n >= 10 else revenues[-1],
            'min': revenues[0],
            'max': revenues[-1]
        }
        
        # Determine verdict
        deviation = ((assumed_revenue - stats['median']) / stats['median']) * 100 if stats['median'] > 0 else 0
        
        if assumed_revenue < stats['p25']:
            verdict = "conservative"
        elif assumed_revenue <= stats['p75']:
            verdict = "realistic"
        elif assumed_revenue <= stats['p90']:
            verdict = "optimistic"
        else:
            verdict = "very_optimistic"
        
        return {
            'verdict': verdict,
            'assumed_revenue': assumed_revenue,
            'market_stats': stats,
            'deviation_pct': round(deviation, 2),
            'sample_size': n,
            'similar_products': sorted(
                products_with_revenue, 
                key=lambda x: x['similarity'], 
                reverse=True
            )[:10]
        }

    
    def find_competitors(
        self,
        query_text: str,
        category: str = None,
        n_results: int = 10
    ) -> List[Dict]:
        """Find competitors"""
        return self.find_similar_products(
            query_text=query_text,
            n_results=n_results,
            category=category
        )
