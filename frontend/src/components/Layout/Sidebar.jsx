import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoles } from '../../utils/RoleBasedAccess';
import { useState } from 'react';

const Sidebar = ({ onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { isAdmin } = useRoles();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    if (onToggle) onToggle(newCollapsed);
  };

  const handleNavBrandClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarStyle = {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: isCollapsed ? '80px' : '280px',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
    transition: 'width 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    overflowX: 'hidden'
  };

  const contentStyle = {
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };

  const brandStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    color: 'white',
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '2rem',
    padding: '0.5rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  };

  const toggleButtonStyle = {
    position: 'absolute',
    right: '-18px',
    top: '25px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'white',
    border: '3px solid #667eea',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#667eea',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    zIndex: 1001
  };

  if (!isAuthenticated) {
    return (
      <div style={sidebarStyle}>
        <div style={contentStyle}>
          {/* Brand */}
          <div style={brandStyle} onClick={handleNavBrandClick}>
            <span style={{ fontSize: '1.8rem' }}>💰</span>
            {!isCollapsed && <span>BudgetWise</span>}
          </div>

          {/* Auth buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
            <button 
              onClick={() => navigate('/signin')}
              disabled={location.pathname === '/signin'}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: location.pathname === '/signin' ? 'not-allowed' : 'pointer',
                opacity: location.pathname === '/signin' ? 0.6 : 1,
                transition: 'all 0.3s ease',
                fontWeight: '600',
                fontSize: isCollapsed ? '0.8rem' : '1rem'
              }}
            >
              {isCollapsed ? '🔑' : 'Sign In'}
            </button>
            <button 
              onClick={() => navigate('/signup')}
              disabled={location.pathname === '/signup'}
              style={{
                background: 'white',
                color: '#667eea',
                border: '2px solid white',
                borderRadius: '8px',
                padding: '0.75rem',
                cursor: location.pathname === '/signup' ? 'not-allowed' : 'pointer',
                opacity: location.pathname === '/signup' ? 0.6 : 1,
                transition: 'all 0.3s ease',
                fontWeight: '700',
                fontSize: isCollapsed ? '0.8rem' : '1rem'
              }}
            >
              {isCollapsed ? '✨' : '✨ Get Started'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={sidebarStyle}>
      {/* Toggle Button */}
      <div 
        style={toggleButtonStyle}
        onClick={handleToggle}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
      >
        {isCollapsed ? '→' : '←'}
      </div>

      <div style={contentStyle}>
        {/* Brand */}
        <div 
          style={brandStyle} 
          onClick={handleNavBrandClick}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>💰</span>
          {!isCollapsed && <span>BudgetWise</span>}
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <SidebarButton 
            active={location.pathname === '/dashboard'}
            onClick={() => navigate('/dashboard')}
            icon="🏠"
            text="Dashboard"
            collapsed={isCollapsed}
          />

          <SidebarButton 
            active={location.pathname === '/transactions'}
            onClick={() => navigate('/transactions')}
            icon="💳"
            text="Transactions"
            collapsed={isCollapsed}
          />
          
          <SidebarButton 
            active={location.pathname.includes('/trends')}
            onClick={() => navigate('/trends')}
            icon="📊"
            text="Analytics"
            collapsed={isCollapsed}
          />

          <SidebarButton 
            active={location.pathname === '/financial-health'}
            onClick={() => navigate('/financial-health')}
            icon="💚"
            text="Health"
            collapsed={isCollapsed}
          />
          
          <SidebarButton 
            active={location.pathname === '/budgets'}
            onClick={() => navigate('/budgets')}
            icon="💰"
            text="Budgets"
            collapsed={isCollapsed}
          />
          
          <SidebarButton 
            active={location.pathname === '/savings-goals'}
            onClick={() => navigate('/savings-goals')}
            icon="🎯"
            text="Goals"
            collapsed={isCollapsed}
          />
          
          {/* Admin-only navigation */}
          {isAdmin() && (
            <SidebarButton 
              active={location.pathname === '/admin'}
              onClick={() => navigate('/admin')}
              icon="👑"
              text="Admin"
              collapsed={isCollapsed}
            />
          )}
          
          <SidebarButton 
            active={location.pathname === '/profile'}
            onClick={() => navigate('/profile')}
            icon="👤"
            text="Profile"
            collapsed={isCollapsed}
          />
        </div>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.2)',
              color: 'white',
              border: '2px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: '0.75rem',
              fontSize: isCollapsed ? '1.2rem' : '1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <span>🚪</span>
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for sidebar navigation buttons
const SidebarButton = ({ active, onClick, icon, text, collapsed }) => {
  const buttonStyle = {
    width: '100%',
    background: active ? 'rgba(255,255,255,0.2)' : 'transparent',
    color: 'white',
    border: active ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent',
    borderRadius: '8px',
    padding: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontWeight: active ? '700' : '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-start',
    gap: '0.75rem',
    fontSize: collapsed ? '1.2rem' : '1rem',
    textAlign: 'left'
  };

  return (
    <button 
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.background = 'rgba(255,255,255,0.1)';
          e.target.style.borderColor = 'rgba(255,255,255,0.2)';
        }
        e.target.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.background = 'transparent';
          e.target.style.borderColor = 'transparent';
        }
        e.target.style.transform = 'translateX(0)';
      }}
      title={collapsed ? text : ''}
    >
      <span>{icon}</span>
      {!collapsed && <span>{text}</span>}
    </button>
  );
};

export default Sidebar;