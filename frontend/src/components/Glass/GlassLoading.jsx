import React from 'react';
import './GlassLoading.css';

const GlassLoading = ({ 
  size = 'md',
  variant = 'spinner',
  text = '',
  overlay = false,
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const LoadingSpinner = () => (
    <div className={`loading-spinner ${sizes[size]} ${className}`} {...props}>
      <div className="animate-spin rounded-full border-2 border-glass-bg-light border-t-primary-500"></div>
    </div>
  );

  const LoadingDots = () => (
    <div className={`flex space-x-1 ${className}`} {...props}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${sizes[size]} bg-primary-500 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const LoadingPulse = () => (
    <div className={`${sizes[size]} bg-gradient-primary rounded-xl animate-pulse ${className}`} {...props} />
  );

  const LoadingBars = () => (
    <div className={`flex space-x-1 items-end ${className}`} {...props}>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1 bg-primary-500 rounded-full animate-pulse"
          style={{
            height: `${(i + 1) * 4 + 8}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

  const renderLoading = () => {
    switch (variant) {
      case 'dots':
        return <LoadingDots />;
      case 'pulse':
        return <LoadingPulse />;
      case 'bars':
        return <LoadingBars />;
      default:
        return <LoadingSpinner />;
    }
  };

  const content = (
    <div className="flex flex-col items-center gap-3">
      {renderLoading()}
      {text && (
        <p className="text-sm text-secondary animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

export default GlassLoading;