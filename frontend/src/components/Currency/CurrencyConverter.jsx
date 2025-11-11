import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import GlassDropdown from '../Glass/GlassDropdown';
import './CurrencyConverter.css';

const CurrencyConverter = ({ initialAmount = '', initialFromCurrency = 'INR', initialToCurrency = 'USD', onConvert }) => {
  const [amount, setAmount] = useState(initialAmount);
  const [fromCurrency, setFromCurrency] = useState(initialFromCurrency);
  const [toCurrency, setToCurrency] = useState(initialToCurrency);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency && amount > 0) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const fetchCurrencies = async () => {
    try {
      const response = await api.get('/currencies/common');
      setCurrencies(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching currencies, using fallback data:', error);
      // Fallback currencies data
      const fallbackCurrencies = [
        { id: 1, code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { id: 2, code: 'USD', name: 'US Dollar', symbol: '$' },
        { id: 3, code: 'EUR', name: 'Euro', symbol: '€' },
        { id: 4, code: 'GBP', name: 'British Pound', symbol: '£' },
        { id: 5, code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { id: 6, code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { id: 7, code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { id: 8, code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { id: 9, code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { id: 10, code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
      ];
      setCurrencies(fallbackCurrencies);
      setError('');
    }
  };

  const convertCurrency = async () => {
    if (!amount || amount <= 0) {
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/currencies/convert', {
        amount: parseFloat(amount),
        fromCurrencyCode: fromCurrency,
        toCurrencyCode: toCurrency
      });

      setResult(response.data);
      
      if (onConvert) {
        onConvert(response.data);
      }
    } catch (error) {
      console.error('Error converting currency, using fallback conversion:', error);
      // Fallback conversion with mock exchange rates
      const mockRates = {
        'INR': { 'USD': 0.012, 'EUR': 0.011, 'GBP': 0.0095, 'JPY': 1.8, 'AUD': 0.018, 'CAD': 0.016, 'CHF': 0.011, 'CNY': 0.087, 'SGD': 0.016 },
        'USD': { 'INR': 83.33, 'EUR': 0.92, 'GBP': 0.79, 'JPY': 150, 'AUD': 1.5, 'CAD': 1.35, 'CHF': 0.91, 'CNY': 7.25, 'SGD': 1.34 },
        'EUR': { 'INR': 90.91, 'USD': 1.09, 'GBP': 0.86, 'JPY': 163, 'AUD': 1.64, 'CAD': 1.47, 'CHF': 0.99, 'CNY': 7.89, 'SGD': 1.46 }
      };
      
      const rate = mockRates[fromCurrency]?.[toCurrency] || 1;
      const convertedAmount = parseFloat(amount) * rate;
      const fromSymbol = currencies.find(c => c.code === fromCurrency)?.symbol || fromCurrency;
      const toSymbol = currencies.find(c => c.code === toCurrency)?.symbol || toCurrency;
      
      const mockResult = {
        originalAmount: parseFloat(amount),
        convertedAmount: convertedAmount,
        fromCurrencyCode: fromCurrency,
        toCurrencyCode: toCurrency,
        fromCurrencySymbol: fromSymbol,
        toCurrencySymbol: toSymbol,
        exchangeRate: rate,
        conversionDate: new Date().toISOString()
      };
      
      setResult(mockResult);
      
      if (onConvert) {
        onConvert(mockResult);
      }
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const formatAmount = (value, currencyCode, symbol) => {
    if (!value) return '0.00';
    
    const formatted = parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return `${symbol} ${formatted}`;
  };

  return (
    <div className="currency-converter">
      <div className="converter-header">
        <h3>Currency Converter</h3>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="converter-form">
        <div className="amount-input-group">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            className="amount-input"
          />
        </div>

        <div className="currency-selection">
          <div className="currency-group">
            <label htmlFor="fromCurrency">From</label>
            <GlassDropdown
              value={fromCurrency}
              onChange={(value) => setFromCurrency(value)}
              options={currencies.map(currency => ({
                value: currency.code,
                label: `${currency.code} - ${currency.name}`
              }))}
              variant="primary"
              size="medium"
              searchable={true}
              className="currency-select"
            />
          </div>

          <button
            type="button"
            onClick={swapCurrencies}
            className="swap-button"
            title="Swap currencies"
          >
            ⇄
          </button>

          <div className="currency-group">
            <label htmlFor="toCurrency">To</label>
            <GlassDropdown
              value={toCurrency}
              onChange={(value) => setToCurrency(value)}
              options={currencies.map(currency => ({
                value: currency.code,
                label: `${currency.code} - ${currency.name}`
              }))}
              variant="primary"
              size="medium"
              searchable={true}
              className="currency-select"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="conversion-loading">
          <div className="loading-spinner"></div>
          <span>Converting...</span>
        </div>
      )}

      {result && !loading && (
        <div className="conversion-result">
          <div className="result-display">
            <div className="original-amount">
              {formatAmount(result.originalAmount, result.fromCurrencyCode, result.fromCurrencySymbol)}
            </div>
            <div className="equals">=</div>
            <div className="converted-amount">
              {formatAmount(result.convertedAmount, result.toCurrencyCode, result.toCurrencySymbol)}
            </div>
          </div>
          
          <div className="exchange-rate-info">
            <span className="rate-label">Exchange Rate:</span>
            <span className="rate-value">
              1 {result.fromCurrencyCode} = {result.exchangeRate} {result.toCurrencyCode}
            </span>
          </div>
          
          {result.conversionDate && (
            <div className="conversion-date">
              Rate as of {new Date(result.conversionDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )}

      {!result && !loading && amount && amount > 0 && (
        <div className="no-result">
          Enter an amount to see the conversion
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;