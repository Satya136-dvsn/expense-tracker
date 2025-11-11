import React, { createContext, useContext, useState } from 'react';
import AnimatedNotification from '../components/Common/AnimatedNotification';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info', duration = 5000) => {
    setAlert({ message, type });
    
    if (duration > 0) {
      setTimeout(() => {
        setAlert(null);
      }, duration);
    }
  };

  const hideAlert = () => {
    setAlert(null);
  };

  const value = {
    alert,
    showAlert,
    hideAlert
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
      <AnimatedNotification 
        alert={alert} 
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};