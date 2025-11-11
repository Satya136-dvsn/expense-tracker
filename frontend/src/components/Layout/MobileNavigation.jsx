import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './MobileNavigation.css';

const MobileNavigation = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  // Navigation items with glassmorphism styling
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
      )
    },
    {
      id: 'transactions',
      label: 'Transactions',
      path: '/transactions',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="m17 5-5-5-5 5"/>
          <path d="m7 19 5 5 5-5"/>
        </svg>
      )
    },
    {
      id: 'budgets',
      label: 'Budgets',
      path: '/budgets',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16 8l-4 4-4-4"/>
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
      )
    },
    {
      id: 'planning',
      label: 'Financial Planning',
      path: '/planning',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      submenu: [
        { label: 'Overview', path: '/planning' },
        { label: 'Retirement', path: '/planning/retirement' },
        { label: 'Debt Optimizer', path: '/planning/debt' },
        { label: 'Tax Planning', path: '/planning/tax' }
      ]
    },
    {
      id: 'investments',
      label: 'Investments',
      path: '/investments',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m7.5 4.27 9 5.15"/>
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
        </svg>
      )
    },
    {
      id: 'bills',
      label: 'Bills & Payments',
      path: '/bills',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect width="20" height="14" x="2" y="5" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      )
    },
    {
      id: 'banking',
      label: 'Bank Integration',
      path: '/banking',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="m20 7-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
      )
    },
    {
      id: 'currencies',
      label: 'Currencies',
      path: '/currencies',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      )
    },
    {
      id: 'ai',
      label: 'AI Insights',
      path: '/ai',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 8V4H8"/>
          <rect width="16" height="12" x="4" y="8" rx="2"/>
          <path d="M2 14h2"/>
          <path d="M20 14h2"/>
          <path d="M15 13v2"/>
          <path d="M9 13v2"/>
        </svg>
      )
    },
    {
      id: 'community',
      label: 'Community',
      path: '/community',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="m22 21-3-3m0 0a5.5 5.5 0 1 1-7.78-7.78 5.5 5.5 0 0 1 7.78 7.78Z"/>
        </svg>
      )
    }
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    onClose();
    setActiveSubmenu(null);
  }, [location.pathname, onClose]);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  // Handle submenu toggle
  const toggleSubmenu = (itemId) => {
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-navigation">
      <div className="mobile-nav-overlay" onClick={onClose} />
      <div className="mobile-nav-container glass-card">
        {/* Header */}
        <div className="mobile-nav-header">
          <div className="mobile-nav-logo">
            <h2>BudgetWise</h2>
          </div>
          <button 
            className="mobile-nav-close glass-button secondary"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="mobile-nav-user glass-card">
            <div className="user-avatar">
              {user.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <div className="user-name">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email}
              </div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mobile-nav-menu">
          {navigationItems.map((item) => (
            <div key={item.id} className="mobile-nav-item-container">
              <button
                className={`mobile-nav-item ${
                  location.pathname === item.path || 
                  (item.submenu && item.submenu.some(sub => location.pathname === sub.path))
                    ? 'active' : ''
                }`}
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.id);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <div className="nav-item-icon">{item.icon}</div>
                <span className="nav-item-label">{item.label}</span>
                {item.submenu && (
                  <div className={`nav-item-arrow ${activeSubmenu === item.id ? 'open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </div>
                )}
              </button>

              {/* Submenu */}
              {item.submenu && activeSubmenu === item.id && (
                <div className="mobile-nav-submenu">
                  {item.submenu.map((subItem, index) => (
                    <button
                      key={index}
                      className={`mobile-nav-subitem ${
                        location.pathname === subItem.path ? 'active' : ''
                      }`}
                      onClick={() => handleNavigation(subItem.path)}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="mobile-nav-footer">
          <button
            className="mobile-nav-item"
            onClick={() => handleNavigation('/settings')}
          >
            <div className="nav-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"/>
                <path d="m12 1 2.09 2.09L16 2l1 1-1.09 1.91L18 7l-1 1-2.91-1.09L12 9l-2.09-2.09L8 8l-1-1 1.09-1.91L6 3l1-1 2.91 1.09L12 1Z"/>
              </svg>
            </div>
            <span className="nav-item-label">Settings</span>
          </button>

          <button
            className="mobile-nav-item logout"
            onClick={handleLogout}
          >
            <div className="nav-item-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span className="nav-item-label">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;