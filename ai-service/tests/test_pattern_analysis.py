import pytest
from datetime import datetime, timedelta
from services.pattern_analysis import SpendingPatternAnalyzer, BehaviorClassifier

class TestSpendingPatternAnalyzer:
    
    def setup_method(self):
        self.analyzer = SpendingPatternAnalyzer()
        self.sample_transactions = [
            {
                'id': 1,
                'amount': 50.0,
                'category': 'Food',
                'date': '2024-01-15T10:00:00Z',
                'merchant': 'Restaurant A'
            },
            {
                'id': 2,
                'amount': 100.0,
                'category': 'Shopping',
                'date': '2024-01-16T14:30:00Z',
                'merchant': 'Store B'
            },
            {
                'id': 3,
                'amount': 25.0,
                'category': 'Food',
                'date': '2024-01-17T12:15:00Z',
                'merchant': 'Restaurant C'
            }
        ]
    
    def test_analyze_spending_patterns_with_valid_data(self):
        """Test spending pattern analysis with valid transaction data"""
        result = self.analyzer.analyze_spending_patterns(self.sample_transactions)
        
        assert 'patterns' in result
        assert 'insights' in result
        assert 'analysis_date' in result
        
        patterns = result['patterns']
        assert 'category_patterns' in patterns
        assert 'temporal_patterns' in patterns
        assert 'amount_patterns' in patterns
    
    def test_analyze_spending_patterns_empty_data(self):
        """Test spending pattern analysis with empty data"""
        result = self.analyzer.analyze_spending_patterns([])
        
        assert result['patterns'] == []
        assert result['insights'] == []
    
    def test_category_patterns_analysis(self):
        """Test category-specific pattern analysis"""
        result = self.analyzer.analyze_spending_patterns(self.sample_transactions)
        category_patterns = result['patterns']['category_patterns']
        
        assert 'category_statistics' in category_patterns
        assert 'top_categories' in category_patterns
        
        # Food should be the top category (75.0 total)
        top_categories = category_patterns['top_categories']
        assert 'Food' in top_categories
        assert top_categories['Food'] == 75.0
    
    def test_temporal_patterns_analysis(self):
        """Test temporal pattern analysis"""
        result = self.analyzer.analyze_spending_patterns(self.sample_transactions)
        temporal_patterns = result['patterns']['temporal_patterns']
        
        assert 'day_of_week_patterns' in temporal_patterns
        assert 'monthly_seasonality' in temporal_patterns
        assert 'peak_spending_day' in temporal_patterns
    
    def test_amount_patterns_analysis(self):
        """Test amount pattern analysis"""
        result = self.analyzer.analyze_spending_patterns(self.sample_transactions)
        amount_patterns = result['patterns']['amount_patterns']
        
        assert 'amount_statistics' in amount_patterns
        assert 'spending_tiers' in amount_patterns
        
        stats = amount_patterns['amount_statistics']
        assert stats['mean'] == pytest.approx(58.33, rel=1e-2)
        assert stats['min'] == 25.0
        assert stats['max'] == 100.0

class TestBehaviorClassifier:
    
    def setup_method(self):
        self.classifier = BehaviorClassifier()
        self.consistent_transactions = [
            {'amount': 50.0, 'date': f'2024-01-{i:02d}T10:00:00Z', 'category': 'Food'}
            for i in range(1, 31)
        ]
        self.impulse_transactions = [
            {'amount': 20.0, 'date': '2024-01-01T10:00:00Z', 'category': 'Food'},
            {'amount': 500.0, 'date': '2024-01-02T15:00:00Z', 'category': 'Shopping'},
            {'amount': 25.0, 'date': '2024-01-03T12:00:00Z', 'category': 'Food'},
            {'amount': 800.0, 'date': '2024-01-04T20:00:00Z', 'category': 'Electronics'}
        ]
    
    def test_classify_disciplined_behavior(self):
        """Test classification of disciplined spending behavior"""
        result = self.classifier.classify_spending_behavior(self.consistent_transactions)
        
        assert 'behavior_type' in result
        assert 'metrics' in result
        assert 'recommendations' in result
        
        # Should classify as disciplined due to consistency
        assert result['behavior_type'] in ['disciplined_planner', 'moderate_spender']
    
    def test_classify_impulse_behavior(self):
        """Test classification of impulse spending behavior"""
        result = self.classifier.classify_spending_behavior(self.impulse_transactions)
        
        assert result['behavior_type'] == 'impulse_spender'
        
        # Check that recommendations are provided
        recommendations = result['recommendations']
        assert len(recommendations) > 0
        assert any('waiting period' in rec.lower() for rec in recommendations)
    
    def test_classify_empty_data(self):
        """Test classification with empty data"""
        result = self.classifier.classify_spending_behavior([])
        
        assert result['behavior_type'] == 'insufficient_data'
    
    def test_behavior_metrics_calculation(self):
        """Test behavior metrics calculation"""
        result = self.classifier.classify_spending_behavior(self.consistent_transactions)
        metrics = result['metrics']
        
        assert 'consistency' in metrics
        assert 'budget_adherence' in metrics
        assert 'impulse_ratio' in metrics
        assert 'planning_score' in metrics
        
        # All metrics should be between 0 and 1
        for metric_value in metrics.values():
            assert 0 <= metric_value <= 1
    
    def test_recommendations_generation(self):
        """Test that appropriate recommendations are generated"""
        disciplined_result = self.classifier.classify_spending_behavior(self.consistent_transactions)
        impulse_result = self.classifier.classify_spending_behavior(self.impulse_transactions)
        
        # Different behavior types should get different recommendations
        assert disciplined_result['recommendations'] != impulse_result['recommendations']
        
        # All recommendations should be strings
        for rec in disciplined_result['recommendations']:
            assert isinstance(rec, str)
            assert len(rec) > 0