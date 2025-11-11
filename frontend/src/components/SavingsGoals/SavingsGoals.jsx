import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import { formatCurrency } from '../../utils/currencyFormatter';
import SavingsProgressChart from '../Analytics/SavingsProgressChart';
import './SavingsGoals.css';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: ''
  });
  
  const { showAlert } = useAlert();

  useEffect(() => {
    fetchGoals();
  }, [filter]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      let data;
      if (filter === 'all') {
        data = await apiService.getAllSavingsGoals();
      } else if (filter === 'active') {
        data = await apiService.getActiveSavingsGoals();
      } else {
        data = await apiService.getSavingsGoalsByStatus(filter);
      }
      setGoals(data);
    } catch (error) {
      showAlert('Failed to load savings goals: ' + error.message, 'error');
    } finally {
      setLoading(false);
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
        await apiService.updateSavingsGoal(editingGoal.id, formData);
        showAlert('Savings goal updated successfully!', 'success');
      } else {
        await apiService.createSavingsGoal(formData);
        showAlert('Savings goal created successfully!', 'success');
      }
      
      setShowModal(false);
      setEditingGoal(null);
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: ''
      });
      fetchGoals();
    } catch (error) {
      showAlert('Failed to save savings goal: ' + error.message, 'error');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) {
      return;
    }
    
    try {
      await apiService.deleteSavingsGoal(id);
      showAlert('Savings goal deleted successfully!', 'success');
      fetchGoals();
    } catch (error) {
      showAlert('Failed to delete savings goal: ' + error.message, 'error');
    }
  };

  const handleAddFunds = async (goal) => {
    const amount = prompt('Enter amount to add:');
    if (!amount || isNaN(amount)) return;
    
    try {
      // Update the savings goal progress
      await apiService.updateSavingsGoalProgress(goal.id, parseFloat(amount));
      
      // Create a transaction entry for this contribution
      const transactionData = {
        title: `Savings Goal: ${goal.name}`,
        description: `Contribution to ${goal.name} savings goal`,
        amount: parseFloat(amount),
        type: 'EXPENSE',
        category: 'Savings Goals',
        transactionDate: new Date().toISOString().split('T')[0]
      };
      
      try {
        await apiService.createTransaction(transactionData);
        // Transaction created successfully for savings goal contribution
      } catch (transactionError) {
        // Failed to create transaction entry - creating fallback
        const existingTransactions = JSON.parse(localStorage.getItem('fallbackTransactions') || '[]');
        const newTransaction = {
          ...transactionData,
          id: Date.now(),
          createdAt: new Date().toISOString()
        };
        existingTransactions.push(newTransaction);
        localStorage.setItem('fallbackTransactions', JSON.stringify(existingTransactions));
        // Created fallback transaction entry for display
      }
      
      showAlert('Funds added successfully!', 'success');
      fetchGoals();
    } catch (error) {
      showAlert('Failed to add funds: ' + error.message, 'error');
    }
  };

  const handleWithdrawFunds = async (goal) => {
    const amount = prompt('Enter amount to withdraw:');
    if (!amount || isNaN(amount)) return;
    
    try {
      // Update the savings goal progress
      await apiService.updateSavingsGoalProgress(goal.id, -parseFloat(amount));
      
      // Create a transaction entry for this withdrawal
      const transactionData = {
        title: `Savings Goal Withdrawal: ${goal.name}`,
        description: `Withdrawal from ${goal.name} savings goal`,
        amount: parseFloat(amount),
        type: 'INCOME',
        category: 'Savings Goals',
        transactionDate: new Date().toISOString().split('T')[0]
      };
      
      try {
        await apiService.createTransaction(transactionData);
        // Transaction created successfully for savings goal withdrawal
      } catch (transactionError) {
        // Failed to create transaction entry - creating fallback
        const existingTransactions = JSON.parse(localStorage.getItem('fallbackTransactions') || '[]');
        const newTransaction = {
          ...transactionData,
          id: Date.now() + 1, // Ensure unique ID
          createdAt: new Date().toISOString()
        };
        existingTransactions.push(newTransaction);
        localStorage.setItem('fallbackTransactions', JSON.stringify(existingTransactions));
        // Created fallback transaction entry for display
      }
      
      showAlert('Funds withdrawn successfully!', 'success');
      fetchGoals();
    } catch (error) {
      showAlert('Failed to withdraw funds: ' + error.message, 'error');
    }
  };

  const handleCompleteGoal = async (id) => {
    try {
      await apiService.completeSavingsGoal(id);
      showAlert('Goal marked as completed!', 'success');
      fetchGoals();
    } catch (error) {
      showAlert('Failed to complete goal: ' + error.message, 'error');
    }
  };

  const handleReopenGoal = async (id) => {
    try {
      await apiService.reopenSavingsGoal(id);
      showAlert('Goal reopened!', 'success');
      fetchGoals();
    } catch (error) {
      showAlert('Failed to reopen goal: ' + error.message, 'error');
    }
  };

  const openNewGoalModal = () => {
    setEditingGoal(null);
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      targetDate: ''
    });
    setShowModal(true);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'COMPLETED': return 'status-completed';
      case 'IN_PROGRESS': return 'status-active';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getDaysRemainingText = (daysRemaining) => {
    if (daysRemaining === null) return '';
    if (daysRemaining < 0) return `${Math.abs(daysRemaining)} days overdue`;
    if (daysRemaining === 0) return 'Due today';
    if (daysRemaining === 1) return '1 day left';
    return `${daysRemaining} days left`;
  };

  const calculateTotalTarget = () => {
    return goals
      .filter(g => g.status === 'IN_PROGRESS')
      .reduce((sum, g) => sum + parseFloat(g.targetAmount || 0), 0);
  };

  const calculateTotalSaved = () => {
    return goals
      .filter(g => g.status === 'IN_PROGRESS')
      .reduce((sum, g) => sum + parseFloat(g.currentAmount || 0), 0);
  };

  return (
    <div className="savings-goals-container">
      <div className="goals-content">
        <div className="goals-header">
          <div>
            <h1>Savings Goals</h1>
            <p>Track your progress towards financial milestones</p>
          </div>
          <button className="btn-primary" onClick={openNewGoalModal}>
            <i className="fas fa-plus"></i> New Goal
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Goals
        </button>
        <button 
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button 
          className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      {/* Summary Cards - only show for active goals */}
      {filter === 'active' && (
        <div className="goals-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <div className="summary-info">
              <h3>{formatCurrency(calculateTotalTarget())}</h3>
              <p>Total Target</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-coins"></i>
            </div>
            <div className="summary-info">
              <h3>{formatCurrency(calculateTotalSaved())}</h3>
              <p>Total Saved</p>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="summary-info">
              <h3>
                {calculateTotalTarget() > 0 
                  ? ((calculateTotalSaved() / calculateTotalTarget()) * 100).toFixed(1) 
                  : 0}%
              </h3>
              <p>Overall Progress</p>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <div className="loading">Loading savings goals...</div>
      ) : goals.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-piggy-bank"></i>
          <h3>No savings goals yet</h3>
          <p>Create your first goal to start saving for what matters</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map(goal => (
            <div key={goal.id} className={`goal-card ${goal.status.toLowerCase()}`}>
              <div className="goal-header">
                <div className="goal-title">
                  <h3>{goal.name}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="goal-actions">
                  {goal.status === 'IN_PROGRESS' && (
                    <>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleAddFunds(goal)}
                        title="Add Funds"
                      >
                        <i className="fas fa-plus-circle"></i>
                        <span>Add</span>
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleWithdrawFunds(goal)}
                        title="Withdraw"
                      >
                        <i className="fas fa-minus-circle"></i>
                        <span>Withdraw</span>
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleCompleteGoal(goal.id)}
                        title="Mark Complete"
                      >
                        <i className="fas fa-check-circle"></i>
                        <span>Complete</span>
                      </button>
                    </>
                  )}
                  {goal.status === 'COMPLETED' && (
                    <button 
                      className="btn-icon" 
                      onClick={() => handleReopenGoal(goal.id)}
                      title="Reopen Goal"
                    >
                      <i className="fas fa-redo"></i>
                      <span>Reopen</span>
                    </button>
                  )}
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEdit(goal)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit</span>
                  </button>
                  <button 
                    className="btn-icon delete" 
                    onClick={() => handleDelete(goal.id)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {goal.description && (
                <p className="goal-description">{goal.description}</p>
              )}

              <div className="goal-amounts">
                <div className="amount-row">
                  <span className="amount-label">Current</span>
                  <span className="amount-value">{formatCurrency(goal.currentAmount)}</span>
                </div>
                <div className="amount-row">
                  <span className="amount-label">Target</span>
                  <span className="amount-value">{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="amount-row">
                  <span className="amount-label">Remaining</span>
                  <span className="amount-value remaining">
                    {formatCurrency(goal.remainingAmount)}
                  </span>
                </div>
              </div>

              <div className="goal-progress">
                <div className="progress-header">
                  <span className="progress-text">
                    {goal.progressPercentage.toFixed(1)}% Complete
                  </span>
                  {goal.targetDate && (
                    <span className={`days-remaining ${goal.daysRemaining < 0 ? 'overdue' : ''}`}>
                      {getDaysRemainingText(goal.daysRemaining)}
                    </span>
                  )}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${Math.min(goal.progressPercentage, 100)}%`,
                      backgroundColor: goal.progressPercentage >= 100 ? '#27ae60' : 
                                     goal.progressPercentage >= 75 ? '#3498db' : 
                                     goal.progressPercentage >= 50 ? '#f39c12' : '#e74c3c'
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
            </div>
          ))}
        </div>
      )}

      {/* Savings Progress Chart */}
      {goals.length > 0 && (
        <div className="savings-chart-section">
          <div className="chart-header">
            <h2>Savings Goals Progress</h2>
            <p>Visual overview of your savings goals progress and timeline</p>
          </div>
          <div className="chart-container">
            <SavingsProgressChart 
              height="500px"
              className="savings-progress-chart"
            />
          </div>
        </div>
      )}

      {/* Modal for Create/Edit Goal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                  placeholder="e.g., Emergency Fund, New Car, Vacation"
                />
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
                  placeholder="How much do you want to save?"
                />
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
      </div>
    </div>
  );
};

export default SavingsGoals;
