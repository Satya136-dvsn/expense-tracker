import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import './ResponsiveWrapper.css';

const ResponsiveWrapper = ({ 
  children, 
  className = '',
  spacing,
  padding,
  margin,
  columns,
  gap,
  hideOn = [],
  showOn = [],
  ...props 
}) => {
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useResponsive();

  // Check if component should be hidden on current breakpoint
  const shouldHide = hideOn.includes(currentBreakpoint) || 
                    (hideOn.includes('mobile') && isMobile) ||
                    (hideOn.includes('tablet') && isTablet) ||
                    (hideOn.includes('desktop') && isDesktop);

  // Check if component should only show on specific breakpoints
  const shouldShow = showOn.length === 0 || 
                     showOn.includes(currentBreakpoint) ||
                     (showOn.includes('mobile') && isMobile) ||
                     (showOn.includes('tablet') && isTablet) ||
                     (showOn.includes('desktop') && isDesktop);

  if (shouldHide || !shouldShow) {
    return null;
  }

  // Generate responsive classes
  const responsiveClasses = [
    'responsive-wrapper',
    `breakpoint-${currentBreakpoint}`,
    isMobile && 'mobile',
    isTablet && 'tablet',
    isDesktop && 'desktop',
    spacing && `spacing-${typeof spacing === 'object' ? spacing[currentBreakpoint] || spacing.default : spacing}`,
    padding && `padding-${typeof padding === 'object' ? padding[currentBreakpoint] || padding.default : padding}`,
    margin && `margin-${typeof margin === 'object' ? margin[currentBreakpoint] || margin.default : margin}`,
    columns && `columns-${typeof columns === 'object' ? columns[currentBreakpoint] || columns.default : columns}`,
    gap && `gap-${typeof gap === 'object' ? gap[currentBreakpoint] || gap.default : gap}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={responsiveClasses} {...props}>
      {children}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid = ({ 
  children, 
  columns = { xs: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = { xs: 'md', sm: 'md', md: 'lg', lg: 'xl', xl: 'xl' },
  className = '',
  ...props 
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentColumns = typeof columns === 'object' ? 
    columns[currentBreakpoint] || columns.lg || columns.md || 1 : columns;
  
  const currentGap = typeof gap === 'object' ? 
    gap[currentBreakpoint] || gap.lg || gap.md || 'lg' : gap;

  return (
    <div 
      className={`responsive-grid grid-cols-${currentColumns} gap-${currentGap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Responsive Flex Component
export const ResponsiveFlex = ({ 
  children, 
  direction = { xs: 'column', md: 'row' },
  align = 'center',
  justify = 'flex-start',
  wrap = true,
  gap = 'md',
  className = '',
  ...props 
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentDirection = typeof direction === 'object' ? 
    direction[currentBreakpoint] || direction.md || 'row' : direction;

  return (
    <div 
      className={`responsive-flex flex-${currentDirection} items-${align} justify-${justify} ${wrap ? 'flex-wrap' : ''} gap-${gap} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Responsive Text Component
export const ResponsiveText = ({ 
  children, 
  size = { xs: 'sm', md: 'base', lg: 'lg' },
  weight = 'normal',
  color = 'primary',
  align = 'left',
  className = '',
  as: Component = 'p',
  ...props 
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentSize = typeof size === 'object' ? 
    size[currentBreakpoint] || size.md || 'base' : size;

  return (
    <Component 
      className={`responsive-text text-${currentSize} font-${weight} text-${color} text-${align} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

// Responsive Spacing Component
export const ResponsiveSpacing = ({ 
  size = { xs: 'sm', md: 'md', lg: 'lg' },
  type = 'margin',
  direction = 'bottom',
  className = ''
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentSize = typeof size === 'object' ? 
    size[currentBreakpoint] || size.md || 'md' : size;

  const spacingClass = `${type.charAt(0)}${direction.charAt(0)}-${currentSize}`;

  return <div className={`responsive-spacing ${spacingClass} ${className}`} />;
};

// Responsive Container Component
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = { xs: '100%', sm: '100%', md: '768px', lg: '1024px', xl: '1200px', '2xl': '1400px' },
  padding = { xs: 'md', sm: 'lg', md: 'xl', lg: 'xl', xl: '2xl' },
  className = '',
  ...props 
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentMaxWidth = typeof maxWidth === 'object' ? 
    maxWidth[currentBreakpoint] || maxWidth.lg || '1200px' : maxWidth;
  
  const currentPadding = typeof padding === 'object' ? 
    padding[currentBreakpoint] || padding.lg || 'xl' : padding;

  return (
    <div 
      className={`responsive-container p-${currentPadding} ${className}`}
      style={{ maxWidth: currentMaxWidth, margin: '0 auto', width: '100%' }}
      {...props}
    >
      {children}
    </div>
  );
};

// Responsive Image Component
export const ResponsiveImage = ({ 
  src, 
  alt, 
  sizes = { xs: '100vw', sm: '100vw', md: '50vw', lg: '33vw', xl: '25vw' },
  className = '',
  loading = 'lazy',
  ...props 
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const currentSize = typeof sizes === 'object' ? 
    sizes[currentBreakpoint] || sizes.lg || '33vw' : sizes;

  return (
    <img 
      src={src}
      alt={alt}
      sizes={currentSize}
      loading={loading}
      className={`responsive-image ${className}`}
      {...props}
    />
  );
};

export default ResponsiveWrapper;