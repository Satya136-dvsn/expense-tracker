import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch
from sqlalchemy.orm import Session
from services.anomaly_service import AnomalyService, AnomalyDetector, FraudDetector
from models import SpendingAnomaly, AnomalyType, Severity

class TestAnomalyDetector:
    
    def setup_method(self):
        self.detector = AnomalyDetector()
        self.normal_transactions = [
            {
                'id': i,
                'amount': 50.0 + (i % 10),  # Amounts between 50-59
                'category': 'Food',
                'date': (datetime.now() - timedelta(days=i)).isoformat(),
                'merchant': f'Restaurant {i % 3}'
            }
            for i in range(30)
        ]
    
    def test_detect_amount_anomalies(self):
        """Test detection of unusual spending amounts"""
        # Add an unusually large transaction
        anomalous_transactions = self.normal_transactions + [{
            'id': 999,
            'amount': 500.0,  # Much larger than normal 50-59 range
            'category': 'Food',
            'date': datetime.now().isoformat(),
            'merchant': 'Expensive Restaurant'
        }]
        
        anomalies = self.detector.detect_all_anomalies(1, anomalous_transactions)
        
        # Should detect the large amount as anomalous
        amount_anomalies = [a for a in anomalies if a['anomaly_type'] == AnomalyType.UNUSUAL_AMOUNT]
        assert len(amount_anomalies) > 0
        
        # Check anomaly properties
        anomaly = amount_anomalies[0]
        assert anomaly['user_id'] == 1
        assert anomaly['severity'] in [Severity.HIGH, Severity.MEDIUM]
        assert anomaly['confidence_score'] > 0.5
    
    def test_detect_category_anomalies(self):
        """Test detection of unusual spending in categories"""
        # Add transaction with unusual amount for the category
        anomalous_transactions = self.normal_transactions + [{
            'id': 999,
            'amount': 200.0,  # Much larger than typical Food transactions
            'category': 'Food',
            'date': datetime.now().isoformat(),
            'merchant': 'Expensive Restaurant'
        }]
        
        anomalies = self.detector.detect_all_anomalies(1, anomalous_transactions)
        
        # Should detect category anomaly
        category_anomalies = [a for a in anomalies if a['anomaly_type'] == AnomalyType.UNUSUAL_CATEGORY]
        assert len(category_anomalies) > 0
    
    def test_detect_time_anomalies(self):
        """Test detection of unusual transaction times"""
        # Add late night transaction
        late_night_transaction = {
            'id': 999,
            'amount': 100.0,
            'category': 'Shopping',
            'date': datetime.now().replace(hour=2, minute=30).isoformat(),  # 2:30 AM
            'merchant': 'Late Night Store'
        }
        
        transactions_with_late = self.normal_transactions + [late_night_transaction]
        anomalies = self.detector.detect_all_anomalies(1, transactions_with_late)
        
        # Should detect time anomaly
        time_anomalies = [a for a in anomalies if a['anomaly_type'] == AnomalyType.UNUSUAL_TIME]
        assert len(time_anomalies) > 0
    
    def test_detect_merchant_anomalies(self):
        """Test detection of new merchant patterns"""
        # Add transaction with new merchant and large amount
        new_merchant_transaction = {
            'id': 999,
            'amount': 150.0,  # Larger than average
            'category': 'Shopping',
            'date': datetime.now().isoformat(),
            'merchant': 'Brand New Store'  # Never seen before
        }
        
        transactions_with_new = self.normal_transactions + [new_merchant_transaction]
        anomalies = self.detector.detect_all_anomalies(1, transactions_with_new)
        
        # Should detect merchant anomaly
        merchant_anomalies = [a for a in anomalies if a['anomaly_type'] == AnomalyType.UNUSUAL_MERCHANT]
        assert len(merchant_anomalies) > 0
    
    def test_statistical_anomaly_detection(self):
        """Test statistical anomaly detection using Isolation Forest"""
        # Create transactions with one clear outlier
        transactions = [
            {
                'id': i,
                'amount': 50.0,
                'category': 'Food',
                'date': (datetime.now() - timedelta(days=i)).isoformat(),
                'merchant': 'Restaurant'
            }
            for i in range(20)
        ]
        
        # Add clear outlier
        transactions.append({
            'id': 999,
            'amount': 1000.0,  # Very different from others
            'category': 'Electronics',
            'date': datetime.now().isoformat(),
            'merchant': 'Electronics Store'
        })
        
        anomalies = self.detector.detect_all_anomalies(1, transactions)
        
        # Should detect at least one anomaly
        assert len(anomalies) > 0
    
    def test_empty_transactions(self):
        """Test anomaly detection with empty transaction list"""
        anomalies = self.detector.detect_all_anomalies(1, [])
        assert anomalies == []
    
    def test_insufficient_data(self):
        """Test anomaly detection with insufficient data"""
        # Only 2 transactions - not enough for statistical analysis
        minimal_transactions = [
            {
                'id': 1,
                'amount': 50.0,
                'category': 'Food',
                'date': datetime.now().isoformat(),
                'merchant': 'Restaurant'
            },
            {
                'id': 2,
                'amount': 60.0,
                'category': 'Food',
                'date': datetime.now().isoformat(),
                'merchant': 'Restaurant'
            }
        ]
        
        anomalies = self.detector.detect_all_anomalies(1, minimal_transactions)
        
        # Should handle gracefully without errors
        assert isinstance(anomalies, list)

