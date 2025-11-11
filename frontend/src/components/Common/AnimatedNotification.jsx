import React, { useEffect, useState } from 'react';
import './AnimatedNotification.css';

const AnimatedNotification = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (alert) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [alert]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getGradient = (type) => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'info':
      default:
        return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  };

  if (!alert || !isVisible) return null;

  return (
    <div className={`animated-notification ${alert.type} ${isExiting ? 'exiting' : 'entering'}`}>
      <div 
        className="notification-content"
        style={{ background: getGradient(alert.type) }}
      >
        <div className="notification-icon">
          {getIcon(alert.type)}
        </div>
        <div className="notification-message">
          {alert.message}
        </div>
        <button 
          className="notification-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      <div className="notification-progress">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
};

export default AnimatedNotification;