import React, { useRef, useEffect, useState } from 'react';
import ChartWrapper from './ChartWrapper';

const ResponsiveChart = ({ 
  children, 
  title, 
  isLoading, 
  error, 
  onRetry,
  className = '',
  maintainAspectRatio = false,
  aspectRatio = 2
}) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    // Initial measurement
    updateDimensions();

    // Set up resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback for older browsers
    const handleResize = () => {
      setTimeout(updateDimensions, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate responsive height
  const getResponsiveHeight = () => {
    if (maintainAspectRatio && dimensions.width > 0) {
      return `${dimensions.width / aspectRatio}px`;
    }
    
    // Default responsive heights based on screen size
    if (dimensions.width < 480) {
      return '250px';
    } else if (dimensions.width < 768) {
      return '300px';
    } else {
      return '400px';
    }
  };

  return (
    <div ref={containerRef} className={`responsive-chart-container ${className}`}>
      <ChartWrapper
        title={title}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        height={getResponsiveHeight()}
        className="responsive-chart"
      >
        {React.cloneElement(children, {
          width: dimensions.width,
          height: dimensions.height,
          options: {
            ...children.props.options,
            responsive: true,
            maintainAspectRatio: maintainAspectRatio,
            plugins: {
              ...children.props.options?.plugins,
              legend: {
                ...children.props.options?.plugins?.legend,
                position: dimensions.width < 768 ? 'bottom' : 'top',
              }
            },
            scales: {
              ...children.props.options?.scales,
              x: {
                ...children.props.options?.scales?.x,
                ticks: {
                  ...children.props.options?.scales?.x?.ticks,
                  maxRotation: dimensions.width < 768 ? 45 : 0,
                  minRotation: dimensions.width < 768 ? 45 : 0,
                }
              }
            }
          }
        })}
      </ChartWrapper>
    </div>
  );
};

export default ResponsiveChart;