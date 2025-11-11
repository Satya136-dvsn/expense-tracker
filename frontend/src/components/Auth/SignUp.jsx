import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../hooks/useAlert';
import './Auth.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register(formData);
      if (response.token && response.id) {
        showAlert('Registration successful! You are now logged in.', 'success');
        navigate('/dashboard');
      } else {
        showAlert('Registration successful! Please login.', 'success');
        navigate('/signin');
      }
    } catch (error) {
      showAlert(`Registration failed: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <div className="auth-container">
        <div className="auth-left">
          <div className="welcome-content">
            <h1>Join Budget Tracker!</h1>
            <p>Start your journey to financial freedom today</p>
            <div className="benefits-list">
              <div className="benefit-item">
                <span style={{fontSize: '1.5rem'}}>🐷</span>
                <div>
                  <b>Smart Budgeting</b>
                  <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>Create and manage budgets that work for you</div>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{fontSize: '1.5rem'}}>📊</span>
                <div>
                  <b>Detailed Analytics</b>
                  <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>Understand your spending patterns with insights</div>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{fontSize: '1.5rem'}}>🎯</span>
                <div>
                  <b>Goal Tracking</b>
                  <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>Set and achieve your financial goals faster</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <h2>Create Account</h2>
            <p>Fill in the details below to get started</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Choose a username"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Create a strong password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Account Type</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="USER">Personal User</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            
            <div className="auth-links">
              Already have an account? <Link to="/signin">Sign in here</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;
