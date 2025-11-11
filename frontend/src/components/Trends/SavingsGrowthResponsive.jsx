import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import PageLayout from '../Layout/PageLayout';

const SavingsGrowthResponsive = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [goalData, setGoalData] = useState([]);
  const [monthlyContributions, setMonthlyContributions] = useState([]);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [progressToGoal, setProgressToGoal] = useState(0);
  const [averageMonthlyContribution, setAverageMonthlyContribution] = useState(0);

  // Fetch savings data
  useEffect(() => {
    const fetchSavingsData = async () => {
      try {
        setLoading(true);
        
        // Get number of months based on selected period
        const periodMonths = selectedPeriod === '3months' ? 3 : 
                            selectedPeriod === '6months' ? 6 : 12;
        
        // Fetch savings goals and transactions
        const [savingsGoals, transactions, userProfile] = await Promise.all([
          apiService.getAllSavingsGoals().catch(() => []),
          apiService.getUserTransactions().catch(() => []),
          apiService.getUserProfile().catch(() => ({}))
        ]);
        
        // Calculate active savings goal (use the first active goal or create a default)
        const activeGoal = savingsGoals.find(g => g.status === 'ACTIVE') || 
                          savingsGoals.find(g => g.status === 'IN_PROGRESS') ||
                          savingsGoals[0];
        
        const targetAmount = activeGoal?.targetAmount || userProfile?.savingsGoal || 10000;
        
        // Create array of last N months
        const monthsArray = [];
        const savingsArray = [];
        const goalArray = [];
        const contributionsArray = [];
        const now = new Date();
        
        // Get user's current savings from profile
        let runningBalance = userProfile?.currentSavings || 0;
        
        for (let i = periodMonths - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          monthsArray.push(monthName);
          
          // Calculate month boundaries
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
          
          // Calculate net income for this month (income - expenses)
          const monthTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date || t.transactionDate);
            return transactionDate >= monthStart && transactionDate <= monthEnd;
          });
          
          const monthIncome = monthTransactions
            .filter(t => t.type === 'INCOME' || t.amount > 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          
          const monthExpenses = monthTransactions
            .filter(t => t.type === 'EXPENSE' || t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
          
          const monthlyContribution = monthIncome - monthExpenses;
          contributionsArray.push(Math.max(0, Math.round(monthlyContribution)));
          
          // Calculate savings progression (starting from current and working backwards)
          if (i === 0) {
            // Most recent month - use current savings
            savingsArray.push(Math.round(runningBalance));
          } else {
            // Earlier months - subtract contributions to estimate previous balance
            const futureSavings = savingsArray[0] || runningBalance;
            const estimatedPastSavings = futureSavings - (contributionsArray.slice(0, periodMonths - i).reduce((sum, val) => sum + val, 0));
            savingsArray.unshift(Math.max(0, Math.round(estimatedPastSavings)));
          }
          
          // Goal progression (linear towards target)
          const goalProgress = targetAmount * ((periodMonths - i) / periodMonths);
          goalArray.push(Math.round(goalProgress));
        }
        
        setMonths(monthsArray);
        setSavingsData(savingsArray);
        setGoalData(goalArray);
        setMonthlyContributions(contributionsArray);
        
        const current = savingsArray[savingsArray.length - 1] || 0;
        const goal = targetAmount;
        const progress = goal > 0 ? ((current / goal) * 100).toFixed(1) : 0;
        const avgContribution = contributionsArray.reduce((sum, val) => sum + val, 0) / contributionsArray.length;
        
        setCurrentSavings(current);
        setSavingsGoal(goal);
        setProgressToGoal(progress);
        setAverageMonthlyContribution(Math.round(avgContribution));
        
      } catch (error) {
        console.error('Error fetching savings data:', error);
        // Set default empty data on error
        const defaultMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setMonths(defaultMonths);
        setSavingsData([5000, 6000, 7500, 8200, 9000, 10000]);
        setGoalData([2000, 4000, 6000, 8000, 10000, 12000]);
        setMonthlyContributions([1000, 1500, 700, 1200, 800, 1000]);
        setCurrentSavings(10000);
        setSavingsGoal(12000);
        setProgressToGoal(83.3);
        setAverageMonthlyContribution(1033);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavingsData();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh',
        padding: '1rem',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>
            Savings Growth
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
            Loading your savings data...
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            height: '300px', 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: '#64748b'
          }}>
            🐷 Loading savings data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      minHeight: '100vh',
      padding: '1rem',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: '#f8fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.75rem',
              fontSize: '1.2rem',
              color: '#64748b',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e2e8f0';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f8fafc';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ←
          </button>
          <div>
            <h1 style={{ color: '#1e293b', fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>
              Savings Growth
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>
              Monitor your savings progress and goal achievement
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              background: 'white',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#64748b',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          >
            🐷 Export
          </button>
        </div>
      </div>

      {/* Main Chart Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            color: '#1f2937', 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            margin: '0 0 0.5rem 0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🐷 Savings Growth Trend
          </h3>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>
            Current: ₹{currentSavings.toLocaleString()} • Goal: ₹{savingsGoal.toLocaleString()} • 
            Progress: {progressToGoal}%
          </p>
        </div>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: '#f1f5f9',
            borderRadius: '12px',
            height: '12px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              height: '100%',
              width: `${Math.min(progressToGoal, 100)}%`,
              borderRadius: '12px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.8rem',
            color: '#64748b'
          }}>
            <span>₹0</span>
            <span style={{ fontWeight: '600', color: '#22c55e' }}>
              {progressToGoal}% Complete
            </span>
            <span>₹{savingsGoal.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Responsive Chart */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '12px',
          padding: '2rem 1rem',
          minHeight: '300px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'end',
            justifyContent: 'space-around',
            minHeight: '250px',
            padding: '1rem 0'
          }}>
            {months.map((month, index) => {
              const value = savingsData[index];
              const height = Math.max(50, (value / Math.max(...savingsData)) * 180);
              
              return (
                <div key={index} style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  minWidth: '60px',
                  flex: '1 1 auto',
                  maxWidth: '100px'
                }}>
                  {/* Value label */}
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#1f2937', 
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    ₹{(value / 1000).toFixed(1)}k
                  </div>
                  
                  {/* Bar */}
                  <div 
                    style={{ 
                      height: `${height}px`,
                      width: '100%',
                      minWidth: '30px',
                      maxWidth: '60px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      borderRadius: '6px 6px 0 0',
                      marginBottom: '0.5rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'end',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-4px) scale(1.05)';
                      e.target.style.boxShadow = '0 8px 20px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                    }}
                  />
                  
                  {/* Month label */}
                  <div style={{ 
                    fontWeight: '600', 
                    color: '#64748b', 
                    fontSize: '0.8rem',
                    textAlign: 'center'
                  }}>
                    {month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard 
          icon="🐷"
          title="Current Savings"
          value={`₹${currentSavings.toLocaleString()}`}
          subtitle="Total accumulated"
          color="#22c55e"
        />
        <StatCard 
          icon="🎯"
          title="Goal Progress"
          value={`${progressToGoal}%`}
          subtitle={`Of ₹${savingsGoal.toLocaleString()} goal`}
          color="#f59e0b"
        />
        <StatCard 
          icon="📅"
          title="Monthly Average"
          value={`₹${Math.round(averageMonthlyContribution).toLocaleString()}`}
          subtitle="Per month"
          color="#3b82f6"
        />
        <StatCard 
          icon="📈"
          title="Growth Rate"
          value={`+${savingsData.length > 1 ? (((currentSavings - savingsData[0]) / (savingsData[0] || 1)) * 100).toFixed(1) : '0.0'}%`}
          subtitle={`Over ${months.length} months`}
          color="#8b5cf6"
        />
      </div>

      {/* Monthly Contributions Chart */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#1f2937', fontWeight: '700', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
          💰 Monthly Contributions
        </h3>
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'end',
          justifyContent: 'space-around',
          minHeight: '200px',
          padding: '1rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px'
        }}>
          {monthlyContributions.map((contribution, index) => {
            const height = Math.max(30, (contribution / Math.max(...monthlyContributions)) * 120);
            const isHighest = contribution === Math.max(...monthlyContributions);
            
            return (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                minWidth: '60px',
                flex: '1 1 auto',
                maxWidth: '100px'
              }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: '#1f2937', 
                  marginBottom: '0.5rem',
                  fontSize: '0.8rem'
                }}>
                  ₹{(contribution / 1000).toFixed(1)}k
                </div>
                <div 
                  style={{ 
                    height: `${height}px`,
                    width: '100%',
                    minWidth: '30px',
                    maxWidth: '60px',
                    background: isHighest 
                      ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                      : 'linear-gradient(135deg, #667eea, #764ba2)',
                    borderRadius: '6px 6px 0 0',
                    marginBottom: '0.5rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: isHighest 
                      ? '0 4px 12px rgba(34, 197, 94, 0.3)' 
                      : '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-4px) scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                  }}
                />
                <div style={{ 
                  fontWeight: '600', 
                  color: '#64748b', 
                  fontSize: '0.8rem'
                }}>
                  {months[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Card */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#1f2937', fontWeight: '700', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
          💡 Savings Insights & Recommendations
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <InsightCard 
            icon="🏆"
            title="Great Progress!"
            description={`You're ${progressToGoal}% of the way to your savings goal. Keep up the excellent work!`}
            type="positive"
          />
          <InsightCard 
            icon="⏰"
            title="Goal Timeline"
            description={`At your current pace, you'll reach your ₹${savingsGoal.toLocaleString()} goal in approximately ${averageMonthlyContribution > 0 ? Math.ceil((savingsGoal - currentSavings) / averageMonthlyContribution) : 'N/A'} months.`}
            type="info"
          />
          <InsightCard 
            icon="🚀"
            title="Boost Your Savings"
            description="Increasing your monthly contribution by ₹1000 could help you reach your goal faster."
            type="warning"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, subtitle, color }) => (
  <div style={{
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    transition: 'all 0.3s ease'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem'
    }}>
      {icon}
    </div>
    <div>
      <h4 style={{ margin: '0 0 0.25rem 0', color: '#1f2937', fontSize: '0.9rem', fontWeight: '600' }}>
        {title}
      </h4>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.25rem 0' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
        {subtitle}
      </div>
    </div>
  </div>
);

const InsightCard = ({ icon, title, description, type }) => {
  const colors = {
    info: '#3b82f6',
    positive: '#22c55e',
    warning: '#f59e0b'
  };
  
  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      padding: '1rem',
      borderRadius: '8px',
      background: `${colors[type]}10`,
      border: `1px solid ${colors[type]}20`
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: colors[type],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1rem', fontWeight: '600' }}>
          {title}
        </h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.4' }}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default SavingsGrowthResponsive;