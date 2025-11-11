from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()

class InsightType(enum.Enum):
    SPENDING_PATTERN = "spending_pattern"
    SAVING_OPPORTUNITY = "saving_opportunity"
    BUDGET_ALERT = "budget_alert"
    FINANCIAL_HEALTH = "financial_health"
    GOAL_PROGRESS = "goal_progress"

class AnomalyType(enum.Enum):
    UNUSUAL_AMOUNT = "unusual_amount"
    UNUSUAL_CATEGORY = "unusual_category"
    UNUSUAL_TIME = "unusual_time"
    UNUSUAL_MERCHANT = "unusual_merchant"

class Severity(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Insight(Base):
    __tablename__ = "insights"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    type = Column(Enum(InsightType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    confidence_score = Column(Float, nullable=False)
    action_items = Column(Text)  # JSON string of action items
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    user_feedback = Column(String(50))  # helpful, not_helpful, dismissed

class SpendingAnomaly(Base):
    __tablename__ = "spending_anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    transaction_id = Column(Integer)  # Reference to transaction in main DB
    anomaly_type = Column(Enum(AnomalyType), nullable=False)
    severity = Column(Enum(Severity), nullable=False)
    explanation = Column(Text, nullable=False)
    suggested_actions = Column(Text)  # JSON string of suggested actions
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_resolved = Column(Boolean, default=False)

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    potential_savings = Column(Float)
    confidence_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_implemented = Column(Boolean, default=False)
    user_feedback = Column(String(50))

class PredictionModel(Base):
    __tablename__ = "prediction_models"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    model_type = Column(String(100), nullable=False)  # spending, income, savings
    model_data = Column(Text)  # Serialized model parameters
    accuracy_score = Column(Float)
    last_trained = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

class UserMLProfile(Base):
    __tablename__ = "user_ml_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True, nullable=False, index=True)
    spending_patterns = Column(Text)  # JSON string of spending patterns
    financial_personality = Column(String(50))  # conservative, moderate, aggressive
    risk_tolerance = Column(Float)
    last_analysis = Column(DateTime, default=datetime.utcnow)
    insights_enabled = Column(Boolean, default=True)