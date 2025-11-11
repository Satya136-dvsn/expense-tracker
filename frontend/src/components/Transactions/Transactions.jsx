import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../hooks/useAlert';
import { apiService } from '../../services/api';
import DataMismatchExplainer from '../Common/DataMismatchExplainer';
import GlassCard from '../Glass/GlassCard';
import GlassButton from '../Glass/GlassButton';
import GlassInput from '../Glass/GlassInput';
import GlassDropdown from '../Glass/GlassDropdown';
import GlassModal from '../Glass/GlassModal';
import './Transactions.css';

const Transactions = () => {
  const navigate = useNavigate();
  const { user, loadUserProfile } = useAuth();
  const { showAlert } = useAlert();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Filter states
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [dataMismatchDismissed, setDataMismatchDismissed] = useState(false);

  // Form state
  const [transactionForm, setTransactionForm] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'EXPENSE',
    category: '',
    transactionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, filterType, filterCategory, searchQuery, sortBy]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUserTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      showAlert('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const [expenseCategories, incomeCategories] = await Promise.all([
        apiService.getExpenseCategories(),
        apiService.getIncomeCategories()
      ]);
      
      // Add type property to each category
      const expenseCatsWithType = expenseCategories.map(cat => ({ ...cat, type: 'EXPENSE' }));
      const incomeCatsWithType = incomeCategories.map(cat => ({ ...cat, type: 'INCOME' }));
      
      setCategories([...expenseCatsWithType, ...incomeCatsWithType]);
    } catch (error) {
      console.error('Failed to load categories:', error);
      showAlert('Failed to load categories', 'error');
    }
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc':
          return new Date(b.transactionDate) - new Date(a.transactionDate);
        case 'date-asc':
          return new Date(a.transactionDate) - new Date(b.transactionDate);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleInputChange = (e) => {
    setTransactionForm({
      ...transactionForm,
      [e.target.name]: e.target.value
    });
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setTransactionForm({
      title: '',
      description: '',
      amount: '',
      type: 'EXPENSE', // Always default to EXPENSE for add
      category: '',
      transactionDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionForm({
      title: transaction.title,
      description: transaction.description || '',
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      transactionDate: new Date(transaction.transactionDate).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!transactionForm.title || !transactionForm.amount || !transactionForm.category) {
      showAlert('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        ...transactionForm,
        amount: parseFloat(transactionForm.amount),
        transactionDate: new Date(transactionForm.transactionDate).toISOString()
      };
      // Submitting transaction data

      if (editingTransaction) {
        await apiService.updateTransaction(editingTransaction.id, transactionData);
        showAlert('Transaction updated successfully!', 'success');
      } else {
        await apiService.createTransaction(transactionData);
        showAlert('Transaction added successfully!', 'success');
      }

      setShowModal(false);
      loadTransactions();
      loadUserProfile(); // Sync user profile with updated transactions
    } catch (error) {
      console.error('Error saving transaction:', error);
      showAlert(`Failed to save transaction: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setLoading(true);
    try {
      await apiService.deleteTransaction(id);
      showAlert('Transaction deleted successfully!', 'success');
      loadTransactions();
      loadUserProfile(); // Sync user profile with updated transactions
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showAlert('Failed to delete transaction', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return '₹' + new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Fallback categories if API returns none
  const fallbackCategories = [
    { id: 'fc1', name: 'Food & Dining', type: 'EXPENSE' },
    { id: 'fc2', name: 'Transportation', type: 'EXPENSE' },
    { id: 'fc3', name: 'Shopping', type: 'EXPENSE' },
    { id: 'fc4', name: 'Entertainment', type: 'EXPENSE' },
    { id: 'fc5', name: 'Bills & Utilities', type: 'EXPENSE' },
    { id: 'fc6', name: 'Healthcare', type: 'EXPENSE' },
    { id: 'fc7', name: 'Education', type: 'EXPENSE' },
    { id: 'fc8', name: 'Other', type: 'EXPENSE' }
  ];

  const getCategoryOptions = () => {
    const filtered = categories.filter(cat => cat.type === transactionForm.type);
    if (filtered.length > 0) return filtered;
    
    // Fallback categories based on transaction type
    if (transactionForm.type === 'EXPENSE') {
      return fallbackCategories;
    } else if (transactionForm.type === 'INCOME') {
      return [
        { id: 'ic1', name: 'Salary', type: 'INCOME' },
        { id: 'ic2', name: 'Freelance', type: 'INCOME' },
        { id: 'ic3', name: 'Business', type: 'INCOME' },
        { id: 'ic4', name: 'Investment', type: 'INCOME' },
        { id: 'ic5', name: 'Rental', type: 'INCOME' },
        { id: 'ic6', name: 'Gift', type: 'INCOME' },
        { id: 'ic7', name: 'Other Income', type: 'INCOME' }
      ];
    }
    return [];
  };

  // Calculate totals from ALL transactions (not filtered)
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      return sum + (amount || 0);
    }, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
      return sum + (amount || 0);
    }, 0);

  // Calculate filtered totals for display context
  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const filteredExpenses = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  if (!user) {
    return (
      <div className="transactions-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
            ←
          </button>
          <div className="header-content">
            <h1>💳 Transaction Management</h1>
            <p>Track and manage all your income and expenses</p>
          </div>
        </div>
        <button className="add-transaction-btn" onClick={openAddModal}>
          ➕ Add Transaction
        </button>
      </div>

      {/* Data Mismatch Explainer */}
      {user && !dataMismatchDismissed && (
        (Math.abs(totalIncome - (user.monthlyIncome || 0)) > 100 || 
         Math.abs(totalExpenses - (user.targetExpenses || 0)) > 100) && (
          <DataMismatchExplainer
            onUpdateProfile={() => navigate('/profile')}
            onAddTransactions={() => setShowModal(true)}
            onDismiss={() => setDataMismatchDismissed(true)}
          />
        )
      )}

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">📥</div>
          <div className="card-content">
            <div className="card-label">Transaction Income</div>
            <div className="card-value">{formatCurrency(totalIncome)}</div>
            {user && user.monthlyIncome && (
              <div className="card-note">Profile: {formatCurrency(user.monthlyIncome)}</div>
            )}
            {(filterType !== 'ALL' || filterCategory || searchQuery) && (
              <div className="card-note">Filtered: {formatCurrency(filteredIncome)}</div>
            )}
          </div>
        </div>
        <div className="summary-card expense">
          <div className="card-icon">📤</div>
          <div className="card-content">
            <div className="card-label">Transaction Expenses</div>
            <div className="card-value">{formatCurrency(totalExpenses)}</div>
            {user && user.targetExpenses && (
              <div className="card-note">Target: {formatCurrency(user.targetExpenses)}</div>
            )}
            {(filterType !== 'ALL' || filterCategory || searchQuery) && (
              <div className="card-note">Filtered: {formatCurrency(filteredExpenses)}</div>
            )}
          </div>
        </div>
        <div className="summary-card balance">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-label">Net Balance</div>
            <div className="card-value">{formatCurrency(totalIncome - totalExpenses)}</div>
            {(filterType !== 'ALL' || filterCategory || searchQuery) && (
              <div className="card-note">Filtered: {formatCurrency(filteredIncome - filteredExpenses)}</div>
            )}
          </div>
        </div>
        <div className="summary-card count">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <div className="card-label">Transactions</div>
            <div className="card-value">{filteredTransactions.length}</div>
            {(filterType !== 'ALL' || filterCategory || searchQuery) && (
              <div className="card-note">Total: {transactions.length}</div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Type</label>
          <GlassDropdown
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'INCOME', label: 'Income' },
              { value: 'EXPENSE', label: 'Expense' }
            ]}
            variant="primary"
            size="small"
            className="filter-dropdown"
          />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <GlassDropdown
            value={filterCategory}
            onChange={setFilterCategory}
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(cat => ({ value: cat.name, label: cat.name }))
            ]}
            variant="primary"
            size="small"
            searchable={true}
            clearable={true}
            className="filter-dropdown"
          />
        </div>
        <div className="filter-group">
          <label>Sort By</label>
          <GlassDropdown
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'date-desc', label: 'Date (Newest)' },
              { value: 'date-asc', label: 'Date (Oldest)' },
              { value: 'amount-desc', label: 'Amount (High to Low)' },
              { value: 'amount-asc', label: 'Amount (Low to High)' }
            ]}
            variant="primary"
            size="small"
            className="filter-dropdown"
          />
        </div>
        <div className="filter-group search-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    {new Date(transaction.transactionDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="transaction-title-cell">
                      <strong>{transaction.title}</strong>
                      {transaction.description && (
                        <div className="transaction-description">{transaction.description}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{transaction.category}</span>
                  </td>
                  <td>
                    <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={`amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'EXPENSE' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(transaction)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(transaction.id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-transactions">
            <span className="empty-icon">📊</span>
            <h3>No transactions found</h3>
            <p>
              {transactions.length === 0 
                ? "Start by adding your first transaction to track your finances" 
                : "Try adjusting your filters to see more transactions"
              }
            </p>
            <div className="no-transactions-actions">
              <button className="add-transaction-btn" onClick={openAddModal}>
                ➕ Add Transaction
              </button>
              {totalIncome === 0 && transactions.length > 0 && (
                <button 
                  className="add-income-btn" 
                  onClick={() => {
                    setTransactionForm({
                      title: '',
                      description: '',
                      amount: '',
                      type: 'INCOME',
                      category: '',
                      transactionDate: new Date().toISOString().split('T')[0]
                    });
                    setShowModal(true);
                  }}
                >
                  💰 Add Income
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content transaction-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)} title="Close">
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <GlassDropdown
                    value={transactionForm.type}
                    onChange={(value) => handleInputChange({ target: { name: 'type', value } })}
                    options={[
                      { value: 'EXPENSE', label: 'Expense' },
                      { value: 'INCOME', label: 'Income' }
                    ]}
                    variant="primary"
                    size="medium"
                    className="form-dropdown"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Amount (₹) *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={transactionForm.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={transactionForm.title}
                  onChange={handleInputChange}
                  placeholder="Transaction title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <GlassDropdown
                  value={transactionForm.category}
                  onChange={(value) => handleInputChange({ target: { name: 'category', value } })}
                  options={[
                    { value: '', label: 'Select a category' },
                    ...getCategoryOptions().map(cat => ({ value: cat.name, label: cat.name }))
                  ]}
                  variant="primary"
                  size="medium"
                  searchable={true}
                  className="form-dropdown"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={transactionForm.description}
                  onChange={handleInputChange}
                  placeholder="Additional details..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="transactionDate">Date *</label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  value={transactionForm.transactionDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
