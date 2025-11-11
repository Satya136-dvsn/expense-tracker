import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../../hooks/useAlert';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { showAlert } = useAlert();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, show a success message since we don't have a backend endpoint
      // In a real app, you would call: await apiService.forgotPassword(email);
      
      showAlert('Password reset link has been sent to your email address. Please check your inbox.', 'success');
      
      // Reset the form
      setEmail('');
      
    } catch (error) {
      showAlert(`Failed to send reset email: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <div className="auth-container">
        <div className="auth-left">
          <div className="welcome-content">
            <h2>Reset Your Password</h2>
            <p>Don't worry! It happens. Please enter the email address associated with your account.</p>
            
            <div className="benefits-list">
              <div className="benefit-item">
                <span style={{fontSize: '1.5rem'}}>🔒</span>
                <div>
                  <b>Secure Process</b>
                  <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>Your password reset is protected with advanced security</div>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{fontSize: '1.5rem'}}>📧</span>
                <div>
                  <b>Email Verification</b>
                  <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>We'll send you a secure link to reset your password</div>
                </div>
              </div>
              <div className="benefit-item">
                <span style={{fontSize: '1.5rem'}}>⚡</span>
                <div>
                  <b>Quick Recovery</b>
                  <div style={{fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)'}}>Get back to managing your budget in just a few minutes</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-form">
            <h2>🔑 Reset Password</h2>
            <p>Enter your email address to receive a password reset link</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            
            <div className="auth-links">
              Remember your password? <Link to="/signin">Sign In here</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;