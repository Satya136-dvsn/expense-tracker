import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/dashboard')}>
        <span className="navbar-brand-icon">💰</span>
        <span>BudgetWise</span>
      </div>

      <div className="navbar-user-menu">
        <img
          src={user?.avatarUrl || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'}
          alt="User Avatar"
          className="navbar-user-avatar"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        />
        {dropdownOpen && (
          <div className="navbar-dropdown">
            <div className="navbar-dropdown-item" onClick={() => navigate('/profile')}>
              Profile
            </div>
            <div className="navbar-dropdown-item" onClick={handleLogout}>
              Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
