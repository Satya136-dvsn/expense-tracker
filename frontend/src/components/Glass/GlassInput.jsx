import React, { useState, forwardRef } from 'react';
import './GlassInput.css';

const GlassInput = forwardRef(({ 
  type = 'text',
  placeholder = '',
  label = '',
  error = '',
  success = false,
  disabled = false,
  required = false,
  icon = null,
  iconPosition = 'left',
  size = 'md',
  variant = 'default',
  fullWidth = true,
  className = '',
  onChange,
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(props.value || props.defaultValue || '');

  const inputClasses = [
    'pro-input',
    error && 'border-red-500 focus:border-red-500',
    success && 'border-green-500 focus:border-green-500',
    disabled && 'cursor-not-allowed opacity-50',
    focused && 'ring-2 ring-primary-500/20',
    fullWidth && 'w-full',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    'space-y-2',
    fullWidth && 'w-full'
  ].filter(Boolean).join(' ');

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-secondary">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-xs text-red-400 mt-1">
          {error}
        </p>
      )}
      
      {success && !error && (
        <p className="text-xs text-green-400 mt-1">
          Input is valid
        </p>
      )}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

export default GlassInput;