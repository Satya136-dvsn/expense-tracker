import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import PageLayout from '../Layout/PageLayout';

const CategoryAnalysisNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch category spending data
        const transactions = await apiService.getUserTransactions().catch(() => []);
        
        // Process transactions by category
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
        
        // Convert to array and sort by amount
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
        // Set default data
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
        className="form-select"
        style={{ minWidth: '150px' }}
      >
        <option value="week">Last Week</option>
        <option value="month">Last Month</option>
        <option value="quarter">Last Quarter</option>
        <option value="year">Last Year</option>
      </select>
      <button className="btn btn-primary">
        📊 Export Report
      </button>
    </>
  );

  if (loading) {
    return (
      <PageLayout 
        title="Category Analysis" 
        subtitle="Loading your spending breakdown..."
        showBackButton
        onBack={() => navigate('/trends')}
        actions={actions}
      >
        <div className="grid grid-cols-2">
          <div className="card loading-shimmer" style={{ height: '400px' }} />
          <div className="card loading-shimmer" style={{ height: '400px' }} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title="Category Analysis" 
      subtitle="Detailed breakdown of your spending by category"
      showBackButton
      onBack={() => navigate('/trends')}
      actions={actions}
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-4 mb-4">
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

      <div className="grid grid-cols-2 gap-6">
        {/* Category Breakdown Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📊 Category Breakdown</h3>
            <p className="card-subtitle">Visual representation of your spending</p>
          </div>
          
          <div style={{ padding: '2rem' }}>
            {/* Pie Chart Representation */}
            <div style={{
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `conic-gradient(${categoryData.map((cat, index) => {
                const startAngle = categoryData.slice(0, index).reduce((sum, c) => sum + parseFloat(c.percentage), 0) * 3.6;
                const endAngle = startAngle + (parseFloat(cat.percentage) * 3.6);
                return `${cat.color} ${startAngle}deg ${endAngle}deg`;
              }).join(', ')})`,
              margin: '0 auto 2rem auto',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937' }}>
                  {formatCurrency(totalSpending)}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Total Spent
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {categoryData.slice(0, 5).map((category, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: category.color
                  }} />
                  <span style={{ fontSize: '0.875rem', color: '#64748b', flex: 1 }}>
                    {category.name}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                    {category.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Details List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Category Details</h3>
            <p className="card-subtitle">Detailed breakdown by category</p>
          </div>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {categoryData.map((category, index) => (
              <CategoryItem
                key={index}
                category={category}
                totalSpending={totalSpending}
                rank={index + 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">💡 Category Insights</h3>
          <p className="card-subtitle">Understanding your spending patterns</p>
        </div>
        
        <div className="grid grid-cols-3">
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
    </PageLayout>
  );
};

// Helper Components
const SummaryCard = ({ title, value, subtitle, icon, color }) => (
  <div className="card" style={{ textAlign: 'center' }}>
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

const CategoryItem = ({ category, totalSpending, rank }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      borderBottom: '1px solid #f1f5f9',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.background = '#f8fafc';
    }}
    onMouseLeave={(e) => {
      e.target.style.background = 'transparent';
    }}>
      <div style={{
        width: '40px',
        height: '40px',
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
        #{rank}
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            flex: 1,
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
          <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '80px' }}>
            {category.transactions} transactions
          </span>
        </div>
      </div>
    </div>
  );
};

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

export default CategoryAnalysisNew;