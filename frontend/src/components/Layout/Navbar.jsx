import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRoles } from '../../utils/RoleBasedAccess';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { isAdmin } = useRoles();

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

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleNavBrandClick}>
          <div className="brand-icon">
            <span className="brand-emoji">💰</span>
          </div>
          <span className="brand-text">BudgetWise</span>
          <div className="brand-glow"></div>
        </div>
        <div className="navbar-links">
          {!isAuthenticated ? (
            <>
              <button 
                className="modern-nav-btn nav-btn-signin" 
                onClick={() => navigate('/signin')}
                disabled={location.pathname === '/signin'}
              >
                <span className="btn-text">Sign In</span>
                <div className="btn-gradient"></div>
              </button>
              <button 
                className="modern-nav-btn nav-btn-signup" 
                onClick={() => navigate('/signup')}
                disabled={location.pathname === '/signup'}
              >
                ✨ Get Started
                <div className="btn-shine"></div>
              </button>
            </>
          ) : (
            <>
              <button 
                className={`modern-nav-btn ${location.pathname === '/dashboard' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/dashboard')}
                title="Dashboard"
              >
                <span className="btn-icon">🏠</span>
                <span className="btn-text">Dashboard</span>
              </button>

              <button 
                className={`modern-nav-btn ${location.pathname === '/transactions' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/transactions')}
                title="Transactions"
              >
                <span className="btn-icon">💳</span>
                <span className="btn-text">Transactions</span>
              </button>
              
              <button 
                className={`modern-nav-btn ${location.pathname.includes('/trends') ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/trends')}
                title="Analytics & Trends"
              >
                <span className="btn-icon">📊</span>
                <span className="btn-text">Analytics</span>
              </button>

              <button 
                className={`modern-nav-btn ${location.pathname === '/financial-health' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/financial-health')}
                title="Financial Health"
              >
                <span className="btn-icon">💚</span>
                <span className="btn-text">Health</span>
              </button>
              
              <button 
                className={`modern-nav-btn ${location.pathname === '/budgets' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/budgets')}
                title="Budgets"
              >
                <span className="btn-icon">💰</span>
                <span className="btn-text">Budgets</span>
              </button>
              
              <button 
                className={`modern-nav-btn ${location.pathname === '/savings-goals' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/savings-goals')}
                title="Savings Goals"
              >
                <span className="btn-icon">🎯</span>
                <span className="btn-text">Goals</span>
              </button>
              
              {/* Admin-only navigation */}
              {isAdmin() && (
                <button 
                  className={`modern-nav-btn ${location.pathname === '/admin' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                  onClick={() => navigate('/admin')}
                  title="Admin Panel"
                >
                  <span className="btn-icon">👑</span>
                  <span className="btn-text">Admin</span>
                </button>
              )}
              
              <button 
                className={`modern-nav-btn ${location.pathname === '/profile' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
                onClick={() => navigate('/profile')}
                title="Profile Settings"
              >
                <span className="btn-icon">👤</span>
                <span className="btn-text">Profile</span>
              </button>
              
              <button 
                className="modern-nav-btn nav-btn-logout" 
                onClick={handleLogout}
                title="Sign Out"
              >
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;