import { useState } from 'react';
import websocketService from '../../services/websocketService';
import { useRealTime } from '../../hooks/useRealTime';

/**
 * Demo component to test real-time functionality
 * This will be removed once full WebSocket implementation is complete
 */
const RealTimeDemo = () => {
  const { connected, connectionStatus } = useRealTime();
  const [lastAction, setLastAction] = useState('');

  const triggerTransactionUpdate = () => {
    websocketService.simulateUpdate('TRANSACTION_UPDATE', {
      id: Date.now(),
      amount: Math.floor(Math.random() * 5000) + 100,
      description: 'Demo Transaction',
      category: 'Food',
      timestamp: new Date().toISOString()
    });
    setLastAction('Transaction Update Sent');
  };

  const triggerNotification = () => {
    websocketService.simulateUpdate('NOTIFICATION', {
      title: 'Demo Notification',
      message: 'This is a test real-time notification!',
      priority: 'NORMAL',
      timestamp: new Date().toISOString()
    });
    setLastAction('Notification Sent');
  };

  const triggerBudgetAlert = () => {
    websocketService.simulateUpdate('BUDGET_ALERT', {
      message: 'You have exceeded 80% of your monthly budget',
      category: 'Food',
      percentage: 85,
      timestamp: new Date().toISOString()
    });
    setLastAction('Budget Alert Sent');
  };

  const triggerCurrencyUpdate = () => {
    websocketService.simulateUpdate('CURRENCY_RATE_UPDATE', {
      newCurrency: 'USD',
      oldCurrency: 'INR',
      message: 'Currency preference updated',
      timestamp: new Date().toISOString()
    });
    setLastAction('Currency Update Sent');
  };

  const triggerDashboardRefresh = () => {
    websocketService.simulateUpdate('DASHBOARD_REFRESH', {
      refresh: true,
      timestamp: new Date().toISOString()
    });
    setLastAction('Dashboard Refresh Sent');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '1rem',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      padding: '1rem',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      minWidth: '220px',
      maxWidth: '280px'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#4a5568', fontWeight: '600' }}>
          Real-Time Demo
        </h4>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: connected ? '#48bb78' : '#f56565',
          boxShadow: connected ? '0 0 8px rgba(72, 187, 120, 0.6)' : '0 0 8px rgba(245, 101, 101, 0.6)'
        }} />
      </div>
      
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#718096', 
        marginBottom: '0.5rem',
        padding: '0.25rem 0.5rem',
        background: 'rgba(113, 128, 150, 0.1)',
        borderRadius: '4px'
      }}>
        Status: {connectionStatus} | {lastAction && `Last: ${lastAction}`}
      </div>
      
      <button
        onClick={triggerTransactionUpdate}
        disabled={!connected}
        style={{
          padding: '0.5rem',
          background: connected ? '#4299e1' : '#a0aec0',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8rem',
          cursor: connected ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        💳 Transaction Update
      </button>
      
      <button
        onClick={triggerNotification}
        disabled={!connected}
        style={{
          padding: '0.5rem',
          background: connected ? '#48bb78' : '#a0aec0',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8rem',
          cursor: connected ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        🔔 Notification
      </button>
      
      <button
        onClick={triggerBudgetAlert}
        disabled={!connected}
        style={{
          padding: '0.5rem',
          background: connected ? '#f56565' : '#a0aec0',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8rem',
          cursor: connected ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ⚠️ Budget Alert
      </button>
      
      <button
        onClick={triggerCurrencyUpdate}
        disabled={!connected}
        style={{
          padding: '0.5rem',
          background: connected ? '#ed8936' : '#a0aec0',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8rem',
          cursor: connected ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        💱 Currency Update
      </button>
      
      <button
        onClick={triggerDashboardRefresh}
        disabled={!connected}
        style={{
          padding: '0.5rem',
          background: connected ? '#9f7aea' : '#a0aec0',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.8rem',
          cursor: connected ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        🔄 Dashboard Refresh
      </button>
    </div>
  );
};

export default RealTimeDemo;