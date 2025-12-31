# vector_search_text_based.py

# database/vector_search_text_based.py
#!/usr/bin/env python3
"""
Vector Search - TEXT-BASED VERSION
Works with ChromaDB that stores data in documents, not metadata
"""
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Optional
import re

import os

class VectorSearchTextBased:
    def __init__(self, persist_directory: str = None):

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

        self.client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=False
            )
        )

        
        self.collections = {}
        self._load_collections()
        
        print(f"✅ Loaded {len(self.collections)} ChromaDB collections")
        for name in self.collections.keys():
            count = self.collections[name].count()
            print(f"   - {name}: {count} items")
    
    def _load_collections(self):
        """Load all collections"""
        try:
            all_collections = self.client.list_collections()
            for collection in all_collections:
                self.collections[collection.name] = collection
        except Exception as e:
            print(f"⚠️  Error loading collections: {e}")
    
    def find_similar_products(
        self, 
        query_text: str, 
        n_results: int = 10,
        source: Optional[str] = None
    ) -> Dict:
        """
        Find similar products using semantic search
        Returns document text + metadata
        """
        
        # Determine collections to search
        if source and source in self.collections:
            collections_to_search = {source: self.collections[source]}
        else:
            collections_to_search = self.collections
        
        all_results = {}
        
        for collection_name, collection in collections_to_search.items():
            try:
                results = collection.query(
                    query_texts=[query_text],
                    n_results=n_results,
                    include=["metadatas", "documents", "distances"]
                )
                
                # Format results
                formatted_results = []
                if results['documents'] and results['documents'][0]:
                    for i, doc in enumerate(results['documents'][0]):
                        formatted_results.append({
                            'row_index': results['metadatas'][0][i].get('row_index') if results['metadatas'][0] else None,
                            'source': collection_name,
                            'document': doc,
                            'similarity_score': round(1 - results['distances'][0][i], 3) if results['distances'] else 0
                        })
                
                all_results[collection_name] = {
                    'count': len(formatted_results),
                    'results': formatted_results
                }
                
            except Exception as e:
                print(f"⚠️  Error searching {collection_name}: {e}")
                all_results[collection_name] = {'count': 0, 'results': []}
        
        return all_results
    
    def find_competitors(
        self,
        query_text: str,
        n_results: int = 10,
        sources: Optional[List[str]] = None
    ) -> List[Dict]:
        """
        Find competitors across sources
        """
        
        # Search specific sources or all
        results = {}
        if sources:
            for source in sources:
                if source in self.collections:
                    source_results = self.find_similar_products(
                        query_text=query_text,
                        n_results=n_results,
                        source=source
                    )
                    results.update(source_results)
        else:
            results = self.find_similar_products(
                query_text=query_text,
                n_results=n_results
            )
        
        # Flatten results
        competitors = []
        for source, data in results.items():
            if data['count'] > 0:
                for product in data['results']:
                    competitors.append({
                        'source': source,
                        'document': product['document'][:300] + "..." if len(product['document']) > 300 else product['document'],
                        'similarity_score': product['similarity_score']
                    })
        
        # Sort by similarity
        competitors.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        return competitors[:n_results]
    
    def get_collection_stats(self) -> Dict:
        """Get collection statistics"""
        stats = {}
        for name, collection in self.collections.items():
            try:
                stats[name] = {
                    'count': collection.count(),
                    'status': 'active'
                }
            except Exception as e:
                stats[name] = {
                    'count': 0,
                    'status': f'error: {str(e)}'
                }
        return stats
