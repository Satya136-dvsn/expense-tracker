import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock
from sqlalchemy.orm import Session
from services.prediction_service import PredictionService, SpendingPredictor, CashFlowPredictor, BudgetPredictor

class TestSpendingPredictor:
    
    def setup_method(self):
        self.predictor = SpendingPredictor()
        self.sample_transactions = [
            {
                'id': i,
                'amount': 50.0 + (i % 10),
                'category': 'Food' if i % 2 == 0 else 'Shopping',
                'date': (datetime.now() - timedelta(days=i)).isoformat()
            }
            for i in range(30)  # 30 days of data
        ]
    
    def test_predict_spending_with_sufficient_data(self):
        """Test spending prediction with sufficient historical data"""
        result = self.predictor.predict_spending(self.sample_transactions, months=3)
        
        # Verify result structure
        assert 'total_predicted' in result
        assert 'monthly_breakdown' in result
        assert 'category_predictions' in result
        assert 'trend' in result
        assert 'confidence_score' in result
        
        # Verify data types and ranges
        assert isinstance(result['total_predicted'], (int, float))
        assert result['total_predicted'] >= 0
        assert len(result['monthly_breakdown']) == 3
        assert 0 <= result['confidence_score'] <= 1
    
    def test_predict_spending_with_limited_data(self):
        """Test spending prediction with limited data"""
        limited_transactions = self.sample_transactions[:5]  # Only 5 transactions
        
        result = self.predictor.predict_spending(limited_transactions, months=2)
        
        # Should still return valid structure
        assert 'total_predicted' in result
        assert 'monthly_breakdown' in result
        assert len(result['monthly_breakdown']) == 2
        
        # Confidence should be lower with limited data
        assert result['confidence_score'] < 0.8
    
    def test_predict_spending_empty_data(self):
        """Test spending prediction with empty data"""
        result = self.predictor.predict_spending([], months=1)
        
        # Should handle gracefully
        assert result['total_predicted'] == 0
        assert result['monthly_breakdown'] == [0]
        assert result['confidence_score'] == 0.3
    
    def test_advanced_prediction_method(self):
        """Test advanced prediction method with sufficient data"""
        # Create more structured data for better prediction
        structured_transactions = []
        base_date = datetime.now() - timedelta(days=60)
        
        for i in range(60):
            date = base_date + timedelta(days=i)
            # Simulate weekly pattern (higher spending on weekends)
            amount = 40.0 if date.weekday() < 5 else 80.0
            
            structured_transactions.append({
                'id': i,
                'amount': amount,
                'category': 'Food',
                'date': date.isoformat()
            })
        
        result = self.predictor.predict_spending(structured_transactions, months=2)
        
        # Should use advanced prediction
        assert result['confidence_score'] > 0.6
        assert result['total_predicted'] > 0
    
    def test_category_predictions(self):
        """Test category-specific predictions"""
        result = self.predictor.predict_spending(self.sample_transactions, months=1)
        
        category_predictions = result['category_predictions']
        
        # Should have predictions for categories in the data
        if category_predictions:  # May be empty with simple prediction
            for category, amount in category_predictions.items():
                assert isinstance(category, str)
                assert isinstance(amount, (int, float))
                assert amount >= 0

