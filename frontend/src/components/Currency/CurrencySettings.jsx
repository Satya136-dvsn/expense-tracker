import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './CurrencySettings.css';

const CurrencySettings = ({ onClose, onSave }) => {
  const [currencies, setCurrencies] = useState([]);
  const [commonCurrencies, setCommonCurrencies] = useState([]);
  const [selectedBaseCurrency, setSelectedBaseCurrency] = useState('INR');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCurrencies, setShowAllCurrencies] = useState(false);

  useEffect(() => {
    fetchCurrencies();
    fetchUserBaseCurrency();
  }, []);

  const fetchCurrencies = async () => {
    try {
      const [commonResponse, allResponse] = await Promise.all([
        api.get('/currencies/common'),
        api.get('/currencies')
      ]);
      
      setCommonCurrencies(commonResponse.data);
      setCurrencies(allResponse.data);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      // Fallback to mock data with INR first
      const mockCurrencies = [
        { id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { id: 2, code: 'USD', name: 'US Dollar', symbol: '$' },
        { id: 3, code: 'EUR', name: 'Euro', symbol: '€' },
        { id: 4, code: 'GBP', name: 'British Pound', symbol: '£' },
        { id: 5, code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
      ];
      setCommonCurrencies(mockCurrencies);
      setCurrencies(mockCurrencies);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBaseCurrency = async () => {
    try {
      // Get user's current base currency from profile or settings
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      if (userProfile.baseCurrencyCode) {
        setSelectedBaseCurrency(userProfile.baseCurrencyCode);
      } else {
        // Default to INR if no preference is set
        setSelectedBaseCurrency('INR');
      }
    } catch (error) {
      console.error('Error fetching user base currency:', error);
    }
  };

  const handleSave = async () => {
    try {
      // Save the base currency to user profile
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      userProfile.baseCurrencyCode = selectedBaseCurrency;
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Call parent save handler
      if (onSave) {
        onSave(selectedBaseCurrency);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving currency settings:', error);
      setError('Failed to save currency settings');
    }
  };

  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayCurrencies = showAllCurrencies ? filteredCurrencies : commonCurrencies;

  if (loading) {
    return (
      <div className="currency-settings-modal">
        <div className="currency-settings-content">
          <div className="loading-spinner">Loading currencies...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="currency-settings-modal">
      <div className="currency-settings-content">
        <div className="currency-settings-header">
          <h2>Currency Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="currency-settings-body">
          <div className="setting-section">
            <h3>Base Currency</h3>
            <p>Select your primary currency for displaying amounts and calculations.</p>
            
            <div className="currency-search">
              <input
                type="text"
                placeholder="Search currencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <div className="currency-toggle">
                <button
                  className={!showAllCurrencies ? 'active' : ''}
                  onClick={() => setShowAllCurrencies(false)}
                >
                  Common
                </button>
                <button
                  className={showAllCurrencies ? 'active' : ''}
                  onClick={() => setShowAllCurrencies(true)}
                >
                  All Currencies
                </button>
              </div>
            </div>

            <div className="currency-list">
              {displayCurrencies.map(currency => (
                <div
                  key={currency.id}
                  className={`currency-item ${selectedBaseCurrency === currency.code ? 'selected' : ''}`}
                  onClick={() => setSelectedBaseCurrency(currency.code)}
                >
                  <div className="currency-info">
                    <span className="currency-code">{currency.code}</span>
                    <span className="currency-symbol">{currency.symbol}</span>
                    <span className="currency-name">{currency.name}</span>
                  </div>
                  {selectedBaseCurrency === currency.code && (
                    <div className="selected-indicator">✓</div>
                  )}
                </div>
              ))}
            </div>

            {displayCurrencies.length === 0 && searchQuery && (
              <div className="no-results">
                No currencies found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        <div className="currency-settings-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CurrencySettings;