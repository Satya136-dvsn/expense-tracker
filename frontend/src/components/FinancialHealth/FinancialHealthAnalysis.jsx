import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GlassDropdown from '../Glass/GlassDropdown';

import { calculateFinancialHealthScore, getHealthScoreStatus } from '../../utils/financialHealthCalculator';
import { formatCurrency } from '../../utils/currencyFormatter';
import HealthScoreTrends from './HealthScoreTrends';
import './FinancialHealthAnalysis.css';

const FinancialHealthAnalysis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');
  const [activeTab, setActiveTab] = useState('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrendsModal, setShowTrendsModal] = useState(false);

  useEffect(() => {
    if (user) {
      // No need to fetch data since we're using the centralized calculator
      setLoading(false);
      setError(null);
    }
  }, [user]);

  // Enhanced financial calculations using real data
  const monthlyIncome = user?.monthlyIncome || 0;
  const currentSavings = user?.currentSavings || 0;
  const targetExpenses = user?.targetExpenses || 0;
  const monthlyDebt = user?.monthlyDebt || 0;
  
  const savingsRate = monthlyIncome ? ((currentSavings / monthlyIncome) * 100).toFixed(1) : 0;
  const expenseRatio = monthlyIncome ? ((targetExpenses / monthlyIncome) * 100).toFixed(1) : 0;
  const debtToIncomeRatio = monthlyIncome ? ((monthlyDebt / monthlyIncome) * 100).toFixed(1) : 0;
  const emergencyFundMonths = monthlyIncome ? (currentSavings / monthlyIncome).toFixed(1) : 0;
  




  // Use centralized health score calculator for consistency
  const healthAnalysis = calculateFinancialHealthScore(user, []);
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { text: 'Excellent', emoji: '🌟', color: '#10b981', icon: '🌟', status: 'Excellent' };
    if (score >= 60) return { text: 'Good', emoji: '👍', color: '#3b82f6', icon: '👍', status: 'Good' };
    if (score >= 40) return { text: 'Fair', emoji: '⚠️', color: '#f59e0b', icon: '⚠️', status: 'Fair' };
    return { text: 'Needs Work', emoji: '⚠️', color: '#ef4444', icon: '⚠️', status: 'Needs Work' };
  };

  const status = getHealthScoreStatus(healthAnalysis.score);

  // Improvement recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    healthAnalysis.factors.forEach(factor => {
      if (factor.score < 60) {
        switch (factor.name) {
          case 'Savings Rate':
            recommendations.push({
              priority: 'high',
              title: 'Increase Your Savings Rate',
              description: `Try to save at least 15-20% of your income. Consider automating savings transfers.`,
              action: 'Set up automatic savings'
            });
            break;
          case 'Emergency Fund':
            recommendations.push({
              priority: 'high',
              title: 'Build Emergency Fund',
              description: `Aim for 3-6 months of expenses. Start with ₹10000 as a mini-emergency fund.`,
              action: 'Create emergency fund goal'
            });
            break;
          case 'Expense Control':
            recommendations.push({
              priority: 'medium',
              title: 'Reduce Monthly Expenses',
              description: `Review subscriptions, dining out, and discretionary spending.`,
              action: 'Analyze spending categories'
            });
            break;
          case 'Debt Management':
            recommendations.push({
              priority: 'high',
              title: 'Reduce Debt Burden',
              description: `Focus on paying down high-interest debt first using debt avalanche method.`,
              action: 'Create debt payoff plan'
            });
            break;
          case 'Credit Health':
            recommendations.push({
              priority: 'medium',
              title: 'Improve Credit Score',
              description: `Pay bills on time, reduce credit utilization below 30%.`,
              action: 'Monitor credit report'
            });
            break;
          default:
            break;
        }
      }
    });

    // If no improvement needed, show maintenance recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        {
          priority: 'medium',
          title: 'Maintain Your Excellent Progress',
          description: 'Continue your current financial habits and review your goals monthly to stay on track.',
          action: 'Review monthly goals'
        },
        {
          priority: 'medium',
          title: 'Consider Investment Diversification',
          description: 'Explore additional investment opportunities to maximize returns and manage risk effectively.',
          action: 'Explore investments'
        },
        {
          priority: 'medium',
          title: 'Plan for Long-term Goals',
          description: 'Set up retirement accounts, college funds, or other long-term financial objectives.',
          action: 'Set long-term goals'
        },
        {
          priority: 'medium',
          title: 'Review Insurance Coverage',
          description: 'Ensure you have adequate life, health, and property insurance for your situation.',
          action: 'Check insurance'
        }
      );
    }

    return recommendations.slice(0, 4); // Return top 4 recommendations
  };

  const recommendations = healthAnalysis.recommendations.map((rec, index) => ({
    priority: index < 2 ? 'high' : 'medium',
    title: `Recommendation ${index + 1}`,
    description: rec,
    action: 'Take action'
  }));

  const handleRecommendationAction = (recommendation, index) => {
    // Handle different recommendation actions
    const recText = recommendation.description.toLowerCase();
    
    if (recText.includes('emergency fund') || recText.includes('savings')) {
      navigate('/savings-goals');
    } else if (recText.includes('expense') || recText.includes('spending')) {
      navigate('/transactions');
    } else if (recText.includes('budget')) {
      navigate('/budgets');
    } else if (recText.includes('debt')) {
      navigate('/transactions');
    } else {
      // Default action - show more details
      alert(`Taking action on: ${recommendation.description}\n\nThis will help improve your financial health score.`);
    }
  };

  // Community tips data
  const communityTips = [
    {
      id: 1,
      title: "50/30/20 Rule",
      description: "Allocate 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
      category: "Budgeting",
      likes: 245,
      author: "Financial Expert",
      icon: "💰"
    },
    {
      id: 2,
      title: "Emergency Fund Priority",
      description: "Build an emergency fund covering 3-6 months of expenses before investing.",
      category: "Savings",
      likes: 189,
      author: "Community Member",
      icon: "🛡️"
    },
    {
      id: 3,
      title: "Track Small Expenses",
      description: "Small daily expenses like coffee can add up to significant amounts over time.",
      category: "Spending",
      likes: 156,
      author: "Budget Coach",
      icon: "☕"
    },
    {
      id: 4,
      title: "Automate Savings",
      description: "Set up automatic transfers to savings accounts to build wealth consistently.",
      category: "Automation",
      likes: 203,
      author: "Financial Advisor",
      icon: "🤖"
    },
    {
      id: 5,
      title: "Review Monthly Subscriptions",
      description: "Cancel unused subscriptions and negotiate better rates for services you use.",
      category: "Spending",
      likes: 178,
      author: "Money Saver",
      icon: "📱"
    },
    {
      id: 6,
      title: "Invest in Index Funds",
      description: "Low-cost index funds provide diversified exposure to the market with minimal fees.",
      category: "Investment",
      likes: 234,
      author: "Investment Advisor",
      icon: "📈"
    }
  ];

  if (loading) {
    return (
      <div className="financial-health-page">
        <div className="health-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <span style={{ fontSize: '1rem' }}>&#8592;</span>
            </button>
            <div className="header-title">
              <h1>💚 Financial Health Analysis</h1>
              <p>Loading your financial insights...</p>
            </div>
          </div>
        </div>
        <div className="health-content">
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
      <div className="financial-health-page">
        <div className="health-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
              <span style={{ fontSize: '1rem' }}>&#8592;</span>
            </button>
            <div className="header-title">
              <h1>💚 Financial Health Analysis</h1>
              <p>Error loading insights</p>
            </div>
          </div>
        </div>
        <div className="health-content">
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
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="financial-health-page">
      {/* Header */}
      <div className="health-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <span style={{ fontSize: '1rem' }}>&#8592;</span>
          </button>
          <div className="header-title">
            <h1>💚 Financial Health Analysis</h1>
            <p>Comprehensive analysis of your financial wellness</p>
          </div>
        </div>
        <div className="header-actions">
          <GlassDropdown
            value={selectedTimeframe}
            onChange={(value) => setSelectedTimeframe(value)}
            options={[
              { value: 'current', label: 'Current Status' },
              { value: '3months', label: '3 Month Trend' },
              { value: '6months', label: '6 Month Trend' },
              { value: '1year', label: '1 Year Trend' }
            ]}
            variant="primary"
            size="medium"
            className="period-selector-custom health-period-dropdown"
          />
        </div>
      </div>
      <div className="health-content">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
            onClick={() => setActiveTab('community')}
          >
            👥 Community Tips
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Overall Score */}
            <div className="health-score-card">
          <div className="score-display">
            <div className="score-circle-large">
              <div className="score-number-large">
                {healthAnalysis.score}
              </div>
              <div className="score-label-large">Financial Health Score</div>
            </div>
            <div className="score-status-large">
              <span className="status-emoji">{status.icon}</span>
              <span className="status-text" style={{ color: status.color }}>
                {status.status}
              </span>
            </div>
          </div>
          
          {/* Color Legend */}
          <div className="color-legend">
            <h4>Score Guide:</h4>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                <span>80-100: Excellent</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                <span>60-79: Good</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                <span>40-59: Fair</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                <span>0-39: Needs Work</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="health-factors">
          <h3>📊 Factor Breakdown</h3>
          <div className="factors-grid">
            {healthAnalysis.factors.map((factor, index) => (
              <div key={index} className="factor-card">
                <div className="factor-header">
                  <span className="factor-icon">
                    {factor.name === 'Savings Rate' ? '💰' :
                     factor.name === 'Emergency Fund' ? '🛡️' :
                     factor.name === 'Expense Control' ? '💸' :
                     factor.name === 'Debt Management' ? '💳' :
                     factor.name === 'Income Level' ? '📊' :
                     factor.name === 'Financial Activity' ? '📈' : '📊'}
                  </span>
                  <div className="factor-info">
                    <h4>{factor.name}</h4>
                    <p>{factor.description}</p>
                  </div>
                  <div className="factor-score" style={{ color: getScoreColor(factor.score) }}>
                    {factor.score}/{factor.maxScore}
                  </div>
                </div>
                <div className="factor-details">
                  <div className="current-vs-target">
                    <span>Current: <strong>{factor.value}</strong></span>
                    <span>Score: <strong>{factor.score}/{factor.maxScore}</strong></span>
                  </div>
                  <div className="factor-progress">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(factor.score / factor.maxScore) * 100}%`,
                        backgroundColor: getScoreColor(factor.score)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="health-recommendations">
          <h3>💡 Personalized Recommendations</h3>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-card ${rec.priority}`}>
                <div className="rec-header">
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority === 'high' ? '🔥 High Priority' : '⚡ Medium Priority'}
                  </span>
                  <h4>{rec.title}</h4>
                </div>
                <p>{rec.description}</p>
                <button 
                  className="rec-action-btn"
                  onClick={() => handleRecommendationAction(rec, index)}
                >
                  {rec.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Health Trends */}
        <div className="health-trends">
          <h3>📈 Health Score Trends</h3>
          <div className="trends-chart">
            <div className="trend-placeholder">
              <div className="placeholder-icon">📊</div>
              <h4>Historical Trends Coming Soon</h4>
              <p>Track your financial health score progress over time</p>
              <p>View monthly comparisons and improvement patterns</p>
              <button 
                className="placeholder-btn" 
                onClick={() => navigate('/trends')}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📈 View Trends
              </button>
            </div>
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
                    <div className="tip-icon">{tip.icon}</div>
                    <div>
                      <h4>{tip.title}</h4>
                      <span className="tip-category">{tip.category}</span>
                    </div>
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
      
      {/* Health Score Trends Modal */}
      {showTrendsModal && (
        <HealthScoreTrends 
          user={user} 
          onClose={() => setShowTrendsModal(false)} 
        />
      )}
    </div>
  );
};

export default FinancialHealthAnalysis;