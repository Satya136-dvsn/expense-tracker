// Chart preferences service for storing user customization settings
class ChartPreferencesService {
  constructor() {
    this.storageKey = 'chartPreferences';
    this.defaultPreferences = {
      chartTypes: {
        monthlyTrends: 'line', // line, bar, area
        categoryBreakdown: 'pie', // pie, doughnut, bar
        budgetVsActual: 'bar', // bar, line
        savingsProgress: 'bar' // bar, line, radial
      },
      colors: {
        theme: 'default', // default, colorful, monochrome, custom
        customColors: []
      },
      display: {
        showLegend: true,
        showTooltips: true,
        showGridLines: true,
        showDataLabels: false,
        animationEnabled: true
      },
      export: {
        defaultFormat: 'png', // png, svg, pdf
        quality: 'high', // low, medium, high
        includeTitle: true,
        includeWatermark: false
      }
    };
  }

  // Get all preferences
  getPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...this.defaultPreferences, ...parsed };
      }
    } catch (error) {
      console.error('Error loading chart preferences:', error);
    }
    return { ...this.defaultPreferences };
  }

  // Save preferences
  savePreferences(preferences) {
    try {
      const merged = { ...this.getPreferences(), ...preferences };
      localStorage.setItem(this.storageKey, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error('Error saving chart preferences:', error);
      return false;
    }
  }

  // Get specific preference
  getPreference(key) {
    const preferences = this.getPreferences();
    return this.getNestedValue(preferences, key);
  }

  // Set specific preference
  setPreference(key, value) {
    const preferences = this.getPreferences();
    this.setNestedValue(preferences, key, value);
    return this.savePreferences(preferences);
  }

  // Get chart type preference
  getChartType(chartName) {
    return this.getPreference(`chartTypes.${chartName}`) || 'line';
  }

  // Set chart type preference
  setChartType(chartName, type) {
    return this.setPreference(`chartTypes.${chartName}`, type);
  }

  // Get color theme
  getColorTheme() {
    return this.getPreference('colors.theme') || 'default';
  }

  // Set color theme
  setColorTheme(theme) {
    return this.setPreference('colors.theme', theme);
  }

  // Get display preferences
  getDisplayPreferences() {
    return this.getPreference('display') || this.defaultPreferences.display;
  }

  // Set display preference
  setDisplayPreference(key, value) {
    return this.setPreference(`display.${key}`, value);
  }

  // Get export preferences
  getExportPreferences() {
    return this.getPreference('export') || this.defaultPreferences.export;
  }

  // Set export preference
  setExportPreference(key, value) {
    return this.setPreference(`export.${key}`, value);
  }

  // Reset to defaults
  resetToDefaults() {
    try {
      localStorage.removeItem(this.storageKey);
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }

  // Helper methods
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Export preferences as JSON
  exportPreferences() {
    const preferences = this.getPreferences();
    const blob = new Blob([JSON.stringify(preferences, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chart-preferences.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import preferences from JSON
  importPreferences(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const preferences = JSON.parse(e.target.result);
          if (this.savePreferences(preferences)) {
            resolve(preferences);
          } else {
            reject(new Error('Failed to save imported preferences'));
          }
        } catch (error) {
          reject(new Error('Invalid preferences file format'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Create singleton instance
export const chartPreferences = new ChartPreferencesService();
export default chartPreferences;