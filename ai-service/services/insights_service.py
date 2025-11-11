from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import json
import logging

from models import Insight, Recommendation, UserMLProfile, InsightType
from schemas import InsightResponse, InsightCreate, UserFeedback, FinancialHealthScore
from services.pattern_analysis import SpendingPatternAnalyzer, BehaviorClassifier

logger = logging.getLogger(__name__)

class InsightsService:
    """Service for generating and managing AI insights"""
    
    def __init__(self, db: Session):
        self.db = db
        self.pattern_analyzer = SpendingPatternAnalyzer()
        self.behavior_classifier = BehaviorClassifier()
    
    async def get_user_insights(self, user_id: int, limit: int = 10) -> List[InsightResponse]:
        """Get existing insights for a user"""
        insights = self.db.query(Insight).filter(
            Insight.user_id == user_id,
            Insight.is_active == True
        ).order_by(Insight.created_at.desc()).limit(limit).all()
        
        return [InsightResponse.from_orm(insight) for insight in insights]
    
    async def generate_insights(self, user_id: int, user_data: Dict[str, Any]) -> List[InsightResponse]:
        """Generate new AI insights for a user"""
        insights = []
        
        try:
            # Analyze spending patterns
            if user_data.get('transactions'):
                pattern_insights = await self._generate_pattern_insights(user_id, user_data['transactions'])
                insights.extend(pattern_insights)
            
            # Analyze budget performance
            if user_data.get('budgets') and user_data.get('transactions'):
                budget_insights = await self._generate_budget_insights(user_id, user_data['budgets'], user_data['transactions'])
                insights.extend(budget_insights)
            
            # Analyze goal progress
            if user_data.get('goals'):
                goal_insights = await self._generate_goal_insights(user_id, user_data['goals'])
                insights.extend(goal_insights)
            
            # Generate savings opportunities
            savings_insights = await self._generate_savings_insights(user_id, user_data)
            insights.extend(savings_insights)
            
            # Save insights to database
            saved_insights = []
            for insight_data in insights:
                insight = Insight(**insight_data)
                self.db.add(insight)
                self.db.commit()
                self.db.refresh(insight)
                saved_insights.append(InsightResponse.from_orm(insight))
            
            return saved_insights
            
        except Exception as e:
            logger.error(f"Error generating insights for user {user_id}: {e}")
            return []
    
    async def _generate_pattern_insights(self, user_id: int, transactions: List[Dict]) -> List[Dict]:
        """Generate insights from spending patterns"""
        insights = []
        
        try:
            analysis = self.pattern_analyzer.analyze_spending_patterns(transactions)
            patterns = analysis.get('patterns', {})
            
            # Category pattern insights
            if 'category_patterns' in patterns:
                category_patterns = patterns['category_patterns']
                
                # Top spending category insight
                if category_patterns.get('top_categories'):
                    top_category = max(category_patterns['top_categories'], 
                                     key=category_patterns['top_categories'].get)
                    top_amount = category_patterns['top_categories'][top_category]
                    
                    insights.append({
                        "user_id": user_id,
                        "type": InsightType.SPENDING_PATTERN,
                        "title": f"Your highest spending is in {top_category}",
                        "description": f"You've spent ${top_amount:.2f} in {top_category} recently, which represents your largest expense category.",
                        "confidence_score": 0.9,
                        "action_items": json.dumps([
                            f"Review your {top_category} expenses for optimization opportunities",
                            f"Set a monthly budget limit for {top_category}",
                            f"Look for ways to reduce {top_category} costs"
                        ])
                    })
                
                # Increasing trend insights
                if category_patterns.get('category_trends'):
                    increasing_categories = [cat for cat, trend in category_patterns['category_trends'].items() 
                                           if trend == "increasing"]
                    
                    if increasing_categories:
                        insights.append({
                            "user_id": user_id,
                            "type": InsightType.SPENDING_PATTERN,
                            "title": "Rising spending detected in multiple categories",
                            "description": f"Your spending is increasing in: {', '.join(increasing_categories[:3])}. This trend may impact your budget.",
                            "confidence_score": 0.8,
                            "action_items": json.dumps([
                                "Review recent purchases in these categories",
                                "Consider setting spending alerts",
                                "Evaluate if this increase is temporary or permanent"
                            ])
                        })
            
            # Temporal pattern insights
            if 'temporal_patterns' in patterns:
                temporal = patterns['temporal_patterns']
                
                if temporal.get('peak_spending_day'):
                    peak_day = temporal['peak_spending_day']
                    insights.append({
                        "user_id": user_id,
                        "type": InsightType.SPENDING_PATTERN,
                        "title": f"You spend the most on {peak_day}s",
                        "description": f"{peak_day} is your highest spending day of the week. Consider planning purchases to spread costs more evenly.",
                        "confidence_score": 0.7,
                        "action_items": json.dumps([
                            f"Plan {peak_day} expenses in advance",
                            "Consider moving some purchases to other days",
                            "Set a daily spending limit for high-spend days"
                        ])
                    })
            
        except Exception as e:
            logger.error(f"Error generating pattern insights: {e}")
        
        return insights
    
    async def _generate_budget_insights(self, user_id: int, budgets: List[Dict], transactions: List[Dict]) -> List[Dict]:
        """Generate insights from budget performance"""
        insights = []
        
        try:
            # Calculate budget vs actual spending
            current_month = datetime.now().month
            current_year = datetime.now().year
            
            monthly_transactions = [
                t for t in transactions 
                if datetime.fromisoformat(t['date'].replace('Z', '+00:00')).month == current_month
                and datetime.fromisoformat(t['date'].replace('Z', '+00:00')).year == current_year
            ]
            
            # Group transactions by category
            category_spending = {}
            for transaction in monthly_transactions:
                category = transaction.get('category', 'Other')
                amount = float(transaction.get('amount', 0))
                category_spending[category] = category_spending.get(category, 0) + amount
            
            # Compare with budgets
            over_budget_categories = []
            under_budget_categories = []
            
            for budget in budgets:
                category = budget.get('category')
                budget_amount = float(budget.get('amount', 0))
                actual_spending = category_spending.get(category, 0)
                
                if actual_spending > budget_amount * 1.1:  # 10% over budget
                    over_budget_categories.append({
                        'category': category,
                        'budget': budget_amount,
                        'actual': actual_spending,
                        'overage': actual_spending - budget_amount
                    })
                elif actual_spending < budget_amount * 0.8:  # 20% under budget
                    under_budget_categories.append({
                        'category': category,
                        'budget': budget_amount,
                        'actual': actual_spending,
                        'savings': budget_amount - actual_spending
                    })
            
            # Generate over-budget insights
            if over_budget_categories:
                total_overage = sum(cat['overage'] for cat in over_budget_categories)
                insights.append({
                    "user_id": user_id,
                    "type": InsightType.BUDGET_ALERT,
                    "title": f"Over budget in {len(over_budget_categories)} categories",
                    "description": f"You're ${total_overage:.2f} over budget this month across multiple categories.",
                    "confidence_score": 0.95,
                    "action_items": json.dumps([
                        "Review overspending categories immediately",
                        "Adjust remaining month spending to compensate",
                        "Consider increasing budgets for consistently overspent categories"
                    ])
                })
            
            # Generate under-budget insights
            if under_budget_categories:
                total_savings = sum(cat['savings'] for cat in under_budget_categories)
                insights.append({
                    "user_id": user_id,
                    "type": InsightType.SAVING_OPPORTUNITY,
                    "title": f"Great job staying under budget!",
                    "description": f"You're ${total_savings:.2f} under budget in {len(under_budget_categories)} categories this month.",
                    "confidence_score": 0.9,
                    "action_items": json.dumps([
                        "Consider moving excess budget to savings",
                        "Reallocate funds to over-budget categories",
                        "Reward yourself for good budget discipline"
                    ])
                })
            
        except Exception as e:
            logger.error(f"Error generating budget insights: {e}")
        
        return insights
    
    async def _generate_goal_insights(self, user_id: int, goals: List[Dict]) -> List[Dict]:
        """Generate insights from goal progress"""
        insights = []
        
        try:
            for goal in goals:
                target_amount = float(goal.get('targetAmount', 0))
                current_amount = float(goal.get('currentAmount', 0))
                target_date = goal.get('targetDate')
                goal_name = goal.get('name', 'Your goal')
                
                if target_amount > 0:
                    progress_percentage = (current_amount / target_amount) * 100
                    
                    # Calculate time remaining
                    if target_date:
                        target_dt = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
                        days_remaining = (target_dt - datetime.now()).days
                        
                        if days_remaining > 0:
                            daily_savings_needed = (target_amount - current_amount) / days_remaining
                            
                            if progress_percentage < 50 and days_remaining < 90:
                                insights.append({
                                    "user_id": user_id,
                                    "type": InsightType.GOAL_PROGRESS,
                                    "title": f"{goal_name} needs attention",
                                    "description": f"You're {progress_percentage:.1f}% towards your goal with {days_remaining} days left. You need to save ${daily_savings_needed:.2f} daily to reach it.",
                                    "confidence_score": 0.85,
                                    "action_items": json.dumps([
                                        f"Increase daily savings to ${daily_savings_needed:.2f}",
                                        "Review and cut unnecessary expenses",
                                        "Consider extending the goal timeline if needed"
                                    ])
                                })
                            elif progress_percentage > 80:
                                insights.append({
                                    "user_id": user_id,
                                    "type": InsightType.GOAL_PROGRESS,
                                    "title": f"Almost there with {goal_name}!",
                                    "description": f"You're {progress_percentage:.1f}% towards your goal. Keep up the great work!",
                                    "confidence_score": 0.9,
                                    "action_items": json.dumps([
                                        "Maintain current savings rate",
                                        "Start planning your next financial goal",
                                        "Celebrate your progress so far"
                                    ])
                                })
            
        except Exception as e:
            logger.error(f"Error generating goal insights: {e}")
        
        return insights
    
    async def _generate_savings_insights(self, user_id: int, user_data: Dict[str, Any]) -> List[Dict]:
        """Generate savings opportunity insights"""
        insights = []
        
        try:
            transactions = user_data.get('transactions', [])
            if not transactions:
                return insights
            
            # Analyze behavior for savings opportunities
            behavior_analysis = self.behavior_classifier.classify_spending_behavior(transactions)
            behavior_type = behavior_analysis.get('behavior_type')
            
            if behavior_type == 'impulse_spender':
                insights.append({
                    "user_id": user_id,
                    "type": InsightType.SAVING_OPPORTUNITY,
                    "title": "Reduce impulse spending to save more",
                    "description": "Your spending pattern shows frequent impulse purchases. Implementing a waiting period could help you save significantly.",
                    "confidence_score": 0.8,
                    "action_items": json.dumps([
                        "Use the 24-hour rule for purchases over $50",
                        "Remove saved payment methods from shopping apps",
                        "Create a wish list instead of buying immediately"
                    ])
                })
            
            # Calculate potential subscription savings
            subscription_keywords = ['netflix', 'spotify', 'subscription', 'monthly', 'annual']
            potential_subscriptions = [
                t for t in transactions 
                if any(keyword in t.get('description', '').lower() for keyword in subscription_keywords)
            ]
            
            if len(potential_subscriptions) > 5:
                total_subscription_cost = sum(float(t.get('amount', 0)) for t in potential_subscriptions[-30:])  # Last 30 transactions
                
                insights.append({
                    "user_id": user_id,
                    "type": InsightType.SAVING_OPPORTUNITY,
                    "title": "Review your subscriptions",
                    "description": f"You have multiple subscription services costing approximately ${total_subscription_cost:.2f} recently. Review and cancel unused ones.",
                    "confidence_score": 0.75,
                    "action_items": json.dumps([
                        "List all your active subscriptions",
                        "Cancel subscriptions you don't use regularly",
                        "Look for cheaper alternatives to expensive services"
                    ])
                })
            
        except Exception as e:
            logger.error(f"Error generating savings insights: {e}")
        
        return insights
    
    async def update_insight_feedback(self, insight_id: int, feedback: UserFeedback) -> Dict[str, str]:
        """Update user feedback for an insight"""
        insight = self.db.query(Insight).filter(Insight.id == insight_id).first()
        if not insight:
            raise ValueError("Insight not found")
        
        insight.user_feedback = feedback.feedback
        self.db.commit()
        
        return {"status": "updated", "message": "Feedback recorded"}
    
    async def dismiss_insight(self, insight_id: int) -> Dict[str, str]:
        """Dismiss an insight"""
        insight = self.db.query(Insight).filter(Insight.id == insight_id).first()
        if not insight:
            raise ValueError("Insight not found")
        
        insight.is_active = False
        self.db.commit()
        
        return {"status": "dismissed", "message": "Insight dismissed"}
    
    async def calculate_financial_health_score(self, user_id: int, user_data: Dict[str, Any]) -> FinancialHealthScore:
        """Calculate comprehensive financial health score"""
        try:
            transactions = user_data.get('transactions', [])
            budgets = user_data.get('budgets', [])
            goals = user_data.get('goals', [])
            
            # Calculate component scores
            spending_score = self._calculate_spending_score(transactions)
            savings_score = self._calculate_savings_score(transactions, goals)
            budget_score = self._calculate_budget_adherence_score(transactions, budgets)
            debt_score = self._calculate_debt_score(transactions)
            
            # Calculate overall score (weighted average)
            overall_score = (
                spending_score * 0.3 +
                savings_score * 0.25 +
                budget_score * 0.25 +
                debt_score * 0.2
            )
            
            # Generate factors and recommendations
            factors = self._identify_health_factors(spending_score, savings_score, budget_score, debt_score)
            recommendations = self._generate_health_recommendations(spending_score, savings_score, budget_score, debt_score)
            
            return FinancialHealthScore(
                user_id=user_id,
                overall_score=overall_score,
                spending_score=spending_score,
                savings_score=savings_score,
                debt_score=debt_score,
                budget_adherence_score=budget_score,
                factors=factors,
                recommendations=recommendations,
                calculated_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error calculating financial health score: {e}")
            # Return default score
            return FinancialHealthScore(
                user_id=user_id,
                overall_score=0.5,
                spending_score=0.5,
                savings_score=0.5,
                debt_score=0.5,
                budget_adherence_score=0.5,
                factors=["Insufficient data for accurate scoring"],
                recommendations=["Add more financial data to improve score accuracy"],
                calculated_at=datetime.utcnow()
            )
    
    def _calculate_spending_score(self, transactions: List[Dict]) -> float:
        """Calculate spending behavior score (0-1)"""
        if not transactions:
            return 0.5
        
        # Analyze spending consistency and trends
        amounts = [float(t.get('amount', 0)) for t in transactions]
        if not amounts:
            return 0.5
        
        # Lower variance in spending = higher score
        mean_amount = sum(amounts) / len(amounts)
        variance = sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)
        consistency_score = max(0, 1 - (variance / (mean_amount ** 2)))
        
        return min(1.0, max(0.0, consistency_score))
    
    def _calculate_savings_score(self, transactions: List[Dict], goals: List[Dict]) -> float:
        """Calculate savings behavior score (0-1)"""
        # Simple heuristic: presence of goals and positive cash flow
        if not goals:
            return 0.3  # Low score if no savings goals
        
        # Check goal progress
        total_progress = 0
        for goal in goals:
            target = float(goal.get('targetAmount', 1))
            current = float(goal.get('currentAmount', 0))
            progress = min(1.0, current / target) if target > 0 else 0
            total_progress += progress
        
        avg_progress = total_progress / len(goals) if goals else 0
        return min(1.0, max(0.0, avg_progress))
    
    def _calculate_budget_adherence_score(self, transactions: List[Dict], budgets: List[Dict]) -> float:
        """Calculate budget adherence score (0-1)"""
        if not budgets:
            return 0.5  # Neutral score if no budgets
        
        # Calculate adherence for current month
        current_month = datetime.now().month
        monthly_transactions = [
            t for t in transactions 
            if datetime.fromisoformat(t['date'].replace('Z', '+00:00')).month == current_month
        ]
        
        category_spending = {}
        for transaction in monthly_transactions:
            category = transaction.get('category', 'Other')
            amount = float(transaction.get('amount', 0))
            category_spending[category] = category_spending.get(category, 0) + amount
        
        adherence_scores = []
        for budget in budgets:
            category = budget.get('category')
            budget_amount = float(budget.get('amount', 0))
            actual_spending = category_spending.get(category, 0)
            
            if budget_amount > 0:
                adherence = min(1.0, budget_amount / actual_spending) if actual_spending > 0 else 1.0
                adherence_scores.append(adherence)
        
        return sum(adherence_scores) / len(adherence_scores) if adherence_scores else 0.5
    
    def _calculate_debt_score(self, transactions: List[Dict]) -> float:
        """Calculate debt management score (0-1)"""
        # Simple heuristic: look for debt-related transactions
        debt_keywords = ['credit card', 'loan', 'interest', 'payment']
        debt_transactions = [
            t for t in transactions 
            if any(keyword in t.get('description', '').lower() for keyword in debt_keywords)
        ]
        
        # Higher score if fewer debt-related transactions
        debt_ratio = len(debt_transactions) / len(transactions) if transactions else 0
        return max(0.0, 1.0 - debt_ratio * 2)  # Penalize high debt transaction ratio
    
    def _identify_health_factors(self, spending: float, savings: float, budget: float, debt: float) -> List[str]:
        """Identify key factors affecting financial health"""
        factors = []
        
        if spending < 0.5:
            factors.append("Inconsistent spending patterns")
        if savings < 0.5:
            factors.append("Low savings rate or goal progress")
        if budget < 0.5:
            factors.append("Poor budget adherence")
        if debt < 0.5:
            factors.append("High debt burden")
        
        if not factors:
            factors.append("Good overall financial discipline")
        
        return factors
    
    def _generate_health_recommendations(self, spending: float, savings: float, budget: float, debt: float) -> List[str]:
        """Generate recommendations based on scores"""
        recommendations = []
        
        if spending < 0.6:
            recommendations.append("Work on creating more consistent spending habits")
        if savings < 0.6:
            recommendations.append("Increase your savings rate and set clear financial goals")
        if budget < 0.6:
            recommendations.append("Improve budget tracking and adherence")
        if debt < 0.6:
            recommendations.append("Focus on debt reduction strategies")
        
        if not recommendations:
            recommendations.append("Continue your excellent financial management")
        
        return recommendations