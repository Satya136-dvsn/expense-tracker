import React from 'react';

const IncomeSyncHelper = ({ totalIncome, onAddIncome }) => {
  if (totalIncome > 0) return null;

  return (
    <div className="income-sync-explanation">
      <div className="icon">💡</div>
      <div className="content">
        <h4>Income Not Synced Yet</h4>
        <p>
          Your dashboard shows budgeted income (₹30,000), but your actual income from transactions is ₹0. 
          Add income transactions (salary, freelance, etc.) to sync your real financial data across the entire app.
        </p>
        <button 
          onClick={onAddIncome}
          style={{
            marginTop: '0.75rem',
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          💰 Add Income Transaction
        </button>
      </div>
    </div>
  );
};

export default IncomeSyncHelper;