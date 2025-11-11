import React from 'react';
import './Button.css';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} btn-${size} ${className} ${disabled ? 'disabled' : ''}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};