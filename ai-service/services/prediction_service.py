from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import logging

from schemas import PredictionResponse

logger = logging.getLogger(__name__)

class PredictionService:
    """Service for generating financial predictions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.scaler = StandardScaler()
    
    async def predict_future_spending(self, user_id: int, user_data: Dict[str, Any], months: int = 3) -> PredictionResponse:
        """Predict future spending based on historical data"""
        try:
            transactions = user_data.get('transactions', [])
            if not transactions:
                return self._create_default_prediction(user_id, months)
            
            predictor = SpendingPredictor()
            predictions = predictor.predict_spending(transactions, months)
            
            return PredictionResponse(
                user_id=user_id,
                predictions=predictions,
                confidence_score=predictions.get('confidence_score', 0.7),
                generated_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error predicting spending for user {user_id}: {e}")
            return self._create_default_prediction(user_id, months)
    
    async def predict_cash_flow(self, user_id: int, user_data: Dict[str, Any], months: int = 3) -> Dict[str, Any]:
        """Predict future cash flow"""
        try:
            transactions = user_data.get('transactions', [])
            if not transactions:
                return self._create_default_cash_flow(months)
            
            predictor = CashFlowPredictor()
            return predictor.predict_cash_flow(transactions, months)
            
        except Exception as e:
            logger.error(f"Error predicting cash flow for user {user_id}: {e}")
            return self._create_default_cash_flow(months)
    
    async def forecast_budget_performance(self, user_id: int, user_data: Dict[str, Any], months: int = 3) -> Dict[str, Any]:
        """Forecast budget performance"""
        try:
            budgets = user_data.get('budgets', [])
            transactions = user_data.get('transactions', [])
            
            if not budgets or not transactions:
                return self._create_default_budget_forecast(months)
            
            predictor = BudgetPredictor()
            return predictor.forecast_budget_performance(budgets, transactions, months)
            
        except Exception as e:
            logger.error(f"Error forecasting budget for user {user_id}: {e}")
            return self._create_default_budget_forecast(months)
    
    def _create_default_prediction(self, user_id: int, months: int) -> PredictionResponse:
        """Create default prediction when insufficient data"""
        return PredictionResponse(
            user_id=user_id,
            predictions={
                "total_predicted": 0,
                "monthly_breakdown": [0] * months,
                "category_predictions": {},
                "trend": 0,
                "confidence_score": 0.3
            },
            confidence_score=0.3,
            generated_at=datetime.utcnow()
        )
    
    def _create_default_cash_flow(self, months: int) -> Dict[str, Any]:
        """Create default cash flow prediction"""
        return {
            "monthly_projections": [
                {"month": i, "net_cash_flow": 0} for i in range(months)
            ],
            "total_projected_income": 0,
            "total_projected_expenses": 0,
            "net_cash_flow": 0
        }
    
    def _create_default_budget_forecast(self, months: int) -> Dict[str, Any]:
        """Create default budget forecast"""
        return {
            "category_forecasts": [],
            "at_risk_categories": [],
            "recommendations": ["Add budget and transaction data to get accurate forecasts"],
            "overall_adherence_score": 0.5
        }

class SpendingPredictor:
    """Predicts future spending based on historical patterns"""
    
    def predict_spending(self, transactions: List[Dict], months: int) -> Dict[str, Any]:
        """Predict spending for the next N months"""
        try:
            df = self._prepare_data(transactions)
            if df.empty or len(df) < 7:  # Need at least a week of data
                return self._create_simple_prediction(transactions, months)
            
            # Use different prediction methods based on data availability
            if len(df) >= 30:  # At least a month of data
                return self._advanced_prediction(df, months)
            else:
                return self._simple_prediction(df, months)
            
        except Exception as e:
            logger.error(f"Error in spending prediction: {e}")
            return self._create_simple_prediction(transactions, months)
    
    def _prepare_data(self, transactions: List[Dict]) -> pd.DataFrame:
        """Prepare transaction data for prediction"""
        df = pd.DataFrame(transactions)
        if df.empty:
            return df
        
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        df = df.dropna(subset=['amount'])
        
        # Group by date and category
        daily_spending = df.groupby([df['date'].dt.date, 'category'])['amount'].sum().reset_index()
        daily_spending['date'] = pd.to_datetime(daily_spending['date'])
        
        return daily_spending
    
    def _advanced_prediction(self, df: pd.DataFrame, months: int) -> Dict[str, Any]:
        """Advanced prediction using machine learning"""
        try:
            # Create time series features
            df_daily = df.groupby('date')['amount'].sum().reset_index()
            df_daily = df_daily.sort_values('date')
            
            # Create features
            df_daily['day_of_week'] = df_daily['date'].dt.dayofweek
            df_daily['day_of_month'] = df_daily['date'].dt.day
            df_daily['month'] = df_daily['date'].dt.month
            df_daily['days_since_start'] = (df_daily['date'] - df_daily['date'].min()).dt.days
            
            # Prepare features and target
            features = ['day_of_week', 'day_of_month', 'month', 'days_since_start']
            X = df_daily[features].values
            y = df_daily['amount'].values
            
            # Train model
            model = LinearRegression()
            model.fit(X, y)
            
            # Generate predictions
            predictions = []
            start_date = df_daily['date'].max() + timedelta(days=1)
            
            for month in range(months):
                month_start = start_date + timedelta(days=month * 30)
                month_predictions = []
                
                for day in range(30):  # Predict 30 days per month
                    pred_date = month_start + timedelta(days=day)
                    features_pred = [
                        pred_date.weekday(),
                        pred_date.day,
                        pred_date.month,
                        (pred_date - df_daily['date'].min()).days
                    ]
                    
                    pred_amount = model.predict([features_pred])[0]
                    month_predictions.append(max(0, pred_amount))  # Ensure non-negative
                
                predictions.append(sum(month_predictions))
            
            # Category predictions
            category_predictions = self._predict_by_category(df, months)
            
            # Calculate trend
            recent_avg = df_daily['amount'].tail(7).mean()
            older_avg = df_daily['amount'].head(7).mean()
            trend = (recent_avg - older_avg) / older_avg if older_avg > 0 else 0
            
            return {
                "total_predicted": sum(predictions),
                "monthly_breakdown": predictions,
                "category_predictions": category_predictions,
                "trend": trend,
                "confidence_score": min(0.9, len(df_daily) / 60)  # Higher confidence with more data
            }
            
        except Exception as e:
            logger.error(f"Error in advanced prediction: {e}")
            return self._simple_prediction(df, months)
    
    def _simple_prediction(self, df: pd.DataFrame, months: int) -> Dict[str, Any]:
        """Simple prediction based on averages"""
        try:
            # Calculate daily average
            daily_avg = df.groupby('date')['amount'].sum().mean()
            
            # Predict monthly spending (30 days per month)
            monthly_prediction = daily_avg * 30
            predictions = [monthly_prediction] * months
            
            # Category predictions
            category_predictions = self._predict_by_category(df, months)
            
            return {
                "total_predicted": sum(predictions),
                "monthly_breakdown": predictions,
                "category_predictions": category_predictions,
                "trend": 0,  # No trend calculation for simple prediction
                "confidence_score": 0.6
            }
            
        except Exception as e:
            logger.error(f"Error in simple prediction: {e}")
            return self._create_simple_prediction([], months)
    
    def _predict_by_category(self, df: pd.DataFrame, months: int) -> Dict[str, float]:
        """Predict spending by category"""
        try:
            category_monthly = df.groupby('category')['amount'].sum() / (len(df['date'].unique()) / 30)
            return {cat: amount * months for cat, amount in category_monthly.items()}
        except:
            return {}
    
    def _create_simple_prediction(self, transactions: List[Dict], months: int) -> Dict[str, Any]:
        """Create simple prediction when advanced methods fail"""
        if not transactions:
            return {
                "total_predicted": 0,
                "monthly_breakdown": [0] * months,
                "category_predictions": {},
                "trend": 0,
                "confidence_score": 0.3
            }
        
        # Simple average
        total_amount = sum(float(t.get('amount', 0)) for t in transactions)
        avg_monthly = total_amount / max(1, len(transactions) / 30)  # Rough monthly average
        
        return {
            "total_predicted": avg_monthly * months,
            "monthly_breakdown": [avg_monthly] * months,
            "category_predictions": {},
            "trend": 0,
            "confidence_score": 0.5
        }

class CashFlowPredictor:
    """Predicts future cash flow"""
    
    def predict_cash_flow(self, transactions: List[Dict], months: int) -> Dict[str, Any]:
        """Predict cash flow for the next N months"""
        try:
            df = pd.DataFrame(transactions)
            if df.empty:
                return self._create_default_cash_flow(months)
            
            df['date'] = pd.to_datetime(df['date'])
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            
            # Separate income and expenses (assuming negative amounts are expenses)
            income_transactions = df[df['amount'] > 0]
            expense_transactions = df[df['amount'] < 0]
            
            # Calculate monthly averages
            monthly_income = self._calculate_monthly_average(income_transactions)
            monthly_expenses = abs(self._calculate_monthly_average(expense_transactions))
            
            # Generate projections
            projections = []
            for month in range(months):
                net_flow = monthly_income - monthly_expenses
                projections.append({
                    "month": month,
                    "projected_income": monthly_income,
                    "projected_expenses": monthly_expenses,
                    "net_cash_flow": net_flow
                })
            
            return {
                "monthly_projections": projections,
                "total_projected_income": monthly_income * months,
                "total_projected_expenses": monthly_expenses * months,
                "net_cash_flow": (monthly_income - monthly_expenses) * months
            }
            
        except Exception as e:
            logger.error(f"Error predicting cash flow: {e}")
            return self._create_default_cash_flow(months)
    
    def _calculate_monthly_average(self, df: pd.DataFrame) -> float:
        """Calculate monthly average from transactions"""
        if df.empty:
            return 0
        
        # Group by month and calculate average
        monthly_totals = df.groupby(df['date'].dt.to_period('M'))['amount'].sum()
        return monthly_totals.mean() if not monthly_totals.empty else 0
    
    def _create_default_cash_flow(self, months: int) -> Dict[str, Any]:
        """Create default cash flow when no data available"""
        return {
            "monthly_projections": [
                {
                    "month": i,
                    "projected_income": 0,
                    "projected_expenses": 0,
                    "net_cash_flow": 0
                } for i in range(months)
            ],
            "total_projected_income": 0,
            "total_projected_expenses": 0,
            "net_cash_flow": 0
        }

class BudgetPredictor:
    """Predicts budget performance"""
    
    def forecast_budget_performance(self, budgets: List[Dict], transactions: List[Dict], months: int) -> Dict[str, Any]:
        """Forecast budget performance for the next N months"""
        try:
            # Calculate current spending patterns
            df = pd.DataFrame(transactions)
            df['date'] = pd.to_datetime(df['date'])
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
            
            # Get current month spending by category
            current_month = datetime.now().month
            current_spending = df[df['date'].dt.month == current_month].groupby('category')['amount'].sum()
            
            # Forecast each budget category
            forecasts = []
            at_risk_categories = []
            
            for budget in budgets:
                category = budget.get('category')
                budget_amount = float(budget.get('amount', 0))
                
                # Predict spending based on historical average
                historical_avg = current_spending.get(category, 0)
                predicted_spending = historical_avg * months
                
                forecasts.append({
                    "category": category,
                    "budgeted": budget_amount * months,
                    "predicted": predicted_spending
                })
                
                # Check if at risk of overspending
                if predicted_spending > budget_amount * 1.1:  # 10% over budget
                    at_risk_categories.append({
                        "name": category,
                        "predicted_overage": predicted_spending - budget_amount,
                        "risk_percentage": ((predicted_spending - budget_amount) / budget_amount) * 100
                    })
            
            # Calculate overall adherence score
            total_budgeted = sum(f['budgeted'] for f in forecasts)
            total_predicted = sum(f['predicted'] for f in forecasts)
            adherence_score = min(1.0, total_budgeted / total_predicted) if total_predicted > 0 else 1.0
            
            # Generate recommendations
            recommendations = self._generate_budget_recommendations(at_risk_categories, adherence_score)
            
            return {
                "category_forecasts": forecasts,
                "at_risk_categories": at_risk_categories,
                "recommendations": recommendations,
                "overall_adherence_score": adherence_score
            }
            
        except Exception as e:
            logger.error(f"Error forecasting budget performance: {e}")
            return {
                "category_forecasts": [],
                "at_risk_categories": [],
                "recommendations": ["Error generating forecast. Please check your data."],
                "overall_adherence_score": 0.5
            }
    
    def _generate_budget_recommendations(self, at_risk_categories: List[Dict], adherence_score: float) -> List[str]:
        """Generate budget recommendations"""
        recommendations = []
        
        if at_risk_categories:
            recommendations.append(f"Monitor spending in {len(at_risk_categories)} at-risk categories")
            recommendations.append("Consider adjusting budgets for consistently overspent categories")
        
        if adherence_score < 0.8:
            recommendations.append("Overall budget adherence needs improvement")
            recommendations.append("Review and optimize your spending habits")
        elif adherence_score > 0.95:
            recommendations.append("Excellent budget discipline!")
            recommendations.append("Consider increasing savings or investment allocations")
        
        if not recommendations:
            recommendations.append("Your budget forecast looks healthy")
        
        return recommendations