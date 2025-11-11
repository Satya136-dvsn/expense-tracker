import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../hooks/useAlert';

const Profile = () => {
  const { user, loadUserProfile } = useAuth();
  const { showAlert } = useAlert();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      loadUserProfile();
    }
  }, [user, loadUserProfile]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showAlert('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        showAlert('Password changed successfully!', 'success');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        const errorData = await response.text();
        showAlert(errorData || 'Failed to change password', 'error');
      }
    } catch (error) {
      showAlert('Error changing password. Please try again.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-header">
          <div className="loading-state">
            <div className="spinner"></div>
            <h2>Loading Profile...</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-header">
        <h2><i className="fas fa-user"></i> User Profile</h2>
        <p>Manage your account information and financial details</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h3>Profile Information</h3>
          <div>
            <div className="profile-item">
              <strong>Username:</strong> <span>{user.username || 'N/A'}</span>
            </div>
            <div className="profile-item">
              <strong>Email:</strong> <span>{user.email || 'N/A'}</span>
            </div>
            <div className="profile-item">
              <strong>Role:</strong> <span>{user.role || 'USER'}</span>
            </div>
            <div className="profile-item">
              <strong>Account Status:</strong> <span>{user.enabled ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="profile-item">
              <strong>Member Since:</strong> <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Financial Information</h3>
          <div>
            <div className="profile-item">
              <strong>Monthly Income:</strong> <span>{formatCurrency(user.monthlyIncome)}</span>
            </div>
            <div className="profile-item">
              <strong>Current Savings:</strong> <span>{formatCurrency(user.currentSavings)}</span>
            </div>
            <div className="profile-item">
              <strong>Target Expenses:</strong> <span>{formatCurrency(user.targetExpenses)}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>Security Settings</h3>
            <button 
              className="btn btn-primary change-password-btn"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              <i className="fas fa-lock"></i>
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Enter your new password"
                  minLength="6"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  placeholder="Confirm your new password"
                  minLength="6"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <>
                      <div className="spinner-small"></div>
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;