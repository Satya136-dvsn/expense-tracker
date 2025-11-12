import React from 'react';

const GlassCard = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  elevation = 2,
  hover = true,
  glow = false,
  animated = true,
  className = '',
  onClick,
  ...props 
}) => {
  const cardClasses = [
    'glass-card',
    `glass-card-elevation-${elevation}`,
    `glass-card-${variant}`,
    `glass-card-${size}`,
    hover && 'glass-card-hover',
    glow && 'glass-card-glow',
    animated && 'glass-card-animated',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;