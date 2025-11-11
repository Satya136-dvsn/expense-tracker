import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveChartContainer from '../ResponsiveChartContainer';

// Mock the useMediaQuery hook
jest.mock('../../../hooks/useMediaQuery', () => ({
  useMediaQuery: jest.fn()
}));

import { useMediaQuery } from '../../../hooks/useMediaQuery';

describe('ResponsiveChartContainer', () => {
  const defaultProps = {
    title: 'Test Chart',
    children: <div data-testid="chart-content">Chart Content</div>
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default to desktop
    useMediaQuery.mockReturnValue(false);
    
    // Mock fullscreen API
    document.fullscreenElement = null;
    document.exitFullscreen = jest.fn().mockResolvedValue();
    
    // Mock requestFullscreen
    HTMLElement.prototype.requestFullscreen = jest.fn().mockResolvedValue();
  });

  test('renders chart content', () => {
    render(<ResponsiveChartContainer {...defaultProps} />);
    
    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  test('shows mobile header on mobile devices', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    render(<ResponsiveChartContainer {...defaultProps} />);
    
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByTitle('Fullscreen')).toBeInTheDocument();
  });

  test('does not show mobile header on desktop', () => {
    render(<ResponsiveChartContainer {...defaultProps} />);
    
    expect(screen.queryByText('Test Chart')).not.toBeInTheDocument();
  });

  test('shows swipe indicators on mobile when enabled', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    render(<ResponsiveChartContainer {...defaultProps} enableSwipe={true} />);
    
    expect(screen.getByText('‹')).toBeInTheDocument();
    expect(screen.getByText('›')).toBeInTheDocument();
    expect(screen.getByText('← Swipe to navigate →')).toBeInTheDocument();
  });

  test('does not show swipe indicators when disabled', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    render(<ResponsiveChartContainer {...defaultProps} enableSwipe={false} />);
    
    expect(screen.queryByText('‹')).not.toBeInTheDocument();
    expect(screen.queryByText('›')).not.toBeInTheDocument();
    expect(screen.queryByText('← Swipe to navigate →')).not.toBeInTheDocument();
  });

  test('handles fullscreen toggle', async () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    render(<ResponsiveChartContainer {...defaultProps} />);
    
    const fullscreenButton = screen.getByTitle('Fullscreen');
    fireEvent.click(fullscreenButton);
    
    expect(HTMLElement.prototype.requestFullscreen).toHaveBeenCalled();
  });

  test('handles exit fullscreen', async () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    // Mock being in fullscreen
    document.fullscreenElement = document.createElement('div');
    
    render(<ResponsiveChartContainer {...defaultProps} />);
    
    const exitFullscreenButton = screen.getByTitle('Exit Fullscreen');
    fireEvent.click(exitFullscreenButton);
    
    expect(document.exitFullscreen).toHaveBeenCalled();
  });

  test('handles touch events for swipe detection', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    const container = render(<ResponsiveChartContainer {...defaultProps} enableSwipe={true} />);
    const chartContainer = container.container.firstChild;
    
    // Mock custom event dispatch
    const dispatchEventSpy = jest.spyOn(chartContainer, 'dispatchEvent');
    
    // Simulate swipe left
    fireEvent.touchStart(chartContainer, {
      targetTouches: [{ clientX: 100 }]
    });
    
    fireEvent.touchMove(chartContainer, {
      targetTouches: [{ clientX: 50 }]
    });
    
    fireEvent.touchEnd(chartContainer);
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chartSwipe',
        detail: { direction: 'left' }
      })
    );
  });

  test('handles swipe right detection', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    const container = render(<ResponsiveChartContainer {...defaultProps} enableSwipe={true} />);
    const chartContainer = container.container.firstChild;
    
    const dispatchEventSpy = jest.spyOn(chartContainer, 'dispatchEvent');
    
    // Simulate swipe right
    fireEvent.touchStart(chartContainer, {
      targetTouches: [{ clientX: 50 }]
    });
    
    fireEvent.touchMove(chartContainer, {
      targetTouches: [{ clientX: 150 }]
    });
    
    fireEvent.touchEnd(chartContainer);
    
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'chartSwipe',
        detail: { direction: 'right' }
      })
    );
  });

  test('ignores short swipes', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    const container = render(<ResponsiveChartContainer {...defaultProps} enableSwipe={true} />);
    const chartContainer = container.container.firstChild;
    
    const dispatchEventSpy = jest.spyOn(chartContainer, 'dispatchEvent');
    
    // Simulate short swipe (less than minimum distance)
    fireEvent.touchStart(chartContainer, {
      targetTouches: [{ clientX: 100 }]
    });
    
    fireEvent.touchMove(chartContainer, {
      targetTouches: [{ clientX: 90 }]
    });
    
    fireEvent.touchEnd(chartContainer);
    
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });

  test('applies correct CSS classes based on device type', () => {
    useMediaQuery.mockImplementation((query) => {
      if (query === '(max-width: 768px)') return true;
      if (query === '(max-width: 1024px)') return true;
      return false;
    });
    
    const { container } = render(<ResponsiveChartContainer {...defaultProps} />);
    const chartContainer = container.firstChild;
    
    expect(chartContainer).toHaveClass('responsive-chart-container');
    expect(chartContainer).toHaveClass('mobile');
    expect(chartContainer).toHaveClass('tablet');
  });

  test('uses correct height for mobile vs desktop', () => {
    // Test mobile
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    const { container, rerender } = render(
      <ResponsiveChartContainer {...defaultProps} mobileHeight="250px" desktopHeight="400px" />
    );
    
    expect(container.firstChild).toHaveStyle({ height: '250px' });
    
    // Test desktop
    useMediaQuery.mockReturnValue(false);
    
    rerender(
      <ResponsiveChartContainer {...defaultProps} mobileHeight="250px" desktopHeight="400px" />
    );
    
    expect(container.firstChild).toHaveStyle({ height: '400px' });
  });

  test('handles fullscreen change events', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    render(<ResponsiveChartContainer {...defaultProps} />);
    
    // Simulate entering fullscreen
    document.fullscreenElement = document.createElement('div');
    fireEvent(document, new Event('fullscreenchange'));
    
    expect(screen.getByTitle('Exit Fullscreen')).toBeInTheDocument();
    
    // Simulate exiting fullscreen
    document.fullscreenElement = null;
    fireEvent(document, new Event('fullscreenchange'));
    
    expect(screen.getByTitle('Fullscreen')).toBeInTheDocument();
  });

  test('does not show mobile controls when disabled', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    render(<ResponsiveChartContainer {...defaultProps} showMobileControls={false} />);
    
    expect(screen.queryByTitle('Fullscreen')).not.toBeInTheDocument();
  });

  test('handles touch events when swipe is disabled', () => {
    useMediaQuery.mockImplementation((query) => {
      return query === '(max-width: 768px)';
    });
    
    const container = render(<ResponsiveChartContainer {...defaultProps} enableSwipe={false} />);
    const chartContainer = container.container.firstChild;
    
    const dispatchEventSpy = jest.spyOn(chartContainer, 'dispatchEvent');
    
    // Simulate touch events
    fireEvent.touchStart(chartContainer, {
      targetTouches: [{ clientX: 100 }]
    });
    
    fireEvent.touchMove(chartContainer, {
      targetTouches: [{ clientX: 50 }]
    });
    
    fireEvent.touchEnd(chartContainer);
    
    expect(dispatchEventSpy).not.toHaveBeenCalled();
  });
});