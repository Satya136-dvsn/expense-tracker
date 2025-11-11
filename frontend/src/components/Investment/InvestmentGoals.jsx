import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './InvestmentGoals.css';

const InvestmentGoals = () => {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    riskTolerance: 'moderate',
    category: 'retirement'
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      // Mock goals data
      const mockGoals = [
        {
          id: 1,
          name: 'Retirement Fund',
          targetAmount: 1000000,
          currentAmount: 125000,
          targetDate: '2045-12-31',
          riskTolerance: 'moderate',
          category: 'retirement',
          monthlyContribution: 1200,
          projectedReturn: 7.5,
          onTrack: true
        },
        {
          id: 2,
          name: 'House Down Payment',
          targetAmount: 80000,
          currentAmount: 25000,
          targetDate: '2026-06-01',
          riskTolerance: 'conservative',
          category: 'major_purchase',
          monthlyContribution: 1500,
          projectedReturn: 4.2,
          onTrack: true
        },
        {
          id: 3,
          name: 'Kids College Fund',
          targetAmount: 200000,
          currentAmount: 15000,
          targetDate: '2035-08-15',
          riskTolerance: 'aggressive',
          category: 'education',
          monthlyContribution: 800,
          projectedReturn: 9.1,
          onTrack: false
        },
        {
          id: 4,
          name: 'Dream Vacation',
          targetAmount: 15000,
          currentAmount: 3500,
          targetDate: '2025-07-01',
          riskTolerance: 'conservative',
          category: 'lifestyle',
          monthlyContribution: 600,
          projectedReturn: 3.8,
          onTrack: true
        }
      ];

      setGoals(mockGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthsRemaining = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target - now;
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(diffMonths, 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'conservative': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'aggressive': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'retirement': return '🏖️';
      case 'major_purchase': return '🏠';
      case 'education': return '🎓';
      case 'lifestyle': return '✈️';
      case 'emergency': return '🛡️';
      default: return '🎯';
    }
  };

  const handleAddGoal = () => {
    const goal = {
      id: goals.length + 1,
      ...newGoal,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      monthlyContribution: 0,
      projectedReturn: 7.0,
      onTrack: true
    };

    setGoals([...goals, goal]);
    setNewGoal({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      riskTolerance: 'moderate',
      category: 'retirement'
    });
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <div className="investment-goals">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading investment goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-goals">
      <div className="goals-header">
        <h2>🎯 Investment Goals</h2>
        <p>Track and manage your investment objectives</p>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="add-goal-btn"
        >
          + Add New Goal
        </Button>
      </div>

      {/* Goals Overview */}
      <div className="goals-overview">
        <Card>
          <CardHeader>
            <CardTitle>Goals Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overview-stats">
              <div className="stat-item">
                <span className="stat-number">{goals.length}</span>
                <span className="stat-label">Total Goals</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                </span>
                <span className="stat-label">Target Amount</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {formatCurrency(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
                </span>
                <span className="stat-label">Current Amount</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {goals.filter(goal => goal.onTrack).length}
                </span>
                <span className="stat-label">On Track</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="goals-list">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const monthsRemaining = calculateMonthsRemaining(goal.targetDate);
          
          return (
            <Card key={goal.id} className="goal-card">
              <CardHeader>
                <CardTitle className="goal-title">
                  <span className="goal-icon">{getCategoryIcon(goal.category)}</span>
                  {goal.name}
                  <span className={`status-badge ${goal.onTrack ? 'on-track' : 'behind'}`}>
                    {goal.onTrack ? '✅ On Track' : '⚠️ Behind'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="goal-progress">
                  <div className="progress-header">
                    <span className="current-amount">{formatCurrency(goal.currentAmount)}</span>
                    <span className="target-amount">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {progress.toFixed(1)}% Complete
                  </div>
                </div>

                <div className="goal-details">
                  <div className="detail-row">
                    <span className="label">Target Date:</span>
                    <span className="value">{new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Months Remaining:</span>
                    <span className="value">{monthsRemaining} months</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Monthly Contribution:</span>
                    <span className="value">{formatCurrency(goal.monthlyContribution)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Risk Tolerance:</span>
                    <span 
                      className="value risk-badge"
                      style={{ backgroundColor: getRiskColor(goal.riskTolerance) }}
                    >
                      {goal.riskTolerance}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Projected Return:</span>
                    <span className="value">{goal.projectedReturn}% annually</span>
                  </div>
                </div>

                <div className="goal-actions">
                  <Button className="action-btn primary">Update Goal</Button>
                  <Button className="action-btn secondary">View Strategy</Button>
                  <Button className="action-btn secondary">Add Funds</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Investment Goal</h3>
              <Button 
                onClick={() => setShowAddModal(false)}
                className="close-btn"
              >
                ✕
              </Button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  placeholder="e.g., Retirement Fund"
                />
              </div>
              <div className="form-group">
                <label>Target Amount</label>
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})}
                  placeholder="100000"
                />
              </div>
              <div className="form-group">
                <label>Current Amount</label>
                <input
                  type="number"
                  value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({...newGoal, currentAmount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="retirement">Retirement</option>
                  <option value="major_purchase">Major Purchase</option>
                  <option value="education">Education</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="emergency">Emergency Fund</option>
                </select>
              </div>
              <div className="form-group">
                <label>Risk Tolerance</label>
                <select
                  value={newGoal.riskTolerance}
                  onChange={(e) => setNewGoal({...newGoal, riskTolerance: e.target.value})}
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button onClick={() => setShowAddModal(false)} className="cancel-btn">
                Cancel
              </Button>
              <Button onClick={handleAddGoal} className="save-btn">
                Add Goal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentGoals;