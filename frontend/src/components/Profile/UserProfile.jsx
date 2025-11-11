import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import GlassCard from '../Glass/GlassCard';
import GlassButton from '../Glass/GlassButton';
import GlassInput from '../Glass/GlassInput';
import GlassDropdown from '../Glass/GlassDropdown';
import './UserProfile.css';

/**
 * User Profile component for managing personal settings and preferences
 * Includes currency selection, notifications, and theme preferences
 */
const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState({});
  const [availableThemes, setAvailableThemes] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    preferredCurrency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'IN',
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    whatsappNotifications: false,
    budgetAlerts: true,
    billReminders: true,
    investmentAlerts: true,
    weeklySummary: true,
    monthlyReport: true
  });

  useEffect(() => {
    loadProfile();
    loadAvailableOptions();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await api.getUserProfile();
      
      setProfile(profileData);
      setFormData({
        preferredCurrency: profileData.preferredCurrency || 'INR',
        timezone: profileData.timezone || 'Asia/Kolkata',
        dateFormat: profileData.dateFormat || 'DD/MM/YYYY',
        numberFormat: profileData.numberFormat || 'IN',
        language: profileData.language || 'en',
        theme: profileData.theme || 'light',
        emailNotifications: profileData.emailNotifications ?? true,
        smsNotifications: profileData.smsNotifications ?? false,
        pushNotifications: profileData.pushNotifications ?? true,
        whatsappNotifications: profileData.whatsappNotifications ?? false,
        budgetAlerts: profileData.budgetAlerts ?? true,
        billReminders: profileData.billReminders ?? true,
        investmentAlerts: profileData.investmentAlerts ?? true,
        weeklySummary: profileData.weeklySummary ?? true,
        monthlyReport: profileData.monthlyReport ?? true
      });
    } catch (error) {
      console.error('Error loading profile, using default settings:', error);
      // Use default profile data when API is not available
      const defaultProfile = {
        preferredCurrency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'IN',
        language: 'en',
        theme: 'light',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        whatsappNotifications: false,
        budgetAlerts: true,
        billReminders: true,
        investmentAlerts: true,
        weeklySummary: true,
        monthlyReport: true
      };
      setProfile(defaultProfile);
      setFormData(defaultProfile);
      setMessage('Using default profile settings (API not available)');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableOptions = async () => {
    try {
      const [currenciesResponse, themesResponse] = await Promise.all([
        api.makeRequest('/api/profile/currencies', 'GET'),
        api.makeRequest('/api/profile/themes', 'GET')
      ]);
      
      setAvailableCurrencies(currenciesResponse.currencies);
      setAvailableThemes(themesResponse.themes);
    } catch (error) {
      console.error('Error loading options, using fallback data:', error);
      // Fallback data
      setAvailableCurrencies({
        'INR': 'Indian Rupee (₹)',
        'USD': 'US Dollar ($)',
        'EUR': 'Euro (€)',
        'GBP': 'British Pound (£)',
        'JPY': 'Japanese Yen (¥)',
        'AUD': 'Australian Dollar (A$)',
        'CAD': 'Canadian Dollar (C$)',
        'CHF': 'Swiss Franc (CHF)',
        'CNY': 'Chinese Yuan (¥)',
        'SGD': 'Singapore Dollar (S$)'
      });
      setAvailableThemes({
        'light': 'Light Theme',
        'dark': 'Dark Theme',
        'auto': 'Auto (System)'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      await api.updateUserProfile(formData);
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      
      // Reload profile to get updated data
      await loadProfile();
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Error saving profile settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This will set your currency to INR and timezone to IST.')) {
      try {
        setSaving(true);
        await api.makeRequest('/api/profile/reset', 'POST');
        setMessage('Profile reset to defaults successfully!');
        setTimeout(() => setMessage(''), 3000);
        await loadProfile();
      } catch (error) {
        console.error('Error resetting profile:', error);
        setMessage('Error resetting profile');
      } finally {
        setSaving(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    const currency = formData.preferredCurrency;
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p>Manage your personal preferences and notification settings</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        {/* Currency & Localization Settings */}
        <div className="settings-section">
          <h2>Currency & Localization</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label htmlFor="preferredCurrency">Preferred Currency</label>
              <GlassDropdown
                value={formData.preferredCurrency}
                onChange={(value) => handleInputChange('preferredCurrency', value)}
                options={Object.entries(availableCurrencies).map(([code, name]) => ({
                  value: code,
                  label: name
                }))}
                variant="primary"
                size="medium"
                searchable={true}
                className="form-dropdown"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(59, 130, 246, 0.4)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              />
              <small>Default: Indian Rupee (₹) - Example: {formatCurrency(10000)}</small>
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <GlassDropdown
                value={formData.timezone}
                onChange={(value) => handleInputChange('timezone', value)}
                options={[
                  { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
                  { value: 'America/New_York', label: 'Eastern Time (ET)' },
                  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
                  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
                  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
                  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
                ]}
                variant="primary"
                size="medium"
                searchable={true}
                className="form-dropdown"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dateFormat">Date Format</label>
              <GlassDropdown
                value={formData.dateFormat}
                onChange={(value) => handleInputChange('dateFormat', value)}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (Indian format)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US format)' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO format)' }
                ]}
                variant="primary"
                size="medium"
                className="form-dropdown"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberFormat">Number Format</label>
              <GlassDropdown
                value={formData.numberFormat}
                onChange={(value) => handleInputChange('numberFormat', value)}
                options={[
                  { value: 'IN', label: 'Indian (1,00,000 - Lakhs/Crores)' },
                  { value: 'US', label: 'US (100,000 - Thousands/Millions)' },
                  { value: 'EU', label: 'European (100.000 - Thousands/Millions)' }
                ]}
                variant="primary"
                size="medium"
                className="form-dropdown"
              />
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="settings-grid">
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <GlassDropdown
                value={formData.theme}
                onChange={(value) => handleInputChange('theme', value)}
                options={Object.entries(availableThemes).map(([code, name]) => ({
                  value: code,
                  label: name
                }))}
                variant="primary"
                size="medium"
                className="form-dropdown"
              />
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <GlassDropdown
                value={formData.language}
                onChange={(value) => handleInputChange('language', value)}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'hi', label: 'हिन्दी (Hindi)' },
                  { value: 'es', label: 'Español' },
                  { value: 'fr', label: 'Français' },
                  { value: 'de', label: 'Deutsch' }
                ]}
                variant="primary"
                size="medium"
                className="form-dropdown"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="settings-section">
          <h2>Notification Preferences</h2>
          <div className="notification-grid">
            <div className="notification-category">
              <h3>Communication Channels</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Email Notifications
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications}
                    onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  SMS Notifications
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.pushNotifications}
                    onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Push Notifications
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.whatsappNotifications}
                    onChange={(e) => handleInputChange('whatsappNotifications', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  WhatsApp Notifications (India)
                </label>
              </div>
            </div>

            <div className="notification-category">
              <h3>Alert Types</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.budgetAlerts}
                    onChange={(e) => handleInputChange('budgetAlerts', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Budget Alerts
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.billReminders}
                    onChange={(e) => handleInputChange('billReminders', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Bill Reminders
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.investmentAlerts}
                    onChange={(e) => handleInputChange('investmentAlerts', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Investment Alerts
                </label>
              </div>
            </div>

            <div className="notification-category">
              <h3>Reports</h3>
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.weeklySummary}
                    onChange={(e) => handleInputChange('weeklySummary', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Weekly Summary
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.monthlyReport}
                    onChange={(e) => handleInputChange('monthlyReport', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Monthly Report
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleReset}
            disabled={saving}
            className="btn btn-secondary"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;