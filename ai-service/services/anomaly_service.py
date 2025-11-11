from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import logging

from models import SpendingAnomaly, AnomalyType, Severity
from schemas import AnomalyResponse, AnomalyCreate

logger = logging.getLogger(__name__)

class AnomalyService:
    """Service for detecting and managing spending anomalies"""
    
    def __init__(self, db: Session):
        self.db = db
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
    
    async def get_user_anomalies(self, user_id: int, limit: int = 20, severity: str = None) -> List[AnomalyResponse]:
        """Get existing anomalies for a user"""
        query = self.db.query(SpendingAnomaly).filter(SpendingAnomaly.user_id == user_id)
        
        if severity:
            query = query.filter(SpendingAnomaly.severity == severity)
        
        anomalies = query.order_by(SpendingAnomaly.created_at.desc()).limit(limit).all()
        
        return [AnomalyResponse.from_orm(anomaly) for anomaly in anomalies]
    
    async def detect_anomalies(self, user_id: int, transactions: List[Dict]) -> List[AnomalyResponse]:
        """Detect new anomalies in user transactions"""
        if not transactions:
            return []
        
        detector = AnomalyDetector()
        anomalies = detector.detect_all_anomalies(user_id, transactions)
        
        # Save anomalies to database
        saved_anomalies = []
        for anomaly_data in anomalies:
            anomaly = SpendingAnomaly(**anomaly_data)
            self.db.add(anomaly)
            self.db.commit()
            self.db.refresh(anomaly)
            saved_anomalies.append(AnomalyResponse.from_orm(anomaly))
        
        return saved_anomalies
    
    async def resolve_anomaly(self, anomaly_id: int) -> Dict[str, str]:
        """Mark an anomaly as resolved"""
        anomaly = self.db.query(SpendingAnomaly).filter(SpendingAnomaly.id == anomaly_id).first()
        if not anomaly:
            raise ValueError("Anomaly not found")
        
        anomaly.is_resolved = True
        self.db.commit()
        
        return {"status": "resolved", "message": "Anomaly marked as resolved"}
    
    async def get_fraud_alerts(self, user_id: int) -> List[AnomalyResponse]:
        """Get high-severity fraud alerts for a user"""
        fraud_alerts = self.db.query(SpendingAnomaly).filter(
            SpendingAnomaly.user_id == user_id,
            SpendingAnomaly.severity == Severity.HIGH,
            SpendingAnomaly.is_resolved == False
        ).order_by(SpendingAnomaly.created_at.desc()).all()
        
        return [AnomalyResponse.from_orm(alert) for alert in fraud_alerts]

