import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './ResponsiveChartContainer.css';

const ResponsiveChartContainer = ({ 
  children, 
  title,
  className = '',
  mobileHeight = '300px',
  desktopHeight = '400px',
  enableSwipe = true,
  showMobileControls = true
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    if (!enableSwipe) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    if (!enableSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!enableSwipe || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Emit custom swipe event for parent components to handle
      const swipeEvent = new CustomEvent('chartSwipe', {
        detail: { direction: isLeftSwipe ? 'left' : 'right' }
      });
      containerRef.current?.dispatchEvent(swipeEvent);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const getContainerHeight = () => {
    if (isFullscreen) return '100vh';
    return isMobile ? mobileHeight : desktopHeight;
  };

  const getContainerClass = () => {
    let classes = ['responsive-chart-container', className];
    
    if (isMobile) classes.push('mobile');
    if (isTablet) classes.push('tablet');
    if (isFullscreen) classes.push('fullscreen');
    
    return classes.join(' ');
  };

  return (
    <div 
      ref={containerRef}
      className={getContainerClass()}
      style={{ height: getContainerHeight() }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Mobile Header */}
      {isMobile && title && (
        <div className="mobile-chart-header">
          <h3 className="mobile-chart-title">{title}</h3>
          {showMobileControls && (
            <div className="mobile-controls">
              <button 
                className="mobile-control-btn"
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? '⤓' : '⤢'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Chart Content */}
      <div className="chart-content-wrapper">
        {children}
      </div>

      {/* Mobile Touch Indicators */}
      {isMobile && enableSwipe && (
        <div className="mobile-swipe-indicators">
          <div className="swipe-indicator left">‹</div>
          <div className="swipe-indicator right">›</div>
        </div>
      )}

      {/* Mobile Footer with Swipe Hint */}
      {isMobile && enableSwipe && (
        <div className="mobile-chart-footer">
          <span className="swipe-hint">← Swipe to navigate →</span>
        </div>
      )}
    </div>
  );
};

export default ResponsiveChartContainer;