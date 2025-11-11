// Responsive utility functions for consistent behavior across components

// Breakpoint utilities
export const breakpoints = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1200,
  '2xl': 1400
};

// Get current breakpoint
export const getCurrentBreakpoint = (width = window.innerWidth) => {
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

// Check if current screen is mobile
export const isMobileScreen = (width = window.innerWidth) => {
  return width < breakpoints.md;
};

// Check if current screen is tablet
export const isTabletScreen = (width = window.innerWidth) => {
  return width >= breakpoints.md && width < breakpoints.lg;
};

// Check if current screen is desktop
export const isDesktopScreen = (width = window.innerWidth) => {
  return width >= breakpoints.lg;
};

// Responsive grid column calculator
export const getResponsiveColumns = (config, currentBreakpoint) => {
  const { xs = 1, sm = 1, md = 2, lg = 3, xl = 4, '2xl': xxl = 4 } = config;
  
  switch (currentBreakpoint) {
    case 'xs': return xs;
    case 'sm': return sm;
    case 'md': return md;
    case 'lg': return lg;
    case 'xl': return xl;
    case '2xl': return xxl;
    default: return lg;
  }
};

// Responsive spacing calculator
export const getResponsiveSpacing = (config, currentBreakpoint) => {
  const spacingMap = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  };

  const { xs = 'sm', sm = 'sm', md = 'md', lg = 'lg', xl = 'xl', '2xl': xxl = 'xl' } = config;
  
  let spacing;
  switch (currentBreakpoint) {
    case 'xs': spacing = xs; break;
    case 'sm': spacing = sm; break;
    case 'md': spacing = md; break;
    case 'lg': spacing = lg; break;
    case 'xl': spacing = xl; break;
    case '2xl': spacing = xxl; break;
    default: spacing = lg;
  }

  return spacingMap[spacing] || spacing;
};

// Responsive font size calculator
export const getResponsiveFontSize = (config, currentBreakpoint) => {
  const fontSizeMap = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  };

  const { xs = 'sm', sm = 'sm', md = 'base', lg = 'lg', xl = 'xl', '2xl': xxl = 'xl' } = config;
  
  let fontSize;
  switch (currentBreakpoint) {
    case 'xs': fontSize = xs; break;
    case 'sm': fontSize = sm; break;
    case 'md': fontSize = md; break;
    case 'lg': fontSize = lg; break;
    case 'xl': fontSize = xl; break;
    case '2xl': fontSize = xxl; break;
    default: fontSize = lg;
  }

  return fontSizeMap[fontSize] || fontSize;
};

// Touch-friendly sizing
export const getTouchFriendlySize = (baseSize, isTouch = false) => {
  if (!isTouch) return baseSize;
  
  // Ensure minimum 44px touch target
  const minTouchSize = 44;
  const baseSizePx = parseInt(baseSize);
  
  return baseSizePx < minTouchSize ? `${minTouchSize}px` : baseSize;
};

// Responsive container width
export const getContainerWidth = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return '100%';
    case 'sm': return '100%';
    case 'md': return '768px';
    case 'lg': return '1024px';
    case 'xl': return '1200px';
    case '2xl': return '1400px';
    default: return '1200px';
  }
};

// Responsive padding
export const getResponsivePadding = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return '0.5rem';
    case 'sm': return '1rem';
    case 'md': return '1.5rem';
    case 'lg': return '2rem';
    case 'xl': return '2rem';
    case '2xl': return '3rem';
    default: return '2rem';
  }
};

// Responsive margin
export const getResponsiveMargin = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return '0.5rem';
    case 'sm': return '1rem';
    case 'md': return '1.5rem';
    case 'lg': return '2rem';
    case 'xl': return '2rem';
    case '2xl': return '3rem';
    default: return '2rem';
  }
};

// Responsive border radius
export const getResponsiveBorderRadius = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return '8px';
    case 'sm': return '12px';
    case 'md': return '16px';
    case 'lg': return '20px';
    case 'xl': return '20px';
    case '2xl': return '24px';
    default: return '20px';
  }
};

// Responsive glassmorphism blur
export const getResponsiveBlur = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return 'blur(10px)';
    case 'sm': return 'blur(15px)';
    case 'md': return 'blur(20px)';
    case 'lg': return 'blur(20px)';
    case 'xl': return 'blur(25px)';
    case '2xl': return 'blur(30px)';
    default: return 'blur(20px)';
  }
};

// Responsive shadow
export const getResponsiveShadow = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return '0 4px 16px rgba(0, 0, 0, 0.2)';
    case 'sm': return '0 6px 24px rgba(0, 0, 0, 0.25)';
    case 'md': return '0 8px 32px rgba(0, 0, 0, 0.3)';
    case 'lg': return '0 8px 32px rgba(0, 0, 0, 0.3)';
    case 'xl': return '0 12px 40px rgba(0, 0, 0, 0.35)';
    case '2xl': return '0 16px 48px rgba(0, 0, 0, 0.4)';
    default: return '0 8px 32px rgba(0, 0, 0, 0.3)';
  }
};

