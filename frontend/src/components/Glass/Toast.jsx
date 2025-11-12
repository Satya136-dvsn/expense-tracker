import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    info: {
      icon: 'ℹ️',
      className: 'toast-info',
    },
    success: {
      icon: '✅',
      className: 'toast-success',
    },
    warning: {
      icon: '⚠️',
      className: 'toast-warning',
    },
    error: {
      icon: '❌',
      className: 'toast-error',
    },
  };

  const toastVariant = variants[type];

  return (
    <motion.div
      className={`toast ${toastVariant.className}`}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <div className="toast-icon">{toastVariant.icon}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>&times;</button>
    </motion.div>
  );
};

export default Toast;
