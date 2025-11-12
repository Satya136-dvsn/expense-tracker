import React from 'react';

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

    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];

    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    onClick?.(e);
  };

  return (
    <button 
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      role="button"
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