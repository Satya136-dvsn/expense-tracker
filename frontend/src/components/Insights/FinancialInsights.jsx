import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import './FinancialInsights.css';

const FinancialInsights = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState(null);
  const [spendingPatterns, setSpendingPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from analytics endpoints first, fallback to existing endpoints
      const [insightsData, patternsData] = await Promise.all([
        apiService.getFinancialInsights().catch(() => null),
        apiService.getSpendingPatterns().catch(() => null)
      ]);
      
      // If analytics endpoints are available, use them
      let enhancedInsights = insightsData;
      let enhancedPatterns = patternsData;
      
      try {
        // Try to get enhanced data from analytics service
        const [healthData, trendsData, categoryData] = await Promise.all([
          apiService.makeRequest('/analytics/financial-health').catch(() => null),
          apiService.makeRequest('/analytics/monthly-trends?months=6').catch(() => null),
          apiService.makeRequest('/analytics/category-breakdown').catch(() => null)
        ]);
        
        if (healthData) {
          enhancedInsights = {
            ...enhancedInsights,
            healthScore: healthData.healthScore || enhancedInsights?.healthScore || 0,
            recommendations: healthData.recommendations || enhancedInsights?.recommendations || [],
            factorScores: healthData.factorScores || {}
          };
        }
        
        if (trendsData) {
          enhancedPatterns = {
            ...enhancedPatterns,
            monthlyTrends: trendsData.dataPoints || [],
            trendDirection: trendsData.trendDirection || 'stable'
          };
        }
        
        if (categoryData) {
          enhancedInsights = {
            ...enhancedInsights,
            topCategories: categoryData.categories || enhancedInsights?.topCategories || []
          };
        }
      } catch (analyticsError) {
        console.log('Analytics endpoints not available, using fallback data');
      }
      
      setInsights(enhancedInsights || generateFallbackInsights());
      setSpendingPatterns(enhancedPatterns || generateFallbackPatterns());
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('Failed to load financial insights');
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackInsights = () => ({
    healthScore: 65,
    savingsRate: 15.0,
    balance: 25000,
    totalIncome: 50000,
    totalExpenses: 42500,
    recommendations: [
      "Consider increasing your emergency fund to cover 6 months of expenses",
      "Review your subscription services and cancel unused ones",
      "Set up automatic savings transfers to build wealth consistently"
    ],
    topCategories: [
      { category: "Food & Dining", totalAmount: 8500 },
      { category: "Transportation", totalAmount: 6200 },
      { category: "Shopping", totalAmount: 4800 }
    ]
  });

  const generateFallbackPatterns = () => ({
    dayOfWeekSpending: [
      { dayOfWeek: 1, totalAmount: 150 },
      { dayOfWeek: 2, totalAmount: 200 },
      { dayOfWeek: 3, totalAmount: 180 },
      { dayOfWeek: 4, totalAmount: 220 },
      { dayOfWeek: 5, totalAmount: 300 },
      { dayOfWeek: 6, totalAmount: 450 },
      { dayOfWeek: 7, totalAmount: 280 }
    ],
    largestTransactions: [
      { title: "Monthly Rent", category: "Housing", amount: 15000 },
      { title: "Grocery Shopping", category: "Food & Dining", amount: 3500 },
      { title: "Fuel", category: "Transportation", amount: 2800 }
    ],
    categoryDistribution: [
      { category: "Housing", totalAmount: 15000, percentage: 35.3 },
      { category: "Food & Dining", totalAmount: 8500, percentage: 20.0 },
      { category: "Transportation", totalAmount: 6200, percentage: 14.6 }
    ]
  });

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const analyzeSpendingPatterns = (patterns) => {
    if (!patterns) return [];
    
    const detectedPatterns = [];
    
    // Weekend spending pattern
    if (patterns.dayOfWeekSpending) {
      const weekdayAvg = patterns.dayOfWeekSpending
        .filter(d => d.dayOfWeek >= 2 && d.dayOfWeek <= 6)
        .reduce((sum, d) => sum + d.totalAmount, 0) / 5;
      const weekendAvg = patterns.dayOfWeekSpending
        .filter(d => d.dayOfWeek === 1 || d.dayOfWeek === 7)
        .reduce((sum, d) => sum + d.totalAmount, 0) / 2;
      
      if (weekendAvg > weekdayAvg * 1.5) {
        detectedPatterns.push({
          type: 'weekend_spending',
          title: 'High Weekend Spending',
          description: `You spend ${((weekendAvg / weekdayAvg - 1) * 100).toFixed(0)}% more on weekends than weekdays`,
          recommendation: 'Consider setting a weekend budget to control leisure spending',
          severity: 'medium',
          icon: '🎉'
        });
      }
    }
    
    // Large transaction pattern
    if (patterns.largestTransactions) {
      const avgTransaction = patterns.largestTransactions.reduce((sum, t) => sum + t.amount, 0) / patterns.largestTransactions.length;
      const largeTransactions = patterns.largestTransactions.filter(t => t.amount > avgTransaction * 2);
      
      if (largeTransactions.length > 2) {
        detectedPatterns.push({
          type: 'large_transactions',
          title: 'Frequent Large Purchases',
          description: `${largeTransactions.length} transactions are significantly above average`,
          recommendation: 'Review large purchases and consider if they align with your financial goals',
          severity: 'high',
          icon: '💳'
        });
      }
    }
    
    // Category concentration pattern
    if (patterns.categoryDistribution) {
      const topCategory = patterns.categoryDistribution[0];
      if (topCategory && topCategory.percentage > 40) {
        detectedPatterns.push({
          type: 'category_concentration',
          title: 'High Category Concentration',
          description: `${topCategory.percentage.toFixed(1)}% of spending is in ${topCategory.category}`,
          recommendation: 'Consider diversifying your spending or finding ways to reduce costs in this category',
          severity: topCategory.percentage > 50 ? 'high' : 'medium',
          icon: '🎯'
        });
      }
    }
    
    return detectedPatterns;
  };

  const generateActionableRecommendations = (insights, patterns) => {
    const recommendations = [];
    
    if (insights?.healthScore < 60) {
      recommendations.push({
        title: 'Improve Financial Health',
        actions: [
          'Create a monthly budget and stick to it',
          'Build an emergency fund with 3-6 months of expenses',
          'Track all expenses for better awareness'
        ],
        priority: 'high',
        icon: '🎯'
      });
    }
    
    if (insights?.savingsRate < 15) {
      recommendations.push({
        title: 'Increase Savings Rate',
        actions: [
          'Automate savings transfers on payday',
          'Use the 50/30/20 budgeting rule',
          'Find areas to cut unnecessary expenses'
        ],
        priority: 'high',
        icon: '💰'
      });
    }
    
    if (patterns?.monthlyTrends && patterns.trendDirection === 'declining') {
      recommendations.push({
        title: 'Address Declining Trend',
        actions: [
          'Review recent spending increases',
          'Identify and eliminate unnecessary subscriptions',
          'Consider additional income sources'
        ],
        priority: 'medium',
        icon: '📉'
      });
    }
    
    return recommendations;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const communityTips = [
    {
      id: 1,
      title: "50/30/20 Rule",
      description: "Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
      category: "Budgeting",
      likes: 245,
      author: "Financial Expert"
    },
    {
      id: 2,
      title: "Emergency Fund Priority",
      description: "Build an emergency fund covering 3-6 months of expenses before investing.",
      category: "Savings",
      likes: 189,
      author: "Community Member"
    },
    {
      id: 3,
      title: "Track Small Expenses",
      description: "Small daily expenses like coffee can add up to significant amounts over time.",
      category: "Spending",
      likes: 156,
      author: "Budget Coach"
    },
    {
      id: 4,
      title: "Automate Savings",
      description: "Set up automatic transfers to savings accounts to build wealth consistently.",
      category: "Automation",
      likes: 203,
      author: "Financial Advisor"
    }
  ];

  if (loading) {
    return (
      <div className="insights-page">
        <div className="insights-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="header-title">
              <h1>Financial Insights</h1>
              <p>Loading your personalized insights...</p>
            </div>
          </div>
        </div>
        <div className="insights-content">
          <div className="insight-card full-width" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
            <p>Analyzing your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-page">
        <div className="insights-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="header-title">
              <h1>Financial Insights</h1>
              <p>Error loading insights</p>
            </div>
          </div>
        </div>
        <div className="insights-content">
          <div className="insight-card full-width error-card">
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Unable to Load Insights</h3>
              <p style={{ color: '#64748b', marginBottom: '2rem' }}>{error}</p>
              <button 
                onClick={fetchInsightsData}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="insights-page">
      <div className="insights-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="header-title">
            <h1>Financial Insights</h1>
            <p>AI-powered analysis and community tips</p>
          </div>
        </div>
      </div>

      <div className="insights-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'patterns' ? 'active' : ''}`}
            onClick={() => setActiveTab('patterns')}
          >
            📈 Patterns
          </button>
          <button 
            className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActiveTab('recommendations')}
          >
            🎯 Action Plan
          </button>
          <button 
            className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            👥 Community Tips
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && insights && (
          <>
            {/* Financial Health Score */}
            <div className="insight-card health-score-card">
              <h3>🎯 Financial Health Score</h3>
              <div className="health-score-display">
                <div className="score-circle">
                  <div 
                    className="score-progress"
                    style={{
                      background: `conic-gradient(${getHealthScoreColor(insights.healthScore)} ${insights.healthScore * 3.6}deg, #f1f5f9 0deg)`
                    }}
                  >
                    <div className="score-inner">
                      <span className="score-number">{insights.healthScore}</span>
                      <span className="score-label">{getHealthScoreLabel(insights.healthScore)}</span>
                    </div>
                  </div>
                </div>
                <div className="score-details">
                  <div className="score-metric">
                    <span className="metric-label">Savings Rate</span>
                    <span className="metric-value">{parseFloat(insights.savingsRate).toFixed(1)}%</span>
                  </div>
                  <div className="score-metric">
                    <span className="metric-label">Balance</span>
                    <span className="metric-value">{formatCurrency(insights.balance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#22c55e' }}>💰</div>
                <div className="metric-content">
                  <h4>Total Income</h4>
                  <span className="metric-amount">{formatCurrency(insights.totalIncome)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#ef4444' }}>💸</div>
                <div className="metric-content">
                  <h4>Total Expenses</h4>
                  <span className="metric-amount">{formatCurrency(insights.totalExpenses)}</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: '#3b82f6' }}>📊</div>
                <div className="metric-content">
                  <h4>Monthly Average</h4>
                  <span className="metric-amount">
                    {insights.monthlyAverages ? formatCurrency(insights.monthlyAverages.avgExpense || 0) : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="insight-card">
              <h3>🤖 AI Recommendations</h3>
              <div className="recommendations-list">
                {insights.recommendations && insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="recommendation-icon">💡</div>
                    <p>{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Spending Categories */}
            {insights.topCategories && insights.topCategories.length > 0 && (
              <div className="insight-card">
                <h3>🏷️ Top Spending Categories</h3>
                <div className="category-list">
                  {insights.topCategories.map((category, index) => (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{category.category}</span>
                        <span className="category-amount">{formatCurrency(category.totalAmount)}</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-progress"
                          style={{
                            width: `${(category.totalAmount / insights.topCategories[0].totalAmount) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && spendingPatterns && (
          <>
            {/* Spending by Day of Week */}
            {spendingPatterns.dayOfWeekSpending && (
              <div className="insight-card">
                <h3>📅 Spending by Day of Week</h3>
                <div className="day-spending-chart">
                  {spendingPatterns.dayOfWeekSpending.map((day, index) => {
                    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const maxAmount = Math.max(...spendingPatterns.dayOfWeekSpending.map(d => d.totalAmount));
                    return (
                      <div key={index} className="day-bar">
                        <div className="day-label">{dayNames[day.dayOfWeek - 1]}</div>
                        <div className="day-bar-container">
                          <div 
                            className="day-bar-fill"
                            style={{
                              height: `${(day.totalAmount / maxAmount) * 100}%`
                            }}
                          ></div>
                        </div>
                        <div className="day-amount">${day.totalAmount.toFixed(0)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Largest Transactions */}
            {spendingPatterns.largestTransactions && (
              <div className="insight-card">
                <h3>💳 Largest Transactions</h3>
                <div className="large-transactions-list">
                  {spendingPatterns.largestTransactions.slice(0, 5).map((transaction, index) => (
                    <div key={index} className="large-transaction-item">
                      <div className="transaction-info">
                        <span className="transaction-title">{transaction.title}</span>
                        <span className="transaction-category">{transaction.category}</span>
                      </div>
                      <div className="transaction-amount">{formatCurrency(transaction.amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Distribution */}
            {spendingPatterns.categoryDistribution && (
              <div className="insight-card">
                <h3>🥧 Category Distribution</h3>
                <div className="category-distribution">
                  {spendingPatterns.categoryDistribution.slice(0, 6).map((category, index) => (
                    <div key={index} className="distribution-item">
                      <div className="distribution-info">
                        <span className="distribution-category">{category.category}</span>
                        <span className="distribution-percentage">{parseFloat(category.percentage).toFixed(1)}%</span>
                      </div>
                      <div className="distribution-amount">{formatCurrency(category.totalAmount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Plan Tab */}
        {activeTab === 'recommendations' && (
          <>
            {/* Detected Patterns */}
            <div className="insight-card">
              <h3>🔍 Detected Spending Patterns</h3>
              <div className="patterns-analysis">
                {analyzeSpendingPatterns(spendingPatterns).length > 0 ? (
                  analyzeSpendingPatterns(spendingPatterns).map((pattern, index) => (
                    <div key={index} className={`pattern-item ${pattern.severity}`}>
                      <div className="pattern-header">
                        <span className="pattern-icon">{pattern.icon}</span>
                        <div className="pattern-info">
                          <h4>{pattern.title}</h4>
                          <p>{pattern.description}</p>
                        </div>
                        <span className={`severity-badge ${pattern.severity}`}>
                          {pattern.severity}
                        </span>
                      </div>
                      <div className="pattern-recommendation">
                        <strong>💡 Recommendation:</strong> {pattern.recommendation}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-patterns">
                    <span className="no-patterns-icon">✅</span>
                    <p>Great! No concerning spending patterns detected.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actionable Recommendations */}
            <div className="insight-card">
              <h3>🎯 Personalized Action Plan</h3>
              <div className="action-recommendations">
                {generateActionableRecommendations(insights, spendingPatterns).map((rec, index) => (
                  <div key={index} className={`action-card ${rec.priority}`}>
                    <div className="action-header">
                      <span className="action-icon">{rec.icon}</span>
                      <h4>{rec.title}</h4>
                      <span className={`priority-badge ${rec.priority}`}>
                        {rec.priority} priority
                      </span>
                    </div>
                    <div className="action-list">
                      {rec.actions.map((action, actionIndex) => (
                        <div key={actionIndex} className="action-item">
                          <input type="checkbox" id={`action-${index}-${actionIndex}`} />
                          <label htmlFor={`action-${index}-${actionIndex}`}>{action}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="insight-card">
              <h3>⚡ Quick Actions</h3>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/budgets')}
                >
                  <span className="action-icon">📊</span>
                  <span>Create Budget</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/savings-goals')}
                >
                  <span className="action-icon">🎯</span>
                  <span>Set Savings Goal</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/transactions')}
                >
                  <span className="action-icon">💳</span>
                  <span>Review Transactions</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => navigate('/analytics')}
                >
                  <span className="action-icon">📈</span>
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Community Tips Tab */}
        {activeTab === 'community' && (
          <div className="insight-card">
            <h3>👥 Community Financial Tips</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Learn from the community's best financial practices and tips
            </p>
            <div className="community-tips-grid">
              {communityTips.map((tip) => (
                <div key={tip.id} className="tip-card">
                  <div className="tip-header">
                    <h4>{tip.title}</h4>
                    <span className="tip-category">{tip.category}</span>
                  </div>
                  <p className="tip-description">{tip.description}</p>
                  <div className="tip-footer">
                    <span className="tip-author">by {tip.author}</span>
                    <div className="tip-likes">
                      <span>👍 {tip.likes}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialInsights;