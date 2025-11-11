import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from services.insights_service import InsightsService
from models import Insight, InsightType

class TestInsightsService:
    
    def setup_method(self):
        self.mock_db = Mock(spec=Session)
        self.service = InsightsService(self.mock_db)
        
        self.sample_user_data = {
            'transactions': [
                {
                    'id': 1,
                    'amount': 50.0,
                    'category': 'Food',
                    'date': '2024-01-15T10:00:00Z',
                    'description': 'Restaurant meal'
                },
                {
                    'id': 2,
                    'amount': 100.0,
                    'category': 'Shopping',
                    'date': '2024-01-16T14:30:00Z',
                    'description': 'Clothing purchase'
                },
                {
                    'id': 3,
                    'amount': 75.0,
                    'category': 'Food',
                    'date': '2024-01-17T12:15:00Z',
                    'description': 'Grocery shopping'
                }
            ],
            'budgets': [
                {
                    'category': 'Food',
                    'amount': 200.0
                },
                {
                    'category': 'Shopping',
                    'amount': 150.0
                }
            ],
            'goals': [
                {
                    'name': 'Emergency Fund',
                    'targetAmount': 1000.0,
                    'currentAmount': 500.0,
                    'targetDate': '2024-12-31T00:00:00Z'
                }
            ]
        }
    
    def test_get_user_insights(self):
        """Test retrieving existing insights for a user"""
        # Mock database response
        mock_insight = Mock()
        mock_insight.id = 1
        mock_insight.user_id = 1
        mock_insight.type = InsightType.SPENDING_PATTERN
        mock_insight.title = "Test Insight"
        mock_insight.is_active = True
        
        self.mock_db.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [mock_insight]
        
        # Call service method
        result = self.service.get_user_insights(1, limit=10)
        
        # Verify database was queried
        self.mock_db.query.assert_called_once()
    
    @patch('services.insights_service.SpendingPatternAnalyzer')
    def test_generate_pattern_insights(self, mock_analyzer_class):
        """Test generation of spending pattern insights"""
        # Mock pattern analyzer
        mock_analyzer = Mock()
        mock_analyzer.analyze_spending_patterns.return_value = {
            'patterns': {
                'category_patterns': {
                    'top_categories': {'Food': 125.0, 'Shopping': 100.0},
                    'category_trends': {'Food': 'increasing', 'Shopping': 'stable'}
                },
                'temporal_patterns': {
                    'peak_spending_day': 'Monday'
                }
            },
            'insights': ['Test insight']
        }
        mock_analyzer_class.return_value = mock_analyzer
        
        # Mock database operations
        self.mock_db.add = Mock()
        self.mock_db.commit = Mock()
        self.mock_db.refresh = Mock()
        
        # Call service method
        result = self.service.generate_insights(1, self.sample_user_data)
        
        # Verify analyzer was called
        mock_analyzer.analyze_spending_patterns.assert_called_once()
        
        # Verify insights were generated and saved
        self.mock_db.add.assert_called()
        self.mock_db.commit.assert_called()
    
    def test_generate_budget_insights(self):
        """Test generation of budget-related insights"""
        # Mock database operations
        self.mock_db.add = Mock()
        self.mock_db.commit = Mock()
        self.mock_db.refresh = Mock()
        
        # Call service method
        result = self.service.generate_insights(1, self.sample_user_data)
        
        # Should generate insights without errors
        assert isinstance(result, list)
    
    def test_generate_goal_insights(self):
        """Test generation of goal progress insights"""
        # Test data with goal that needs attention
        goal_data = {
            'transactions': [],
            'budgets': [],
            'goals': [
                {
                    'name': 'Vacation Fund',
                    'targetAmount': 2000.0,
                    'currentAmount': 200.0,  # Only 10% progress
                    'targetDate': (datetime.now() + timedelta(days=60)).isoformat()  # 2 months left
                }
            ]
        }
        
        # Mock database operations
        self.mock_db.add = Mock()
        self.mock_db.commit = Mock()
        self.mock_db.refresh = Mock()
        
        # Call service method
        result = self.service.generate_insights(1, goal_data)
        
        # Should generate goal-related insights
        assert isinstance(result, list)
    
    def test_calculate_financial_health_score(self):
        """Test financial health score calculation"""
        result = self.service.calculate_financial_health_score(1, self.sample_user_data)
        
        # Verify score structure
        assert hasattr(result, 'user_id')
        assert hasattr(result, 'overall_score')
        assert hasattr(result, 'spending_score')
        assert hasattr(result, 'savings_score')
        assert hasattr(result, 'debt_score')
        assert hasattr(result, 'budget_adherence_score')
        assert hasattr(result, 'factors')
        assert hasattr(result, 'recommendations')
        
        # Verify score ranges
        assert 0 <= result.overall_score <= 1
        assert 0 <= result.spending_score <= 1
        assert 0 <= result.savings_score <= 1
        assert 0 <= result.debt_score <= 1
        assert 0 <= result.budget_adherence_score <= 1
        
        # Verify factors and recommendations are lists
        assert isinstance(result.factors, list)
        assert isinstance(result.recommendations, list)
    
    def test_calculate_spending_score(self):
        """Test spending score calculation"""
        transactions = [
            {'amount': 50.0},
            {'amount': 55.0},
            {'amount': 45.0},
            {'amount': 52.0}
        ]
        
        score = self.service._calculate_spending_score(transactions)
        
        # Should return a score between 0 and 1
        assert 0 <= score <= 1
        
        # Consistent spending should get a higher score
        assert score > 0.5  # These amounts are fairly consistent
    
    def test_calculate_savings_score(self):
        """Test savings score calculation"""
        goals = [
            {
                'targetAmount': 1000.0,
                'currentAmount': 500.0  # 50% progress
            },
            {
                'targetAmount': 2000.0,
                'currentAmount': 800.0  # 40% progress
            }
        ]
        
        score = self.service._calculate_savings_score([], goals)
        
        # Should return a score between 0 and 1
        assert 0 <= score <= 1
        
        # With 45% average progress, should be moderate score
        assert 0.3 < score < 0.7
    
    def test_calculate_budget_adherence_score(self):
        """Test budget adherence score calculation"""
        # Current month transactions
        current_date = datetime.now()
        transactions = [
            {
                'category': 'Food',
                'amount': 80.0,  # Under budget (200)
                'date': current_date.isoformat()
            },
            {
                'category': 'Shopping',
                'amount': 200.0,  # Over budget (150)
                'date': current_date.isoformat()
            }
        ]
        
        budgets = [
            {'category': 'Food', 'amount': 200.0},
            {'category': 'Shopping', 'amount': 150.0}
        ]
        
        score = self.service._calculate_budget_adherence_score(transactions, budgets)
        
        # Should return a score between 0 and 1
        assert 0 <= score <= 1
    
    def test_update_insight_feedback(self):
        """Test updating insight feedback"""
        # Mock insight
        mock_insight = Mock()
        mock_insight.user_feedback = None
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_insight
        
        # Mock feedback
        mock_feedback = Mock()
        mock_feedback.feedback = 'helpful'
        
        # Call service method
        result = self.service.update_insight_feedback(1, mock_feedback)
        
        # Verify feedback was updated
        assert mock_insight.user_feedback == 'helpful'
        self.mock_db.commit.assert_called_once()
        assert result['status'] == 'updated'
    
    def test_dismiss_insight(self):
        """Test dismissing an insight"""
        # Mock insight
        mock_insight = Mock()
        mock_insight.is_active = True
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_insight
        
        # Call service method
        result = self.service.dismiss_insight(1)
        
        # Verify insight was dismissed
        assert mock_insight.is_active == False
        self.mock_db.commit.assert_called_once()
        assert result['status'] == 'dismissed'
    
    def test_generate_insights_with_empty_data(self):
        """Test insight generation with empty data"""
        empty_data = {
            'transactions': [],
            'budgets': [],
            'goals': []
        }
        
        # Mock database operations
        self.mock_db.add = Mock()
        self.mock_db.commit = Mock()
        self.mock_db.refresh = Mock()
        
        # Should handle empty data gracefully
        result = self.service.generate_insights(1, empty_data)
        
        assert isinstance(result, list)
    
    def test_generate_insights_error_handling(self):
        """Test insight generation error handling"""
        # Mock database operations to raise an exception
        self.mock_db.add.side_effect = Exception("Database error")
        
        # Should handle errors gracefully
        result = self.service.generate_insights(1, self.sample_user_data)
        
        # Should return empty list on error
        assert result == []
    
    def test_identify_health_factors(self):
        """Test identification of health factors"""
        # Test with poor scores
        factors = self.service._identify_health_factors(0.3, 0.4, 0.2, 0.1)
        
        # Should identify multiple issues
        assert len(factors) > 1
        assert any('spending' in factor.lower() for factor in factors)
        assert any('savings' in factor.lower() for factor in factors)
        assert any('budget' in factor.lower() for factor in factors)
        assert any('debt' in factor.lower() for factor in factors)
    
    def test_generate_health_recommendations(self):
        """Test generation of health recommendations"""
        # Test with poor scores
        recommendations = self.service._generate_health_recommendations(0.3, 0.4, 0.2, 0.1)
        
        # Should generate multiple recommendations
        assert len(recommendations) > 1
        
        # All recommendations should be strings
        for rec in recommendations:
            assert isinstance(rec, str)
            assert len(rec) > 0