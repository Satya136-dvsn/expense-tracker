import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import logging

logger = logging.getLogger(__name__)

class SpendingPatternAnalyzer:
    """Analyzes spending patterns using machine learning algorithms"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = KMeans(n_clusters=5, random_state=42)
    
    def analyze_spending_patterns(self, transactions: List[Dict]) -> Dict[str, Any]:
        """Analyze spending patterns from transaction data"""
        if not transactions:
            return {"patterns": [], "insights": []}
        
        df = pd.DataFrame(transactions)
        
        # Convert date strings to datetime
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        patterns = {
            "category_patterns": self._analyze_category_patterns(df),
            "temporal_patterns": self._analyze_temporal_patterns(df),
            "amount_patterns": self._analyze_amount_patterns(df),
            "merchant_patterns": self._analyze_merchant_patterns(df),
            "behavioral_clusters": self._identify_behavioral_clusters(df)
        }
        
        insights = self._generate_pattern_insights(patterns, df)
        
        return {
            "patterns": patterns,
            "insights": insights,
            "analysis_date": datetime.utcnow().isoformat()
        }
    
    def _analyze_category_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze spending patterns by category"""
        category_stats = df.groupby('category').agg({
            'amount': ['sum', 'mean', 'count', 'std'],
            'date': ['min', 'max']
        }).round(2)
        
        category_stats.columns = ['total_spent', 'avg_amount', 'transaction_count', 'amount_std', 'first_transaction', 'last_transaction']
        
        # Calculate category trends
        monthly_category = df.groupby([df['date'].dt.to_period('M'), 'category'])['amount'].sum().unstack(fill_value=0)
        
        trends = {}
        for category in monthly_category.columns:
            values = monthly_category[category].values
            if len(values) > 1:
                trend = np.polyfit(range(len(values)), values, 1)[0]
                trends[category] = "increasing" if trend > 0 else "decreasing" if trend < 0 else "stable"
        
        return {
            "category_statistics": category_stats.to_dict('index'),
            "category_trends": trends,
            "top_categories": df.groupby('category')['amount'].sum().nlargest(5).to_dict()
        }
    
    def _analyze_temporal_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze spending patterns over time"""
        df['day_of_week'] = df['date'].dt.day_name()
        df['hour'] = df['date'].dt.hour
        df['month'] = df['date'].dt.month
        
        # Day of week patterns
        dow_spending = df.groupby('day_of_week')['amount'].agg(['sum', 'mean', 'count']).round(2)
        
        # Monthly seasonality
        monthly_spending = df.groupby('month')['amount'].sum()
        
        # Hourly patterns
        hourly_spending = df.groupby('hour')['amount'].agg(['sum', 'count']).round(2)
        
        # Weekly patterns
        df['week'] = df['date'].dt.isocalendar().week
        weekly_spending = df.groupby('week')['amount'].sum()
        
        return {
            "day_of_week_patterns": dow_spending.to_dict('index'),
            "monthly_seasonality": monthly_spending.to_dict(),
            "hourly_patterns": hourly_spending.to_dict('index'),
            "weekly_trends": weekly_spending.to_dict(),
            "peak_spending_day": dow_spending['sum'].idxmax(),
            "peak_spending_hour": hourly_spending['sum'].idxmax()
        }
    
    def _analyze_amount_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze spending amount patterns"""
        amounts = df['amount'].values
        
        # Statistical measures
        stats = {
            "mean": np.mean(amounts),
            "median": np.median(amounts),
            "std": np.std(amounts),
            "min": np.min(amounts),
            "max": np.max(amounts),
            "q25": np.percentile(amounts, 25),
            "q75": np.percentile(amounts, 75)
        }
        
        # Identify spending tiers
        small_transactions = df[df['amount'] < stats['q25']]
        medium_transactions = df[(df['amount'] >= stats['q25']) & (df['amount'] <= stats['q75'])]
        large_transactions = df[df['amount'] > stats['q75']]
        
        return {
            "amount_statistics": stats,
            "spending_tiers": {
                "small": {
                    "count": len(small_transactions),
                    "total": small_transactions['amount'].sum(),
                    "avg": small_transactions['amount'].mean()
                },
                "medium": {
                    "count": len(medium_transactions),
                    "total": medium_transactions['amount'].sum(),
                    "avg": medium_transactions['amount'].mean()
                },
                "large": {
                    "count": len(large_transactions),
                    "total": large_transactions['amount'].sum(),
                    "avg": large_transactions['amount'].mean()
                }
            }
        }
    
    def _analyze_merchant_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze spending patterns by merchant"""
        if 'merchant' not in df.columns:
            return {"merchant_patterns": "No merchant data available"}
        
        merchant_stats = df.groupby('merchant').agg({
            'amount': ['sum', 'mean', 'count'],
            'date': ['min', 'max']
        }).round(2)
        
        merchant_stats.columns = ['total_spent', 'avg_amount', 'visit_count', 'first_visit', 'last_visit']
        
        # Calculate visit frequency
        for merchant in merchant_stats.index:
            merchant_data = df[df['merchant'] == merchant]
            date_range = (merchant_data['date'].max() - merchant_data['date'].min()).days
            if date_range > 0:
                merchant_stats.loc[merchant, 'visit_frequency'] = len(merchant_data) / date_range
        
        return {
            "top_merchants": merchant_stats.nlargest(10, 'total_spent').to_dict('index'),
            "frequent_merchants": merchant_stats.nlargest(10, 'visit_count').to_dict('index')
        }
    
    def _identify_behavioral_clusters(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Identify behavioral spending clusters using machine learning"""
        try:
            # Create features for clustering
            features = []
            
            # Daily spending features
            daily_spending = df.groupby(df['date'].dt.date)['amount'].agg(['sum', 'count', 'mean'])
            
            if len(daily_spending) < 5:  # Need minimum data for clustering
                return {"clusters": "Insufficient data for clustering"}
            
            # Prepare features
            feature_matrix = daily_spending.values
            
            # Normalize features
            feature_matrix_scaled = self.scaler.fit_transform(feature_matrix)
            
            # Apply clustering
            n_clusters = min(3, len(daily_spending) // 2)  # Adaptive cluster count
            kmeans = KMeans(n_clusters=n_clusters, random_state=42)
            clusters = kmeans.fit_predict(feature_matrix_scaled)
            
            # Analyze clusters
            cluster_analysis = {}
            for i in range(n_clusters):
                cluster_data = daily_spending[clusters == i]
                cluster_analysis[f"cluster_{i}"] = {
                    "size": len(cluster_data),
                    "avg_daily_spending": cluster_data['sum'].mean(),
                    "avg_transactions_per_day": cluster_data['count'].mean(),
                    "avg_transaction_amount": cluster_data['mean'].mean(),
                    "description": self._describe_cluster(cluster_data)
                }
            
            return {
                "clusters": cluster_analysis,
                "total_clusters": n_clusters
            }
        
        except Exception as e:
            logger.error(f"Error in behavioral clustering: {e}")
            return {"clusters": "Error in clustering analysis"}
    
    def _describe_cluster(self, cluster_data: pd.DataFrame) -> str:
        """Generate description for a spending cluster"""
        avg_spending = cluster_data['sum'].mean()
        avg_transactions = cluster_data['count'].mean()
        
        if avg_spending > 100 and avg_transactions > 5:
            return "High spending, high activity days"
        elif avg_spending > 100 and avg_transactions <= 5:
            return "High spending, low activity days"
        elif avg_spending <= 100 and avg_transactions > 5:
            return "Low spending, high activity days"
        else:
            return "Low spending, low activity days"
    
    def _generate_pattern_insights(self, patterns: Dict, df: pd.DataFrame) -> List[str]:
        """Generate actionable insights from spending patterns"""
        insights = []
        
        # Category insights
        if 'category_patterns' in patterns:
            top_category = max(patterns['category_patterns']['top_categories'], 
                             key=patterns['category_patterns']['top_categories'].get)
            insights.append(f"Your highest spending category is {top_category}")
            
            # Trend insights
            increasing_categories = [cat for cat, trend in patterns['category_patterns']['category_trends'].items() 
                                   if trend == "increasing"]
            if increasing_categories:
                insights.append(f"Spending is increasing in: {', '.join(increasing_categories[:3])}")
        
        # Temporal insights
        if 'temporal_patterns' in patterns:
            peak_day = patterns['temporal_patterns']['peak_spending_day']
            insights.append(f"You spend the most on {peak_day}s")
        
        # Amount insights
        if 'amount_patterns' in patterns:
            large_transactions = patterns['amount_patterns']['spending_tiers']['large']
            if large_transactions['count'] > 0:
                insights.append(f"You have {large_transactions['count']} large transactions averaging ${large_transactions['avg']:.2f}")
        
        return insights

class BehaviorClassifier:
    """Classifies user spending behavior"""
    
    def classify_spending_behavior(self, transactions: List[Dict], budgets: List[Dict] = None) -> Dict[str, Any]:
        """Classify user's spending behavior type"""
        if not transactions:
            return {"behavior_type": "insufficient_data"}
        
        df = pd.DataFrame(transactions)
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        # Calculate behavior metrics
        metrics = self._calculate_behavior_metrics(df, budgets)
        
        # Classify behavior
        behavior_type = self._classify_behavior(metrics)
        
        return {
            "behavior_type": behavior_type,
            "metrics": metrics,
            "recommendations": self._get_behavior_recommendations(behavior_type)
        }
    
    def _calculate_behavior_metrics(self, df: pd.DataFrame, budgets: List[Dict] = None) -> Dict[str, float]:
        """Calculate metrics for behavior classification"""
        # Spending consistency
        daily_spending = df.groupby(df['date'].dt.date)['amount'].sum()
        consistency = 1 - (daily_spending.std() / daily_spending.mean()) if daily_spending.mean() > 0 else 0
        
        # Budget adherence (if budgets available)
        budget_adherence = 0.5  # Default neutral score
        if budgets:
            # Calculate budget adherence logic here
            pass
        
        # Impulse spending indicator
        large_transaction_threshold = df['amount'].quantile(0.9)
        impulse_transactions = df[df['amount'] > large_transaction_threshold]
        impulse_ratio = len(impulse_transactions) / len(df)
        
        # Planning indicator
        weekend_spending = df[df['date'].dt.dayofweek >= 5]['amount'].sum()
        weekday_spending = df[df['date'].dt.dayofweek < 5]['amount'].sum()
        planning_score = weekday_spending / (weekend_spending + weekday_spending) if (weekend_spending + weekday_spending) > 0 else 0.5
        
        return {
            "consistency": max(0, min(1, consistency)),
            "budget_adherence": budget_adherence,
            "impulse_ratio": impulse_ratio,
            "planning_score": planning_score
        }
    
    def _classify_behavior(self, metrics: Dict[str, float]) -> str:
        """Classify behavior based on metrics"""
        consistency = metrics['consistency']
        impulse_ratio = metrics['impulse_ratio']
        planning_score = metrics['planning_score']
        
        if consistency > 0.7 and impulse_ratio < 0.1 and planning_score > 0.6:
            return "disciplined_planner"
        elif consistency > 0.5 and impulse_ratio < 0.2:
            return "moderate_spender"
        elif impulse_ratio > 0.3:
            return "impulse_spender"
        elif planning_score < 0.3:
            return "spontaneous_spender"
        else:
            return "average_spender"
    
    def _get_behavior_recommendations(self, behavior_type: str) -> List[str]:
        """Get recommendations based on behavior type"""
        recommendations = {
            "disciplined_planner": [
                "Continue your excellent spending discipline",
                "Consider increasing your savings rate",
                "Explore investment opportunities"
            ],
            "moderate_spender": [
                "Set up automatic savings transfers",
                "Review and optimize your budget categories",
                "Track your progress monthly"
            ],
            "impulse_spender": [
                "Implement a 24-hour waiting period for large purchases",
                "Set up spending alerts for your categories",
                "Consider using cash for discretionary spending"
            ],
            "spontaneous_spender": [
                "Create a weekly spending plan",
                "Set aside money for spontaneous purchases",
                "Use budgeting apps with real-time notifications"
            ],
            "average_spender": [
                "Focus on one spending category to optimize",
                "Set up automatic bill payments",
                "Review your spending weekly"
            ]
        }
        
        return recommendations.get(behavior_type, ["Continue monitoring your spending patterns"])