// Responsive animation duration
export const getResponsiveAnimationDuration = (currentBreakpoint, prefersReducedMotion = false) => {
  if (prefersReducedMotion) return '0.01ms';
  
  switch (currentBreakpoint) {
    case 'xs': return '200ms';
    case 'sm': return '250ms';
    case 'md': return '300ms';
    case 'lg': return '300ms';
    case 'xl': return '350ms';
    case '2xl': return '400ms';
    default: return '300ms';
  }
};

// Responsive chart dimensions
export const getResponsiveChartDimensions = (currentBreakpoint) => {
  switch (currentBreakpoint) {
    case 'xs': return { width: '100%', height: '200px' };
    case 'sm': return { width: '100%', height: '250px' };
    case 'md': return { width: '100%', height: '300px' };
    case 'lg': return { width: '100%', height: '350px' };
    case 'xl': return { width: '100%', height: '400px' };
    case '2xl': return { width: '100%', height: '450px' };
    default: return { width: '100%', height: '350px' };
  }
};

// Responsive table behavior
export const getResponsiveTableConfig = (currentBreakpoint) => {
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  
  return {
    showScrollbar: isMobile,
    stackColumns: isMobile,
    hideColumns: isMobile ? ['created', 'updated'] : [],
    minWidth: isMobile ? '600px' : 'auto',
    fontSize: isMobile ? '0.875rem' : '1rem',
    padding: isMobile ? '0.75rem' : '1rem'
  };
};

// Responsive modal behavior
export const getResponsiveModalConfig = (currentBreakpoint) => {
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  
  return {
    fullScreen: isMobile,
    maxWidth: isMobile ? '100vw' : '600px',
    maxHeight: isMobile ? '100vh' : '80vh',
    padding: isMobile ? '1rem' : '2rem',
    borderRadius: isMobile ? '0' : '20px'
  };
};

// Responsive form layout
export const getResponsiveFormConfig = (currentBreakpoint) => {
  return {
    columns: currentBreakpoint === 'xs' ? 1 : currentBreakpoint === 'sm' ? 1 : 2,
    gap: currentBreakpoint === 'xs' ? '1rem' : '1.5rem',
    labelPosition: currentBreakpoint === 'xs' ? 'top' : 'top',
    buttonSize: currentBreakpoint === 'xs' ? 'small' : 'medium'
  };
};

// Responsive navigation config
export const getResponsiveNavConfig = (currentBreakpoint) => {
  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  
  return {
    showMobileMenu: isMobile,
    collapsible: !isMobile,
    showLabels: !isMobile || currentBreakpoint === 'sm',
    iconSize: isMobile ? '20px' : '24px',
    itemPadding: isMobile ? '0.75rem' : '1rem'
  };
};

// CSS custom properties generator for responsive values
export const generateResponsiveCSS = (property, values, currentBreakpoint) => {
  const value = values[currentBreakpoint] || values.lg || values.md || values.sm || values.xs;
  return { [property]: value };
};

// Debounced resize handler
export const createDebouncedResizeHandler = (callback, delay = 150) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback.apply(null, args), delay);
  };
};

// Performance-optimized resize observer
export const createResizeObserver = (callback) => {
  if (typeof ResizeObserver === 'undefined') {
    // Fallback for browsers without ResizeObserver
    return {
      observe: () => {},
      unobserve: () => {},
      disconnect: () => {}
    };
  }
  
  return new ResizeObserver(callback);
};

// Responsive image loading
export const getResponsiveImageSrc = (baseSrc, currentBreakpoint) => {
  const suffix = currentBreakpoint === 'xs' || currentBreakpoint === 'sm' ? '_mobile' : 
                 currentBreakpoint === 'md' ? '_tablet' : '_desktop';
  
  const extension = baseSrc.split('.').pop();
  const nameWithoutExtension = baseSrc.replace(`.${extension}`, '');
  
  return `${nameWithoutExtension}${suffix}.${extension}`;
};

export default {
  breakpoints,
  getCurrentBreakpoint,
  isMobileScreen,
  isTabletScreen,
  isDesktopScreen,
  getResponsiveColumns,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getTouchFriendlySize,
  getContainerWidth,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveBorderRadius,
  getResponsiveBlur,
  getResponsiveShadow,
  getResponsiveAnimationDuration,
  getResponsiveChartDimensions,
  getResponsiveTableConfig,
  getResponsiveModalConfig,
  getResponsiveFormConfig,
  getResponsiveNavConfig,
  generateResponsiveCSS,
  createDebouncedResizeHandler,
  createResizeObserver,
  getResponsiveImageSrc
};