class AnomalyDetector:
    """Core anomaly detection algorithms"""
    
    def __init__(self):
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
    
    def detect_all_anomalies(self, user_id: int, transactions: List[Dict]) -> List[Dict]:
        """Detect all types of anomalies in transactions"""
        anomalies = []
        
        # Convert to DataFrame for analysis
        df = pd.DataFrame(transactions)
        if df.empty:
            return anomalies
        
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        # Detect different types of anomalies
        anomalies.extend(self._detect_amount_anomalies(user_id, df))
        anomalies.extend(self._detect_category_anomalies(user_id, df))
        anomalies.extend(self._detect_time_anomalies(user_id, df))
        anomalies.extend(self._detect_merchant_anomalies(user_id, df))
        anomalies.extend(self._detect_statistical_anomalies(user_id, df))
        
        return anomalies
    
    def _detect_amount_anomalies(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect unusual spending amounts"""
        anomalies = []
        
        # Calculate statistical thresholds
        mean_amount = df['amount'].mean()
        std_amount = df['amount'].std()
        
        # Define thresholds (3 standard deviations)
        high_threshold = mean_amount + (3 * std_amount)
        
        # Find anomalous amounts
        unusual_amounts = df[df['amount'] > high_threshold]
        
        for _, transaction in unusual_amounts.iterrows():
            severity = self._calculate_amount_severity(transaction['amount'], mean_amount, std_amount)
            
            anomalies.append({
                "user_id": user_id,
                "transaction_id": transaction.get('id'),
                "anomaly_type": AnomalyType.UNUSUAL_AMOUNT,
                "severity": severity,
                "explanation": f"Transaction amount ${transaction['amount']:.2f} is significantly higher than your average of ${mean_amount:.2f}",
                "suggested_actions": [
                    "Verify this transaction is legitimate",
                    "Check if this was a planned large purchase",
                    "Review your budget for this category"
                ],
                "confidence_score": min(0.95, (transaction['amount'] - mean_amount) / std_amount / 3)
            })
        
        return anomalies
    
    def _detect_category_anomalies(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect unusual spending in categories"""
        anomalies = []
        
        # Group by category and analyze patterns
        category_stats = df.groupby('category')['amount'].agg(['mean', 'std', 'count'])
        
        for category, stats in category_stats.iterrows():
            if stats['count'] < 3:  # Need minimum transactions for analysis
                continue
            
            category_transactions = df[df['category'] == category]
            threshold = stats['mean'] + (2.5 * stats['std'])
            
            unusual_transactions = category_transactions[category_transactions['amount'] > threshold]
            
            for _, transaction in unusual_transactions.iterrows():
                severity = self._calculate_category_severity(transaction['amount'], stats['mean'], stats['std'])
                
                anomalies.append({
                    "user_id": user_id,
                    "transaction_id": transaction.get('id'),
                    "anomaly_type": AnomalyType.UNUSUAL_CATEGORY,
                    "severity": severity,
                    "explanation": f"${transaction['amount']:.2f} spending in {category} is unusual (average: ${stats['mean']:.2f})",
                    "suggested_actions": [
                        f"Review your {category} spending pattern",
                        "Check if this category needs budget adjustment",
                        "Verify the transaction category is correct"
                    ],
                    "confidence_score": min(0.9, (transaction['amount'] - stats['mean']) / stats['std'] / 2.5)
                })
        
        return anomalies
    
    def _detect_time_anomalies(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect unusual spending times"""
        anomalies = []
        
        # Add time features
        df['hour'] = df['date'].dt.hour
        df['day_of_week'] = df['date'].dt.dayofweek
        
        # Detect late night transactions (potential fraud indicator)
        late_night_transactions = df[(df['hour'] >= 23) | (df['hour'] <= 5)]
        
        for _, transaction in late_night_transactions.iterrows():
            if transaction['amount'] > df['amount'].median():  # Only flag significant amounts
                anomalies.append({
                    "user_id": user_id,
                    "transaction_id": transaction.get('id'),
                    "anomaly_type": AnomalyType.UNUSUAL_TIME,
                    "severity": Severity.MEDIUM,
                    "explanation": f"Transaction at {transaction['date'].strftime('%H:%M')} is outside normal hours",
                    "suggested_actions": [
                        "Verify you made this transaction",
                        "Check for unauthorized account access",
                        "Review recent account activity"
                    ],
                    "confidence_score": 0.7
                })
        
        # Detect weekend vs weekday anomalies
        weekend_avg = df[df['day_of_week'] >= 5]['amount'].mean()
        weekday_avg = df[df['day_of_week'] < 5]['amount'].mean()
        
        if weekend_avg > 0 and weekday_avg > 0:
            ratio = weekend_avg / weekday_avg
            if ratio > 2:  # Weekend spending significantly higher
                recent_weekends = df[(df['day_of_week'] >= 5) & 
                                   (df['date'] >= df['date'].max() - timedelta(days=14))]
                
                if not recent_weekends.empty and recent_weekends['amount'].sum() > weekend_avg * 2:
                    anomalies.append({
                        "user_id": user_id,
                        "transaction_id": None,
                        "anomaly_type": AnomalyType.UNUSUAL_TIME,
                        "severity": Severity.LOW,
                        "explanation": "Recent weekend spending is significantly higher than usual",
                        "suggested_actions": [
                            "Review weekend spending habits",
                            "Consider setting weekend spending limits",
                            "Plan weekend activities within budget"
                        ],
                        "confidence_score": 0.6
                    })
        
        return anomalies
    
    def _detect_merchant_anomalies(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect unusual merchant patterns"""
        anomalies = []
        
        if 'merchant' not in df.columns:
            return anomalies
        
        # Detect new merchants with large transactions
        merchant_stats = df.groupby('merchant')['amount'].agg(['sum', 'count', 'mean'])
        new_merchants = merchant_stats[merchant_stats['count'] == 1]
        
        # Flag new merchants with amounts above average
        overall_avg = df['amount'].mean()
        
        for merchant, stats in new_merchants.iterrows():
            if stats['mean'] > overall_avg * 1.5:
                transaction = df[df['merchant'] == merchant].iloc[0]
                
                anomalies.append({
                    "user_id": user_id,
                    "transaction_id": transaction.get('id'),
                    "anomaly_type": AnomalyType.UNUSUAL_MERCHANT,
                    "severity": Severity.MEDIUM,
                    "explanation": f"First transaction with {merchant} for ${stats['mean']:.2f}",
                    "suggested_actions": [
                        "Verify this merchant is legitimate",
                        "Check if you recognize this purchase",
                        "Monitor future transactions with this merchant"
                    ],
                    "confidence_score": 0.65
                })
        
        return anomalies
    
    def _detect_statistical_anomalies(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect anomalies using statistical methods (Isolation Forest)"""
        anomalies = []
        
        if len(df) < 10:  # Need minimum data for statistical analysis
            return anomalies
        
        try:
            # Prepare features for anomaly detection
            features = self._prepare_features_for_ml(df)
            
            if features is None or len(features) == 0:
                return anomalies
            
            # Apply Isolation Forest
            outliers = self.isolation_forest.fit_predict(features)
            
            # Process outliers
            outlier_indices = np.where(outliers == -1)[0]
            
            for idx in outlier_indices:
                transaction = df.iloc[idx]
                
                # Calculate anomaly score
                anomaly_score = self.isolation_forest.decision_function(features[idx:idx+1])[0]
                confidence = min(0.9, abs(anomaly_score) * 2)
                
                severity = Severity.HIGH if confidence > 0.8 else Severity.MEDIUM if confidence > 0.6 else Severity.LOW
                
                anomalies.append({
                    "user_id": user_id,
                    "transaction_id": transaction.get('id'),
                    "anomaly_type": AnomalyType.UNUSUAL_AMOUNT,  # Default type for statistical anomalies
                    "severity": severity,
                    "explanation": f"Statistical analysis flagged this ${transaction['amount']:.2f} transaction as unusual",
                    "suggested_actions": [
                        "Review this transaction for accuracy",
                        "Check if this represents a change in spending pattern",
                        "Verify the transaction details"
                    ],
                    "confidence_score": confidence
                })
        
        except Exception as e:
            logger.error(f"Error in statistical anomaly detection: {e}")
        
        return anomalies
    
    def _prepare_features_for_ml(self, df: pd.DataFrame) -> Optional[np.ndarray]:
        """Prepare features for machine learning anomaly detection"""
        try:
            # Create feature matrix
            features = []
            
            # Amount features
            features.append(df['amount'].values)
            
            # Time features
            df['hour'] = df['date'].dt.hour
            df['day_of_week'] = df['date'].dt.dayofweek
            df['day_of_month'] = df['date'].dt.day
            
            features.append(df['hour'].values)
            features.append(df['day_of_week'].values)
            features.append(df['day_of_month'].values)
            
            # Category encoding (simple frequency encoding)
            category_counts = df['category'].value_counts()
            df['category_frequency'] = df['category'].map(category_counts)
            features.append(df['category_frequency'].values)
            
            # Combine features
            feature_matrix = np.column_stack(features)
            
            # Scale features
            feature_matrix_scaled = self.scaler.fit_transform(feature_matrix)
            
            return feature_matrix_scaled
        
        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            return None
    
    def _calculate_amount_severity(self, amount: float, mean_amount: float, std_amount: float) -> Severity:
        """Calculate severity based on amount deviation"""
        z_score = (amount - mean_amount) / std_amount if std_amount > 0 else 0
        
        if z_score > 4:
            return Severity.HIGH
        elif z_score > 3:
            return Severity.MEDIUM
        else:
            return Severity.LOW
    
    def _calculate_category_severity(self, amount: float, category_mean: float, category_std: float) -> Severity:
        """Calculate severity based on category deviation"""
        z_score = (amount - category_mean) / category_std if category_std > 0 else 0
        
        if z_score > 3:
            return Severity.HIGH
        elif z_score > 2:
            return Severity.MEDIUM
        else:
            return Severity.LOW

class FraudDetector:
    """Specialized fraud detection algorithms"""
    
    def __init__(self):
        self.risk_patterns = {
            "rapid_transactions": {"threshold": 5, "timeframe": 3600},  # 5 transactions in 1 hour
            "large_amount": {"multiplier": 5},  # 5x average transaction
            "unusual_location": {"enabled": False},  # Would need location data
            "new_merchant_large": {"multiplier": 2}  # 2x average for new merchant
        }
    
    def detect_fraud_patterns(self, user_id: int, transactions: List[Dict]) -> List[Dict]:
        """Detect potential fraud patterns"""
        fraud_alerts = []
        
        df = pd.DataFrame(transactions)
        if df.empty:
            return fraud_alerts
        
        df['date'] = pd.to_datetime(df['date'])
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce')
        
        # Detect rapid transaction patterns
        fraud_alerts.extend(self._detect_rapid_transactions(user_id, df))
        
        # Detect unusually large transactions
        fraud_alerts.extend(self._detect_large_transactions(user_id, df))
        
        return fraud_alerts
    
    def _detect_rapid_transactions(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect rapid succession of transactions (potential card skimming)"""
        alerts = []
        
        # Sort by date
        df_sorted = df.sort_values('date')
        
        # Check for rapid transactions
        for i in range(len(df_sorted) - 4):
            window = df_sorted.iloc[i:i+5]
            time_diff = (window['date'].max() - window['date'].min()).total_seconds()
            
            if time_diff <= self.risk_patterns["rapid_transactions"]["timeframe"]:
                total_amount = window['amount'].sum()
                
                alerts.append({
                    "user_id": user_id,
                    "transaction_id": None,
                    "anomaly_type": AnomalyType.UNUSUAL_TIME,
                    "severity": Severity.HIGH,
                    "explanation": f"5 transactions totaling ${total_amount:.2f} in {time_diff/60:.1f} minutes",
                    "suggested_actions": [
                        "Immediately check your card and account",
                        "Contact your bank if you didn't make these transactions",
                        "Consider freezing your card temporarily"
                    ],
                    "confidence_score": 0.9
                })
        
        return alerts
    
    def _detect_large_transactions(self, user_id: int, df: pd.DataFrame) -> List[Dict]:
        """Detect unusually large transactions that might indicate fraud"""
        alerts = []
        
        avg_amount = df['amount'].mean()
        large_threshold = avg_amount * self.risk_patterns["large_amount"]["multiplier"]
        
        large_transactions = df[df['amount'] > large_threshold]
        
        for _, transaction in large_transactions.iterrows():
            # Additional checks for fraud likelihood
            is_recent = (datetime.now() - transaction['date']).days <= 1
            
            if is_recent:
                alerts.append({
                    "user_id": user_id,
                    "transaction_id": transaction.get('id'),
                    "anomaly_type": AnomalyType.UNUSUAL_AMOUNT,
                    "severity": Severity.HIGH,
                    "explanation": f"Large transaction of ${transaction['amount']:.2f} detected (5x your average)",
                    "suggested_actions": [
                        "Verify you authorized this transaction",
                        "Check transaction details and merchant",
                        "Contact your bank if suspicious"
                    ],
                    "confidence_score": 0.85
                })
        
        return alerts