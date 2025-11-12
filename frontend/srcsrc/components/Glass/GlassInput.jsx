import React, { useState, forwardRef } from 'react';
import './GlassInput.css';

const GlassInput = forwardRef(({
  type = 'text',
  placeholder = ' ',
  label = '',
  error = '',
  success = false,
  disabled = false,
  icon = null,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    props.onBlur?.(e);
  };

  const containerClasses = [
    'glass-input-container',
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    'glass-input',
    error && 'glass-input-error',
    success && 'glass-input-success',
    disabled && 'glass-input-disabled'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {label && (
        <label className="glass-input-label">
          {label}
        </label>
      )}
      {icon && (
        <div className="glass-input-icon">
          {icon}
        </div>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;
