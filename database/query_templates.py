# database/query_templates.py
"""
SQL Query Templates for Product Analytics
All queries are parameterized for security
"""

QUERY_TEMPLATES = {
    
    # Benchmark queries
    "get_category_benchmark": {
        "query": """
            SELECT 
                category,
                avg_revenue,
                avg_price,
                avg_rating,
                median_reviews,
                avg_funding,
                success_rate
            FROM category_benchmarks
            WHERE category = %(category)s
        """,
        "params": ["category"],
        "description": "Get all benchmarks for a category"
    },
    
    "get_specific_metric": {
        "query": """
            SELECT 
                category,
                {metric_column}
            FROM category_benchmarks
            WHERE category = %(category)s
        """,
        "params": ["category", "metric_column"],
        "description": "Get specific metric for a category"
    },
    
    # Product queries
    "find_similar_products": {
        "query": """
            SELECT 
                name,
                price,
                rating_avg,
                active_users,
                revenue_monthly,
                team_size
            FROM master_products_features
            WHERE main_category = %(category)s
              AND still_operating = 1
              {price_filter}
              {users_filter}
            ORDER BY rating_avg DESC
            LIMIT %(limit)s
        """,
        "params": ["category", "limit"],
        "optional_params": ["min_price", "max_price", "min_users"],
        "description": "Find similar products in category"
    },
    
    "get_top_performers": {
        "query": """
            SELECT 
                name,
                revenue_monthly,
                active_users,
                price,
                rating_avg,
                success_factors
            FROM master_products_features
            WHERE main_category = %(category)s
              AND success_label = 1
              AND still_operating = 1
            ORDER BY revenue_monthly DESC
            LIMIT %(limit)s
        """,
        "params": ["category", "limit"],
        "description": "Get top performing products"
    },
    
    "compare_products": {
        "query": """
            SELECT 
                name,
                price,
                rating_avg,
                active_users,
                revenue_monthly,
                team_size,
                burn_rate_monthly_est
            FROM master_products_features
            WHERE main_category = %(category)s
              AND price BETWEEN %(min_price)s AND %(max_price)s
              AND still_operating = 1
            ORDER BY revenue_monthly DESC
            LIMIT %(limit)s
        """,
        "params": ["category", "min_price", "max_price", "limit"],
        "description": "Compare products in price range"
    },
    
    "get_category_stats": {
        "query": """
            SELECT 
                COUNT(*) as total_products,
                AVG(price) as avg_price,
                AVG(rating_avg) as avg_rating,
                AVG(revenue_monthly) as avg_revenue,
                AVG(active_users) as avg_users,
                AVG(team_size) as avg_team_size,
                SUM(CASE WHEN success_label = 1 THEN 1 ELSE 0 END) as successful_count,
                SUM(CASE WHEN still_operating = 1 THEN 1 ELSE 0 END) as active_count
            FROM master_products_features
            WHERE main_category = %(category)s
        """,
        "params": ["category"],
        "description": "Get aggregated statistics for category"
    },
    
    "get_failure_insights": {
        "query": """
            SELECT 
                failure_reason_cat,
                COUNT(*) as count,
                AVG(age_months) as avg_lifetime_months
            FROM master_products_features
            WHERE main_category = %(category)s
              AND success_label = 0
              AND failure_reason_cat IS NOT NULL
            GROUP BY failure_reason_cat
            ORDER BY count DESC
            LIMIT 5
        """,
        "params": ["category"],
        "description": "Get common failure reasons in category"
    },
    
    "get_success_factors": {
        "query": """
            SELECT 
                success_reason_cat,
                COUNT(*) as count,
                AVG(revenue_monthly) as avg_revenue
            FROM master_products_features
            WHERE main_category = %(category)s
              AND success_label = 1
              AND success_reason_cat IS NOT NULL
            GROUP BY success_reason_cat
            ORDER BY count DESC
            LIMIT 5
        """,
        "params": ["category"],
        "description": "Get common success factors in category"
    },
    
    "price_range_analysis": {
        "query": """
            SELECT 
                CASE 
                    WHEN price = 0 THEN 'Free'
                    WHEN price < 10 THEN 'Budget (<$10)'
                    WHEN price < 50 THEN 'Mid-range ($10-$50)'
                    WHEN price < 100 THEN 'Premium ($50-$100)'
                    ELSE 'Enterprise (>$100)'
                END as price_tier,
                COUNT(*) as product_count,
                AVG(rating_avg) as avg_rating,
                AVG(active_users) as avg_users,
                AVG(revenue_monthly) as avg_revenue
            FROM master_products_features
            WHERE main_category = %(category)s
              AND still_operating = 1
            GROUP BY price_tier
            ORDER BY AVG(price)
        """,
        "params": ["category"],
        "description": "Analyze products by price tiers"
    }
}

METRIC_COLUMNS = {
    'revenue': 'avg_revenue',
    'price': 'avg_price',
    'rating': 'avg_rating',
    'reviews': 'median_reviews',
    'funding': 'avg_funding',
    'success_rate': 'success_rate',
}

