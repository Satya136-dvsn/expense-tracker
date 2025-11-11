import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../hooks/useAlert';
import { apiService } from '../../services/api';
import ForgotPasswordModal from '../Common/ForgotPasswordModal';
import './ProfileNew.css';

const ProfileNew = () => {
  const { user, updateUser } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    currentSavings: '',
    targetExpenses: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        monthlyIncome: user.monthlyIncome || '',
        currentSavings: user.currentSavings || '',
        targetExpenses: user.targetExpenses || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For financial fields, only allow numbers and decimal points
    if (['monthlyIncome', 'currentSavings', 'targetExpenses'].includes(name)) {
      // Remove any non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      // Ensure only one decimal point
      const parts = numericValue.split('.');
      const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericValue;
      
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        monthlyIncome: parseFloat(formData.monthlyIncome) || null,
        currentSavings: parseFloat(formData.currentSavings) || null,
        targetExpenses: parseFloat(formData.targetExpenses) || null
      };

      const response = await apiService.updateUserProfile(updateData);
      updateUser(response);
      showAlert('Profile updated successfully!', 'success');
    } catch (error) {
      showAlert(`Failed to update profile: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 My Profile</h1>
          <p>Manage your financial profile and preferences</p>
        </div>

        <div className="profile-content">
          {/* User Info Section */}
          <div className="profile-info-card">
            <h3>📋 Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <div className="info-value">{user.username}</div>
              </div>
              <div className="info-item">
                <label>Email</label>
                <div className="info-value">{user.email}</div>
              </div>
              <div className="info-item">
                <label>Role</label>
                <div className={`role-badge ${user.role?.toLowerCase()}`}>
                  {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                </div>
              </div>
            </div>
            
            <div className="account-actions">
              <button 
                type="button"
                className="forgot-password-btn"
                onClick={() => setShowForgotPassword(true)}
              >
                🔐 Reset Password
              </button>
            </div>
          </div>

          {/* Financial Profile Section */}
          <div className="profile-form-card">
            <h3>💰 Financial Profile</h3>
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="monthlyIncome">
                  💵 Monthly Income (₹)
                </label>
                <input
                  type="text"
                  id="monthlyIncome"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="Enter your monthly income"
                  pattern="[0-9]*\.?[0-9]*"
                  inputMode="decimal"
                />
              </div>

              <div className="form-group">
                <label htmlFor="currentSavings">
                  🏦 Current Savings (₹)
                </label>
                <input
                  type="text"
                  id="currentSavings"
                  name="currentSavings"
                  value={formData.currentSavings}
                  onChange={handleChange}
                  placeholder="Enter your current savings"
                  pattern="[0-9]*\.?[0-9]*"
                  inputMode="decimal"
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetExpenses">
                  🛒 Target Monthly Expenses (₹)
                </label>
                <input
                  type="text"
                  id="targetExpenses"
                  name="targetExpenses"
                  value={formData.targetExpenses}
                  onChange={handleChange}
                  placeholder="Enter your target expenses"
                  pattern="[0-9]*\.?[0-9]*"
                  inputMode="decimal"
                />
              </div>

              <button 
                type="submit" 
                className="update-btn"
                disabled={loading}
              >
                {loading ? 'Updating...' : '💾 Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        userEmail={user?.email}
      />
    </div>
  );
};

export default ProfileNew;