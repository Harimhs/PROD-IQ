# unified_backend.py

#!/usr/bin/env python3
"""
Unified Backend - Combines SQL and Vector Search
Single interface for both relational and semantic queries
"""
from database.backend_executor import QueryExecutor
from database.vector_search import VectorSearch
from typing import Dict, Optional

class UnifiedBackend:
    """
    Unified backend that handles both SQL and Vector queries
    Routes requests to appropriate backend based on intent
    """
    
    def __init__(self):
        """Initialize both SQL and Vector backends"""
        self.sql = QueryExecutor()
        self.vector = VectorSearch()
        
        print("✅ Unified Backend initialized")
        print("   - SQL Backend: Ready")
        print("   - Vector Backend: Ready")
    
    def execute(self, llm_output: dict) -> Dict:
        """
        Execute query based on LLM output
        Routes to SQL or Vector backend based on intent
        
        Args:
            llm_output: {
                "intent": "benchmark" | "semantic_similar" | "cross_validate" | ...,
                "params": {...}
            }
        
        Returns:
            Unified result format
        """
        
        intent = llm_output.get('intent', '')
        params = llm_output.get('params', {})
        
        # SQL-based intents
        sql_intents = [
            'benchmark', 'average', 'typical',
            'statistics', 'stats',
            'top', 'best', 'winning',
            'compare', 'comparison',
            'failure', 'success',
            'price_range'
        ]
        
        # Vector-based intents
        vector_intents = [
            'semantic_similar', 'similar', 'competitor',
            'cross_validate', 'validate',
            'find_competitors', 'market_gap'
        ]
        
        # Route to appropriate backend
        if any(keyword in intent.lower() for keyword in sql_intents):
            return self._execute_sql(llm_output)
        
        elif any(keyword in intent.lower() for keyword in vector_intents):
            return self._execute_vector(llm_output)
        
        else:
            # Default to SQL
            return self._execute_sql(llm_output)
    
    def _execute_sql(self, llm_output: dict) -> Dict:
        """Execute SQL query"""
        try:
            result = self.sql.execute_from_llm_output(llm_output)
            return {
                'success': True,
                'backend': 'sql',
                'data': result
            }
        except Exception as e:
            return {
                'success': False,
                'backend': 'sql',
                'error': str(e)
            }
    
    def _execute_vector(self, llm_output: dict) -> Dict:
        """Execute vector search"""
        try:
            intent = llm_output.get('intent', '')
            params = llm_output.get('params', {})
            
            if 'cross_validate' in intent or 'validate' in intent:
                # Cross-validation query
                result = self.vector.cross_validate_assumption(
                    query_text=params.get('query_text', params.get('description', '')),
                    assumed_revenue=params.get('assumed_revenue', 0),
                    category=params.get('category', ''),
                    n_results=params.get('n_results', 20)
                )
                
            elif 'competitor' in intent:
                # Competitor search
                result = self.vector.find_competitors(
                    query_text=params.get('query_text', params.get('description', '')),
                    category=params.get('category', ''),
                    n_results=params.get('n_results', 10)
                )
                
            else:
                # General semantic search
                result = self.vector.find_similar_products(
                    query_text=params.get('query_text', params.get('description', '')),
                    n_results=params.get('n_results', 10),
                    category=params.get('category'),
                    source=params.get('source')
                )
            
            return {
                'success': True,
                'backend': 'vector',
                'data': result
            }
        
        except Exception as e:
            return {
                'success': False,
                'backend': 'vector',
                'error': str(e)
            }
