from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime
import json

app = FastAPI(
    title="BudgetWise AI Insights Service",
    description="AI-powered financial insights and recommendations (MySQL-based)",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "BudgetWise AI Insights Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Mock AI Insights endpoints
@app.get("/api/ai/insights/{user_id}")
async def get_user_insights(user_id: int, limit: int = 10):
    """Get personalized AI insights for a user"""
    mock_insights = [
        {
            "id": 1,
            "user_id": user_id,
            "type": "spending_pattern",
            "title": "Your highest spending is in Food category",
            "description": "You've spent $450 in Food recently, which represents your largest expense category.",
            "confidence_score": 0.9,
            "action_items": [
                "Review your Food expenses for optimization opportunities",
                "Set a monthly budget limit for Food",
                "Look for ways to reduce Food costs"
            ],
            "created_at": datetime.now().isoformat(),
            "expires_at": None,
            "is_active": True,
            "user_feedback": None
        },
        {
            "id": 2,
            "user_id": user_id,
            "type": "saving_opportunity",
            "title": "Potential subscription savings detected",
            "description": "You have multiple subscription services that could be optimized to save $50/month.",
            "confidence_score": 0.75,
            "action_items": [
                "Review all active subscriptions",
                "Cancel unused services",
                "Look for bundle deals"
            ],
            "created_at": datetime.now().isoformat(),
            "expires_at": None,
            "is_active": True,
            "user_feedback": None
        }
    ]
    return mock_insights[:limit]

@app.post("/api/ai/insights/{user_id}/generate")
async def generate_insights(user_id: int):
    """Generate new AI insights for a user"""
    return await get_user_insights(user_id, 3)

@app.get("/api/ai/insights/{user_id}/health-score")
async def get_financial_health_score(user_id: int):
    """Get AI-calculated financial health score"""
    return {
        "user_id": user_id,
        "overall_score": 0.75,
        "spending_score": 0.8,
        "savings_score": 0.7,
        "debt_score": 0.8,
        "budget_adherence_score": 0.7,
        "factors": [
            "Good spending consistency",
            "Moderate savings rate",
            "Low debt burden"
        ],
        "recommendations": [
            "Increase your savings rate by 5%",
            "Continue your excellent spending discipline",
            "Consider setting up automatic savings transfers"
        ],
        "calculated_at": datetime.now().isoformat()
    }

@app.get("/api/ai/anomalies/{user_id}")
async def get_user_anomalies(user_id: int, limit: int = 20, severity: str = None):
    """Get spending anomalies for a user"""
    mock_anomalies = [
        {
            "id": 1,
            "user_id": user_id,
            "transaction_id": 123,
            "anomaly_type": "unusual_amount",
            "severity": "high",
            "explanation": "Transaction amount $500 is significantly higher than your average of $75",
            "suggested_actions": [
                "Verify this transaction is legitimate",
                "Check if this was a planned large purchase",
                "Review your budget for this category"
            ],
            "confidence_score": 0.9,
            "created_at": datetime.now().isoformat(),
            "is_resolved": False
        }
    ]
    
    if severity:
        mock_anomalies = [a for a in mock_anomalies if a["severity"] == severity]
    
    return mock_anomalies[:limit]

@app.post("/api/ai/anomalies/{user_id}/detect")
async def detect_anomalies(user_id: int, days: int = 30):
    """Detect new spending anomalies for a user"""
    return await get_user_anomalies(user_id, 5)

@app.post("/api/ai/predictions/{user_id}")
async def predict_spending(user_id: int):
    """Generate spending predictions for a user"""
    return {
        "user_id": user_id,
        "predictions": {
            "total_predicted": 2400,
            "monthly_breakdown": [800, 800, 800],
            "category_predictions": {
                "Food": 900,
                "Shopping": 600,
                "Transportation": 450,
                "Entertainment": 300,
                "Utilities": 150
            },
            "trend": 0.05,
            "confidence_score": 0.8
        },
        "confidence_score": 0.8,
        "generated_at": datetime.now().isoformat()
    }

@app.get("/api/ai/predictions/{user_id}/cash-flow")
async def predict_cash_flow(user_id: int, months: int = 3):
    """Predict future cash flow for a user"""
    return {
        "monthly_projections": [
            {
                "month": i,
                "projected_income": 3000,
                "projected_expenses": 2400,
                "net_cash_flow": 600
            } for i in range(months)
        ],
        "total_projected_income": 3000 * months,
        "total_projected_expenses": 2400 * months,
        "net_cash_flow": 600 * months
    }

@app.get("/api/ai/predictions/{user_id}/budget-forecast")
async def forecast_budget_performance(user_id: int, months: int = 3):
    """Forecast budget performance and adherence"""
    return {
        "category_forecasts": [
            {"category": "Food", "budgeted": 900, "predicted": 850},
            {"category": "Shopping", "budgeted": 500, "predicted": 600},
            {"category": "Transportation", "budgeted": 400, "predicted": 450}
        ],
        "at_risk_categories": [
            {
                "name": "Shopping",
                "predicted_overage": 100,
                "risk_percentage": 20
            }
        ],
        "recommendations": [
            "Monitor Shopping category spending",
            "Consider adjusting Shopping budget",
            "Great job staying under Food budget"
        ],
        "overall_adherence_score": 0.85
    }

if __name__ == "__main__":
    uvicorn.run("simple_main:app", host="0.0.0.0", port=8000, reload=True)