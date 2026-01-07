
# PROD-iQ: AI System for Startup Analysis with Hallucination Reduction

![Status](https://img.shields.io/badge/Status-Proprietary-red)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![Stack](https://img.shields.io/badge/Tech-Llama3%20%7C%20MCP%20%7C%20PyTorch-green)

***

> **Production ML infrastructure for reducing hallucination in startup financial predictions.**

***

## Problem Statement

In 2025, over 11,300 startups shut down in India alone. Most founders lack quantitative tools to validate financial assumptions before launch. Standard LLMs confidently generate revenue forecasts, burn rate estimates, and survival predictions even when:

- Input data is incomplete or conflicting
- The model has never seen this specific domain
- Assumptions are not grounded in real benchmarks

This leads to **confident-but-wrong predictions** that mislead founders into poor decisions.

PROD-IQ addresses this by **never trusting the LLM for math**. Instead, it uses a compound AI architecture where the LLM is the orchestrator, not the predictor.

***

## Core Innovation: Delta State Graph

The Delta State Graph is the hallucination reduction mechanism at the heart of PROD-IQ.

### The Problem It Solves

When an LLM predicts startup metrics, it cannot distinguish between:

- **Known data** (user provided: "team size = 5, burn rate = \$80K/month")
- **Missing data** (user didn't provide funding amount)
- **Assumed data** (system used category average for pricing)
- **Inferred data** (model predicted revenue based on above)

Without this tracking, the LLM generates fabricated numbers to fill gaps.

### How Delta State Graph Works

**Conceptual Design:**

The Delta State Graph is a state-tracking layer that sits between user input and model prediction:

1. **Input Parsing:**
    - User provides partial data (e.g., category, team size, price)
    - System maps to 387-feature vector
2. **State Classification:**
    - Each feature is tagged:
        - `KNOWN`: Directly from user input
        - `MISSING`: Required but not provided
        - `ASSUMED`: Filled using category benchmarks
        - `INFERRED`: Computed by ML models
3. **Graph Construction:**
    - Nodes: Features (team_size, burn_rate, revenue_estimate, etc.)
    - Edges: Dependencies (revenue depends on price, active_users, etc.)
    - Labels: State tags (KNOWN, MISSING, ASSUMED, INFERRED)
4. **Hallucination Prevention:**
    - Before LLM generates response:
        - Check graph for MISSING nodes in critical paths
        - Flag when ASSUMED nodes dominate a prediction
        - Prevent LLM from inventing numbers where graph shows gaps
5. **Output Adjustment:**
    - LLM response includes:
        - Prediction values
        - Explicit mentions: "Using category average for CAC (no user data provided)"
        - Confidence adjustments: "65% reliability due to missing burn rate data"

**Implementation:**

```
data/raw/ → feature_engine.py → 387-feature vector
                    ↓
            state_tracker.py
                    ↓
        Delta State Graph (JSON)
        {
          "team_size": {"value": 5, "state": "KNOWN"},
          "burn_rate": {"value": 80000, "state": "ASSUMED", "source": "category_avg"},
          "revenue_predicted": {"value": 120000, "state": "INFERRED", "confidence": 0.65}
        }
                    ↓
         ml_core/inference.py (5 models)
                    ↓
        llm/orchestrator.py (interprets graph + predictions)
                    ↓
        Response: "Revenue estimate: $120K/month. 
                   Note: This assumes category-average burn rate ($80K) 
                   since you didn't provide actual burn data. 
                   Confidence: 65%"
```

**Result:**

- 82% reduction in hallucination instances (measured as "fabricated numbers not grounded in input or benchmarks")
- Explicit uncertainty communication instead of false confidence

***

## System Architecture

PROD-IQ is a **Compound AI System** with clear separation between reasoning and computation.

### 1. Controller Layer (LLM Orchestrator)

**Location:** `llm/orchestrator.py`, `llm/router.py`, `llm/mcp_client.py`

**Role:**

- Parses natural language user input
- Extracts structured fields (category, team_size, price, etc.)
- Routes to appropriate tools via MCP
- Interprets Delta State Graph + model outputs
- Generates narrative response

**Key Point:** The LLM **never does math**. It delegates to ML models and databases.

**Technology:**

- Llama-3.2B (4-bit quantized, local inference)
- Custom prompts: `prompts/global_prompt.txt`, task-specific prompts

***

### 2. Data Engine \& Feature Reconstruction

**Location:** `ml_core/`, `data/processed/`

**Challenge:**

Users provide ~10-20 messy inputs. Models need exactly 387 features in a specific order, format, and distribution.

**Dataset:**

- **42,500 real startup/product samples** across 15 verticals
- **387 engineered features:**
    - Raw: price, team_size, total_funding, launch_date, active_users, review_count, etc.
    - Derived: burn_rate_monthly_est, estimated_runway_months, survival_score, growth_score, market_fit_score
    - Category benchmarks: category_success_rate, category_avg_revenue, category_product_count
    - Text features: TF-IDF vectors for descriptions, success/failure reasons
    - Encodings: label-encoded categorical variables

**Feature Reconstruction Pipeline:**

```python
# ml_core/pipeline.py
user_input = {
    "category": "SaaS",
    "team_size": 5,
    "price": 49,
    "funding": 100000
}

↓ input_adapter.py
base_row = {
    "team_size": 5,
    "price": 49,
    "total_funding": 100000,
    # 384 other features = None
}

↓ feature_engine.py
derived_row = {
    "burn_rate_monthly_est": team_size * 15000,  # heuristic
    "estimated_runway_months": funding / burn_rate,
    "age_months": (today - launch_date).days / 30,
    # ... +50 derived features
}

↓ merge category_benchmarks.json
benchmark_row = {
    "category_success_rate": 0.42,  # SaaS average
    "category_avg_revenue": 85000,
    "category_product_count": 1200,
    # ... category-level stats
}

↓ preprocessing.py (TF-IDF, encoders)
final_vector = [387 floats]  # ready for models
```

**Data Sources:**

- Web scraping (Product Hunt, Crunchbase, app stores, public datasets)
- Manual cleaning \& augmentation
- **No Kaggle toy datasets**

***

### 3. ML Prediction Layer (5 Specialized Models)

**Location:** `models/`, `ml_core/inference.py`

Each model answers one core question:


| Model | Target | Architecture | Training Samples | Performance |
| :-- | :-- | :-- | :-- | :-- |
| **Success Classifier** | `success_label` (-1/0/1) | XGBoost → CatBoost stack | 3,708 | 73% accuracy |
| **Revenue Estimator** | `revenue_estimated` (monthly) | CatBoost + XGBoost ensemble | 35,674 | R² ≈ 0.63 |
| **Survival Predictor** | `target_survival_months` | Stack model + gradient boosters | 35,674 | MAE ≈ 8.2 months |
| **Break-Even Time** | `target_breakeven_time` (months) | Ensemble regressor | 34,612 | RMSE ≈ 6.5 months |
| **Traction Time** | `target_traction_time` (months to 1K users) | XGBoost regressor | 35,520 | RMSE ≈ 4.1 months |

**Training Process:**

- Train/test split with **strict leakage prevention**:
    - No future data in past predictions
    - No target-derived features
    - No data from same product family in train/test
- Cross-validation via vector DB + SQL benchmarks
- Models saved with `feature_names.pkl` to enforce strict input contracts

**Inference:**

- Only called through `ml_core/inference.py` (no direct LLM access)
- Input validation: checks for 387 features in correct order
- Output includes prediction + confidence metadata

***

### 4. Knowledge Layer (SQL + Vector DB)

**SQL Benchmarks (Structured):**

- MySQL/PostgreSQL database from master CSV
- Provides:
    - Category averages (success rates, funding, revenue)
    - Market density (product count, saturation)
    - Regional benchmarks
- Used for:
    - Feature reconstruction (filling ASSUMED values)
    - Cross-validation (comparing predictions to historical norms)

**Vector DB (Unstructured):**

- ChromaDB with ~8 CSV knowledge sources
- Stores embeddings of:
    - Startup post-mortems
    - Success case studies
    - Strategic patterns
- Used for:
    - RAG (Retrieval-Augmented Generation)
    - Competitor Analysis tool
    - Similar product lookups

***

### 5. MCP Server (Tool Interface)

**Location:** `mcp_server/`

Model Context Protocol server exposes 5 prediction tools + 2 special tools to the LLM:

**Core Tools:**

- `predict_success.py`
- `predict_revenue.py`
- `predict_survival.py`
- `predict_breakeven.py`
- `predict_traction.py`

**Special Tools:**

- `journey_simulator.py` - Scenario storytelling
- `market_scout.py` - Competitor analysis

**Flow:**

```
LLM decides → "Need revenue + survival"
     ↓
Composes startup_input.json
     ↓
MCP server receives request
     ↓
ml_core reconstructs 387 features + Delta State Graph
     ↓
Models run
     ↓
Returns prediction_output.json + graph metadata
     ↓
LLM interprets and responds
```


***

### 6. API \& Session Management

**Location:** `api/app.py`, `api/routes.py`

- FastAPI backend
- Session-based context (no accounts in MVP)
- Endpoints:
    - `POST /chat` - Main chat interface
    - `POST /tools/storyweaver` - Scenario tool
    - `POST /tools/competitor-analysis` - Benchmark tool

***

## End-to-End Flow Example

**User Input:**
> "I'm building a subscription fitness app for Indian Tier-2 cities, 3 founders, 6 team members, thinking of ₹499/month. What revenue and survival odds?"

**System Process:**

1. **Frontend → API:** Sends message + session ID
2. **API → LLM Orchestrator:**
    - Parses input
    - Extracts:
        - `main_category="fitness"`, `business_model="subscription"`, `price=499`, `team_size=6`, `country="India"`, `region="tier_2"`
3. **Orchestrator → Feature Engine:**
    - Builds 387-feature vector
    - Tracks Delta State Graph:
        - `KNOWN`: team_size, price, category
        - `MISSING`: total_funding, active_users
        - `ASSUMED`: burn_rate (from team_size heuristic), category benchmarks
4. **Feature Engine → ML Models (via MCP):**
    - Calls: `predict_revenue`, `predict_survival`, `predict_success`
    - Models return:
        - Revenue: ₹85K/month (confidence 0.62)
        - Survival: 18 months (confidence 0.58)
        - Success probability: 45%
5. **ML Models → SQL/Vector DB:**
    - Compares against:
        - Fitness category average revenue: ₹120K
        - Similar Tier-2 subscription apps
    - Flags: "Below category average"
6. **All Results → LLM:**
    - Receives:
        - Predictions
        - Delta State Graph
        - Benchmark comparisons
        - Similar products
7. **LLM → Response:**
    - "Based on your inputs, estimated monthly revenue is ₹85K (vs category average ₹120K). This suggests 18-month survival with current burn rate. Success probability: 45%.

**Important caveats:**
    - I assumed ₹90K monthly burn based on 6-person team (no funding data provided).
    - Revenue estimate has 62% confidence due to missing active user data.
    - Consider validating pricing (₹499 is below Tier-2 fitness app average)."
8. **API → Frontend:** Displays response with context

***

## Results \& Validation

**Hallucination Reduction:**

- Measured as "fabricated numbers not grounded in input or benchmarks"
- Baseline (plain LLM): High rate of confident-but-wrong predictions
- With Delta State Graph: ~82% reduction in hallucination instances

**Prediction Reliability:**

- Cross-validated via vector DB + SQL benchmarks
- ~65% reliability on real-world test scenarios
- Honest metric: 35% error rate on edge cases

**What This Means:**

- System is **not production-grade** for high-stakes decisions
- Suitable for **early validation** and **directional guidance**
- Transparent about uncertainty

***

## Challenges \& Trade-offs

### Technical Challenges Faced

**1. Feature Reconstruction from Sparse Input**

- **Problem:** Users give 10-20 fields, models need 387
- **Solution:** Benchmark-based imputation + heuristics
- **Trade-off:** Introduces assumptions that may not match reality
- **Mitigation:** Delta State Graph explicitly tracks these assumptions

**2. Data Leakage Prevention**

- **Problem:** Easy to accidentally include target-derived features
- **Solution:** Manual feature audits + strict train/test splitting
- **Trade-off:** Lower model accuracy (removed 40+ leaky features)
- **Result:** Honest 65% reliability vs fake 90%+

**3. LLM Hallucination Control**

- **Problem:** LLMs confidently invent numbers
- **Solution:** Delta State Graph + MCP tool constraints
- **Trade-off:** More complex architecture, higher latency
- **Result:** 82% hallucination reduction but slower responses

**4. Cold Start Problem**

- **Problem:** New categories with limited training data
- **Solution:** Fall back to category benchmarks + high uncertainty flags
- **Trade-off:** Predictions are very conservative for novel verticals

**5. Real-Time Inference Speed**

- **Problem:** 5 models + feature pipeline + RAG = slow
- **Solution:** Quantized LLM (4-bit), batching, caching
- **Trade-off:** Response time 8-12 seconds (vs 2-3 for plain LLM)

***

### Engineering Trade-offs

**1. Accuracy vs. Interpretability**

- **Choice:** Gradient boosting ensembles over deep neural networks
- **Why:** Explainable feature importance for founders
- **Cost:** ~5-10% accuracy loss vs black-box models

**2. Speed vs. Safety**

- **Choice:** Delta State Graph adds latency
- **Why:** Preventing hallucination matters more than speed
- **Cost:** 3-5 second overhead per prediction

**3. Fine-Tuning Scope**

- **Choice:** LoRA fine-tuning on limited compute
- **Why:** Budget constraints (no access to A100s)
- **Cost:** LLM reasoning quality lower than GPT-4 level

**4. Dataset Diversity**

- **Choice:** 42K samples across 15 verticals
- **Why:** Scraped and cleaned manually (no budget for commercial data)
- **Cost:** Weak coverage for niche verticals (biotech, deep tech, hardware)

**5. Imputation Method**

- **Choice:** Benchmark-based imputation (10× faster than MICE)
- **Why:** Real-time requirements
- **Cost:** May distort relationships in sparse data scenarios

***

## Known Limitations

**1. Geographic Coverage:**

- Strong on India, US, Europe
- Weak on LatAm, Africa, Southeast Asia (limited training data)

**2. Vertical Coverage:**

- Strong: SaaS, digital apps, consumables, food delivery, e-commerce
- Weak: Biotech, deep tech, hardware, manufacturing (complex unit economics)

**3. Stage Coverage:**

- Designed for pre-seed / seed stage
- Not suitable for growth-stage startups with complex metrics

**4. Prediction Horizon:**

- Reliable for 12-24 month forecasts
- Unreliable beyond 36 months (too many unknowns)

**5. Data Freshness:**

- Training data frozen at collection time
- May miss very recent market shifts (e.g., post-2024 AI boom dynamics)

**6. Edge Cases:**

- Novel business models (e.g., Web3, DAO structures) poorly understood
- Predictions are very conservative / uncertain

***

## Technology Stack

**LLM \& Orchestration:**

- Llama-3.2B (4-bit quantized)
- Custom prompt engineering

**ML Core:**

- CatBoost, XGBoost
- Scikit-learn
- PyTorch (for fine-tuning experiments)

**Data Infrastructure:**

- MySQL/PostgreSQL (benchmarks)
- ChromaDB (vector store)
- Custom feature pipeline

**Backend:**

- Python, FastAPI
- MCP (Model Context Protocol)

**Storage:**

- Local file system (MVP)
- 387-feature artifacts in `ml_core/artifacts/`

***

## Repository Structure

```
prod-iq/
├── api/                    # FastAPI backend
├── llm/                    # LLM orchestrator & MCP client
├── ml_core/                # Feature engine + inference
│   ├── artifacts/          # Models, encoders, TF-IDF
│   ├── feature_engine.py
│   ├── inference.py
│   └── pipeline.py
├── mcp_server/             # MCP tool server
│   ├── tools/              # 5 prediction tools + special tools
│   └── server.py
├── models/                 # Trained model binaries
├── data/
│   ├── raw/                # Original CSVs
│   └── processed/          # Clean training data
├── database/
│   ├── chroma_db_storage/  # Vector DB
│   └── scripts/            # DB setup scripts
├── prompts/                # LLM system prompts
└── README.md
```

## Usage Example

```python
import requests

payload = {
    "session_id": "demo_session",
    "message": "I'm building a SaaS tool for small businesses, 4-person team, $299/month pricing. What's realistic revenue?"
}

response = requests.post("http://localhost:8000/chat", json=payload)
print(response.json()["response"])
```

**Sample Output:**

```
Based on your inputs, estimated monthly revenue is $42K (confidence: 68%).

This is grounded in:
- SaaS category average: $55K for 4-person teams
- Your pricing ($299) is slightly below median ($350)
- Assumed 140 customers based on typical early-stage conversion

Caveats:
- I don't have your funding or burn rate, so I can't estimate runway
- Revenue assumes 3% monthly churn (category average)
- Actual results depend heavily on distribution channels (not provided)

Recommendation: Validate pricing with 20 customer interviews before launch.
```


## License

**Proprietary Software**

© 2025 Hariharasudhan M, Elango T. All Rights Reserved.

This repository contains proprietary research and code for PROD-IQ MVP.
Not open for public distribution.

**Contact:**

- Email: mghariharasudhan@gmail.com, elangothangarasan@gmail.com
- LinkedIn: [Hariharasudhan M](https://linkedin.com/in/hariharasudhan-mg), [Elango T](https://www.linkedin.com/in/elango-t/)

***

*Built with honesty in Coimbatore.*

