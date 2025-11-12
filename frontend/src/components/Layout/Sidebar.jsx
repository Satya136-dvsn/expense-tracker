import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoles } from '../../utils/RoleBasedAccess';
import { useState } from 'react';
import './Sidebar.css';

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

  const sidebarClasses = [
    'sidebar',
    isCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
  ].join(' ');

  if (!isAuthenticated) {
    return null; // Don't show sidebar on auth pages
  }

  return (
    <div className={sidebarClasses}>
      <div className="sidebar-brand" onClick={handleNavBrandClick}>
        <span className="sidebar-brand-icon">💰</span>
        {!isCollapsed && <span>BudgetWise</span>}
      </div>

      <nav className="sidebar-nav">
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
        {isAdmin() && (
          <SidebarButton 
            active={location.pathname === '/admin'}
            onClick={() => navigate('/admin')}
            icon="👑"
            text="Admin"
            collapsed={isCollapsed}
          />
        )}
      </nav>

      <div className="sidebar-logout">
        <SidebarButton
          onClick={handleLogout}
          icon="🚪"
          text="Logout"
          collapsed={isCollapsed}
        />
      </div>
    </div>
  );
};

const SidebarButton = ({ active, onClick, icon, text, collapsed }) => {
  const buttonClasses = [
    'sidebar-button',
    active && 'sidebar-button-active'
  ].filter(Boolean).join(' ');

  return (
    <button onClick={onClick} className={buttonClasses} title={collapsed ? text : ''}>
      <span className="sidebar-button-icon">{icon}</span>
      {!collapsed && <span>{text}</span>}
    </button>
  );
};

export default Sidebar;
