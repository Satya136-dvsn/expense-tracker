import React from 'react';
import ErrorBoundary from '../Common/ErrorBoundary';
import LoadingSpinner from '../Common/LoadingSpinner';
import ResponsiveChartContainer from './ResponsiveChartContainer';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';
import './ChartWrapper.css';

const ChartWrapper = ({ 
  children, 
  title, 
  isLoading = false, 
  error = null, 
  className = '',
  height = '400px',
  showLegend = true,
  onRetry = null,
  enableMobileOptimizations = true,
  enableSwipe = true
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  // Get responsive height
  const getResponsiveHeight = () => {
    if (isMobile) return '300px';
    if (isTablet) return '350px';
    return height;
  };

  if (error) {
    const ErrorContent = (
      <div className="chart-error">
        <div className="error-icon">📊</div>
        <p className="error-message">Unable to load chart data</p>
        <p className="error-details">{error}</p>
        {onRetry && (
          <button 
            className="retry-button"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    );

    if (enableMobileOptimizations && (isMobile || isTablet)) {
      return (
        <ResponsiveChartContainer
          title={title}
          className={`chart-wrapper error ${className}`}
          mobileHeight="250px"
          desktopHeight={height}
          enableSwipe={false}
          showMobileControls={false}
        >
          {ErrorContent}
        </ResponsiveChartContainer>
      );
    }

    return (
      <div className={`chart-wrapper error ${className}`}>
        <div className="chart-header">
          {title && <h3 className="chart-title">{title}</h3>}
        </div>
        {ErrorContent}
      </div>
    );
  }

  if (isLoading) {
    const LoadingContent = (
      <div className="chart-loading">
        <LoadingSpinner 
          size={isMobile ? "medium" : "large"} 
          message="Loading chart data..." 
          color="#10b981"
        />
      </div>
    );

    if (enableMobileOptimizations && (isMobile || isTablet)) {
      return (
        <ResponsiveChartContainer
          title={title}
          className={`chart-wrapper loading ${className}`}
          mobileHeight="250px"
          desktopHeight={height}
          enableSwipe={false}
          showMobileControls={false}
        >
          {LoadingContent}
        </ResponsiveChartContainer>
      );
    }

    return (
      <div className={`chart-wrapper loading ${className}`} style={{ height: getResponsiveHeight() }}>
        <div className="chart-header">
          {title && <h3 className="chart-title">{title}</h3>}
        </div>
        {LoadingContent}
      </div>
    );
  }

  // Main chart content
  const ChartContent = (
    <>
      <div className="chart-content">
        {children}
      </div>
      {showLegend && !isMobile && (
        <div className="chart-legend-container">
          {/* Legend will be handled by individual chart components */}
        </div>
      )}
    </>
  );

  if (enableMobileOptimizations && (isMobile || isTablet)) {
    return (
      <ErrorBoundary>
        <ResponsiveChartContainer
          title={title}
          className={`chart-wrapper ${className}`}
          mobileHeight="300px"
          desktopHeight={height}
          enableSwipe={enableSwipe}
          showMobileControls={true}
        >
          {ChartContent}
        </ResponsiveChartContainer>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`chart-wrapper ${className}`} style={{ height: getResponsiveHeight() }}>
        {title && (
          <div className="chart-header">
            <h3 className="chart-title">{title}</h3>
          </div>
        )}
        {ChartContent}
      </div>
    </ErrorBoundary>
  );
};

export default ChartWrapper;