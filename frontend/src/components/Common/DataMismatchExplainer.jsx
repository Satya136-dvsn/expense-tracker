import React, { useState } from 'react';

const DataMismatchExplainer = ({ onUpdateProfile, onAddTransactions, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '2px solid #f59e0b',
      borderRadius: '16px',
      padding: '1.5rem',
      margin: '1rem 0',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>⚠️</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ 
            color: '#92400e', 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            Data Mismatch Detected
          </h4>
          <p style={{ 
            color: '#a16207', 
            margin: '0 0 1rem 0', 
            fontSize: '0.9rem',
            lineHeight: '1.5'
          }}>
            Your transaction totals don't match your profile settings. This is normal when you first start using the app.
          </p>
          
          {!showDetails && (
            <button
              onClick={() => setShowDetails(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#92400e',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '0',
                marginBottom: '1rem'
              }}
            >
              Why is this happening? Click to learn more →
            </button>
          )}

          {showDetails && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              fontSize: '0.85rem',
              lineHeight: '1.5',
              color: '#a16207'
            }}>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                <strong>Profile Settings:</strong> Your monthly income (₹30,000) and target expenses (₹20,000) are budget/planning amounts you set in your profile.
              </p>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                <strong>Transaction Data:</strong> Your actual income (₹30,000) and expenses (₹1,000) come from real transactions you've added.
              </p>
              <p style={{ margin: '0' }}>
                <strong>The Solution:</strong> Add more transactions to reflect your actual financial activity, or update your profile to match your real spending patterns.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={onAddTransactions}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              💰 Add More Transactions
            </button>
            
            <button
              onClick={onUpdateProfile}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ⚙️ Update Profile
            </button>
            
            <button
              onClick={onDismiss}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                color: '#92400e',
                border: '1px solid #d97706',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMismatchExplainer;