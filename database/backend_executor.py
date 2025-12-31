# backend_executor.py
"""
Query Executor - Connects LLM output to SQL templates
"""
import mysql.connector
import os
from typing import Dict, List
from database.query_templates import QUERY_TEMPLATES, METRIC_COLUMNS
from database.intent_mapper import get_template_from_intent

class QueryExecutor:
    def __init__(self):
        """Initialize database connection"""
        self.conn = mysql.connector.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=int(os.getenv('DB_PORT', 3306)),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', 'Peaceat14'),
            database=os.getenv('DB_NAME', 'prodiq_db')
        )
    
    def execute_from_llm_output(self, llm_output: dict) -> dict:
        """
        Execute query based on LLM output
        
        Args:
            llm_output: {
                "intent": "benchmark",
                "params": {
                    "category": "saas",
                    "metric": "revenue"
                }
            }
        
        Returns:
            {
                'template_used': str,
                'results': list,
                'params': dict
            }
        """
        
        # Step 1: Get template name from intent
        intent = llm_output.get('intent', 'benchmark')
        template_name = get_template_from_intent(intent)
        
        # Step 2: Get template
        if template_name not in QUERY_TEMPLATES:
            raise ValueError(f"Template '{template_name}' not found")
        
        template = QUERY_TEMPLATES[template_name]
        
        # Step 3: Prepare parameters
        params = llm_output.get('params', {})
        params = self._prepare_params(params, template)
        
        # Step 4: Build query with filters
        query = self._build_query(template, params)
        
        # Step 5: Execute
        cursor = self.conn.cursor(dictionary=True)
        cursor.execute(query, params)
        results = cursor.fetchall()
        
        return {
            'template_used': template_name,
            'query_executed': query,
            'params': params,
            'results': results,
            'count': len(results)
        }
    
    def _prepare_params(self, params: dict, template: dict) -> dict:
        """Prepare and validate parameters"""
        
        # Add defaults
        if 'limit' not in params:
            params['limit'] = 10
        
        # Handle metric column mapping
        if 'metric' in params:
            params['metric_column'] = METRIC_COLUMNS.get(
                params['metric'].lower(), 
                'avg_revenue'
            )
        
        # Normalize category to lowercase
        if 'category' in params:
            params['category'] = params['category'].lower().strip()
        
        # Ensure numeric types
        for key in ['min_price', 'max_price', 'min_users', 'limit']:
            if key in params:
                params[key] = float(params[key]) if 'price' in key else int(params[key])
        
        return params
    
    def _build_query(self, template: dict, params: dict) -> str:
        """Build final query with optional filters"""
        query = template['query']
        
        # Handle price filter
        if '{price_filter}' in query:
            if 'min_price' in params and 'max_price' in params:
                price_filter = "AND price BETWEEN %(min_price)s AND %(max_price)s"
            elif 'min_price' in params:
                price_filter = "AND price >= %(min_price)s"
            elif 'max_price' in params:
                price_filter = "AND price <= %(max_price)s"
            else:
                price_filter = ""
            query = query.replace('{price_filter}', price_filter)
        
        # Handle users filter
        if '{users_filter}' in query:
            if 'min_users' in params:
                users_filter = "AND active_users >= %(min_users)s"
            else:
                users_filter = ""
            query = query.replace('{users_filter}', users_filter)
        
        # Handle metric column
        if '{metric_column}' in query:
            metric_col = params.get('metric_column', 'avg_revenue')
            query = query.replace('{metric_column}', metric_col)
        
        return query
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()
