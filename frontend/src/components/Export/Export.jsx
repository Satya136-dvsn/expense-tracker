import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import GlassCard from '../Glass/GlassCard';
import GlassButton from '../Glass/GlassButton';
import GlassInput from '../Glass/GlassInput';
import './Export.css';

const Export = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingType, setExportingType] = useState('');
  
  // Export customization options
  const [selectedFormat, setSelectedFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeBudgets, setIncludeBudgets] = useState(true);
  const [includeSavingsGoals, setIncludeSavingsGoals] = useState(true);
  const [exportHistory, setExportHistory] = useState([]);
  
  // Date range presets
  const datePresets = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 3 months', days: 90 },
    { label: 'Last 6 months', days: 180 },
    { label: 'Last year', days: 365 },
    { label: 'All time', days: null }
  ];

  useEffect(() => {
    // Load export history from localStorage
    const savedHistory = localStorage.getItem('exportHistory');
    if (savedHistory) {
      setExportHistory(JSON.parse(savedHistory));
    }
  }, []);

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const generateFilename = (type, extension) => {
    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `${type}-${dateStr}`;
    
    if (startDate && endDate) {
      filename = `${type}-${startDate}-to-${endDate}`;
    }
    
    return `${filename}.${extension}`;
  };

  const addToExportHistory = (type, format, filename) => {
    const historyItem = {
      id: Date.now(),
      type,
      format,
      filename,
      dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'All time',
      exportedAt: new Date().toISOString(),
      size: 'Unknown' // Could be enhanced to track actual file size
    };
    
    const newHistory = [historyItem, ...exportHistory.slice(0, 9)]; // Keep last 10 exports
    setExportHistory(newHistory);
    localStorage.setItem('exportHistory', JSON.stringify(newHistory));
  };

  const simulateProgress = (duration = 3000) => {
    setExportProgress(0);
    const interval = 100;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 95) {
        clearInterval(progressInterval);
        setExportProgress(95); // Leave at 95% until actual completion
      } else {
        setExportProgress(currentProgress);
      }
    }, interval);
    
    return progressInterval;
  };

  const handleExportTransactionsPdf = async () => {
    try {
      setLoading(true);
      setExportingType('Transactions PDF');
      setError(null);
      setSuccess(null);
      
      const progressInterval = simulateProgress();

      const blob = await apiService.exportTransactionsPdf(startDate, endDate);
      const filename = generateFilename('transactions', 'pdf');
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      downloadFile(blob, filename);
      addToExportHistory('Transactions', 'PDF', filename);
      
      setSuccess('Transactions exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting transactions PDF:', error);
      setError('Failed to export transactions to PDF: ' + error.message);
    } finally {
      setLoading(false);
      setExportingType('');
      setExportProgress(0);
    }
  };

  const handleExportTransactionsCsv = async () => {
    try {
      setLoading(true);
      setExportingType('Transactions CSV');
      setError(null);
      setSuccess(null);
      
      const progressInterval = simulateProgress();

      const blob = await apiService.exportTransactionsCsv(startDate, endDate);
      const filename = generateFilename('transactions', 'csv');
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      downloadFile(blob, filename);
      addToExportHistory('Transactions', 'CSV', filename);
      
      setSuccess('Transactions exported to CSV successfully!');
    } catch (error) {
      console.error('Error exporting transactions CSV:', error);
      setError('Failed to export transactions to CSV: ' + error.message);
    } finally {
      setLoading(false);
      setExportingType('');
      setExportProgress(0);
    }
  };

  const handleExportAnalyticsPdf = async () => {
    try {
      setLoading(true);
      setExportingType('Analytics Report');
      setError(null);
      setSuccess(null);
      
      const progressInterval = simulateProgress();

      const blob = await apiService.exportAnalyticsPdf();
      const filename = generateFilename('financial-analytics', 'pdf');
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      downloadFile(blob, filename);
      addToExportHistory('Analytics', 'PDF', filename);
      
      setSuccess('Analytics report exported to PDF successfully!');
    } catch (error) {
      console.error('Error exporting analytics PDF:', error);
      setError('Failed to export analytics report: ' + error.message);
    } finally {
      setLoading(false);
      setExportingType('');
      setExportProgress(0);
    }
  };

  // New comprehensive export function
  const handleComprehensiveExport = async () => {
    try {
      setLoading(true);
      setExportingType('Comprehensive Report');
      setError(null);
      setSuccess(null);
      
      const progressInterval = simulateProgress(5000); // Longer for comprehensive report

      // This would call a new API endpoint for comprehensive reports
      const blob = await apiService.exportComprehensiveReport(startDate, endDate);
      const filename = generateFilename('comprehensive-report', 'pdf');
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      downloadFile(blob, filename);
      addToExportHistory('Comprehensive Report', 'PDF', filename);
      
      setSuccess('Comprehensive report exported successfully!');
    } catch (error) {
      console.error('Error exporting comprehensive report:', error);
      setError('Failed to export comprehensive report: ' + error.message);
    } finally {
      setLoading(false);
      setExportingType('');
      setExportProgress(0);
    }
  };

  // New Excel export function
  const handleExportToExcel = async () => {
    try {
      setLoading(true);
      setExportingType('Excel Workbook');
      setError(null);
      setSuccess(null);
      
      const progressInterval = simulateProgress(4000);

      // This would call a new API endpoint for Excel export
      const blob = await apiService.exportToExcel(startDate, endDate);
      const filename = generateFilename('financial-data', 'xlsx');
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      downloadFile(blob, filename);
      addToExportHistory('Financial Data', 'Excel', filename);
      
      setSuccess('Data exported to Excel successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setError('Failed to export to Excel: ' + error.message);
    } finally {
      setLoading(false);
      setExportingType('');
      setExportProgress(0);
    }
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const setQuickDateRange = (days) => {
    if (days === null) {
      clearDateRange();
      return;
    }
    
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExportTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'transactions': return '📊';
      case 'analytics': return '📈';
      case 'comprehensive report': return '📋';
      case 'financial data': return '💾';
      default: return '📄';
    }
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf': return '📄';
      case 'csv': return '📊';
      case 'excel': return '📗';
      default: return '📄';
    }
  };

  return (
    <div className="export-page">
      <div className="export-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="header-title">
            <h1>Export Data</h1>
            <p>Download your financial data and reports</p>
          </div>
        </div>
      </div>

      <div className="export-content">
        {/* Progress Indicator */}
        {loading && (
          <div className="export-card progress">
            <div className="progress-content">
              <div className="progress-header">
                <span className="progress-icon">⏳</span>
                <div>
                  <h4>Exporting {exportingType}</h4>
                  <p>Please wait while we prepare your export...</p>
                </div>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{Math.round(exportProgress)}%</span>
              </div>
              <LoadingSpinner size="small" message="" />
            </div>
          </div>
        )}

        {/* Date Range Selection */}
        <div className="export-card">
          <h3>📅 Date Range Selection</h3>
          <p>Choose a date range for your exports (optional)</p>
          
          <div className="date-range-section">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                  disabled={loading}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="quick-date-buttons">
              {datePresets.map((preset, index) => (
                <button 
                  key={index}
                  onClick={() => setQuickDateRange(preset.days)} 
                  className={`quick-date-btn ${preset.days === null ? 'clear' : ''}`}
                  disabled={loading}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            {(startDate || endDate) && (
              <div className="date-range-display">
                <span className="range-label">Selected range:</span>
                <span className="range-value">
                  {startDate ? formatDate(startDate) : 'Beginning'} to {endDate ? formatDate(endDate) : 'Now'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Export Format Selection */}
        <div className="export-card">
          <h3>🎯 Export Options</h3>
          <p>Customize your export preferences</p>
          
          <div className="export-customization">
            <div className="format-selection">
              <h4>Default Format</h4>
              <div className="format-options">
                <label className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={selectedFormat === 'pdf'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    disabled={loading}
                  />
                  <span className="format-label">📄 PDF</span>
                </label>
                <label className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value="excel"
                    checked={selectedFormat === 'excel'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    disabled={loading}
                  />
                  <span className="format-label">📗 Excel</span>
                </label>
                <label className="format-option">
                  <input
                    type="radio"
                    name="format"
                    value="csv"
                    checked={selectedFormat === 'csv'}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    disabled={loading}
                  />
                  <span className="format-label">📊 CSV</span>
                </label>
              </div>
            </div>

            <div className="include-options">
              <h4>Include in Export</h4>
              <div className="checkbox-options">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeAnalytics}
                    onChange={(e) => setIncludeAnalytics(e.target.checked)}
                    disabled={loading}
                  />
                  <span>📈 Analytics & Insights</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeBudgets}
                    onChange={(e) => setIncludeBudgets(e.target.checked)}
                    disabled={loading}
                  />
                  <span>💰 Budget Information</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeSavingsGoals}
                    onChange={(e) => setIncludeSavingsGoals(e.target.checked)}
                    disabled={loading}
                  />
                  <span>🎯 Savings Goals</span>
                </label>
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={includeCharts}
                    onChange={(e) => setIncludeCharts(e.target.checked)}
                    disabled={loading}
                  />
                  <span>📊 Charts & Visualizations</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Export Options */}
        <div className="export-card">
          <h3>🚀 Quick Exports</h3>
          <p>One-click exports for common use cases</p>
          
          <div className="export-options">
            <div className="export-option">
              <div className="export-option-info">
                <h4>📋 Comprehensive Report</h4>
                <p>Complete financial report with all data, analytics, and insights</p>
                <div className="option-features">
                  <span className="feature">✓ All transactions</span>
                  <span className="feature">✓ Budget analysis</span>
                  <span className="feature">✓ Savings progress</span>
                  <span className="feature">✓ Financial health</span>
                </div>
              </div>
              <button 
                onClick={handleComprehensiveExport}
                disabled={loading}
                className="export-btn comprehensive"
              >
                {loading && exportingType === 'Comprehensive Report' ? '⏳ Generating...' : '📋 Export Report'}
              </button>
            </div>
            
            <div className="export-option">
              <div className="export-option-info">
                <h4>📗 Excel Workbook</h4>
                <p>Multi-sheet Excel file with organized data for analysis</p>
                <div className="option-features">
                  <span className="feature">✓ Transactions sheet</span>
                  <span className="feature">✓ Budget sheet</span>
                  <span className="feature">✓ Goals sheet</span>
                  <span className="feature">✓ Summary sheet</span>
                </div>
              </div>
              <button 
                onClick={handleExportToExcel}
                disabled={loading}
                className="export-btn excel"
              >
                {loading && exportingType === 'Excel Workbook' ? '⏳ Creating...' : '📗 Export Excel'}
              </button>
            </div>
          </div>
        </div>

        {/* Individual Export Options */}
        <div className="export-card">
          <h3>📊 Individual Exports</h3>
          <p>Export specific data types</p>
          
          <div className="export-options">
            <div className="export-option">
              <div className="export-option-info">
                <h4>📄 Transaction Report</h4>
                <p>Detailed transaction history with summaries</p>
              </div>
              <div className="export-buttons">
                <button 
                  onClick={handleExportTransactionsPdf}
                  disabled={loading}
                  className="export-btn pdf small"
                >
                  {loading && exportingType === 'Transactions PDF' ? '⏳' : '📄'} PDF
                </button>
                <button 
                  onClick={handleExportTransactionsCsv}
                  disabled={loading}
                  className="export-btn csv small"
                >
                  {loading && exportingType === 'Transactions CSV' ? '⏳' : '📊'} CSV
                </button>
              </div>
            </div>
            
            <div className="export-option">
              <div className="export-option-info">
                <h4>📈 Analytics Report</h4>
                <p>Financial insights and trend analysis</p>
              </div>
              <div className="export-buttons">
                <button 
                  onClick={handleExportAnalyticsPdf}
                  disabled={loading}
                  className="export-btn analytics small"
                >
                  {loading && exportingType === 'Analytics Report' ? '⏳' : '📈'} PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Export History */}
        {exportHistory.length > 0 && (
          <div className="export-card">
            <h3>📚 Recent Exports</h3>
            <p>Your export history</p>
            
            <div className="export-history">
              {exportHistory.slice(0, 5).map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-icon">
                    {getExportTypeIcon(item.type)} {getFormatIcon(item.format)}
                  </div>
                  <div className="history-details">
                    <div className="history-name">{item.filename}</div>
                    <div className="history-meta">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.dateRange}</span>
                      <span>•</span>
                      <span>{formatDate(item.exportedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="export-card error">
            <div className="message-content">
              <span className="message-icon">⚠️</span>
              <div>
                <h4>Export Failed</h4>
                <p>{error}</p>
                <button 
                  onClick={() => setError(null)} 
                  className="dismiss-btn"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="export-card success">
            <div className="message-content">
              <span className="message-icon">✅</span>
              <div>
                <h4>Export Successful</h4>
                <p>{success}</p>
                <button 
                  onClick={() => setSuccess(null)} 
                  className="dismiss-btn"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Tips */}
        <div className="export-card tips">
          <h3>💡 Export Tips</h3>
          <div className="tips-grid">
            <div className="tip-item">
              <span className="tip-icon">📄</span>
              <div>
                <strong>PDF Reports</strong>
                <p>Best for sharing and printing with formatted layouts</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📗</span>
              <div>
                <strong>Excel Files</strong>
                <p>Perfect for detailed analysis with multiple data sheets</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">📊</span>
              <div>
                <strong>CSV Data</strong>
                <p>Raw data format compatible with all spreadsheet apps</p>
              </div>
            </div>
            <div className="tip-item">
              <span className="tip-icon">⏱️</span>
              <div>
                <strong>Processing Time</strong>
                <p>Larger date ranges and comprehensive reports take longer</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export;