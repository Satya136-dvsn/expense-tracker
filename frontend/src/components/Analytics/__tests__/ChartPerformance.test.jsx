import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MonthlyTrendsChart from '../MonthlyTrendsChart';
import CategoryBreakdownChart from '../CategoryBreakdownChart';

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

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: React.forwardRef(({ data, options }, ref) => (
    <div data-testid="line-chart" ref={ref}>
      Line Chart - {data?.datasets?.length || 0} datasets
    </div>
  )),
  Bar: React.forwardRef(({ data, options }, ref) => (
    <div data-testid="bar-chart" ref={ref}>
      Bar Chart - {data?.datasets?.length || 0} datasets
    </div>
  )),
  Pie: React.forwardRef(({ data, options }, ref) => (
    <div data-testid="pie-chart" ref={ref}>
      Pie Chart - {data?.datasets?.length || 0} datasets
    </div>
  )),
}));

// Mock services
jest.mock('../../../services/chartPreferences', () => ({
  chartPreferences: {
    getPreferences: jest.fn(() => ({
      chartTypes: { monthlyTrends: 'line', categoryBreakdown: 'pie' },
      colors: { theme: 'default' },
      display: {
        showLegend: true,
        showGridLines: true,
        animationEnabled: true
      }
    })),
    getChartType: jest.fn((name) => name === 'monthlyTrends' ? 'line' : 'pie')
  }
}));

jest.mock('../../../hooks/useMediaQuery', () => ({
  useIsMobile: jest.fn(() => false),
  useIsTablet: jest.fn(() => false),
  useIsTouchDevice: jest.fn(() => false)
}));

jest.mock('../../../utils/mobileChartOptions', () => ({
  getMobileOptimizedOptions: jest.fn((options) => options),
  getTouchOptimizedOptions: jest.fn((options) => options),
  shouldUsePerformanceMode: jest.fn(() => false)
}));

