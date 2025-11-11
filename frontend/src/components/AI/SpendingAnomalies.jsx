import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './SpendingAnomalies.css';

const SpendingAnomalies = ({ userId }) => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
  }, [userId]);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      // Mock anomalies data
      const mockAnomalies = [
        {
          id: 1,
          type: 'unusual_amount',
          title: 'Large Grocery Purchase',
          description: 'Spent ₹23,821 at Big Bazaar - 340% higher than your usual grocery spending',
          amount: 23821,
          normalAmount: 5395,
          category: 'Groceries',
          date: '2024-01-15',
          severity: 'medium',
          confidence: 0.89
        },
        {
          id: 2,
          type: 'unusual_frequency',
          title: 'Multiple Coffee Purchases',
          description: '8 coffee shop visits this week - 3x more than usual',
          amount: 45,
          normalAmount: 15,
          category: 'Dining',
          date: '2024-01-14',
          severity: 'low',
          confidence: 0.76
        },
        {
          id: 3,
          type: 'unusual_merchant',
          title: 'New Online Purchase',
          description: 'First-time purchase at TechGadgets.com for ₹16,517',
          amount: 16517,
          normalAmount: 0,
          category: 'Shopping',
          date: '2024-01-13',
          severity: 'high',
          confidence: 0.95
        },
        {
          id: 4,
          type: 'unusual_time',
          title: 'Late Night Transaction',
          description: 'Gas station purchase at 2:47 AM - unusual time for you',
          amount: 45,
          normalAmount: 45,
          category: 'Transportation',
          date: '2024-01-12',
          severity: 'medium',
          confidence: 0.82
        }
      ];

      setAnomalies(mockAnomalies);
    } catch (error) {
      console.error('Error fetching anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '🔍';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'unusual_amount': return '💰';
      case 'unusual_frequency': return '🔄';
      case 'unusual_merchant': return '🏪';
      case 'unusual_time': return '🕐';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="spending-anomalies">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Detecting spending anomalies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spending-anomalies">
      <div className="anomalies-header">
        <h2>🛡️ Spending Anomaly Detection</h2>
        <p>Unusual spending patterns detected by AI analysis</p>
        <Button onClick={fetchAnomalies} className="refresh-btn">
          🔄 Scan for Anomalies
        </Button>
      </div>

      <div className="anomalies-stats">
        <div className="stat-card">
          <div className="stat-number">{anomalies.length}</div>
          <div className="stat-label">Anomalies Detected</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {anomalies.filter(a => a.severity === 'high').length}
          </div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            ${anomalies.reduce((sum, a) => sum + Math.abs(a.amount - a.normalAmount), 0).toFixed(0)}
          </div>
          <div className="stat-label">Total Deviation</div>
        </div>
      </div>

      <div className="anomalies-list">
        {anomalies.map((anomaly) => (
          <Card key={anomaly.id} className="anomaly-card">
            <CardHeader>
              <CardTitle className="anomaly-title">
                <span className="type-icon">{getTypeIcon(anomaly.type)}</span>
                <span className="severity-icon">{getSeverityIcon(anomaly.severity)}</span>
                {anomaly.title}
              </CardTitle>
              <div className="anomaly-meta">
                <span 
                  className="severity-badge"
                  style={{ backgroundColor: getSeverityColor(anomaly.severity) }}
                >
                  {anomaly.severity} risk
                </span>
                <span className="confidence">
                  {Math.round(anomaly.confidence * 100)}% confidence
                </span>
                <span className="date">{new Date(anomaly.date).toLocaleDateString()}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="anomaly-description">{anomaly.description}</p>
              
              <div className="anomaly-details">
                <div className="amount-comparison">
                  <div className="amount-item">
                    <span className="label">Transaction Amount:</span>
                    <span className="value">${anomaly.amount}</span>
                  </div>
                  {anomaly.normalAmount > 0 && (
                    <div className="amount-item">
                      <span className="label">Typical Amount:</span>
                      <span className="value">${anomaly.normalAmount}</span>
                    </div>
                  )}
                  <div className="amount-item">
                    <span className="label">Category:</span>
                    <span className="value">{anomaly.category}</span>
                  </div>
                </div>
              </div>

              <div className="anomaly-actions">
                <Button className="action-btn primary">Mark as Normal</Button>
                <Button className="action-btn secondary">Investigate</Button>
                <Button className="action-btn danger">Report Fraud</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {anomalies.length === 0 && (
        <div className="no-anomalies">
          <Card>
            <CardContent>
              <div className="empty-state">
                <span className="empty-icon">✅</span>
                <h3>No Anomalies Detected</h3>
                <p>Your spending patterns look normal. Great job maintaining consistent financial habits!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SpendingAnomalies;