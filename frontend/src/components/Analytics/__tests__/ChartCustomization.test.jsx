import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChartCustomization from '../ChartCustomization';
import { chartPreferences } from '../../../services/chartPreferences';
import { chartExport } from '../../../services/chartExport';

// Mock the services
jest.mock('../../../services/chartPreferences');
jest.mock('../../../services/chartExport');

// Mock Chart.js
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  BarElement: jest.fn(),
  ArcElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

describe('ChartCustomization', () => {
  const mockChartRef = {
    current: {
      canvas: document.createElement('canvas'),
      chartInstance: {
        canvas: document.createElement('canvas')
      }
    }
  };

  const defaultProps = {
    chartRef: mockChartRef,
    chartName: 'monthlyTrends',
    chartTitle: 'Monthly Trends',
    onPreferenceChange: jest.fn()
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock chartPreferences
    chartPreferences.getPreferences.mockReturnValue({
      chartTypes: { monthlyTrends: 'line' },
      colors: { theme: 'default' },
      display: {
        showLegend: true,
        showGridLines: true,
        showDataLabels: false,
        animationEnabled: true
      },
      export: {
        defaultFormat: 'png',
        quality: 'high',
        includeTitle: true,
        includeWatermark: false
      }
    });

    chartPreferences.setChartType.mockReturnValue(true);
    chartPreferences.setDisplayPreference.mockReturnValue(true);
    chartPreferences.setColorTheme.mockReturnValue(true);
  });

  test('renders customization toggle button', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('⚙️');
  });

  test('opens customization panel when toggle is clicked', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Chart Options')).toBeInTheDocument();
    expect(screen.getByText('Chart Type')).toBeInTheDocument();
    expect(screen.getByText('Color Theme')).toBeInTheDocument();
    expect(screen.getByText('Display Options')).toBeInTheDocument();
    expect(screen.getByText('Export & Share')).toBeInTheDocument();
  });

  test('closes customization panel when close button is clicked', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    // Open panel
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    // Close panel
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(screen.queryByText('Chart Type')).not.toBeInTheDocument();
  });

  test('displays correct chart type options for monthlyTrends', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Line Chart')).toBeInTheDocument();
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Area Chart')).toBeInTheDocument();
  });

  test('handles chart type change', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const barChartButton = screen.getByText('Bar Chart');
    fireEvent.click(barChartButton);
    
    expect(chartPreferences.setChartType).toHaveBeenCalledWith('monthlyTrends', 'bar');
    expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('chartType', 'bar');
  });

  test('handles color theme change', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const colorfulThemeButton = screen.getByText('Colorful');
    fireEvent.click(colorfulThemeButton);
    
    expect(chartPreferences.setColorTheme).toHaveBeenCalledWith('colorful');
    expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('colorTheme', 'colorful');
  });

  test('handles display preference changes', () => {
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const legendCheckbox = screen.getByLabelText('Show Legend');
    fireEvent.click(legendCheckbox);
    
    expect(chartPreferences.setDisplayPreference).toHaveBeenCalledWith('showLegend', false);
    expect(defaultProps.onPreferenceChange).toHaveBeenCalledWith('showLegend', false);
  });

  test('handles PNG export', async () => {
    chartExport.exportAsPNG.mockResolvedValue(new Blob());
    
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const pngButton = screen.getByText('🖼️ PNG');
    fireEvent.click(pngButton);
    
    await waitFor(() => {
      expect(chartExport.exportAsPNG).toHaveBeenCalledWith(
        mockChartRef,
        expect.stringContaining('monthlyTrends'),
        expect.objectContaining({
          title: 'Monthly Trends',
          includeTitle: true,
          includeWatermark: false
        })
      );
    });
  });

  test('handles SVG export', async () => {
    chartExport.exportAsSVG.mockResolvedValue(new Blob());
    
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const svgButton = screen.getByText('🎨 SVG');
    fireEvent.click(svgButton);
    
    await waitFor(() => {
      expect(chartExport.exportAsSVG).toHaveBeenCalledWith(
        mockChartRef,
        expect.stringContaining('monthlyTrends'),
        expect.objectContaining({
          title: 'Monthly Trends'
        })
      );
    });
  });

  test('handles share functionality', async () => {
    chartExport.createShareableLink.mockResolvedValue('data:image/png;base64,test');
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue()
      }
    });
    
    // Mock alert
    window.alert = jest.fn();
    
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const shareButton = screen.getByText('📋 Copy');
    fireEvent.click(shareButton);
    
    await waitFor(() => {
      expect(chartExport.createShareableLink).toHaveBeenCalledWith(
        mockChartRef,
        expect.objectContaining({
          title: 'Monthly Trends',
          width: 800,
          height: 600
        })
      );
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('data:image/png;base64,test');
      expect(window.alert).toHaveBeenCalledWith('Chart image copied to clipboard!');
    });
  });

  test('shows error when chart ref is not available for export', async () => {
    const propsWithoutRef = {
      ...defaultProps,
      chartRef: { current: null }
    };
    
    window.alert = jest.fn();
    
    render(<ChartCustomization {...propsWithoutRef} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const pngButton = screen.getByText('🖼️ PNG');
    fireEvent.click(pngButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Chart is not ready for export');
    });
  });

  test('handles export error gracefully', async () => {
    chartExport.exportAsPNG.mockRejectedValue(new Error('Export failed'));
    
    window.alert = jest.fn();
    
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const pngButton = screen.getByText('🖼️ PNG');
    fireEvent.click(pngButton);
    
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Export failed: Export failed');
    });
  });

  test('displays different chart types for different chart names', () => {
    const categoryProps = {
      ...defaultProps,
      chartName: 'categoryBreakdown'
    };
    
    render(<ChartCustomization {...categoryProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Pie Chart')).toBeInTheDocument();
    expect(screen.getByText('Doughnut Chart')).toBeInTheDocument();
    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
  });

  test('shows loading state during export', async () => {
    chartExport.exportAsPNG.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
    );
    
    render(<ChartCustomization {...defaultProps} />);
    
    const toggleButton = screen.getByTitle('Chart Options');
    fireEvent.click(toggleButton);
    
    const pngButton = screen.getByText('🖼️ PNG');
    fireEvent.click(pngButton);
    
    // Check for loading state
    expect(screen.getByText('⏳ PNG')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('🖼️ PNG')).toBeInTheDocument();
    });
  });
});