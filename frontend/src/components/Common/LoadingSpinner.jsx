import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  overlay = false,
  color = 'primary' 
}) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  
  const spinner = (
    <div className={`loading-spinner-container ${overlay ? 'overlay' : ''}`}>
      <div className={`loading-spinner ${sizeClass} ${colorClass}`}>
        <div className="spinner-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  return spinner;
};

// Inline loading spinner for buttons
export const InlineSpinner = ({ size = 'small' }) => (
  <div className={`inline-spinner spinner-${size}`}>
    <div className="spinner-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
);

// Skeleton loader for content
export const SkeletonLoader = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  count = 1 
}) => (
  <div className="skeleton-container">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="skeleton-loader"
        style={{
          width,
          height,
          borderRadius,
          marginBottom: count > 1 ? '8px' : '0'
        }}
      />
    ))}
  </div>
);

// Chart loading placeholder
export const ChartLoader = ({ height = '300px' }) => (
  <div className="chart-loader" style={{ height }}>
    <div className="chart-skeleton">
      <div className="chart-title-skeleton"></div>
      <div className="chart-content-skeleton">
        <div className="chart-bars">
          {Array.from({ length: 6 }).map((_, index) => (
            <div 
              key={index} 
              className="chart-bar-skeleton"
              style={{ height: `${Math.random() * 80 + 20}%` }}
            />
          ))}
        </div>
      </div>
      <div className="chart-legend-skeleton">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="legend-item-skeleton" />
        ))}
      </div>
    </div>
  </div>
);

export default LoadingSpinner;