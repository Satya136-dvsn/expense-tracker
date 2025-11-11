from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class InsightTypeEnum(str, Enum):
    SPENDING_PATTERN = "spending_pattern"
    SAVING_OPPORTUNITY = "saving_opportunity"
    BUDGET_ALERT = "budget_alert"
    FINANCIAL_HEALTH = "financial_health"
    GOAL_PROGRESS = "goal_progress"

class AnomalyTypeEnum(str, Enum):
    UNUSUAL_AMOUNT = "unusual_amount"
    UNUSUAL_CATEGORY = "unusual_category"
    UNUSUAL_TIME = "unusual_time"
    UNUSUAL_MERCHANT = "unusual_merchant"

class SeverityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class InsightBase(BaseModel):
    user_id: int
    type: InsightTypeEnum
    title: str
    description: str
    confidence_score: float
    action_items: Optional[List[str]] = None

class InsightCreate(InsightBase):
    expires_at: Optional[datetime] = None

class InsightResponse(InsightBase):
    id: int
    created_at: datetime
    expires_at: Optional[datetime]
    is_active: bool
    user_feedback: Optional[str]
    
    class Config:
        from_attributes = True

class AnomalyBase(BaseModel):
    user_id: int
    transaction_id: Optional[int]
    anomaly_type: AnomalyTypeEnum
    severity: SeverityEnum
    explanation: str
    suggested_actions: Optional[List[str]] = None
    confidence_score: float

class AnomalyCreate(AnomalyBase):
    pass

class AnomalyResponse(AnomalyBase):
    id: int
    created_at: datetime
    is_resolved: bool
    
    class Config:
        from_attributes = True

class RecommendationBase(BaseModel):
    user_id: int
    category: str
    title: str
    description: str
    priority: int = 1
    potential_savings: Optional[float] = None
    confidence_score: float

class RecommendationCreate(RecommendationBase):
    pass

class RecommendationResponse(RecommendationBase):
    id: int
    created_at: datetime
    is_implemented: bool
    user_feedback: Optional[str]
    
    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    user_id: int
    months: int = 3
    categories: Optional[List[str]] = None

class PredictionResponse(BaseModel):
    user_id: int
    predictions: Dict[str, Any]
    confidence_score: float
    generated_at: datetime

class SpendingPattern(BaseModel):
    category: str
    average_amount: float
    frequency: str
    trend: str  # increasing, decreasing, stable
    seasonality: Optional[Dict[str, float]] = None

class FinancialHealthScore(BaseModel):
    user_id: int
    overall_score: float
    spending_score: float
    savings_score: float
    debt_score: float
    budget_adherence_score: float
    factors: List[str]
    recommendations: List[str]
    calculated_at: datetime

class UserFeedback(BaseModel):
    feedback: str  # helpful, not_helpful, dismissed
    comments: Optional[str] = None