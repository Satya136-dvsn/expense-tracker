import React from 'react';
import './Tabs.css';

export const Tabs = ({ children, value, onValueChange, className = '', ...props }) => {
  return (
    <div className={`tabs ${className}`} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab: value, onTabChange: onValueChange })
      )}
    </div>
  );
};

export const TabsList = ({ children, className = '', activeTab, onTabChange, ...props }) => {
  return (
    <div className={`tabs-list ${className}`} {...props}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { activeTab, onTabChange })
      )}
    </div>
  );
};

export const TabsTrigger = ({ children, value, className = '', activeTab, onTabChange, ...props }) => {
  const isActive = activeTab === value;
  
  return (
    <button
      className={`tabs-trigger ${isActive ? 'active' : ''} ${className}`}
      onClick={() => onTabChange(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, value, className = '', activeTab, ...props }) => {
  if (activeTab !== value) return null;
  
  return (
    <div className={`tabs-content ${className}`} {...props}>
      {children}
    </div>
  );
};