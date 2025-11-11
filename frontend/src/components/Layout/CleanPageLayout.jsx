import React from 'react';
import { useNavigate } from 'react-router-dom';

const CleanPageLayout = ({ 
  title, 
  subtitle, 
  actions, 
  children, 
  showBackButton = false,
  backTo = '/trends'
}) => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Header */}
      {(title || subtitle || actions || showBackButton) && (
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-left">
              {showBackButton && (
                <button 
                  className="back-button"
                  onClick={() => navigate(backTo)}
                >
                  ←
                </button>
              )}
              <div>
                {title && <h1 className="page-title">{title}</h1>}
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
            </div>
            
            {actions && (
              <div className="page-header-actions">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="page-content">
        <div className="fade-in">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CleanPageLayout;