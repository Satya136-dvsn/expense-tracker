from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import PredictionRequest, PredictionResponse
from services.prediction_service import PredictionService
from services.budgetwise_client import BudgetWiseClient

router = APIRouter()

@router.post("/{user_id}", response_model=PredictionResponse)
async def predict_spending(
    user_id: int,
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """Generate spending predictions for a user"""
    prediction_service = PredictionService(db)
    budgetwise_client = BudgetWiseClient()
    
    # Fetch historical transaction data
    user_data = await budgetwise_client.get_user_transactions(user_id, months=12)
    if not user_data:
        raise HTTPException(status_code=404, detail="User transaction data not found")
    
    return await prediction_service.predict_future_spending(user_id, user_data, request.months)

@router.get("/{user_id}/cash-flow")
async def predict_cash_flow(
    user_id: int,
    months: int = 3,
    db: Session = Depends(get_db)
):
    """Predict future cash flow for a user"""
    prediction_service = PredictionService(db)
    budgetwise_client = BudgetWiseClient()
    
    user_data = await budgetwise_client.get_user_financial_data(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User financial data not found")
    
    return await prediction_service.predict_cash_flow(user_id, user_data, months)

@router.get("/{user_id}/budget-forecast")
async def forecast_budget_performance(
    user_id: int,
    months: int = 3,
    db: Session = Depends(get_db)
):
    """Forecast budget performance and adherence"""
    prediction_service = PredictionService(db)
    budgetwise_client = BudgetWiseClient()
    
    user_data = await budgetwise_client.get_user_budgets(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User budget data not found")
    
    return await prediction_service.forecast_budget_performance(user_id, user_data, months)