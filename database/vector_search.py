#Vector Search

#!/usr/bin/env python3
"""
Vector Search Handler for ChromaDB - FIXED for Multiple Schemas
Handles 8 different collection schemas intelligently
"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
from chromadb.utils import embedding_functions


EMBEDDING_FUNCTION = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

class VectorSearch:
    """
    Handles semantic search across 8 ChromaDB collections with different schemas
    Collections: Product Hunt, Indie Hackers, App Store, Play Store, 
                 Failory Global, Failory India, Failory 103, India Unicorns
    """
    
    # Column mapping for each collection type
    COLUMN_MAPPING = {
        'appstore_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': 'price',
            'rating': 'rating_avg',
            'reviews': 'review_count',
            'revenue': None,  # Not available
            'users': None,
            'funding': None,
            'launch_date': 'launch_date',
            'team_size': None,
            'success_label': None,
            'failure_reason': None
        },
        'playstore_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': 'price',
            'rating': 'rating_avg',
            'reviews': 'review_count',
            'revenue': None,
            'users': 'downloads',
            'funding': None,
            'launch_date': 'launch_date',
            'team_size': None,
            'success_label': 'success_label',
            'failure_reason': None
        },
        'producthunt_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': None,
            'rating': 'rating_avg',
            'reviews': 'review_count',
            'revenue': None,
            'users': 'upvotes',  # Use upvotes as proxy
            'funding': None,
            'launch_date': 'launch_date',
            'team_size': None,
            'success_label': 'still_operating',
            'failure_reason': None
        },
        'indiehackers_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': None,
            'rating': None,
            'reviews': None,
            'revenue': 'revenue_monthly',
            'users': 'active_users',
            'funding': None,
            'launch_date': 'launch_date',
            'team_size': 'team_size',
            'success_label': 'success_label',
            'failure_reason': 'failure_reason'
        },
        'failory_103_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': None,
            'rating': None,
            'reviews': None,
            'revenue': None,
            'users': None,
            'funding': 'total_funding',
            'launch_date': 'launch_date',
            'team_size': 'team_size',
            'success_label': 'exit_status',
            'failure_reason': 'failure_reason'
        },
        'failory_global_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': None,
            'rating': None,
            'reviews': None,
            'revenue': None,
            'users': None,
            'funding': 'total_funding',
            'launch_date': 'launch_date',
            'team_size': 'team_size',
            'success_label': 'still_operating',
            'failure_reason': None
        },
        'failory_industry_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': None,
            'rating': None,
            'reviews': None,
            'revenue': None,
            'users': None,
            'funding': 'total_funding',
            'launch_date': 'launch_date',
            'team_size': 'team_size',
            'success_label': 'still_operating',
            'failure_reason': None
        },
        'india_unicorns_cleaned': {
            'name': 'name',
            'description': 'description',
            'category': 'category_type',
            'price': None,
            'rating': None,
            'reviews': None,
            'revenue': None,
            'users': None,
            'funding': 'total_funding',
            'launch_date': 'launch_date',
            'team_size': 'team_size',
            'success_label': None,
            'failure_reason': None,
            'valuation': 'market_value_estimate'
        }
    }
    
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).resolve().parent.parent

    def __init__(self, persist_directory: str = None):
        if persist_directory is None:
            persist_directory = PROJECT_ROOT / "database" / "chroma_db_storage"

        self.client = chromadb.PersistentClient(
            path=str(persist_directory),
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=False
            )
        )

        self.collections = {}
        self._load_collections()

    
    def _load_collections(self):
        try:
            all_collections = self.client.list_collections()

            for col in all_collections:
                self.collections[col.name] = self.client.get_collection(
                    name=col.name,
                    embedding_function=EMBEDDING_FUNCTION  # 🔥 THIS IS THE KEY
                )
            print("📦 Chroma collections found:")
            for name, col in self.collections.items():
                print(f" - {name}: {col.count()} vectors")


        except Exception as e:
            print(f"⚠️ Error loading collections: {e}")

    
    def _get_field_value(self, metadata: dict, collection_name: str, field: str):
        """
        Get field value using collection-specific mapping
        Falls back gracefully if field doesn't exist
        """
        if collection_name not in self.COLUMN_MAPPING:
            # Unknown collection, try direct access
            return metadata.get(field)
        
        mapping = self.COLUMN_MAPPING[collection_name]
        actual_column = mapping.get(field)
        
        if actual_column is None:
            return None
        
        return metadata.get(actual_column)
    
    def _normalize_metadata(self, metadata: dict, collection_name: str) -> dict:
        """
        Normalize metadata to standard fields across all collections
        """
        return {
            'name': self._get_field_value(metadata, collection_name, 'name'),
            'description': self._get_field_value(metadata, collection_name, 'description'),
            'category': self._get_field_value(metadata, collection_name, 'category'),
            'price': self._get_field_value(metadata, collection_name, 'price'),
            'rating': self._get_field_value(metadata, collection_name, 'rating'),
            'reviews': self._get_field_value(metadata, collection_name, 'reviews'),
            'revenue': self._get_field_value(metadata, collection_name, 'revenue'),
            'users': self._get_field_value(metadata, collection_name, 'users'),
            'funding': self._get_field_value(metadata, collection_name, 'funding'),
            'launch_date': self._get_field_value(metadata, collection_name, 'launch_date'),
            'team_size': self._get_field_value(metadata, collection_name, 'team_size'),
            'success_label': self._get_field_value(metadata, collection_name, 'success_label'),
            'failure_reason': self._get_field_value(metadata, collection_name, 'failure_reason'),
            'source': collection_name,
            'raw_metadata': metadata  # Keep original for debugging
        }
    
    def find_similar_products(
        self, 
        query_text: str, 
        n_results: int = 10,
        category: Optional[str] = None,
        source: Optional[str] = None,
        min_revenue: Optional[float] = None,
        max_revenue: Optional[float] = None
    ) -> Dict:
        """
        Find similar products using semantic search
        
        Args:
            query_text: Description of product to find similar to
            n_results: Number of results to return per collection
            category: Filter by category (optional)
            source: Specific collection to search (optional)
            min_revenue: Minimum monthly revenue filter
            max_revenue: Maximum monthly revenue filter
        
        Returns:
            Dict with normalized results from each collection
        """
        
        # Build metadata filter (category only, since column names vary)
        where_filter = None
        if category:
            # Try different category column names
            where_filter = {"category_type": category}
        
        # Determine which collections to search
        if source and source in self.collections:
            collections_to_search = {source: self.collections[source]}
        else:
            collections_to_search = self.collections
        
        # Search across collections
        all_results = {}
        
        for collection_name, collection in collections_to_search.items():
            try:
                # Query collection
                results = collection.query(
                    query_texts=[query_text],
                    n_results=n_results,
                    where=where_filter if where_filter else None,
                    include=["metadatas", "documents", "distances"]
                )
                
                # Normalize metadata
                normalized_results = []
                if results['metadatas'] and results['metadatas'][0]:
                    for i, raw_metadata in enumerate(results['metadatas'][0]):
                        normalized = self._normalize_metadata(raw_metadata, collection_name)
                        
                        # Apply revenue filter if specified
                        revenue = normalized.get('revenue')
                        if revenue:
                            try:
                                revenue = float(revenue)
                                if min_revenue and revenue < min_revenue:
                                    continue
                                if max_revenue and revenue > max_revenue:
                                    continue
                            except (ValueError, TypeError):
                                pass
                        
                        normalized['similarity_score'] = round(1 - results['distances'][0][i], 3)
                        normalized['description_preview'] = results['documents'][0][i][:200]
                        normalized_results.append(normalized)
                
                all_results[collection_name] = {
                    'count': len(normalized_results),
                    'results': normalized_results
                }
                
            except Exception as e:
                print(f"⚠️  Error searching {collection_name}: {e}")
                all_results[collection_name] = {'count': 0, 'results': []}
        
        return all_results
    
    def cross_validate_assumption(
        self,
        query_text: str,
        assumed_revenue: float,
        category: str,
        n_results: int = 20
    ) -> Dict:
        """
        Cross-validate revenue assumption against similar products
        Only uses collections that have revenue data (indiehackers mainly)
        
        Args:
            query_text: Description of your product
            assumed_revenue: Revenue you're assuming
            category: Product category
            n_results: Number of similar products to compare
        
        Returns:
            Validation results with statistics
        """
        
        # Find similar products
        similar = self.find_similar_products(
            query_text=query_text,
            n_results=n_results,
            category=category
        )
        
        # Collect revenue data from all sources
        all_revenues = []
        all_products = []
        
        for source, data in similar.items():
            if data['count'] > 0:
                for product in data['results']:
                    revenue = product.get('revenue')
                    
                    if revenue:
                        try:
                            revenue = float(revenue)
                            if revenue > 0:
                                all_revenues.append(revenue)
                                all_products.append({
                                    'source': source,
                                    'name': product.get('name', 'Unknown'),
                                    'revenue': revenue,
                                    'price': product.get('price'),
                                    'users': product.get('users'),
                                    'similarity': product.get('similarity_score', 0)
                                })
                        except (ValueError, TypeError):
                            pass
        
        # Calculate statistics
        if all_revenues:
            all_revenues.sort()
            n = len(all_revenues)
            
            avg_revenue = sum(all_revenues) / n
            median_revenue = all_revenues[n // 2]
            p25_revenue = all_revenues[n // 4] if n >= 4 else all_revenues[0]
            p75_revenue = all_revenues[(3 * n) // 4] if n >= 4 else all_revenues[-1]
            p90_revenue = all_revenues[(9 * n) // 10] if n >= 10 else all_revenues[-1]
            
            # Determine if assumption is realistic
            deviation = ((assumed_revenue - median_revenue) / median_revenue) * 100 if median_revenue > 0 else 0
            
            if assumed_revenue < p25_revenue:
                verdict = "conservative"
            elif assumed_revenue <= p75_revenue:
                verdict = "realistic"
            elif assumed_revenue <= p90_revenue:
                verdict = "optimistic"
            else:
                verdict = "very_optimistic"
            
            return {
                'verdict': verdict,
                'assumed_revenue': assumed_revenue,
                'market_stats': {
                    'avg_revenue': round(avg_revenue, 2),
                    'median_revenue': round(median_revenue, 2),
                    'p25_revenue': round(p25_revenue, 2),
                    'p75_revenue': round(p75_revenue, 2),
                    'p90_revenue': round(p90_revenue, 2),
                    'min_revenue': round(all_revenues[0], 2),
                    'max_revenue': round(all_revenues[-1], 2)
                },
                'deviation_pct': round(deviation, 2),
                'sample_size': n,
                'similar_products': sorted(all_products, key=lambda x: x['similarity'], reverse=True)[:10],
                'data_sources': list(set(p['source'] for p in all_products))
            }
        else:
            return {
                'verdict': 'insufficient_data',
                'assumed_revenue': assumed_revenue,
                'sample_size': 0,
                'similar_products': [],
                'note': 'No revenue data found in similar products. Try broader search or different category.'
            }
    
    def find_competitors(
        self,
        query_text: str,
        category: str,
        n_results: int = 10
    ) -> List[Dict]:
        """
        Find direct competitors across all sources
        
        Args:
            query_text: Your product description
            category: Product category
            n_results: Number of competitors to return
        
        Returns:
            List of competitor products with normalized fields
        """
        
        similar = self.find_similar_products(
            query_text=query_text,
            n_results=n_results,
            category=category
        )
        
        competitors = []
        
        for source, data in similar.items():
            if data['count'] > 0:
                for product in data['results']:
                    competitors.append({
                        'source': source,
                        'name': product.get('name', 'Unknown'),
                        'description': product.get('description_preview', ''),
                        'category': product.get('category', category),
                        'price': product.get('price'),
                        'rating': product.get('rating'),
                        'reviews': product.get('reviews'),
                        'revenue': product.get('revenue'),
                        'users': product.get('users'),
                        'funding': product.get('funding'),
                        'team_size': product.get('team_size'),
                        'launch_date': product.get('launch_date'),
                        'success_label': product.get('success_label'),
                        'similarity_score': product.get('similarity_score', 0)
                    })
        
        # Sort by similarity
        competitors.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return competitors[:n_results]
    
    def get_collection_stats(self) -> Dict:
        """Get statistics for all collections"""
        stats = {}
        
        for name, collection in self.collections.items():
            try:
                count = collection.count()
                
                # Get sample to determine available fields
                sample = collection.get(limit=1, include=["metadatas"])
                available_fields = []
                if sample['metadatas'] and len(sample['metadatas']) > 0:
                    available_fields = list(sample['metadatas'][0].keys())
                
                stats[name] = {
                    'count': count,
                    'status': 'active',
                    'available_fields': available_fields
                }
            except Exception as e:
                stats[name] = {
                    'count': 0,
                    'status': f'error: {str(e)}',
                    'available_fields': []
                }
        
        return stats

