import React from 'react';
import './Badge.css';

export const Badge = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  return (
    <span 
      className={`badge badge-${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};