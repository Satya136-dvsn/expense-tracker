import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoles } from '../../utils/RoleBasedAccess';
import NotificationBadge from '../Common/NotificationBadge';
import { GlassCard, GlassButton, GlassNavigation } from '../Glass';
import './CleanSidebar.css';

const CleanSidebar = ({ collapsed, onToggle, isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { isAdmin } = useRoles();

  // Hide sidebar on home page
  if (location.pathname === '/') {
    return null;
  }

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

  if (!isAuthenticated) {
    return (
      <>
        <div className={`sidebar-container ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
          <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            {/* Brand */}
            <div 
              onClick={handleNavBrandClick}
              style={{
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
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span style={{ fontSize: '1.8rem' }}>💰</span>
              {!collapsed && <span>BudgetWise</span>}
            </div>

            {/* Auth buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
              <GlassButton 
                onClick={() => navigate('/signin')}
                disabled={location.pathname === '/signin'}
                variant="secondary"
                fullWidth={true}
                icon={collapsed ? '🔑' : null}
              >
                {collapsed ? '' : 'Sign In'}
              </GlassButton>
              <GlassButton 
                onClick={() => navigate('/signup')}
                disabled={location.pathname === '/signup'}
                variant="primary"
                fullWidth={true}
                icon={collapsed ? '✨' : '✨'}
              >
                {collapsed ? '' : 'Get Started'}
              </GlassButton>
            </div>
            
            {/* Toggle Button - INSIDE sidebar - Fixed positioning */}
            <button 
              className={`sidebar-toggle ${collapsed ? 'collapsed' : 'expanded'}`}
              onClick={onToggle}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(255,255,255,0.95)',
                border: '2px solid rgba(255,255,255,1)',
                borderRadius: '6px',
                color: '#667eea',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                zIndex: 1001,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.95)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
              }}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>
      </>
    );
  }

  // Authenticated sidebar
  return (
    <>
      <div className={`sidebar-container ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
        <div style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
          {/* Brand */}
          <div 
            onClick={handleNavBrandClick}
            style={{
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
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>💰</span>
            {!collapsed && <span>BudgetWise</span>}
          </div>

          {/* Navigation */}
          <GlassNavigation 
            orientation="vertical"
            className="sidebar-nav"
            items={[
              { path: '/dashboard', label: collapsed ? '' : 'Dashboard', icon: '🏠' },
              { path: '/transactions', label: collapsed ? '' : 'Transactions', icon: '💳' },
              { path: '/analytics', label: collapsed ? '' : 'Analytics', icon: '📊' },
              { path: '/financial-health', label: collapsed ? '' : 'Health', icon: '❤️' },
              { path: '/budgets', label: collapsed ? '' : 'Budgets', icon: '🎯' },
              { path: '/planning', label: collapsed ? '' : 'Savings & Planning', icon: '🎯' },
              { path: '/bills', label: collapsed ? '' : 'Bills', icon: '📋' },
              { path: '/ai', label: collapsed ? '' : 'AI Insights', icon: '🤖' },
              { path: '/community', label: collapsed ? '' : 'Community', icon: '👥' },
              { path: '/investments', label: collapsed ? '' : 'Investments', icon: '📈' },
              { path: '/currencies', label: collapsed ? '' : 'Currencies', icon: '💱' },
              { path: '/banking', label: collapsed ? '' : 'Banking', icon: '🏦' },
              { path: '/notifications', label: collapsed ? '' : 'Notifications', icon: '🔔', badge: true },
              { path: '/profile', label: collapsed ? '' : 'Profile', icon: '👤' },
              { path: '/settings', label: collapsed ? '' : 'Settings', icon: '⚙️' },
              ...(isAdmin ? [{ path: '/admin', label: collapsed ? '' : 'Admin', icon: '⚙️' }] : [])
            ]}
          />

          {/* Logout */}
          <div style={{ marginTop: 'auto' }}>
            <GlassButton
              onClick={handleLogout}
              variant="secondary"
              fullWidth={true}
              className="logout-btn"
              icon={collapsed ? '🚪' : '🚪'}
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                borderColor: 'rgba(239, 68, 68, 0.3)'
              }}
            >
              {collapsed ? '' : 'Logout'}
            </GlassButton>
            
            {/* Toggle Button - INSIDE sidebar - Fixed positioning */}
            <button 
              className={`sidebar-toggle ${collapsed ? 'collapsed' : 'expanded'}`}
              onClick={onToggle}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(255,255,255,0.95)',
                border: '2px solid rgba(255,255,255,1)',
                borderRadius: '6px',
                color: '#667eea',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                zIndex: 1001,
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.95)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
              }}
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper component for sidebar navigation buttons
const SidebarNavButton = ({ icon, label, path, collapsed, navigate, location }) => {
  const isActive = location.pathname === path;
  
  return (
    <button
      onClick={() => navigate(path)}
      style={{
        width: '100%',
        padding: collapsed ? '0.75rem' : '0.75rem 1rem',
        marginBottom: '0.5rem',
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0.8
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }
        e.target.style.transform = 'translateX(4px)';
        e.target.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = 'transparent';
        }
        e.target.style.transform = 'translateX(0)';
        e.target.style.opacity = isActive ? '1' : '0.8';
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

// Helper component for sidebar navigation buttons with notification badge
const SidebarNavButtonWithBadge = ({ icon, label, path, collapsed, navigate, location }) => {
  const isActive = location.pathname === path;
  
  return (
    <button
      onClick={() => navigate(path)}
      style={{
        width: '100%',
        padding: collapsed ? '0.75rem' : '0.75rem 1rem',
        marginBottom: '0.5rem',
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '0.75rem',
        fontSize: '0.9rem',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.3s ease',
        opacity: isActive ? 1 : 0.8,
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.target.style.background = 'rgba(255,255,255,0.1)';
        }
        e.target.style.transform = 'translateX(4px)';
        e.target.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.target.style.background = 'transparent';
        }
        e.target.style.transform = 'translateX(0)';
        e.target.style.opacity = isActive ? '1' : '0.8';
      }}
    >
      <span style={{ fontSize: '1.1rem', position: 'relative' }}>
        {icon}
        <NotificationBadge />
      </span>
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

export default CleanSidebar;