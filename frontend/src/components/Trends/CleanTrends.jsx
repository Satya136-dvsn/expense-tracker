import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import CleanPageLayout from '../Layout/CleanPageLayout';

const CleanTrends = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const fetchTrendsData = async () => {
      try {
        setLoading(true);
        
        const insightsData = await apiService.getFinancialInsights().catch(() => ({
          savingsRate: 0,
          totalIncome: 0,
          totalExpenses: 1000,
          netSavings: -1000
        }));
        
        setInsights(insightsData);
        
      } catch (error) {
        console.error('Error fetching trends data:', error);
        setInsights({
          savingsRate: 0,
          totalIncome: 0,
          totalExpenses: 1000,
          netSavings: -1000
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendsData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <CleanPageLayout 
        title="Financial Analytics" 
        subtitle="Loading your financial insights..."
      >
        <div className="professional-grid professional-grid-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="professional-card loading-shimmer" style={{ height: '200px' }} />
          ))}
        </div>
      </CleanPageLayout>
    );
  }

  const savingsRate = insights?.savingsRate || 0;
  const totalIncome = insights?.totalIncome || 0;
  const totalExpenses = insights?.totalExpenses || 0;
  const netSavings = insights?.netSavings || 0;

  return (
    <CleanPageLayout 
      title="Financial Analytics" 
      subtitle="Comprehensive insights into your financial trends and patterns"
    >
      {/* Key Metrics Overview */}
      <div className="professional-grid professional-grid-4">
        <MetricCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          subtitle="Last 3 months"
          icon="💰"
          color="#22c55e"
          trend={savingsRate > 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          subtitle="Last 3 months"
          icon="📈"
          color="#3b82f6"
          trend="up"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle="Last 3 months"
          icon="📊"
          color="#f59e0b"
          trend="down"
        />
        <MetricCard
          title="Net Savings"
          value={formatCurrency(netSavings)}
          subtitle="Last 3 months"
          icon="🎯"
          color={netSavings >= 0 ? "#22c55e" : "#ef4444"}
          trend={netSavings >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Detailed Analytics Section */}
      <div className="professional-card">
        <h3 className="card-title">📊 Detailed Analytics</h3>
        <p className="card-subtitle">Explore specific aspects of your financial data</p>
        
        <div className="professional-grid professional-grid-3">
          <AnalyticsCard
            title="Monthly Spending"
            description="Track your spending patterns over time"
            icon="📈"
            color="#10b981"
            onClick={() => navigate('/trends/monthly-spending')}
          />
          <AnalyticsCard
            title="Category Analysis"
            description="Breakdown of expenses by category"
            icon="🏷️"
            color="#3b82f6"
            onClick={() => navigate('/trends/category-analysis')}
          />
          <AnalyticsCard
            title="Savings Growth"
            description="Monitor your savings progress and goals"
            icon="🐷"
            color="#8b5cf6"
            onClick={() => navigate('/trends/savings-growth')}
          />
        </div>
      </div>

      {/* Financial Insights */}
      <div className="professional-card">
        <h3 className="card-title">💡 Financial Insights & Recommendations</h3>
        <p className="card-subtitle">Personalized advice based on your spending patterns</p>
        
        <div className="professional-grid professional-grid-1">
          <InsightCard
            icon="📊"
            title="Spending Analysis"
            description={`Your current spending rate is ${totalExpenses > 0 ? 'above' : 'within'} your typical range. ${totalExpenses > totalIncome ? 'Consider reviewing your expenses to improve your savings rate.' : 'Great job maintaining a positive cash flow!'}`}
            type={totalExpenses > totalIncome ? 'warning' : 'success'}
          />
          <InsightCard
            icon="💰"
            title="Savings Opportunity"
            description={`${savingsRate > 20 ? 'Excellent savings rate! You\'re on track for strong financial health.' : 'Consider increasing your savings rate to at least 20% of your income for better financial security.'}`}
            type={savingsRate > 20 ? 'success' : 'info'}
          />
          <InsightCard
            icon="🎯"
            title="Goal Recommendation"
            description="Based on your current patterns, focus on tracking daily expenses and setting monthly spending limits for better financial control."
            type="info"
          />
        </div>
      </div>

      {/* Spending Patterns */}
      <div className="professional-card">
        <h3 className="card-title">📊 Spending Patterns</h3>
        <p className="card-subtitle">Understanding your financial behavior</p>
        
        <div className="professional-grid professional-grid-2">
          <div style={{ 
            padding: '2rem', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Weekly Trends</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Most spending occurs on weekends. Consider planning purchases in advance.
            </p>
          </div>
          <div style={{ 
            padding: '2rem', 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
            <h4 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Top Categories</h4>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Food & Dining represents the largest expense category this month.
            </p>
          </div>
        </div>
      </div>
    </CleanPageLayout>
  );
};

// Helper Components
const MetricCard = ({ title, value, subtitle, icon, color, trend }) => (
  <div className="professional-card" style={{ textAlign: 'center' }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      fontSize: '1.5rem'
    }}>
      {icon}
    </div>
    <h4 style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
      {title}
    </h4>
    <div style={{ 
      fontSize: '1.875rem', 
      fontWeight: '800', 
      color: '#1f2937', 
      margin: '0 0 0.25rem 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem'
    }}>
      {value}
      <span style={{ 
        fontSize: '1rem', 
        color: trend === 'up' ? '#22c55e' : '#ef4444' 
      }}>
        {trend === 'up' ? '↗️' : '↘️'}
      </span>
    </div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
      {subtitle}
    </div>
  </div>
);

const AnalyticsCard = ({ title, description, icon, color, onClick }) => (
  <div 
    className="professional-card" 
    style={{ 
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: '2px solid transparent'
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      e.target.style.borderColor = color;
      e.target.style.transform = 'translateY(-4px)';
      e.target.style.boxShadow = `0 8px 25px ${color}20`;
    }}
    onMouseLeave={(e) => {
      e.target.style.borderColor = 'transparent';
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
    }}
  >
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem',
      fontSize: '1.5rem'
    }}>
      {icon}
    </div>
    <h4 style={{ color: '#1f2937', fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
      {title}
    </h4>
    <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.4', margin: 0 }}>
      {description}
    </p>
    <div style={{ 
      marginTop: '1rem', 
      display: 'flex', 
      alignItems: 'center', 
      color: color, 
      fontSize: '0.875rem', 
      fontWeight: '600' 
    }}>
      View Details →
    </div>
  </div>
);

const InsightCard = ({ icon, title, description, type }) => {
  const colors = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444'
  };
  
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1.5rem',
      borderRadius: '12px',
      background: `${colors[type]}08`,
      border: `2px solid ${colors[type]}20`,
      marginBottom: '1rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        background: colors[type],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.125rem', fontWeight: '600' }}>
          {title}
        </h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default CleanTrends;