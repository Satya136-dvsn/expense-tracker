from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import InsightResponse, InsightCreate, UserFeedback, FinancialHealthScore
from services.insights_service import InsightsService
from services.budgetwise_client import BudgetWiseClient

router = APIRouter()

@router.get("/{user_id}", response_model=List[InsightResponse])
async def get_user_insights(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get personalized AI insights for a user"""
    insights_service = InsightsService(db)
    return await insights_service.get_user_insights(user_id, limit)

@router.post("/{user_id}/generate", response_model=List[InsightResponse])
async def generate_insights(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Generate new AI insights for a user"""
    insights_service = InsightsService(db)
    budgetwise_client = BudgetWiseClient()
    
    # Fetch user data from main BudgetWise API
    user_data = await budgetwise_client.get_user_financial_data(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User financial data not found")
    
    return await insights_service.generate_insights(user_id, user_data)

@router.post("/{insight_id}/feedback")
async def provide_feedback(
    insight_id: int,
    feedback: UserFeedback,
    db: Session = Depends(get_db)
):
    """Provide feedback on an AI insight"""
    insights_service = InsightsService(db)
    return await insights_service.update_insight_feedback(insight_id, feedback)

@router.get("/{user_id}/health-score", response_model=FinancialHealthScore)
async def get_financial_health_score(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get AI-calculated financial health score"""
    insights_service = InsightsService(db)
    budgetwise_client = BudgetWiseClient()
    
    user_data = await budgetwise_client.get_user_financial_data(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User financial data not found")
    
    return await insights_service.calculate_financial_health_score(user_id, user_data)

@router.delete("/{insight_id}")
async def dismiss_insight(
    insight_id: int,
    db: Session = Depends(get_db)
):
    """Dismiss an AI insight"""
    insights_service = InsightsService(db)
    return await insights_service.dismiss_insight(insight_id)