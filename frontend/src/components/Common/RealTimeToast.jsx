import React, { useState, useEffect } from 'react';
import { useNotificationRealTime } from '../../hooks/useRealTimeFallback';
import './RealTimeToast.css';

/**
 * Real-time toast notifications component
 * Displays live notifications from WebSocket updates
 */
const RealTimeToast = () => {
  const [toasts, setToasts] = useState([]);

  // Subscribe to real-time notifications
  useNotificationRealTime((update) => {
    if (update.type === 'NOTIFICATION') {
      const { title, message, priority } = update.data;
      addToast({
        id: Date.now(),
        title,
        message,
        priority: priority || 'NORMAL',
        timestamp: new Date()
      });
    } else if (update.type === 'TRANSACTION_UPDATE') {
      addToast({
        id: Date.now(),
        title: 'Transaction Updated',
        message: 'Your transaction has been processed successfully',
        priority: 'NORMAL',
        timestamp: new Date(),
        icon: '💳'
      });
    } else if (update.type === 'BUDGET_ALERT') {
      addToast({
        id: Date.now(),
        title: 'Budget Alert',
        message: update.data.message || 'Budget threshold reached',
        priority: 'HIGH',
        timestamp: new Date(),
        icon: '⚠️'
      });
    } else if (update.type === 'BILL_REMINDER') {
      addToast({
        id: Date.now(),
        title: 'Bill Reminder',
        message: update.data.message || 'You have an upcoming bill payment',
        priority: 'NORMAL',
        timestamp: new Date(),
        icon: '📋'
      });
    } else if (update.type === 'INVESTMENT_UPDATE') {
      addToast({
        id: Date.now(),
        title: 'Investment Update',
        message: update.data.message || 'Your portfolio has been updated',
        priority: 'NORMAL',
        timestamp: new Date(),
        icon: '📈'
      });
    } else if (update.type === 'CURRENCY_RATE_UPDATE') {
      addToast({
        id: Date.now(),
        title: 'Currency Updated',
        message: `Currency preference changed to ${update.data.newCurrency}`,
        priority: 'NORMAL',
        timestamp: new Date(),
        icon: '💱'
      });
    }
  });

  const addToast = (toast) => {
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove toast after 5 seconds (or 8 seconds for high priority)
    const timeout = toast.priority === 'HIGH' ? 8000 : 5000;
    setTimeout(() => {
      removeToast(toast.id);
    }, timeout);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return 'toast-high';
      case 'LOW':
        return 'toast-low';
      default:
        return 'toast-normal';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
      case 'URGENT':
        return '🚨';
      case 'LOW':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="realtime-toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`realtime-toast ${getPriorityClass(toast.priority)}`}
        >
          <div className="toast-header">
            <div className="toast-icon">
              {toast.icon || getPriorityIcon(toast.priority)}
            </div>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-time">{formatTime(toast.timestamp)}</div>
            <button
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
          <div className="toast-message">{toast.message}</div>
          <div className="toast-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RealTimeToast;