class TestCashFlowPredictor:
    
    def setup_method(self):
        self.predictor = CashFlowPredictor()
        
        # Create mixed income and expense transactions
        self.mixed_transactions = []
        base_date = datetime.now() - timedelta(days=30)
        
        for i in range(30):
            date = base_date + timedelta(days=i)
            
            # Add income (positive amounts)
            if i % 7 == 0:  # Weekly income
                self.mixed_transactions.append({
                    'id': f'income_{i}',
                    'amount': 500.0,  # Positive for income
                    'category': 'Salary',
                    'date': date.isoformat()
                })
            
            # Add expenses (negative amounts)
            self.mixed_transactions.append({
                'id': f'expense_{i}',
                'amount': -50.0,  # Negative for expenses
                'category': 'Food',
                'date': date.isoformat()
            })
    
    def test_predict_cash_flow(self):
        """Test cash flow prediction"""
        result = self.predictor.predict_cash_flow(self.mixed_transactions, months=3)
        
        # Verify result structure
        assert 'monthly_projections' in result
        assert 'total_projected_income' in result
        assert 'total_projected_expenses' in result
        assert 'net_cash_flow' in result
        
        # Verify projections
        projections = result['monthly_projections']
        assert len(projections) == 3
        
        for projection in projections:
            assert 'month' in projection
            assert 'projected_income' in projection
            assert 'projected_expenses' in projection
            assert 'net_cash_flow' in projection
    
    def test_cash_flow_with_only_expenses(self):
        """Test cash flow prediction with only expenses"""
        expense_only = [
            {
                'id': i,
                'amount': -50.0,
                'category': 'Food',
                'date': (datetime.now() - timedelta(days=i)).isoformat()
            }
            for i in range(10)
        ]
        
        result = self.predictor.predict_cash_flow(expense_only, months=1)
        
        # Should handle expenses-only scenario
        assert result['total_projected_income'] == 0
        assert result['total_projected_expenses'] > 0
        assert result['net_cash_flow'] < 0
    
    def test_cash_flow_empty_data(self):
        """Test cash flow prediction with empty data"""
        result = self.predictor.predict_cash_flow([], months=2)
        
        # Should return default structure
        assert len(result['monthly_projections']) == 2
        assert result['total_projected_income'] == 0
        assert result['total_projected_expenses'] == 0
        assert result['net_cash_flow'] == 0

class TestBudgetPredictor:
    
    def setup_method(self):
        self.predictor = BudgetPredictor()
        
        self.sample_budgets = [
            {'category': 'Food', 'amount': 300.0},
            {'category': 'Shopping', 'amount': 200.0},
            {'category': 'Transportation', 'amount': 150.0}
        ]
        
        # Current month transactions
        current_date = datetime.now()
        self.current_transactions = [
            {
                'id': 1,
                'amount': 250.0,  # Under Food budget
                'category': 'Food',
                'date': current_date.isoformat()
            },
            {
                'id': 2,
                'amount': 220.0,  # Over Shopping budget
                'category': 'Shopping',
                'date': current_date.isoformat()
            },
            {
                'id': 3,
                'amount': 100.0,  # Under Transportation budget
                'category': 'Transportation',
                'date': current_date.isoformat()
            }
        ]
    
    def test_forecast_budget_performance(self):
        """Test budget performance forecasting"""
        result = self.predictor.forecast_budget_performance(
            self.sample_budgets, 
            self.current_transactions, 
            months=3
        )
        
        # Verify result structure
        assert 'category_forecasts' in result
        assert 'at_risk_categories' in result
        assert 'recommendations' in result
        assert 'overall_adherence_score' in result
        
        # Verify forecasts
        forecasts = result['category_forecasts']
        assert len(forecasts) == len(self.sample_budgets)
        
        for forecast in forecasts:
            assert 'category' in forecast
            assert 'budgeted' in forecast
            assert 'predicted' in forecast
    
    def test_identify_at_risk_categories(self):
        """Test identification of at-risk budget categories"""
        result = self.predictor.forecast_budget_performance(
            self.sample_budgets, 
            self.current_transactions, 
            months=1
        )
        
        at_risk = result['at_risk_categories']
        
        # Shopping should be at risk (220 > 200 * 1.1)
        shopping_at_risk = any(cat['name'] == 'Shopping' for cat in at_risk)
        assert shopping_at_risk
        
        # Verify at-risk category structure
        if at_risk:
            risk_cat = at_risk[0]
            assert 'name' in risk_cat
            assert 'predicted_overage' in risk_cat
            assert 'risk_percentage' in risk_cat
    
    def test_calculate_adherence_score(self):
        """Test overall budget adherence score calculation"""
        result = self.predictor.forecast_budget_performance(
            self.sample_budgets, 
            self.current_transactions, 
            months=1
        )
        
        adherence_score = result['overall_adherence_score']
        
        # Should be between 0 and 1
        assert 0 <= adherence_score <= 1
        
        # With mixed performance, should be moderate
        assert 0.3 < adherence_score < 1.0
    
    def test_generate_recommendations(self):
        """Test budget recommendation generation"""
        result = self.predictor.forecast_budget_performance(
            self.sample_budgets, 
            self.current_transactions, 
            months=1
        )
        
        recommendations = result['recommendations']
        
        # Should generate recommendations
        assert len(recommendations) > 0
        
        # All recommendations should be strings
        for rec in recommendations:
            assert isinstance(rec, str)
            assert len(rec) > 0
    
    def test_forecast_with_empty_budgets(self):
        """Test forecasting with empty budget data"""
        result = self.predictor.forecast_budget_performance([], self.current_transactions, months=1)
        
        # Should handle gracefully
        assert result['category_forecasts'] == []
        assert result['at_risk_categories'] == []
        assert len(result['recommendations']) > 0  # Should still provide recommendations
    
    def test_forecast_with_empty_transactions(self):
        """Test forecasting with empty transaction data"""
        result = self.predictor.forecast_budget_performance(self.sample_budgets, [], months=1)
        
        # Should handle gracefully
        forecasts = result['category_forecasts']
        
        # Should still create forecasts for each budget category
        assert len(forecasts) == len(self.sample_budgets)
        
        # Predicted amounts should be 0 with no transaction data
        for forecast in forecasts:
            assert forecast['predicted'] == 0

