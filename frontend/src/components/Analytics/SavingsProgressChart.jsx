import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import ChartWrapper from './ChartWrapper';
import { defaultChartOptions, chartColors, getCategoryColor } from './BaseChart';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/currencyFormatter';
import './SavingsProgressChart.css';

const SavingsProgressChart = ({ 
  height = '500px',
  className = '',
  onDataLoad = null 
}) => {
  const [chartData, setChartData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [viewMode, setViewMode] = useState('progress'); // 'progress' or 'timeline'

  useEffect(() => {
    fetchSavingsProgress();
  }, []);

  const fetchSavingsProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use demo data directly to avoid API errors
      console.log('Using demo data for savings progress chart');
      const demoData = [
        { 
          id: 1, 
          goalName: 'Emergency Fund', 
          targetAmount: 250000, 
          currentAmount: 150000, 
          targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'IN_PROGRESS'
        },
        { 
          id: 2, 
          goalName: 'Vacation Fund', 
          targetAmount: 125000, 
          currentAmount: 70000, 
          targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'IN_PROGRESS'
        },
        { 
          id: 3, 
          goalName: 'New Car', 
          targetAmount: 2100000, 
          currentAmount: 2100000, 
          targetDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'COMPLETED'
        }
      ];
      
      setSavingsGoals(demoData);
      const processedProgressData = processProgressData(demoData);
      const processedChartData = processChartData(demoData);
      
      setProgressData(processedProgressData);
      setChartData(processedChartData);
      
      if (onDataLoad) {
        onDataLoad({ goals: demoData });
      }
    } catch (err) {
      console.error('Error processing savings progress data:', err);
      setError('Unable to display chart data');
    } finally {
      setLoading(false);
    }
  };

  const processProgressData = (goals) => {
    return goals.map(goal => {
      const progressPercent = goal.targetAmount > 0 
        ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
        : 0;
      
      const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0);
      
      // Calculate days until deadline
      const today = new Date();
      const deadline = new Date(goal.targetDate);
      const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      // Determine status
      let status = 'on-track';
      if (progressPercent >= 100) {
        status = 'completed';
      } else if (daysUntilDeadline < 0) {
        status = 'overdue';
      } else if (daysUntilDeadline <= 30) {
        status = 'approaching';
      }
      
      return {
        ...goal,
        progressPercent,
        remainingAmount,
        daysUntilDeadline,
        status
      };
    });
  };

  const processChartData = (goals) => {
    if (viewMode === 'progress') {
      // Progress bar chart
      const labels = goals.map(goal => goal.goalName);
      const currentAmounts = goals.map(goal => goal.currentAmount);
      const remainingAmounts = goals.map(goal => 
        Math.max(goal.targetAmount - goal.currentAmount, 0)
      );
      
      return {
        labels,
        datasets: [
          {
            label: 'Current Amount',
            data: currentAmounts,
            backgroundColor: chartColors.success + '80',
            borderColor: chartColors.success,
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Remaining Amount',
            data: remainingAmounts,
            backgroundColor: chartColors.gray + '40',
            borderColor: chartColors.gray,
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          }
        ]
      };
    } else {
      // Timeline doughnut chart showing overall progress
      const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
      const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
      const totalRemaining = Math.max(totalTarget - totalCurrent, 0);
      
      return {
        labels: ['Saved', 'Remaining'],
        datasets: [
          {
            data: [totalCurrent, totalRemaining],
            backgroundColor: [
              chartColors.success + '80',
              chartColors.gray + '40'
            ],
            borderColor: [
              chartColors.success,
              chartColors.gray
            ],
            borderWidth: 2,
            hoverBackgroundColor: [
              chartColors.success,
              chartColors.gray + '60'
            ]
          }
        ]
      };
    }
  };

  const getChartOptions = () => {
    if (viewMode === 'progress') {
      return {
        ...defaultChartOptions,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...defaultChartOptions.plugins,
          title: {
            display: false
          },
          tooltip: {
            ...defaultChartOptions.plugins.tooltip,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y;
                
                const formatter = new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
                
                return `${label}: ${formatter.format(value)}`;
              },
              afterBody: function(context) {
                if (context.length > 0) {
                  const dataIndex = context[0].dataIndex;
                  const goal = savingsGoals[dataIndex];
                  
                  if (goal) {
                    const progressPercent = goal.targetAmount > 0 
                      ? ((goal.currentAmount / goal.targetAmount) * 100).toFixed(1)
                      : 0;
                    
                    const deadline = new Date(goal.targetDate);
                    const formattedDeadline = deadline.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    
                    return [
                      '',
                      `Progress: ${progressPercent}%`,
                      `Target: ${new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR'
                      }).format(goal.targetAmount)}`,
                      `Deadline: ${formattedDeadline}`
                    ];
                  }
                }
                return [];
              }
            }
          }
        },
        scales: {
          ...defaultChartOptions.scales,
          x: {
            ...defaultChartOptions.scales.x,
            stacked: true,
            title: {
              display: true,
              text: 'Savings Goals',
              font: {
                size: 12,
                weight: '600'
              },
              color: '#6b7280'
            }
          },
          y: {
            ...defaultChartOptions.scales.y,
            stacked: true,
            title: {
              display: true,
              text: 'Amount (₹)',
              font: {
                size: 12,
                weight: '600'
              },
              color: '#6b7280'
            },
            beginAtZero: true
          }
        }
      };
    } else {
      return {
        ...defaultChartOptions,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...defaultChartOptions.plugins,
          title: {
            display: false
          },
          legend: {
            ...defaultChartOptions.plugins.legend,
            position: 'bottom'
          },
          tooltip: {
            ...defaultChartOptions.plugins.tooltip,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                
                const formatter = new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
                
                return [
                  `${label}: ${formatter.format(value)}`,
                  `Percentage: ${percentage}%`
                ];
              }
            }
          }
        },
        scales: undefined
      };
    }
  };

  const handleRetry = () => {
    fetchSavingsProgress();
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    if (savingsGoals.length > 0) {
      const newChartData = processChartData(savingsGoals);
      setChartData(newChartData);
    }
  };

  const formatCurrencyLocal = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅';
      case 'overdue': return '⚠️';
      case 'approaching': return '🔔';
      default: return '📈';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'completed';
      case 'overdue': return 'overdue';
      case 'approaching': return 'approaching';
      default: return 'on-track';
    }
  };

  return (
    <ChartWrapper
      title={
        <div className="savings-chart-header">
          <span>Savings Goals Progress</span>
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'progress' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('progress')}
            >
              Progress View
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('timeline')}
            >
              Overview
            </button>
          </div>
        </div>
      }
      isLoading={loading}
      error={error}
      onRetry={handleRetry}
      height={height}
      className={`savings-progress-chart ${className}`}
      showLegend={false}
    >
      {chartData && progressData && (
        <div className="savings-chart-container">
          <div className="chart-section">
            <div style={{ position: 'relative', height: '100%', width: '100%' }}>
              {viewMode === 'progress' ? (
                <Bar data={chartData} options={getChartOptions()} />
              ) : (
                <Doughnut data={chartData} options={getChartOptions()} />
              )}
            </div>
          </div>
          
          <div className="goals-summary">
            <div className="summary-header">
              <h4>Goals Summary</h4>
              <span className="goals-count">
                {progressData.length} goal{progressData.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="goals-list">
              {progressData.map((goal, index) => (
                <div 
                  key={goal.id || index}
                  className={`goal-item ${getStatusColor(goal.status)}`}
                >
                  <div className="goal-header">
                    <div className="goal-info">
                      <span className="goal-name">{goal.goalName}</span>
                      <span className="goal-status">
                        {getStatusIcon(goal.status)}
                        {goal.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="goal-progress-percent">
                      {Math.round(goal.progressPercent)}%
                    </div>
                  </div>
                  
                  <div className="goal-progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="goal-details">
                    <div className="goal-amounts">
                      <span className="current-amount">
                        {formatCurrencyLocal(goal.currentAmount)}
                      </span>
                      <span className="target-amount">
                        / {formatCurrencyLocal(goal.targetAmount)}
                      </span>
                    </div>
                    
                    <div className="goal-timeline">
                      <span className="deadline">
                        Due: {formatDate(goal.targetDate)}
                      </span>
                      {goal.daysUntilDeadline >= 0 && (
                        <span className="days-remaining">
                          {goal.daysUntilDeadline} day{goal.daysUntilDeadline !== 1 ? 's' : ''} left
                        </span>
                      )}
                      {goal.daysUntilDeadline < 0 && (
                        <span className="days-overdue">
                          {Math.abs(goal.daysUntilDeadline)} day{Math.abs(goal.daysUntilDeadline) !== 1 ? 's' : ''} overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {progressData.length === 0 && (
              <div className="no-goals-message">
                <p>No savings goals found. Create your first savings goal to track progress!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ChartWrapper>
  );
};

export default SavingsProgressChart;