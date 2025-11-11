import React, { useState, useEffect } from 'react';
import { chartPreferences } from '../../services/chartPreferences';
import { chartExport } from '../../services/chartExport';
import './ChartCustomization.css';

const ChartCustomization = ({ 
  chartRef, 
  chartName, 
  chartTitle,
  onPreferenceChange,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    const prefs = chartPreferences.getPreferences();
    setPreferences(prefs);
  };

  const handleChartTypeChange = (newType) => {
    chartPreferences.setChartType(chartName, newType);
    loadPreferences();
    if (onPreferenceChange) {
      onPreferenceChange('chartType', newType);
    }
  };

  const handleDisplayPreferenceChange = (key, value) => {
    chartPreferences.setDisplayPreference(key, value);
    loadPreferences();
    if (onPreferenceChange) {
      onPreferenceChange(key, value);
    }
  };

  const handleColorThemeChange = (theme) => {
    chartPreferences.setColorTheme(theme);
    loadPreferences();
    if (onPreferenceChange) {
      onPreferenceChange('colorTheme', theme);
    }
  };

  const handleExport = async (format) => {
    if (!chartRef || !chartRef.current) {
      alert('Chart is not ready for export');
      return;
    }

    setExporting(true);
    try {
      const filename = `${chartName}-${new Date().toISOString().split('T')[0]}`;
      const options = {
        title: chartTitle,
        includeTitle: preferences.export?.includeTitle !== false,
        includeWatermark: preferences.export?.includeWatermark === true,
        quality: preferences.export?.quality === 'high' ? 0.95 : 0.8
      };

      if (format === 'png') {
        await chartExport.exportAsPNG(chartRef, filename, options);
      } else if (format === 'svg') {
        await chartExport.exportAsSVG(chartRef, filename, options);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleShare = async () => {
    if (!chartRef || !chartRef.current) {
      alert('Chart is not ready for sharing');
      return;
    }

    try {
      const dataUrl = await chartExport.createShareableLink(chartRef, {
        title: chartTitle,
        width: 800,
        height: 600
      });
      
      // Copy to clipboard
      await navigator.clipboard.writeText(dataUrl);
      alert('Chart image copied to clipboard!');
    } catch (error) {
      console.error('Share failed:', error);
      alert('Share failed: ' + error.message);
    }
  };

  const getAvailableChartTypes = () => {
    switch (chartName) {
      case 'monthlyTrends':
        return [
          { value: 'line', label: 'Line Chart', icon: '📈' },
          { value: 'bar', label: 'Bar Chart', icon: '📊' },
          { value: 'area', label: 'Area Chart', icon: '🏔️' }
        ];
      case 'categoryBreakdown':
        return [
          { value: 'pie', label: 'Pie Chart', icon: '🥧' },
          { value: 'doughnut', label: 'Doughnut Chart', icon: '🍩' },
          { value: 'bar', label: 'Bar Chart', icon: '📊' }
        ];
      case 'budgetVsActual':
        return [
          { value: 'bar', label: 'Bar Chart', icon: '📊' },
          { value: 'line', label: 'Line Chart', icon: '📈' }
        ];
      case 'savingsProgress':
        return [
          { value: 'bar', label: 'Bar Chart', icon: '📊' },
          { value: 'line', label: 'Line Chart', icon: '📈' },
          { value: 'radial', label: 'Radial Chart', icon: '🎯' }
        ];
      default:
        return [
          { value: 'line', label: 'Line Chart', icon: '📈' },
          { value: 'bar', label: 'Bar Chart', icon: '📊' }
        ];
    }
  };

  const currentChartType = preferences.chartTypes?.[chartName] || 'line';
  const displayPrefs = preferences.display || {};
  const colorTheme = preferences.colors?.theme || 'default';

  return (
    <div className={`chart-customization ${className}`}>
      <button 
        className="customization-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Chart Options"
      >
        ⚙️
      </button>

      {isOpen && (
        <div className="customization-panel">
          <div className="customization-header">
            <h4>Chart Options</h4>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="customization-content">
            {/* Chart Type Selection */}
            <div className="customization-section">
              <label className="section-label">Chart Type</label>
              <div className="chart-type-grid">
                {getAvailableChartTypes().map(type => (
                  <button
                    key={type.value}
                    className={`chart-type-btn ${currentChartType === type.value ? 'active' : ''}`}
                    onClick={() => handleChartTypeChange(type.value)}
                    title={type.label}
                  >
                    <span className="chart-type-icon">{type.icon}</span>
                    <span className="chart-type-label">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Theme Selection */}
            <div className="customization-section">
              <label className="section-label">Color Theme</label>
              <div className="color-theme-grid">
                {[
                  { value: 'default', label: 'Default', colors: ['#10b981', '#3b82f6', '#8b5cf6'] },
                  { value: 'colorful', label: 'Colorful', colors: ['#ef4444', '#f59e0b', '#22c55e'] },
                  { value: 'monochrome', label: 'Monochrome', colors: ['#374151', '#6b7280', '#9ca3af'] }
                ].map(theme => (
                  <button
                    key={theme.value}
                    className={`color-theme-btn ${colorTheme === theme.value ? 'active' : ''}`}
                    onClick={() => handleColorThemeChange(theme.value)}
                  >
                    <div className="color-preview">
                      {theme.colors.map((color, index) => (
                        <div 
                          key={index}
                          className="color-dot"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="color-theme-label">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display Options */}
            <div className="customization-section">
              <label className="section-label">Display Options</label>
              <div className="display-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={displayPrefs.showLegend !== false}
                    onChange={(e) => handleDisplayPreferenceChange('showLegend', e.target.checked)}
                  />
                  <span className="checkbox-text">Show Legend</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={displayPrefs.showGridLines !== false}
                    onChange={(e) => handleDisplayPreferenceChange('showGridLines', e.target.checked)}
                  />
                  <span className="checkbox-text">Show Grid Lines</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={displayPrefs.showDataLabels === true}
                    onChange={(e) => handleDisplayPreferenceChange('showDataLabels', e.target.checked)}
                  />
                  <span className="checkbox-text">Show Data Labels</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={displayPrefs.animationEnabled !== false}
                    onChange={(e) => handleDisplayPreferenceChange('animationEnabled', e.target.checked)}
                  />
                  <span className="checkbox-text">Enable Animations</span>
                </label>
              </div>
            </div>

            {/* Export Options */}
            <div className="customization-section">
              <label className="section-label">Export & Share</label>
              <div className="export-buttons">
                <button
                  className="export-btn"
                  onClick={() => handleExport('png')}
                  disabled={exporting}
                  title="Export as PNG"
                >
                  {exporting ? '⏳' : '🖼️'} PNG
                </button>
                <button
                  className="export-btn"
                  onClick={() => handleExport('svg')}
                  disabled={exporting}
                  title="Export as SVG"
                >
                  {exporting ? '⏳' : '🎨'} SVG
                </button>
                <button
                  className="export-btn"
                  onClick={handleShare}
                  title="Copy to Clipboard"
                >
                  📋 Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartCustomization;