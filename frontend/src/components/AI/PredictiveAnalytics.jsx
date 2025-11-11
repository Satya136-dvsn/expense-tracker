import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './PredictiveAnalytics.css';

const PredictiveAnalytics = ({ userId }) => {
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('3months');

  useEffect(() => {
    fetchPredictions();
  }, [userId, selectedPeriod]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      // Mock predictions data
      const mockPredictions = {
        cashFlow: {
          nextMonth: {
            income: 4500,
            expenses: 3200,
            netFlow: 1300,
            confidence: 0.87
          },
          next3Months: {
            income: 13500,
            expenses: 9800,
            netFlow: 3700,
            confidence: 0.82
          },
          next6Months: {
            income: 27000,
            expenses: 19600,
            netFlow: 7400,
            confidence: 0.75
          }
        },
        categoryPredictions: [
          { category: 'Groceries', predicted: 450, current: 420, trend: 'increasing', confidence: 0.91 },
          { category: 'Dining', predicted: 280, current: 320, trend: 'decreasing', confidence: 0.85 },
          { category: 'Transportation', predicted: 180, current: 175, trend: 'stable', confidence: 0.88 },
          { category: 'Entertainment', predicted: 150, current: 140, trend: 'increasing', confidence: 0.79 },
          { category: 'Utilities', predicted: 220, current: 215, trend: 'stable', confidence: 0.93 }
        ],
        goalPredictions: [
          {
            goal: 'Emergency Fund',
            currentAmount: 3400,
            targetAmount: 10000,
            predictedCompletion: '2024-08-15',
            monthsToGoal: 7,
            confidence: 0.84
          },
          {
            goal: 'Vacation Fund',
            currentAmount: 1200,
            targetAmount: 3000,
            predictedCompletion: '2024-06-20',
            monthsToGoal: 5,
            confidence: 0.78
          }
        ],
        riskFactors: [
          {
            factor: 'Seasonal Spending Increase',
            description: 'Holiday season typically increases spending by 25%',
            impact: 'medium',
            probability: 0.82
          },
          {
            factor: 'Income Stability',
            description: 'Consistent income pattern reduces financial risk',
            impact: 'positive',
            probability: 0.91
          }
        ]
      };

      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increasing': return '#ef4444';
      case 'decreasing': return '#10b981';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="predictive-analytics">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating predictions...</p>
        </div>
      </div>
    );
  }

  const cashFlowData = predictions.cashFlow?.[selectedPeriod === '1month' ? 'nextMonth' : selectedPeriod === '3months' ? 'next3Months' : 'next6Months'];

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <h2>📈 Predictive Analytics</h2>
        <p>AI-powered predictions for your financial future</p>
        <div className="period-selector">
          <Button 
            className={selectedPeriod === '1month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('1month')}
          >
            1 Month
          </Button>
          <Button 
            className={selectedPeriod === '3months' ? 'active' : ''}
            onClick={() => setSelectedPeriod('3months')}
          >
            3 Months
          </Button>
          <Button 
            className={selectedPeriod === '6months' ? 'active' : ''}
            onClick={() => setSelectedPeriod('6months')}
          >
            6 Months
          </Button>
        </div>
      </div>

      {/* Cash Flow Prediction */}
      <div className="cash-flow-prediction">
        <Card>
          <CardHeader>
            <CardTitle>💰 Cash Flow Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="cash-flow-grid">
              <div className="flow-item income">
                <span className="label">Predicted Income</span>
                <span className="value">{formatCurrency(cashFlowData?.income || 0)}</span>
              </div>
              <div className="flow-item expenses">
                <span className="label">Predicted Expenses</span>
                <span className="value">{formatCurrency(cashFlowData?.expenses || 0)}</span>
              </div>
              <div className="flow-item net-flow">
                <span className="label">Net Cash Flow</span>
                <span className={`value ${(cashFlowData?.netFlow || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(cashFlowData?.netFlow || 0)}
                </span>
              </div>
              <div className="flow-item confidence">
                <span className="label">Confidence</span>
                <span className="value">{Math.round((cashFlowData?.confidence || 0) * 100)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Predictions */}
      <div className="category-predictions">
        <Card>
          <CardHeader>
            <CardTitle>📊 Category Spending Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="categories-list">
              {predictions.categoryPredictions?.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.category}</span>
                    <span className="trend-indicator" style={{ color: getTrendColor(category.trend) }}>
                      {getTrendIcon(category.trend)} {category.trend}
                    </span>
                  </div>
                  <div className="category-amounts">
                    <span className="current">Current: {formatCurrency(category.current)}</span>
                    <span className="predicted">Predicted: {formatCurrency(category.predicted)}</span>
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${category.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Predictions */}
      <div className="goal-predictions">
        <Card>
          <CardHeader>
            <CardTitle>🎯 Goal Achievement Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="goals-list">
              {predictions.goalPredictions?.map((goal, index) => (
                <div key={index} className="goal-item">
                  <div className="goal-header">
                    <h4>{goal.goal}</h4>
                    <span className="completion-date">
                      Expected: {new Date(goal.predictedCompletion).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </div>
                  </div>
                  <div className="goal-meta">
                    <span>{goal.monthsToGoal} months to go</span>
                    <span>{Math.round(goal.confidence * 100)}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors */}
      <div className="risk-factors">
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Risk Factors & Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="risks-list">
              {predictions.riskFactors?.map((risk, index) => (
                <div key={index} className="risk-item">
                  <div className="risk-header">
                    <span className="risk-factor">{risk.factor}</span>
                    <span className={`impact-badge ${risk.impact}`}>
                      {risk.impact}
                    </span>
                  </div>
                  <p className="risk-description">{risk.description}</p>
                  <div className="probability">
                    Probability: {Math.round(risk.probability * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;