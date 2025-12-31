# intent_mapper.py
"""
Maps user intent to query templates
"""

INTENT_TO_TEMPLATE = {
    # Benchmark queries
    "benchmark": "get_category_benchmark",
    "average": "get_category_benchmark",
    "typical": "get_category_benchmark",
    "industry_standard": "get_category_benchmark",
    
    # Specific metrics
    "revenue": "get_specific_metric",
    "price": "get_specific_metric",
    "churn": "get_specific_metric",
    
    # Similar products
    "similar": "find_similar_products",
    "competitor": "find_similar_products",
    "alternative": "find_similar_products",
    
    # Top performers
    "top": "get_top_performers",
    "best": "get_top_performers",
    "winning": "get_top_performers",
    
    # Comparison
    "compare": "compare_products",
    "comparison": "compare_products",
    
    # Statistics
    "statistics": "get_category_stats",
    "stats": "get_category_stats",
    "how_many": "get_category_stats",
    
    # Failures
    "failure": "get_failure_insights",
    "failed": "get_failure_insights",
    "why_fail": "get_failure_insights",
    
    # Success factors
    "success": "get_success_factors",
    "successful": "get_success_factors",
    
    # Pricing
    "price_range": "price_range_analysis",
    "pricing_tiers": "price_range_analysis",
}

def get_template_from_intent(intent: str) -> str:
    """Map intent to template name"""
    intent_lower = intent.lower()
    
    for keyword, template in INTENT_TO_TEMPLATE.items():
        if keyword in intent_lower:
            return template
    
    # Default fallback
    return "get_category_benchmark"