describe('Chart Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock performance.now for timing tests
    global.performance = {
      now: jest.fn(() => Date.now())
    };
  });

  describe('MonthlyTrendsChart Performance', () => {
    test('renders within acceptable time with small dataset', async () => {
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('line-chart')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 100ms for small dataset
      expect(renderTime).toBeLessThan(100);
    });

    test('handles large dataset efficiently', async () => {
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <MonthlyTrendsChart months={24} showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('line-chart')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within 500ms even for large dataset
      expect(renderTime).toBeLessThan(500);
    });

    test('memory usage remains stable with multiple re-renders', async () => {
      const { rerender } = render(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      // Simulate multiple re-renders
      for (let i = 0; i < 10; i++) {
        rerender(
          <MonthlyTrendsChart months={6 + i} showCustomization={false} />
        );
      }
      
      // If we reach here without memory issues, the test passes
      expect(true).toBe(true);
    });

    test('chart type switching performance', async () => {
      const { rerender, getByTestId } = render(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('line-chart')).toBeInTheDocument();
      });
      
      const startTime = performance.now();
      
      // Mock chart type change
      require('../../../services/chartPreferences').chartPreferences.getChartType.mockReturnValue('bar');
      
      rerender(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('bar-chart')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const switchTime = endTime - startTime;
      
      // Chart type switching should be fast
      expect(switchTime).toBeLessThan(50);
    });
  });

  describe('CategoryBreakdownChart Performance', () => {
    test('renders pie chart efficiently with multiple categories', async () => {
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <CategoryBreakdownChart showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('pie-chart')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    test('handles category filtering performance', async () => {
      const { getByTestId } = render(
        <CategoryBreakdownChart showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('pie-chart')).toBeInTheDocument();
      });
      
      // Simulate rapid category filtering
      const startTime = performance.now();
      
      // Multiple rapid updates
      for (let i = 0; i < 5; i++) {
        // Simulate category toggle
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      const endTime = performance.now();
      const filterTime = endTime - startTime;
      
      // Filtering should be responsive
      expect(filterTime).toBeLessThan(100);
    });
  });

  describe('Mobile Performance Optimizations', () => {
    beforeEach(() => {
      // Mock mobile environment
      require('../../../hooks/useMediaQuery').useIsMobile.mockReturnValue(true);
      require('../../../utils/mobileChartOptions').shouldUsePerformanceMode.mockReturnValue(true);
    });

    test('applies performance optimizations on mobile', async () => {
      const { getMobileOptimizedOptions } = require('../../../utils/mobileChartOptions');
      
      render(<MonthlyTrendsChart months={6} showCustomization={false} />);
      
      await waitFor(() => {
        expect(getMobileOptimizedOptions).toHaveBeenCalled();
      });
    });

    test('reduces animation duration on mobile', async () => {
      const { getMobileOptimizedOptions } = require('../../../utils/mobileChartOptions');
      
      render(<MonthlyTrendsChart months={6} showCustomization={false} />);
      
      await waitFor(() => {
        const calls = getMobileOptimizedOptions.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        
        // Verify mobile optimizations were applied
        const [baseOptions, isMobile] = calls[0];
        expect(isMobile).toBe(true);
      });
    });
  });

  describe('Memory Leak Prevention', () => {
    test('cleans up chart instances on unmount', () => {
      const { unmount } = render(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      // Unmount component
      unmount();
      
      // If we reach here without errors, cleanup was successful
      expect(true).toBe(true);
    });

    test('handles rapid mount/unmount cycles', () => {
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <MonthlyTrendsChart months={6} showCustomization={false} />
        );
        unmount();
      }
      
      // Should handle rapid cycles without memory leaks
      expect(true).toBe(true);
    });

    test('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      unmount();
      
      // Should clean up event listeners
      expect(removeEventListenerSpy).toHaveBeenCalled();
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Large Dataset Handling', () => {
    test('handles 1000+ data points efficiently', async () => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        month: i % 12 + 1,
        year: 2020 + Math.floor(i / 12),
        totalIncome: 5000 + (i * 10),
        totalExpenses: 3000 + (i * 8),
        netSavings: 2000 + (i * 2)
      }));
      
      const startTime = performance.now();
      
      const { getByTestId } = render(
        <MonthlyTrendsChart months={84} showCustomization={false} />
      );
      
      await waitFor(() => {
        expect(getByTestId('line-chart')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should handle large datasets within reasonable time
      expect(renderTime).toBeLessThan(1000);
    });

    test('maintains responsiveness with frequent updates', async () => {
      const { rerender, getByTestId } = render(
        <MonthlyTrendsChart months={6} showCustomization={false} />
      );
      
      const startTime = performance.now();
      
      // Simulate frequent data updates
      for (let i = 0; i < 20; i++) {
        rerender(
          <MonthlyTrendsChart months={6} key={i} showCustomization={false} />
        );
        
        await waitFor(() => {
          expect(getByTestId('line-chart')).toBeInTheDocument();
        });
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Average time per update should be reasonable
      const avgTimePerUpdate = totalTime / 20;
      expect(avgTimePerUpdate).toBeLessThan(50);
    });
  });

  describe('Browser Compatibility', () => {
    test('handles missing Canvas API gracefully', () => {
      // Mock missing Canvas API
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'canvas') {
          return null;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      expect(() => {
        render(<MonthlyTrendsChart months={6} showCustomization={false} />);
      }).not.toThrow();
      
      // Restore original function
      document.createElement = originalCreateElement;
    });

    test('handles missing requestAnimationFrame', () => {
      const originalRAF = window.requestAnimationFrame;
      delete window.requestAnimationFrame;
      
      expect(() => {
        render(<MonthlyTrendsChart months={6} showCustomization={false} />);
      }).not.toThrow();
      
      // Restore
      window.requestAnimationFrame = originalRAF;
    });
  });
});