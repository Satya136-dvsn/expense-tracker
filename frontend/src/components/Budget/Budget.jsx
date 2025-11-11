import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAlert } from '../../hooks/useAlert';
import { useAuth } from '../../contexts/AuthContext';
import BudgetVsActualChart from '../Analytics/BudgetVsActualChart';
import GlassCard from '../Glass/GlassCard';
import GlassButton from '../Glass/GlassButton';
import GlassInput from '../Glass/GlassInput';
import GlassDropdown from '../Glass/GlassDropdown';
import GlassModal from '../Glass/GlassModal';
import './Budget.css';

const Budget = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [formData, setFormData] = useState({
    category: '',
    budgetAmount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });
  
  const { showAlert } = useAlert();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const fetchCategories = async () => {
    try {
      const expenseCategories = await apiService.getExpenseCategories();
      setCategories(expenseCategories);
    } catch (error) {
      showAlert('Failed to load categories: ' + error.message, 'error');
    }
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const data = await apiService.getBudgetsForMonth(selectedMonth, selectedYear);
      setBudgets(data);
    } catch (error) {
      showAlert('Failed to load budgets: ' + error.message, 'error');
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
      if (editingBudget) {
        await apiService.updateBudget(editingBudget.id, formData);
        showAlert('Budget updated successfully!', 'success');
      } else {
        await apiService.createBudget(formData);
        showAlert('Budget created successfully!', 'success');
      }
      
      setShowModal(false);
      setEditingBudget(null);
      setFormData({
        category: '',
        budgetAmount: '',
        month: selectedMonth,
        year: selectedYear
      });
      fetchBudgets();
    } catch (error) {
      showAlert('Failed to save budget: ' + error.message, 'error');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      budgetAmount: budget.budgetAmount,
      month: budget.month,
      year: budget.year
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }
    
    try {
      await apiService.deleteBudget(id);
      showAlert('Budget deleted successfully!', 'success');
      fetchBudgets();
    } catch (error) {
      showAlert('Failed to delete budget: ' + error.message, 'error');
    }
  };

  const openNewBudgetModal = () => {
    setEditingBudget(null);
    setFormData({
      category: '',
      budgetAmount: '',
      month: selectedMonth,
      year: selectedYear
    });
    setShowModal(true);
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return '#e74c3c';
    if (percentage >= 80) return '#f39c12';
    return '#27ae60';
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + parseFloat(b.budgetAmount || 0), 0);
  };

  const calculateTotalSpent = () => {
    return budgets.reduce((sum, b) => sum + parseFloat(b.spentAmount || 0), 0);
  };

  return (
    <div className="budget-container">
      <div className="budget-content">
        <div className="budget-header">
          <div>
            <h1>Monthly Budgets</h1>
            <p>Track your spending limits by category</p>
          </div>
          <button className="btn-primary" onClick={openNewBudgetModal}>
            <i className="fas fa-plus"></i> New Budget
          </button>
        </div>

        {/* Month/Year Selector */}
        <div className="month-selector">
          <div className="selector-group">
            <label>Month</label>
            <GlassDropdown
              value={selectedMonth}
              onChange={(value) => setSelectedMonth(parseInt(value))}
              options={months.map((month, index) => ({ 
                value: index + 1, 
                label: month 
              }))}
              variant="primary"
              size="medium"
              className="month-dropdown"
            />
          </div>
          <div className="selector-group">
            <label>Year</label>
            <GlassDropdown
              value={selectedYear}
              onChange={(value) => setSelectedYear(parseInt(value))}
              options={[2024, 2025, 2026].map(year => ({ 
                value: year, 
                label: year.toString() 
              }))}
              variant="primary"
              size="medium"
              className="year-dropdown"
            />
          </div>
        </div>

      {/* Profile Integration Section */}
      {user && (
        <div className="profile-integration">
          <h3>📊 Profile Integration</h3>
          <div className="profile-budget-comparison">
            <div className="comparison-item">
              <label>Monthly Income (Profile):</label>
              <span className="profile-value">₹{user.monthlyIncome?.toLocaleString('en-IN') || '0'}</span>
            </div>
            <div className="comparison-item">
              <label>Target Expenses (Profile):</label>
              <span className="profile-value">₹{user.targetExpenses?.toLocaleString('en-IN') || '0'}</span>
            </div>
            <div className="comparison-item">
              <label>Total Budget (Current):</label>
              <span className="budget-value">₹{calculateTotalBudget().toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            {user.targetExpenses && calculateTotalBudget() !== user.targetExpenses && (
              <div className="budget-mismatch-warning">
                ⚠️ Your total budget (₹{calculateTotalBudget().toLocaleString('en-IN')}) doesn't match your profile target expenses (₹{user.targetExpenses.toLocaleString('en-IN')}). 
                Consider updating your profile or adjusting your budgets.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="budget-summary">
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-wallet"></i>
          </div>
          <div className="summary-info">
            <h3>₹{calculateTotalBudget().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Budget</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <div className="summary-info">
            <h3>₹{calculateTotalSpent().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Total Spent</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">
            <i className="fas fa-piggy-bank"></i>
          </div>
          <div className="summary-info">
            <h3>₹{(calculateTotalBudget() - calculateTotalSpent()).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Remaining</p>
          </div>
        </div>
      </div>

      {/* Budget List */}
      {loading ? (
        <div className="loading">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-chart-pie"></i>
          <h3>No budgets for {months[selectedMonth - 1]} {selectedYear}</h3>
          <p>Create your first budget to start tracking spending</p>
        </div>
      ) : (
        <div className="budgets-list">
          {budgets.map(budget => (
            <div key={budget.id} className="budget-card">
              <div className="budget-card-header">
                <div className="budget-category">
                  <i className="fas fa-tag"></i>
                  <h3>{budget.category}</h3>
                </div>
                <div className="budget-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEdit(budget)}
                    title="Edit"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleDelete(budget.id)}
                    title="Delete"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className="budget-amounts">
                <div className="amount-item">
                  <span className="amount-label">Budget</span>
                  <span className="amount-value">₹{budget.budgetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Spent</span>
                  <span className="amount-value spent">₹{budget.spentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="amount-item">
                  <span className="amount-label">Remaining</span>
                  <span className={`amount-value ${budget.remainingAmount < 0 ? 'over' : 'remaining'}`}>
                    ₹{budget.remainingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-info">
                  <span>{budget.progressPercentage.toFixed(1)}% used</span>
                  {budget.isOverBudget && (
                    <span className="over-budget-badge">
                      <i className="fas fa-exclamation-triangle"></i> Over Budget
                    </span>
                  )}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{
                      width: `${Math.min(budget.progressPercentage, 100)}%`,
                      backgroundColor: getProgressBarColor(budget.progressPercentage)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget vs Actual Chart */}
      {budgets.length > 0 && (
        <div className="budget-chart-section">
          <div className="chart-header">
            <h2>Budget vs Actual Analysis</h2>
            <p>Visual comparison of your budgeted amounts vs actual spending</p>
          </div>
          <div className="chart-container">
            <BudgetVsActualChart 
              month={selectedMonth}
              year={selectedYear}
              height="400px"
              className="budget-analysis-chart"
            />
          </div>
        </div>
      )}

      {/* Modal for Create/Edit Budget */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <GlassDropdown
                  value={formData.category}
                  onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                  options={[
                    { value: '', label: 'Select a category' },
                    ...categories.map(cat => ({ value: cat.name, label: cat.name }))
                  ]}
                  variant="primary"
                  size="medium"
                  searchable={true}
                  className="form-dropdown"
                />
              </div>

              <div className="form-group">
                <label>Budget Amount (₹)</label>
                <input
                  type="number"
                  name="budgetAmount"
                  value={formData.budgetAmount}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="form-control"
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Month</label>
                  <GlassDropdown
                    value={formData.month}
                    onChange={(value) => handleInputChange({ target: { name: 'month', value } })}
                    options={months.map((month, index) => ({ 
                      value: index + 1, 
                      label: month 
                    }))}
                    variant="primary"
                    size="medium"
                    className="form-dropdown"
                  />
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <GlassDropdown
                    value={formData.year}
                    onChange={(value) => handleInputChange({ target: { name: 'year', value } })}
                    options={[2024, 2025, 2026].map(year => ({ 
                      value: year, 
                      label: year.toString() 
                    }))}
                    variant="primary"
                    size="medium"
                    className="form-dropdown"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
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

export default Budget;