class TestFraudDetector:
    
    def setup_method(self):
        self.fraud_detector = FraudDetector()
    
    def test_detect_rapid_transactions(self):
        """Test detection of rapid succession transactions"""
        base_time = datetime.now()
        
        # Create 5 transactions within 30 minutes (suspicious pattern)
        rapid_transactions = [
            {
                'id': i,
                'amount': 100.0,
                'category': 'Shopping',
                'date': (base_time + timedelta(minutes=i*5)).isoformat(),
                'merchant': f'Store {i}'
            }
            for i in range(5)
        ]
        
        fraud_alerts = self.fraud_detector.detect_fraud_patterns(1, rapid_transactions)
        
        # Should detect rapid transaction pattern
        rapid_alerts = [a for a in fraud_alerts if 'minutes' in a['explanation']]
        assert len(rapid_alerts) > 0
        
        # Should be high severity
        assert any(a['severity'] == Severity.HIGH for a in fraud_alerts)
    
    def test_detect_large_transactions(self):
        """Test detection of unusually large transactions"""
        # Normal transactions
        normal_transactions = [
            {
                'id': i,
                'amount': 50.0,
                'category': 'Food',
                'date': (datetime.now() - timedelta(days=i)).isoformat(),
                'merchant': 'Restaurant'
            }
            for i in range(10)
        ]
        
        # Add very large transaction
        large_transaction = {
            'id': 999,
            'amount': 2500.0,  # 50x the average
            'category': 'Electronics',
            'date': datetime.now().isoformat(),
            'merchant': 'Electronics Store'
        }
        
        transactions = normal_transactions + [large_transaction]
        fraud_alerts = self.fraud_detector.detect_fraud_patterns(1, transactions)
        
        # Should detect large transaction
        large_alerts = [a for a in fraud_alerts if 'Large transaction' in a['explanation']]
        assert len(large_alerts) > 0
    
    def test_no_fraud_patterns(self):
        """Test that normal transactions don't trigger fraud alerts"""
        normal_transactions = [
            {
                'id': i,
                'amount': 50.0 + (i % 10),
                'category': 'Food',
                'date': (datetime.now() - timedelta(days=i)).isoformat(),
                'merchant': 'Restaurant'
            }
            for i in range(10)
        ]
        
        fraud_alerts = self.fraud_detector.detect_fraud_patterns(1, normal_transactions)
        
        # Should not detect any fraud patterns in normal transactions
        assert len(fraud_alerts) == 0

class TestAnomalyService:
    
    def setup_method(self):
        self.mock_db = Mock(spec=Session)
        self.service = AnomalyService(self.mock_db)
    
    def test_get_user_anomalies(self):
        """Test retrieving user anomalies from database"""
        # Mock database response
        mock_anomaly = Mock()
        mock_anomaly.user_id = 1
        mock_anomaly.anomaly_type = AnomalyType.UNUSUAL_AMOUNT
        mock_anomaly.severity = Severity.HIGH
        
        self.mock_db.query.return_value.filter.return_value.order_by.return_value.limit.return_value.all.return_value = [mock_anomaly]
        
        # Test the service method
        result = self.service.get_user_anomalies(1, limit=10)
        
        # Verify database was queried correctly
        self.mock_db.query.assert_called_once()
    
    @patch('services.anomaly_service.AnomalyDetector')
    def test_detect_anomalies(self, mock_detector_class):
        """Test anomaly detection service method"""
        # Mock detector
        mock_detector = Mock()
        mock_detector.detect_all_anomalies.return_value = [
            {
                'user_id': 1,
                'anomaly_type': AnomalyType.UNUSUAL_AMOUNT,
                'severity': Severity.HIGH,
                'explanation': 'Test anomaly',
                'suggested_actions': ['Test action'],
                'confidence_score': 0.9
            }
        ]
        mock_detector_class.return_value = mock_detector
        
        # Mock database operations
        self.mock_db.add = Mock()
        self.mock_db.commit = Mock()
        self.mock_db.refresh = Mock()
        
        # Test transactions
        test_transactions = [
            {
                'id': 1,
                'amount': 100.0,
                'category': 'Food',
                'date': datetime.now().isoformat(),
                'merchant': 'Restaurant'
            }
        ]
        
        # Call service method
        result = self.service.detect_anomalies(1, test_transactions)
        
        # Verify detector was called
        mock_detector.detect_all_anomalies.assert_called_once_with(1, test_transactions)
        
        # Verify database operations
        self.mock_db.add.assert_called()
        self.mock_db.commit.assert_called()
    
    def test_resolve_anomaly(self):
        """Test resolving an anomaly"""
        # Mock anomaly
        mock_anomaly = Mock()
        mock_anomaly.is_resolved = False
        
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_anomaly
        
        # Call service method
        result = self.service.resolve_anomaly(1)
        
        # Verify anomaly was marked as resolved
        assert mock_anomaly.is_resolved == True
        self.mock_db.commit.assert_called_once()
        assert result['status'] == 'resolved'
    
    def test_resolve_nonexistent_anomaly(self):
        """Test resolving a non-existent anomaly"""
        self.mock_db.query.return_value.filter.return_value.first.return_value = None
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="Anomaly not found"):
            self.service.resolve_anomaly(999)