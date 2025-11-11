import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../hooks/useAlert';
import { apiService } from '../../services/api';
import { AdminOnly } from '../../utils/RoleBasedAccess';
import ForgotPasswordModal from '../Common/ForgotPasswordModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [adminStats, setAdminStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [statsResponse, usersResponse] = await Promise.all([
        apiService.getAdminDashboardStats(),
        apiService.getAllUsers()
      ]);
      
      setAdminStats(statsResponse);
      setUsers(usersResponse);
    } catch (error) {
      showAlert(`Failed to load admin data: ₹{error.message}`, 'error');
      if (error.message.includes('Authentication')) {
        navigate('/signin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = async (userId) => {
    try {
      const userDetails = await apiService.getUserByIdAdmin(userId);
      setSelectedUser(userDetails);
    } catch (error) {
      showAlert(`Failed to load user details: ₹{error.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="access-denied">
        <h2>🚫 Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <button onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
      </div>
    }>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>👑 Admin Dashboard</h1>
          <p>System overview and user management</p>
        </div>

        {/* Admin Stats */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Total Users</h3>
              <div className="stat-number">{adminStats?.totalUsers || 0}</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Active Users</h3>
              <div className="stat-number">{adminStats?.activeUsers || 0}</div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>Total Savings</h3>
              <div className="stat-number">
                ₹{adminStats?.totalSavings?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
          
          <div className="admin-stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Monthly Income</h3>
              <div className="stat-number">
                ₹{adminStats?.totalMonthlyIncome?.toLocaleString() || '0'}
              </div>
            </div>
          </div>
        </div>

        {/* Users Management */}
        <div className="admin-users-section">
          <div className="users-header">
            <h3>👤 User Management</h3>
            <button 
              className="refresh-btn"
              onClick={loadAdminData}
            >
              🔄 Refresh
            </button>
          </div>
          
          <div className="users-content">
            <div className="users-list">
              <h4>All Users ({users.length})</h4>
              <div className="users-grid">
                {users.map(user => (
                  <div 
                    key={user.id} 
                    className={`user-card ₹{selectedUser?.id === user.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user.id)}
                  >
                    <div className="user-info">
                      <div className="user-name">{user.username}</div>
                      <div className="user-email">{user.email}</div>
                      <div className={`user-role ₹{user.role?.toLowerCase()}`}>
                        {user.role === 'ADMIN' ? '👑' : '👤'} {user.role}
                      </div>
                    </div>
                    <div className="user-stats">
                      <div className="user-stat">
                        <span>Income:</span>
                        <span>₹{user.monthlyIncome?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="user-stat">
                        <span>Savings:</span>
                        <span>₹{user.currentSavings?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Details Panel */}
            {selectedUser && (
              <div className="user-details-panel">
                <h4>📋 User Details</h4>
                <div className="user-details">
                  <div className="detail-group">
                    <label>ID:</label>
                    <span>{selectedUser.id}</span>
                  </div>
                  <div className="detail-group">
                    <label>Username:</label>
                    <span>{selectedUser.username}</span>
                  </div>
                  <div className="detail-group">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-group">
                    <label>Role:</label>
                    <span className={`role-badge ₹{selectedUser.role?.toLowerCase()}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <div className="detail-group">
                    <label>Monthly Income:</label>
                    <span>₹{selectedUser.monthlyIncome?.toLocaleString() || 'Not set'}</span>
                  </div>
                  <div className="detail-group">
                    <label>Current Savings:</label>
                    <span>₹{selectedUser.currentSavings?.toLocaleString() || 'Not set'}</span>
                  </div>
                  <div className="detail-group">
                    <label>Target Expenses:</label>
                    <span>₹{selectedUser.targetExpenses?.toLocaleString() || 'Not set'}</span>
                  </div>
                </div>
                
                <div className="user-actions">
                  <button 
                    className="reset-password-btn"
                    onClick={() => {
                      setResetPasswordUser(selectedUser);
                      setShowForgotPassword(true);
                    }}
                  >
                    🔐 Reset User Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => {
          setShowForgotPassword(false);
          setResetPasswordUser(null);
        }}
        userEmail={resetPasswordUser?.email}
        isAdminMode={true}
      />
    </AdminOnly>
  );
};

export default AdminDashboard;