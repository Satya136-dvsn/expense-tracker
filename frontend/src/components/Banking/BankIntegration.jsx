import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './BankIntegration.css';

const BankIntegration = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
    fetchTotalBalance();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bank-integration/accounts');
      setAccounts(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalBalance = async () => {
    try {
      const response = await api.get('/bank-integration/accounts/total-balance');
      setTotalBalance(response.data.totalBalance);
    } catch (error) {
      console.error('Error fetching total balance:', error);
    }
  };

  const handleSyncAccount = async (accountId) => {
    try {
      setSyncing(true);
      await api.post(`/bank-integration/accounts/${accountId}/sync`);
      await fetchBankAccounts();
      await fetchTotalBalance();
      setError('');
    } catch (error) {
      console.error('Error syncing account:', error);
      setError('Failed to sync account');
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      await api.post('/bank-integration/accounts/sync-all');
      await fetchBankAccounts();
      await fetchTotalBalance();
      setError('');
    } catch (error) {
      console.error('Error syncing all accounts:', error);
      setError('Failed to sync accounts');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      await api.delete(`/bank-integration/accounts/${accountId}`);
      await fetchBankAccounts();
      await fetchTotalBalance();
      setError('');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setError('Failed to disconnect account');
    }
  };

  const formatCurrency = (amount, currencyCode = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      CHECKING: '🏦',
      SAVINGS: '💰',
      CREDIT_CARD: '💳',
      INVESTMENT: '📈',
      LOAN: '🏠',
      MORTGAGE: '🏡',
      OTHER: '📋'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: '#10b981',
      INACTIVE: '#6b7280',
      ERROR: '#ef4444',
      REQUIRES_UPDATE: '#f59e0b',
      DISCONNECTED: '#9ca3af'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="bank-integration">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bank accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bank-integration">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Bank Integration</h1>
          <p>Connect and manage your bank accounts for automatic transaction import</p>
        </div>
        <div className="dashboard-header-actions">
          <button
            onClick={handleSyncAll}
            disabled={syncing || accounts.length === 0}
            className="sync-all-button"
          >
            {syncing ? '⟳' : '🔄'} Sync All
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="add-account-button"
          >
            + Add Account
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError('')} className="dismiss-error">×</button>
        </div>
      )}

      <div className="total-balance-card">
        <h2>Total Balance</h2>
        <div className="balance-amount">
          {formatCurrency(totalBalance)}
        </div>
        <p className="balance-subtitle">Across {accounts.length} connected accounts</p>
      </div>

      <div className="accounts-section">
        <h2>Connected Accounts</h2>
        
        {accounts.length === 0 ? (
          <div className="no-accounts">
            <div className="no-accounts-icon">🏦</div>
            <h3>No Bank Accounts Connected</h3>
            <p>Connect your bank accounts to automatically import transactions and track balances.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="add-first-account-button"
            >
              Connect Your First Account
            </button>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map(account => (
              <div key={account.id} className="account-card">
                <div className="account-header">
                  <div className="account-info">
                    <span className="account-icon">
                      {getAccountTypeIcon(account.accountType)}
                    </span>
                    <div className="account-details">
                      <h3>{account.accountName}</h3>
                      <p>{account.bankName}</p>
                      <p className="account-number">{account.maskedAccountNumber}</p>
                    </div>
                  </div>
                  <div 
                    className="connection-status"
                    style={{ color: getStatusColor(account.connectionStatus) }}
                  >
                    ● {account.connectionStatus}
                  </div>
                </div>

                <div className="account-balance">
                  <div className="balance-info">
                    <span className="balance-label">Current Balance</span>
                    <span className="balance-value">
                      {formatCurrency(account.currentBalance, account.currencyCode)}
                    </span>
                  </div>
                  {account.availableBalance !== account.currentBalance && (
                    <div className="balance-info">
                      <span className="balance-label">Available Balance</span>
                      <span className="balance-value">
                        {formatCurrency(account.availableBalance, account.currencyCode)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="account-meta">
                  <span className="last-sync">
                    Last sync: {account.lastSyncAt ? 
                      new Date(account.lastSyncAt).toLocaleString() : 
                      'Never'
                    }
                  </span>
                </div>

                <div className="account-actions">
                  <button
                    onClick={() => handleSyncAccount(account.id)}
                    disabled={syncing}
                    className="sync-button"
                  >
                    {syncing ? '⟳' : '🔄'} Sync
                  </button>
                  <button
                    onClick={() => handleDisconnectAccount(account.id)}
                    className="disconnect-button"
                  >
                    🔌 Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <AddAccountModal
          onClose={() => setShowAddForm(false)}
          onAccountAdded={() => {
            setShowAddForm(false);
            fetchBankAccounts();
            fetchTotalBalance();
          }}
        />
      )}
    </div>
  );
};

const AddAccountModal = ({ onClose, onAccountAdded }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    accountType: 'CHECKING',
    currentBalance: '',
    currencyCode: 'INR'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const requestData = {
        ...formData,
        currentBalance: formData.currentBalance ? parseFloat(formData.currentBalance) : 0,
        availableBalance: formData.currentBalance ? parseFloat(formData.currentBalance) : 0
      };

      await api.post('/bank-integration/accounts', requestData);
      onAccountAdded();
    } catch (error) {
      console.error('Error adding account:', error);
      setError('Failed to add account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add Bank Account</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-account-form">
          <div className="form-group">
            <label htmlFor="accountName">Account Name</label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              placeholder="My Checking Account"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bankName">Bank Name</label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              placeholder="Chase Bank"
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="1234567890"
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountType">Account Type</label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              required
            >
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="INVESTMENT">Investment</option>
              <option value="LOAN">Loan</option>
              <option value="MORTGAGE">Mortgage</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="currentBalance">Current Balance</label>
            <input
              type="number"
              id="currentBalance"
              name="currentBalance"
              value={formData.currentBalance}
              onChange={handleChange}
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currencyCode">Currency</label>
            <select
              id="currencyCode"
              name="currencyCode"
              value={formData.currencyCode}
              onChange={handleChange}
            >
              <option value="INR">INR - Indian Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankIntegration;