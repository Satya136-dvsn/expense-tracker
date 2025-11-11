import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import CleanPageLayout from '../Layout/CleanPageLayout';

const CleanCategoryAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        const transactions = await apiService.getUserTransactions().catch(() => []);
        
        const categoryMap = {};
        let total = 0;
        
        transactions
          .filter(t => t.type === 'EXPENSE')
          .forEach(transaction => {
            const category = transaction.category || 'Other';
            const amount = Math.abs(transaction.amount);
            
            if (!categoryMap[category]) {
              categoryMap[category] = {
                name: category,
                amount: 0,
                transactions: 0,
                color: getCategoryColor(category)
              };
            }
            
            categoryMap[category].amount += amount;
            categoryMap[category].transactions += 1;
            total += amount;
          });
        
        const categories = Object.values(categoryMap)
          .sort((a, b) => b.amount - a.amount)
          .map(cat => ({
            ...cat,
            percentage: total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0
          }));
        
        setCategoryData(categories);
        setTotalSpending(total);
        
      } catch (error) {
        console.error('Error fetching category data:', error);
        setCategoryData([
          {
            name: 'Food & Dining',
            amount: 1000,
            transactions: 15,
            percentage: 100,
            color: '#3b82f6'
          }
        ]);
        setTotalSpending(1000);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryData();
  }, [selectedPeriod]);

  const getCategoryColor = (category) => {
    const colors = {
      'Food & Dining': '#ef4444',
      'Transportation': '#f59e0b',
      'Shopping': '#8b5cf6',
      'Entertainment': '#06b6d4',
      'Bills & Utilities': '#10b981',
      'Healthcare': '#ec4899',
      'Education': '#6366f1',
      'Travel': '#84cc16',
      'Other': '#64748b'
    };
    return colors[category] || '#64748b';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const actions = (
    <>
      <select 
        value={selectedPeriod}
        onChange={(e) => setSelectedPeriod(e.target.value)}
        className="professional-select"
      >
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="quarter">Last Quarter</option>
        <option value="year">Last Year</option>
      </select>
      <button className="professional-btn professional-btn-primary">
        📊 Export Report
      </button>
    </>
  );

  if (loading) {
    return (
      <CleanPageLayout 
        title="Category Analysis" 
        subtitle="Loading your spending breakdown..."
        showBackButton
        actions={actions}
      >
        <div className="professional-card loading-shimmer" style={{ height: '400px' }} />
      </CleanPageLayout>
    );
  }

  return (
    <CleanPageLayout 
      title="Category Analysis" 
      subtitle="Detailed breakdown of your spending by category"
      showBackButton
      actions={actions}
    >
      {/* Summary Cards */}
      <div className="professional-grid professional-grid-4">
        <SummaryCard
          title="Total Spending"
          value={formatCurrency(totalSpending)}
          subtitle="This period"
          icon="💰"
          color="#ef4444"
        />
        <SummaryCard
          title="Categories"
          value={categoryData.length}
          subtitle="Active categories"
          icon="🏷️"
          color="#3b82f6"
        />
        <SummaryCard
          title="Top Category"
          value={categoryData[0]?.name || 'N/A'}
          subtitle={`${categoryData[0]?.percentage || 0}% of total`}
          icon="📊"
          color="#22c55e"
        />
        <SummaryCard
          title="Transactions"
          value={categoryData.reduce((sum, cat) => sum + cat.transactions, 0)}
          subtitle="Total transactions"
          icon="📝"
          color="#8b5cf6"
        />
      </div>

      {/* Category Breakdown Chart */}
      <div className="professional-card">
        <h3 className="card-title">📊 Category Breakdown</h3>
        <p className="card-subtitle">Visual representation of your spending</p>
        
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          justifyContent: 'center',
          padding: '2rem',
          minHeight: '300px'
        }}>
          {categoryData.slice(0, 8).map((category, index) => {
            const barHeight = Math.max(60, (parseFloat(category.percentage) / 100) * 250);
            
            return (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '120px',
                flex: '1 1 auto',
                maxWidth: '150px'
              }}>
                {/* Category Name */}
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '0.5rem',
                  textAlign: 'center',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {category.name}
                </div>
                
                {/* Amount */}
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: '#64748b',
                  marginBottom: '0.5rem'
                }}>
                  {formatCurrency(category.amount)}
                </div>
                
                {/* Bar */}
                <div style={{
                  height: `${barHeight}px`,
                  width: '60px',
                  background: category.color,
                  borderRadius: '8px 8px 0 0',
                  marginBottom: '0.5rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: `0 4px 12px ${category.color}30`,
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  paddingBottom: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-4px) scale(1.05)';
                  e.target.style.boxShadow = `0 8px 20px ${category.color}40`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = `0 4px 12px ${category.color}30`;
                }}>
                  {category.percentage}%
                </div>
                
                {/* Transaction Count */}
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  textAlign: 'center'
                }}>
                  {category.transactions} transactions
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Details */}
      <div className="professional-card">
        <h3 className="card-title">📋 Category Details</h3>
        <p className="card-subtitle">Complete breakdown of all categories</p>
        
        <div className="professional-grid professional-grid-auto">
          {categoryData.map((category, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1.5rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px solid #e2e8f0',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = category.color;
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 16px ${category.color}20`;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: category.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.875rem',
                marginRight: '1rem'
              }}>
                #{index + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ color: '#1f2937', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                    {category.name}
                  </h4>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937' }}>
                      {formatCurrency(category.amount)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {category.percentage}% of total
                    </div>
                  </div>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${category.percentage}%`,
                    height: '100%',
                    background: category.color,
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="professional-card">
        <h3 className="card-title">💡 Category Insights</h3>
        <p className="card-subtitle">Understanding your spending patterns</p>
        
        <div className="professional-grid professional-grid-3">
          <InsightCard
            icon="🏆"
            title="Top Spending Category"
            description={`${categoryData[0]?.name || 'N/A'} accounts for ${categoryData[0]?.percentage || 0}% of your total spending. Consider if this aligns with your priorities.`}
            type="info"
          />
          <InsightCard
            icon="⚖️"
            title="Spending Balance"
            description={`You have ${categoryData.length} active spending categories. ${categoryData.length > 5 ? 'Consider consolidating some categories for better tracking.' : 'Good category distribution for tracking.'}`}
            type={categoryData.length > 5 ? 'warning' : 'success'}
          />
          <InsightCard
            icon="🎯"
            title="Optimization Tip"
            description={`Focus on the top 3 categories which represent ${categoryData.slice(0, 3).reduce((sum, cat) => sum + parseFloat(cat.percentage), 0).toFixed(1)}% of your spending for maximum impact.`}
            type="info"
          />
        </div>
      </div>
    </CleanPageLayout>
  );
};

// Helper Components
const SummaryCard = ({ title, value, subtitle, icon, color }) => (
  <div className="professional-card" style={{ textAlign: 'center' }}>
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      background: `${color}15`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem auto',
      fontSize: '1.25rem'
    }}>
      {icon}
    </div>
    <h4 style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
      {title}
    </h4>
    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
      {subtitle}
    </div>
  </div>
);

const InsightCard = ({ icon, title, description, type }) => {
  const colors = {
    info: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b'
  };
  
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1.5rem',
      borderRadius: '12px',
      background: `${colors[type]}08`,
      border: `2px solid ${colors[type]}20`
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
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
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
          {title}
        </h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: '1.4' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default CleanCategoryAnalysis;