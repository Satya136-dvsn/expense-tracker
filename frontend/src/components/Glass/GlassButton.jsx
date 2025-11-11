import React from 'react';
import './GlassButton.css';

const GlassButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  glow = false,
  className = '',
  onClick,
  ...props 
}) => {
  const buttonClasses = [
    'glass-btn',
    `glass-btn-${variant}`,
    size !== 'md' && `glass-btn-${size}`,
    disabled && 'glass-btn-disabled',
    loading && 'glass-btn-loading',
    fullWidth && 'glass-btn-full',
    glow && 'glass-btn-glow',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };

  return (
    <button 
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <div className="inline-flex items-center gap-2">
          <div className="loading-spinner w-4 h-4"></div>
          <span>Loading...</span>
        </div>
      )}
      
      {!loading && (
        <div className="flex items-center gap-2">
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">
              {icon}
            </span>
          )}
          
          <span>
            {children}
          </span>
          
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">
              {icon}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default GlassButton;