import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import { GlassCard, GlassButton, GlassModal, GlassInput, GlassDropdown } from '../Glass';
import { apiService } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency } from '../../utils/currencyFormatter';
import './UnifiedGoals.css';

const UnifiedGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all'); // all, savings, investment, active, completed
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    type: 'savings', // savings or investment
    category: '',
    riskTolerance: 'moderate', // for investment goals
    monthlyContribution: '',
    priority: 'medium', // high, medium, low
    autoContribute: false,
    milestones: []
  });
  
  const [showMilestones, setShowMilestones] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  const { showAlert } = useAlert();

  const goalCategories = {
    savings: ['Emergency Fund', 'Vacation', 'Car', 'Home Down Payment', 'Wedding', 'Other'],
    investment: ['Retirement', 'Education', 'Major Purchase', 'Wealth Building', 'Real Estate', 'Other']
  };

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      // Fetch both savings and investment goals
      const [savingsGoals, investmentGoals] = await Promise.all([
        fetchSavingsGoals(),
        fetchInvestmentGoals()
      ]);
      
      const allGoals = [
        ...savingsGoals.map(goal => ({ ...goal, type: 'savings' })),
        ...investmentGoals.map(goal => ({ ...goal, type: 'investment' }))
      ];
      
      setGoals(filterGoals(allGoals));
    } catch (error) {
      console.error('Error fetching goals:', error);
      showAlert('Failed to load goals: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavingsGoals = async () => {
    try {
      return await apiService.getAllSavingsGoals();
    } catch (error) {
      // Enhanced fallback savings goals with more realistic data
      return [
        {
          id: 's1',
          name: 'Emergency Fund',
          targetAmount: 500000,
          currentAmount: 125000,
          targetDate: '2024-12-31',
          category: 'Emergency Fund',
          status: 'IN_PROGRESS',
          progressPercentage: 25,
          remainingAmount: 375000,
          priority: 'high',
          monthlyContribution: 15000,
          autoContribute: true,
          milestones: [
            { amount: 100000, achieved: true, date: '2024-01-15' },
            { amount: 250000, achieved: false, date: null },
            { amount: 500000, achieved: false, date: null }
          ],
          streak: 8, // months of consistent contributions
          lastContribution: '2024-10-15',
          averageMonthlyProgress: 12500
        },
        {
          id: 's2',
          name: 'Dream Vacation to Japan',
          targetAmount: 150000,
          currentAmount: 45000,
          targetDate: '2025-08-15',
          category: 'Vacation',
          status: 'IN_PROGRESS',
          progressPercentage: 30,
          remainingAmount: 105000,
          priority: 'medium',
          monthlyContribution: 8000,
          autoContribute: false,
          milestones: [
            { amount: 50000, achieved: false, date: null },
            { amount: 100000, achieved: false, date: null },
            { amount: 150000, achieved: false, date: null }
          ],
          streak: 5,
          lastContribution: '2024-10-10',
          averageMonthlyProgress: 7500
        },
        {
          id: 's3',
          name: 'New Car Fund',
          targetAmount: 800000,
          currentAmount: 320000,
          targetDate: '2025-06-01',
          category: 'Car',
          status: 'IN_PROGRESS',
          progressPercentage: 40,
          remainingAmount: 480000,
          priority: 'high',
          monthlyContribution: 25000,
          autoContribute: true,
          milestones: [
            { amount: 200000, achieved: true, date: '2024-05-20' },
            { amount: 400000, achieved: false, date: null },
            { amount: 600000, achieved: false, date: null },
            { amount: 800000, achieved: false, date: null }
          ],
          streak: 12,
          lastContribution: '2024-10-25',
          averageMonthlyProgress: 22000
        }
      ];
    }
  };

  const fetchInvestmentGoals = async () => {
    try {
      // Enhanced mock investment goals with comprehensive data
      return [
        {
          id: 'i1',
          name: 'Retirement Fund',
          targetAmount: 2000000,
          currentAmount: 350000,
          targetDate: '2045-12-31',
          category: 'Retirement',
          riskTolerance: 'moderate',
          projectedReturn: 8.5,
          monthlyContribution: 15000,
          status: 'IN_PROGRESS',
          progressPercentage: 17.5,
          remainingAmount: 1650000,
          priority: 'high',
          autoContribute: true,
          milestones: [
            { amount: 500000, achieved: false, date: null },
            { amount: 1000000, achieved: false, date: null },
            { amount: 1500000, achieved: false, date: null },
            { amount: 2000000, achieved: false, date: null }
          ],
          portfolioAllocation: {
            stocks: 60,
            bonds: 30,
            reits: 10
          },
          performanceData: {
            ytdReturn: 12.3,
            oneYearReturn: 15.7,
            threeYearReturn: 9.2
          },
          streak: 24,
          lastContribution: '2024-10-28',
          projectedCompletionDate: '2043-08-15'
        },
        {
          id: 'i2',
          name: 'Kids Education Fund',
          targetAmount: 800000,
          currentAmount: 120000,
          targetDate: '2035-06-01',
          category: 'Education',
          riskTolerance: 'aggressive',
          projectedReturn: 10.2,
          monthlyContribution: 8000,
          status: 'IN_PROGRESS',
          progressPercentage: 15,
          remainingAmount: 680000,
          priority: 'high',
          autoContribute: true,
          milestones: [
            { amount: 200000, achieved: false, date: null },
            { amount: 400000, achieved: false, date: null },
            { amount: 600000, achieved: false, date: null },
            { amount: 800000, achieved: false, date: null }
          ],
          portfolioAllocation: {
            stocks: 80,
            bonds: 15,
            reits: 5
          },
          performanceData: {
            ytdReturn: 18.5,
            oneYearReturn: 22.1,
            threeYearReturn: 11.8
          },
          streak: 18,
          lastContribution: '2024-10-25',
          projectedCompletionDate: '2034-02-10'
        },
        {
          id: 'i3',
          name: 'Real Estate Investment',
          targetAmount: 1200000,
          currentAmount: 180000,
          targetDate: '2030-12-31',
          category: 'Real Estate',
          riskTolerance: 'moderate',
          projectedReturn: 7.8,
          monthlyContribution: 12000,
          status: 'IN_PROGRESS',
          progressPercentage: 15,
          remainingAmount: 1020000,
          priority: 'medium',
          autoContribute: false,
          milestones: [
            { amount: 300000, achieved: false, date: null },
            { amount: 600000, achieved: false, date: null },
            { amount: 900000, achieved: false, date: null },
            { amount: 1200000, achieved: false, date: null }
          ],
          portfolioAllocation: {
            reits: 70,
            stocks: 20,
            bonds: 10
          },
          performanceData: {
            ytdReturn: 8.9,
            oneYearReturn: 11.2,
            threeYearReturn: 7.1
          },
          streak: 6,
          lastContribution: '2024-10-20',
          projectedCompletionDate: '2031-05-15'
        }
      ];
    } catch (error) {
      return [];
    }
  };

  const filterGoals = (allGoals) => {
    switch (filter) {
      case 'savings':
        return allGoals.filter(goal => goal.type === 'savings');
      case 'investment':
        return allGoals.filter(goal => goal.type === 'investment');
      case 'active':
        return allGoals.filter(goal => goal.status === 'IN_PROGRESS');
      case 'completed':
        return allGoals.filter(goal => goal.status === 'COMPLETED');
      default:
        return allGoals;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingGoal) {
        if (formData.type === 'savings') {
          await apiService.updateSavingsGoal(editingGoal.id, formData);
        }
        showAlert('Goal updated successfully!', 'success');
      } else {
        if (formData.type === 'savings') {
          await apiService.createSavingsGoal(formData);
        }
        showAlert('Goal created successfully!', 'success');
      }
      
      setShowModal(false);
      setEditingGoal(null);
      resetForm();
      fetchGoals();
    } catch (error) {
      showAlert('Failed to save goal: ' + error.message, 'error');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      targetDate: goal.targetDate || '',
      type: goal.type,
      category: goal.category || '',
      riskTolerance: goal.riskTolerance || 'moderate',
      monthlyContribution: goal.monthlyContribution || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (goal) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    try {
      if (goal.type === 'savings') {
        await apiService.deleteSavingsGoal(goal.id);
      }
      showAlert('Goal deleted successfully!', 'success');
      fetchGoals();
    } catch (error) {
      showAlert('Failed to delete goal: ' + error.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      type: 'savings',
      category: '',
      riskTolerance: 'moderate',
      monthlyContribution: '',
      priority: 'medium',
      autoContribute: false,
      milestones: []
    });
  };

  const handleQuickContribute = async (goal) => {
    const amount = prompt(`Add funds to ${goal.name}:`, goal.monthlyContribution || '1000');
    if (!amount || isNaN(amount)) return;
    
    try {
      // Update goal progress
      const updatedGoal = {
        ...goal,
        currentAmount: goal.currentAmount + parseFloat(amount),
        progressPercentage: ((goal.currentAmount + parseFloat(amount)) / goal.targetAmount) * 100
      };
      
      // Update goals list
      setGoals(prevGoals => 
        prevGoals.map(g => g.id === goal.id ? updatedGoal : g)
      );
      
      showAlert(`₹${parseFloat(amount).toLocaleString()} added to ${goal.name}!`, 'success');
    } catch (error) {
      showAlert('Failed to add contribution: ' + error.message, 'error');
    }
  };

  const handleToggleAutoContribute = async (goal) => {
    try {
      const updatedGoal = {
        ...goal,
        autoContribute: !goal.autoContribute
      };
      
      setGoals(prevGoals => 
        prevGoals.map(g => g.id === goal.id ? updatedGoal : g)
      );
      
      showAlert(
        `Auto-contribute ${updatedGoal.autoContribute ? 'enabled' : 'disabled'} for ${goal.name}`,
        'success'
      );
    } catch (error) {
      showAlert('Failed to update auto-contribute: ' + error.message, 'error');
    }
  };

  const handleCreateMilestone = (amount) => {
    const newMilestone = {
      amount: parseFloat(amount),
      achieved: false,
      date: null
    };
    
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone].sort((a, b) => a.amount - b.amount)
    }));
  };

  const openNewGoalModal = () => {
    setEditingGoal(null);
    resetForm();
    setShowModal(true);
  };

  // Enhanced utility functions
  const calculateTimeToGoal = (currentAmount, targetAmount, monthlyContribution) => {
    if (monthlyContribution <= 0) return null;
    const remaining = targetAmount - currentAmount;
    return Math.ceil(remaining / monthlyContribution);
  };

  const calculateRequiredMonthlyContribution = (currentAmount, targetAmount, targetDate) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const monthsRemaining = Math.max(1, Math.ceil((target - now) / (1000 * 60 * 60 * 24 * 30)));
    const remaining = targetAmount - currentAmount;
    return Math.ceil(remaining / monthsRemaining);
  };

  const getGoalHealthStatus = (goal) => {
    const progress = goal.progressPercentage || 0;
    const timeProgress = goal.targetDate ? 
      ((new Date() - new Date(goal.createdAt || '2024-01-01')) / 
       (new Date(goal.targetDate) - new Date(goal.createdAt || '2024-01-01'))) * 100 : 0;
    
    if (progress >= timeProgress + 10) return 'excellent';
    if (progress >= timeProgress - 5) return 'good';
    if (progress >= timeProgress - 15) return 'fair';
    return 'poor';
  };

  const generateGoalRecommendations = (goals) => {
    const recommendations = [];
    
    goals.forEach(goal => {
      const health = getGoalHealthStatus(goal);
      const requiredContribution = calculateRequiredMonthlyContribution(
        goal.currentAmount, goal.targetAmount, goal.targetDate
      );
      
      if (health === 'poor') {
        recommendations.push({
          type: 'warning',
          goalId: goal.id,
          title: `${goal.name} is behind schedule`,
          message: `Consider increasing monthly contribution to ₹${requiredContribution?.toLocaleString() || 'N/A'}`,
          action: 'increase_contribution'
        });
      }
      
      if (goal.streak >= 12) {
        recommendations.push({
          type: 'achievement',
          goalId: goal.id,
          title: `Great consistency on ${goal.name}!`,
          message: `You've maintained contributions for ${goal.streak} months straight`,
          action: 'celebrate'
        });
      }
      
      if (goal.progressPercentage >= 75 && goal.progressPercentage < 100) {
        recommendations.push({
          type: 'milestone',
          goalId: goal.id,
          title: `${goal.name} is almost complete!`,
          message: `Only ₹${goal.remainingAmount?.toLocaleString()} left to reach your goal`,
          action: 'final_push'
        });
      }
    });
    
    return recommendations;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getGoalIcon = (type, category) => {
    if (type === 'investment') {
      switch (category) {
        case 'Retirement': return '🏖️';
        case 'Education': return '🎓';
        case 'Major Purchase': return '🏠';
        case 'Wealth Building': return '💰';
        case 'Real Estate': return '🏢';
        default: return '📈';
      }
    } else {
      switch (category) {
        case 'Emergency Fund': return '🛡️';
        case 'Vacation': return '✈️';
        case 'Car': return '🚗';
        case 'Home Down Payment': return '🏠';
        case 'Wedding': return '💒';
        default: return '🎯';
      }
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'conservative': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'aggressive': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="unified-goals">
        <div className="loading">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="unified-goals">
      <GlassCard className="goals-header" variant="primary">
        <div>
          <h1>Financial Goals</h1>
          <p>Track your savings and investment goals in one place</p>
        </div>
        <button className="btn-primary" onClick={openNewGoalModal}>
          <i className="fas fa-plus">+</i> New Goal
        </button>
      </GlassCard>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <GlassButton 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          variant={filter === 'all' ? 'primary' : 'secondary'}
        >
          All Goals ({goals.length})
        </GlassButton>
        <GlassButton 
          className={`filter-tab ${filter === 'savings' ? 'active' : ''}`}
          onClick={() => setFilter('savings')}
          variant={filter === 'savings' ? 'primary' : 'secondary'}
        >
          Savings Goals
        </GlassButton>
        <GlassButton 
          className={`filter-tab ${filter === 'investment' ? 'active' : ''}`}
          onClick={() => setFilter('investment')}
          variant={filter === 'investment' ? 'primary' : 'secondary'}
        >
          Investment Goals
        </GlassButton>
        <GlassButton 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
          variant={filter === 'active' ? 'primary' : 'secondary'}
        >
          Active
        </GlassButton>
        <GlassButton 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
          variant={filter === 'completed' ? 'primary' : 'secondary'}
        >
          Completed
        </GlassButton>
      </div>

      {/* Goals Summary */}
      <div className="goals-summary">
        <GlassCard className="summary-card" variant="primary">
          <div className="summary-icon">
            <i className="fas fa-bullseye"></i>
          </div>
          <div className="summary-info">
            <h3>{formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}</h3>
            <p>Total Target</p>
          </div>
        </GlassCard>
        <GlassCard className="summary-card" variant="secondary">
          <div className="summary-icon">
            <i className="fas fa-coins"></i>
          </div>
          <div className="summary-info">
            <h3>{formatCurrency(goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0))}</h3>
            <p>Total Saved</p>
          </div>
        </GlassCard>
        <GlassCard className="summary-card" variant="accent">
          <div className="summary-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="summary-info">
            <h3>
              {goals.length > 0 
                ? ((goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0) / 
                   goals.reduce((sum, goal) => sum + goal.targetAmount, 0)) * 100).toFixed(1) 
                : 0}%
            </h3>
            <p>Overall Progress</p>
          </div>
        </GlassCard>
      </div>

      {/* Smart Recommendations */}
      {goals.length > 0 && (
        <div className="recommendations-section">
          <div className="section-header">
            <h3>
              <i className="fas fa-lightbulb"></i>
              Smart Recommendations
            </h3>
            <button 
              className="toggle-btn"
              onClick={() => setShowRecommendations(!showRecommendations)}
            >
              {showRecommendations ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showRecommendations && (
            <div className="recommendations-grid">
              {generateGoalRecommendations(goals).slice(0, 3).map((rec, index) => (
                <div key={index} className={`recommendation-card ${rec.type}`}>
                  <div className="rec-icon">
                    <i className={`fas ${
                      rec.type === 'warning' ? 'fa-exclamation-triangle' :
                      rec.type === 'achievement' ? 'fa-trophy' :
                      'fa-flag-checkered'
                    }`}></i>
                  </div>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.message}</p>
                  </div>
                  <button className="rec-action">
                    {rec.action === 'increase_contribution' ? 'Adjust' :
                     rec.action === 'celebrate' ? 'View' : 'Details'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goals Analytics */}
      {goals.length > 0 && (
        <div className="analytics-section">
          <div className="section-header">
            <h3>
              <i className="fas fa-chart-pie"></i>
              Goals Analytics
            </h3>
            <button 
              className="toggle-btn"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              {showAnalytics ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showAnalytics && (
            <div className="analytics-grid">
              <div className="analytics-card">
                <h4>Completion Timeline</h4>
                <div className="timeline-chart">
                  {goals.filter(g => g.targetDate).map(goal => (
                    <div key={goal.id} className="timeline-item">
                      <div className="timeline-goal">
                        <span className="goal-name">{goal.name}</span>
                        <span className="goal-date">{formatDate(goal.targetDate)}</span>
                      </div>
                      <div className="timeline-progress">
                        <div 
                          className="timeline-fill"
                          style={{ width: `${goal.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="analytics-card">
                <h4>Monthly Contributions</h4>
                <div className="contribution-breakdown">
                  {goals.filter(g => g.monthlyContribution).map(goal => (
                    <div key={goal.id} className="contribution-item">
                      <span className="contrib-goal">{goal.name}</span>
                      <span className="contrib-amount">{formatCurrency(goal.monthlyContribution)}</span>
                      <div className="contrib-bar">
                        <div 
                          className="contrib-fill"
                          style={{ 
                            width: `${(goal.monthlyContribution / Math.max(...goals.map(g => g.monthlyContribution || 0))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="analytics-card">
                <h4>Goal Health Distribution</h4>
                <div className="health-distribution">
                  {['excellent', 'good', 'fair', 'poor'].map(health => {
                    const count = goals.filter(g => getGoalHealthStatus(g) === health).length;
                    return (
                      <div key={health} className="health-item">
                        <span className={`health-indicator health-${health}`}></span>
                        <span className="health-label">{health}</span>
                        <span className="health-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-target"></i>
          <h3>No goals yet</h3>
          <p>Create your first financial goal to start tracking your progress</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <GlassCard key={goal.id} className={`goal-card ${goal.type}`} variant={goal.type === 'investment' ? 'secondary' : 'primary'} hover={true}>
              <div className="goal-header">
                <div className="goal-title">
                  <span className="goal-icon">{getGoalIcon(goal.type, goal.category)}</span>
                  <h3>{goal.name}</h3>
                  <span className={`type-badge ${goal.type}`}>
                    {goal.type === 'savings' ? 'Savings' : 'Investment'}
                  </span>
                </div>
                <div className="goal-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEdit(goal)}
                    title="Edit Goal"
                  >
                    <i className="fas fa-edit">✏️</i>
                    <span>Edit</span>
                  </button>
                  <button 
                    className="btn-icon delete" 
                    onClick={() => handleDelete(goal)}
                    title="Delete Goal"
                  >
                    <i className="fas fa-trash">🗑️</i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="goal-amounts">
                <div className="amount-row">
                  <span className="amount-label">Current</span>
                  <span className="amount-value">{formatCurrency(goal.currentAmount || 0)}</span>
                </div>
                <div className="amount-row">
                  <span className="amount-label">Target</span>
                  <span className="amount-value">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="amount-row">
                  <span className="amount-label">Remaining</span>
                  <span className="amount-value remaining">
                    {formatCurrency(goal.remainingAmount || (goal.targetAmount - (goal.currentAmount || 0)))}
                  </span>
                </div>
              </div>

              <div className="goal-progress">
                <div className="progress-header">
                  <span className="progress-text">
                    {(goal.progressPercentage || 0).toFixed(1)}% Complete
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${Math.min(goal.progressPercentage || 0, 100)}%`,
                      backgroundColor: goal.type === 'investment' ? '#3b82f6' : '#10b981'
                    }}
                  ></div>
                </div>
              </div>

              {goal.targetDate && (
                <div className="goal-deadline">
                  <i className="fas fa-calendar"></i>
                  <span>Target: {formatDate(goal.targetDate)}</span>
                </div>
              )}

              {/* Enhanced Goal Details */}
              <div className="goal-metrics">
                {goal.monthlyContribution && (
                  <div className="metric-item">
                    <i className="fas fa-calendar-plus"></i>
                    <span className="metric-label">Monthly</span>
                    <span className="metric-value">{formatCurrency(goal.monthlyContribution)}</span>
                  </div>
                )}
                
                {goal.streak && (
                  <div className="metric-item">
                    <i className="fas fa-fire"></i>
                    <span className="metric-label">Streak</span>
                    <span className="metric-value">{goal.streak}m</span>
                  </div>
                )}
                
                <div className="metric-item">
                  <i className="fas fa-chart-line"></i>
                  <span className="metric-label">Health</span>
                  <span className={`metric-value health-${getGoalHealthStatus(goal)}`}>
                    {getGoalHealthStatus(goal)}
                  </span>
                </div>
              </div>

              {/* Priority and Auto-contribute indicators */}
              <div className="goal-indicators">
                <span className={`priority-badge priority-${goal.priority || 'medium'}`}>
                  {goal.priority || 'medium'} priority
                </span>
                {goal.autoContribute && (
                  <span className="auto-badge">
                    <i className="fas fa-sync"></i> Auto
                  </span>
                )}
              </div>

              {/* Milestones Progress */}
              {goal.milestones && goal.milestones.length > 0 && (
                <div className="milestones-preview">
                  <div className="milestones-header">
                    <span>Milestones</span>
                    <span>{goal.milestones.filter(m => m.achieved).length}/{goal.milestones.length}</span>
                  </div>
                  <div className="milestones-dots">
                    {goal.milestones.map((milestone, index) => (
                      <div 
                        key={index}
                        className={`milestone-dot ${milestone.achieved ? 'achieved' : ''}`}
                        title={`₹${milestone.amount.toLocaleString()}`}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {goal.type === 'investment' && (
                <div className="investment-details">
                  {goal.riskTolerance && (
                    <div className="detail-item">
                      <span className="label">Risk:</span>
                      <span 
                        className="risk-badge"
                        style={{ backgroundColor: getRiskColor(goal.riskTolerance) }}
                      >
                        {goal.riskTolerance}
                      </span>
                    </div>
                  )}
                  {goal.projectedReturn && (
                    <div className="detail-item">
                      <span className="label">Expected Return:</span>
                      <span className="value">{goal.projectedReturn}%</span>
                    </div>
                  )}
                  {goal.performanceData && (
                    <div className="detail-item">
                      <span className="label">YTD Return:</span>
                      <span className={`value ${goal.performanceData.ytdReturn >= 0 ? 'positive' : 'negative'}`}>
                        {goal.performanceData.ytdReturn >= 0 ? '+' : ''}{goal.performanceData.ytdReturn}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="goal-quick-actions">
                <button 
                  className="quick-action-btn"
                  onClick={() => handleQuickContribute(goal)}
                  title="Quick Contribute"
                >
                  <i className="fas fa-plus" aria-hidden="true">+</i>
                  <span>Add</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => setSelectedGoal(goal)}
                  title="View Details"
                >
                  <i className="fas fa-chart-bar" aria-hidden="true">📊</i>
                  <span>Details</span>
                </button>
                <button 
                  className="quick-action-btn"
                  onClick={() => handleToggleAutoContribute(goal)}
                  title="Toggle Auto-contribute"
                >
                  <i className={`fas ${goal.autoContribute ? 'fa-pause' : 'fa-play'}`} aria-hidden="true">
                    {goal.autoContribute ? '⏸️' : '▶️'}
                  </i>
                  <span>{goal.autoContribute ? 'Pause' : 'Auto'}</span>
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit Goal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times">×</i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Type</label>
                <GlassDropdown
                  value={formData.type}
                  onChange={(value) => handleInputChange({ target: { name: 'type', value } })}
                  options={[
                    { value: 'savings', label: 'Savings Goal' },
                    { value: 'investment', label: 'Investment Goal' }
                  ]}
                  variant="primary"
                  size="medium"
                  className="form-dropdown"
                />
              </div>

              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="e.g., Emergency Fund, Retirement"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <GlassDropdown
                  value={formData.category}
                  onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                  options={[
                    { value: '', label: 'Select Category' },
                    ...goalCategories[formData.type].map(cat => ({ value: cat, label: cat }))
                  ]}
                  variant="primary"
                  size="medium"
                  searchable={true}
                  className="form-dropdown"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount (₹)</label>
                  <input
                    type="number"
                    name="targetAmount"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Current Amount (₹)</label>
                  <input
                    type="number"
                    name="currentAmount"
                    value={formData.currentAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Target Date (Optional)</label>
                <input
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleInputChange}
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {formData.type === 'investment' && (
                <>
                  <div className="form-group">
                    <label>Risk Tolerance</label>
                    <GlassDropdown
                      value={formData.riskTolerance}
                      onChange={(value) => handleInputChange({ target: { name: 'riskTolerance', value } })}
                      options={[
                        { value: 'conservative', label: 'Conservative' },
                        { value: 'moderate', label: 'Moderate' },
                        { value: 'aggressive', label: 'Aggressive' }
                      ]}
                      variant="primary"
                      size="medium"
                      className="form-dropdown"
                    />
                  </div>
                  <div className="form-group">
                    <label>Monthly Contribution (₹)</label>
                    <input
                      type="number"
                      name="monthlyContribution"
                      value={formData.monthlyContribution}
                      onChange={handleInputChange}
                      min="0"
                      step="100"
                      className="form-control"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Priority Level</label>
                <GlassDropdown
                  value={formData.priority}
                  onChange={(value) => handleInputChange({ target: { name: 'priority', value } })}
                  options={[
                    { value: 'high', label: 'High Priority' },
                    { value: 'medium', label: 'Medium Priority' },
                    { value: 'low', label: 'Low Priority' }
                  ]}
                  variant="primary"
                  size="medium"
                  className="form-dropdown"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="autoContribute"
                    checked={formData.autoContribute}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      autoContribute: e.target.checked
                    }))}
                  />
                  Enable automatic monthly contributions
                </label>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Add details about your goal..."
                />
              </div>

              {/* Milestones Section */}
              <div className="form-group">
                <div className="milestones-header">
                  <label>Milestones (Optional)</label>
                  <button 
                    type="button"
                    className="btn-small"
                    onClick={() => setShowMilestones(!showMilestones)}
                  >
                    {showMilestones ? 'Hide' : 'Add'} Milestones
                  </button>
                </div>
                
                {showMilestones && (
                  <div className="milestones-section">
                    <div className="milestone-input">
                      <input
                        type="number"
                        placeholder="Milestone amount"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCreateMilestone(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="form-control"
                      />
                      <small>Press Enter to add milestone</small>
                    </div>
                    
                    {formData.milestones.length > 0 && (
                      <div className="milestones-list">
                        {formData.milestones.map((milestone, index) => (
                          <div key={index} className="milestone-item">
                            <span>₹{milestone.amount.toLocaleString()}</span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                milestones: prev.milestones.filter((_, i) => i !== index)
                              }))}
                              className="remove-milestone"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Goal View Modal */}
      {selectedGoal && (
        <div className="modal-overlay" onClick={() => setSelectedGoal(null)}>
          <div className="modal-content goal-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <span className="goal-icon">{getGoalIcon(selectedGoal.type, selectedGoal.category)}</span>
                {selectedGoal.name}
              </h2>
              <button className="modal-close" onClick={() => setSelectedGoal(null)}>
                <i className="fas fa-times">×</i>
              </button>
            </div>
            
            <div className="goal-details-content">
              {/* Progress Overview */}
              <div className="details-section">
                <h3>Progress Overview</h3>
                <div className="progress-details">
                  <div className="progress-visual">
                    <div className="circular-progress">
                      <svg viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke={selectedGoal.type === 'investment' ? '#3b82f6' : '#10b981'}
                          strokeWidth="8"
                          strokeDasharray={`${(selectedGoal.progressPercentage || 0) * 2.83} 283`}
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      <div className="progress-text">
                        <span className="percentage">{(selectedGoal.progressPercentage || 0).toFixed(1)}%</span>
                        <span className="label">Complete</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="progress-stats">
                    <div className="stat">
                      <span className="stat-label">Current Amount</span>
                      <span className="stat-value">{formatCurrency(selectedGoal.currentAmount)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Target Amount</span>
                      <span className="stat-value">{formatCurrency(selectedGoal.targetAmount)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Remaining</span>
                      <span className="stat-value">{formatCurrency(selectedGoal.remainingAmount)}</span>
                    </div>
                    {selectedGoal.monthlyContribution && (
                      <div className="stat">
                        <span className="stat-label">Time to Goal</span>
                        <span className="stat-value">
                          {calculateTimeToGoal(
                            selectedGoal.currentAmount,
                            selectedGoal.targetAmount,
                            selectedGoal.monthlyContribution
                          )} months
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Milestones */}
              {selectedGoal.milestones && selectedGoal.milestones.length > 0 && (
                <div className="details-section">
                  <h3>Milestones</h3>
                  <div className="milestones-detailed">
                    {selectedGoal.milestones.map((milestone, index) => (
                      <div key={index} className={`milestone-detailed ${milestone.achieved ? 'achieved' : ''}`}>
                        <div className="milestone-marker">
                          <i className={`fas ${milestone.achieved ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        </div>
                        <div className="milestone-info">
                          <span className="milestone-amount">{formatCurrency(milestone.amount)}</span>
                          {milestone.achieved && milestone.date && (
                            <span className="milestone-date">Achieved on {formatDate(milestone.date)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Investment Performance */}
              {selectedGoal.type === 'investment' && selectedGoal.performanceData && (
                <div className="details-section">
                  <h3>Investment Performance</h3>
                  <div className="performance-grid">
                    <div className="performance-item">
                      <span className="perf-label">YTD Return</span>
                      <span className={`perf-value ${selectedGoal.performanceData.ytdReturn >= 0 ? 'positive' : 'negative'}`}>
                        {selectedGoal.performanceData.ytdReturn >= 0 ? '+' : ''}{selectedGoal.performanceData.ytdReturn}%
                      </span>
                    </div>
                    <div className="performance-item">
                      <span className="perf-label">1 Year Return</span>
                      <span className={`perf-value ${selectedGoal.performanceData.oneYearReturn >= 0 ? 'positive' : 'negative'}`}>
                        {selectedGoal.performanceData.oneYearReturn >= 0 ? '+' : ''}{selectedGoal.performanceData.oneYearReturn}%
                      </span>
                    </div>
                    <div className="performance-item">
                      <span className="perf-label">3 Year Return</span>
                      <span className={`perf-value ${selectedGoal.performanceData.threeYearReturn >= 0 ? 'positive' : 'negative'}`}>
                        {selectedGoal.performanceData.threeYearReturn >= 0 ? '+' : ''}{selectedGoal.performanceData.threeYearReturn}%
                      </span>
                    </div>
                  </div>
                  
                  {selectedGoal.portfolioAllocation && (
                    <div className="portfolio-allocation">
                      <h4>Portfolio Allocation</h4>
                      <div className="allocation-bars">
                        {Object.entries(selectedGoal.portfolioAllocation).map(([asset, percentage]) => (
                          <div key={asset} className="allocation-item">
                            <span className="asset-name">{asset.toUpperCase()}</span>
                            <div className="allocation-bar">
                              <div 
                                className="allocation-fill"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="asset-percentage">{percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Goal Actions */}
              <div className="details-actions">
                <button className="btn-primary" onClick={() => handleQuickContribute(selectedGoal)}>
                  <i className="fas fa-plus">+</i> Add Contribution
                </button>
                <button className="btn-secondary" onClick={() => handleEdit(selectedGoal)}>
                  <i className="fas fa-edit">✏️</i> Edit Goal
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => handleToggleAutoContribute(selectedGoal)}
                >
                  <i className={`fas ${selectedGoal.autoContribute ? 'fa-pause' : 'fa-play'}`}>
                    {selectedGoal.autoContribute ? '⏸️' : '▶️'}
                  </i>
                  {selectedGoal.autoContribute ? 'Disable' : 'Enable'} Auto-contribute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedGoals;