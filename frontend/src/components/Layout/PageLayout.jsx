import React from 'react';
import './PageLayout.css';

const PageLayout = ({ 
  title, 
  subtitle, 
  actions, 
  children, 
  className = '',
  headerClassName = '',
  contentClassName = '',
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <div className="page-layout loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-layout error">
        <div className="error-container glass-card">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h2 className="error-title">Something went wrong</h2>
          <p className="error-message">{error.message || 'An unexpected error occurred'}</p>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`page-layout ${className}`}>
      {/* Page Header */}
      {(title || subtitle || actions) && (
        <div className={`page-header ${headerClassName}`}>
          <div className="page-header-content">
            <div className="page-title-section">
              {title && (
                <h1 className="page-title">{title}</h1>
              )}
              {subtitle && (
                <p className="page-subtitle">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="page-actions">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Page Content */}
      <div className={`page-content ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
};

// Subcomponents for better organization
PageLayout.Section = ({ title, children, className = '', actions }) => (
  <section className={`page-section ${className}`}>
    {(title || actions) && (
      <div className="section-header">
        {title && <h2 className="section-title">{title}</h2>}
        {actions && <div className="section-actions">{actions}</div>}
      </div>
    )}
    <div className="section-content">
      {children}
    </div>
  </section>
);

PageLayout.Grid = ({ children, cols = 1, className = '', gap = 'xl' }) => (
  <div className={`page-grid grid-cols-${cols} gap-${gap} ${className}`}>
    {children}
  </div>
);

PageLayout.Card = ({ 
  title, 
  subtitle, 
  children, 
  className = '', 
  actions,
  loading = false,
  variant = 'default'
}) => (
  <div className={`page-card glass-card ${variant} ${loading ? 'loading' : ''} ${className}`}>
    {(title || subtitle || actions) && (
      <div className="card-header">
        <div className="card-title-section">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {actions && (
          <div className="card-actions">
            {actions}
          </div>
        )}
      </div>
    )}
    <div className="card-content">
      {loading ? (
        <div className="card-loading">
          <div className="loading-spinner small"></div>
          <span>Loading...</span>
        </div>
      ) : children}
    </div>
  </div>
);

PageLayout.Stats = ({ stats = [], className = '' }) => (
  <div className={`stats-grid ${className}`}>
    {stats.map((stat, index) => (
      <div key={index} className="stat-card glass-card">
        <div className="stat-icon">
          {stat.icon}
        </div>
        <div className="stat-content">
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
          {stat.change && (
            <div className={`stat-change ${stat.change > 0 ? 'positive' : 'negative'}`}>
              {stat.change > 0 ? '+' : ''}{stat.change}%
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

PageLayout.EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  className = '' 
}) => (
  <div className={`empty-state ${className}`}>
    <div className="empty-state-content glass-card">
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  </div>
);

export default PageLayout;