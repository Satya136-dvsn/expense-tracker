from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schemas import AnomalyResponse, AnomalyCreate
from services.anomaly_service import AnomalyService
from services.budgetwise_client import BudgetWiseClient

router = APIRouter()

@router.get("/{user_id}", response_model=List[AnomalyResponse])
async def get_user_anomalies(
    user_id: int,
    limit: int = 20,
    severity: str = None,
    db: Session = Depends(get_db)
):
    """Get spending anomalies for a user"""
    anomaly_service = AnomalyService(db)
    return await anomaly_service.get_user_anomalies(user_id, limit, severity)

@router.post("/{user_id}/detect", response_model=List[AnomalyResponse])
async def detect_anomalies(
    user_id: int,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Detect new spending anomalies for a user"""
    anomaly_service = AnomalyService(db)
    budgetwise_client = BudgetWiseClient()
    
    # Fetch recent transaction data
    transactions = await budgetwise_client.get_user_transactions(user_id, days=days)
    if not transactions:
        raise HTTPException(status_code=404, detail="No recent transactions found")
    
    return await anomaly_service.detect_anomalies(user_id, transactions)

@router.post("/{anomaly_id}/resolve")
async def resolve_anomaly(
    anomaly_id: int,
    db: Session = Depends(get_db)
):
    """Mark an anomaly as resolved"""
    anomaly_service = AnomalyService(db)
    return await anomaly_service.resolve_anomaly(anomaly_id)

@router.get("/{user_id}/fraud-alerts")
async def get_fraud_alerts(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get high-severity fraud alerts for a user"""
    anomaly_service = AnomalyService(db)
    return await anomaly_service.get_fraud_alerts(user_id)