class TestPredictionService:
    
    def setup_method(self):
        self.mock_db = Mock(spec=Session)
        self.service = PredictionService(self.mock_db)
    
    def test_predict_future_spending(self):
        """Test the main spending prediction service method"""
        user_data = {
            'transactions': [
                {
                    'id': 1,
                    'amount': 50.0,
                    'category': 'Food',
                    'date': datetime.now().isoformat()
                }
            ]
        }
        
        result = self.service.predict_future_spending(1, user_data, months=2)
        
        # Verify result is a PredictionResponse
        assert hasattr(result, 'user_id')
        assert hasattr(result, 'predictions')
        assert hasattr(result, 'confidence_score')
        assert hasattr(result, 'generated_at')
        
        assert result.user_id == 1
    
    def test_predict_cash_flow_service(self):
        """Test the cash flow prediction service method"""
        user_data = {
            'transactions': [
                {'amount': 100.0, 'date': datetime.now().isoformat()},
                {'amount': -50.0, 'date': datetime.now().isoformat()}
            ]
        }
        
        result = self.service.predict_cash_flow(1, user_data, months=1)
        
        # Should return cash flow prediction structure
        assert 'monthly_projections' in result
        assert 'net_cash_flow' in result
    
    def test_forecast_budget_performance_service(self):
        """Test the budget forecasting service method"""
        user_data = {
            'budgets': [{'category': 'Food', 'amount': 200.0}],
            'transactions': [{'category': 'Food', 'amount': 150.0, 'date': datetime.now().isoformat()}]
        }
        
        result = self.service.forecast_budget_performance(1, user_data, months=1)
        
        # Should return budget forecast structure
        assert 'category_forecasts' in result
        assert 'overall_adherence_score' in result
    
    def test_service_error_handling(self):
        """Test service error handling"""
        # Test with invalid data that might cause errors
        invalid_data = {'transactions': 'invalid'}
        
        # Should handle errors gracefully and return default predictions
        result = self.service.predict_future_spending(1, invalid_data, months=1)
        
        assert result.confidence_score == 0.3  # Default low confidence
        assert result.predictions['total_predicted'] == 0