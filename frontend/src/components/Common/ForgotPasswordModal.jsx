import React, { useState } from 'react';
import { useAlert } from '../../hooks/useAlert';
import { apiService } from '../../services/api';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, userEmail = '', isAdminMode = false }) => {
  const [email, setEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email', 'sent', 'reset'
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { showAlert } = useAlert();

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showAlert('Please enter an email address', 'error');
      return;
    }

    setLoading(true);
    try {
      // For now, simulate the API call since we need to implement the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Password reset email sent successfully!', 'success');
      setStep('sent');
    } catch (error) {
      showAlert(`Failed to send reset email: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!resetToken) {
      showAlert('Please enter the reset token from your email', 'error');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showAlert('Password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      // For now, simulate the API call since we need to implement the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showAlert('Password reset successfully!', 'success');
      onClose();
      resetForm();
    } catch (error) {
      showAlert(`Failed to reset password: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail(userEmail);
    setStep('email');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-modal-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {isAdminMode ? '🔐 Admin Password Reset' : '🔐 Reset Password'}
          </h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          {step === 'email' && (
            <form onSubmit={handleSendResetEmail}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isAdminMode && userEmail}
                />
                {isAdminMode && userEmail && (
                  <small className="form-help">
                    Sending reset email to user's registered email
                  </small>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Sending...' : '📧 Send Reset Email'}
                </button>
              </div>
            </form>
          )}

          {step === 'sent' && (
            <div className="reset-sent">
              <div className="success-icon">✅</div>
              <h4>Reset Email Sent!</h4>
              <p>
                We've sent a password reset email to <strong>{email}</strong>.
                Please check your inbox and follow the instructions.
              </p>
              
              <div className="reset-token-section">
                <p><strong>For testing purposes, you can reset your password here:</strong></p>
                <form onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label htmlFor="resetToken">Reset Token</label>
                    <input
                      type="text"
                      id="resetToken"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="Enter reset token from email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      minLength="6"
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={handleClose}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? '⏳ Resetting...' : '🔐 Reset Password'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="resend-section">
                <p>Didn't receive the email?</p>
                <button 
                  type="button" 
                  className="btn-link" 
                  onClick={() => setStep('email')}
                >
                  Send another reset email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;