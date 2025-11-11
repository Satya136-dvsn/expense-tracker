// Mobile-optimized chart options utility
import { defaultChartOptions } from '../components/Analytics/BaseChart';

/**
 * Get mobile-optimized chart options
 * @param {Object} baseOptions - Base chart options
 * @param {boolean} isMobile - Whether the device is mobile
 * @param {boolean} isTablet - Whether the device is tablet
 * @returns {Object} Optimized chart options
 */
export const getMobileOptimizedOptions = (baseOptions = {}, isMobile = false, isTablet = false) => {
  const options = { ...defaultChartOptions, ...baseOptions };

  if (isMobile) {
    return {
      ...options,
      responsive: true,
      maintainAspectRatio: false,
      devicePixelRatio: window.devicePixelRatio || 1,
      
      // Optimize animations for mobile performance
      animation: {
        duration: 500, // Shorter animations
        easing: 'easeOutQuart'
      },
      
      // Mobile-optimized plugins
      plugins: {
        ...options.plugins,
        legend: {
          ...options.plugins?.legend,
          display: false, // Hide legend on mobile to save space
          position: 'bottom',
          labels: {
            ...options.plugins?.legend?.labels,
            boxWidth: 12,
            padding: 8,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          ...options.plugins?.tooltip,
          enabled: true,
          mode: 'nearest',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleFont: {
            size: 12,
            weight: '600'
          },
          bodyFont: {
            size: 11
          },
          padding: 8,
          cornerRadius: 6,
          displayColors: false, // Hide color boxes to save space
          callbacks: {
            ...options.plugins?.tooltip?.callbacks,
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed;
              
              if (typeof value === 'number') {
                const formatter = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                  notation: value >= 1000 ? 'compact' : 'standard'
                });
                return `${label}: ${formatter.format(value)}`;
              }
              
              return `${label}: ${value}`;
            }
          }
        }
      },
      
      // Mobile-optimized scales
      scales: options.scales ? {
        x: {
          ...options.scales.x,
          grid: {
            display: false // Hide grid lines on mobile
          },
          ticks: {
            ...options.scales.x?.ticks,
            maxTicksLimit: 4, // Fewer ticks on mobile
            font: {
              size: 10
            },
            maxRotation: 45,
            minRotation: 0
          }
        },
        y: {
          ...options.scales.y,
          grid: {
            display: false // Hide grid lines on mobile
          },
          ticks: {
            ...options.scales.y?.ticks,
            maxTicksLimit: 4, // Fewer ticks on mobile
            font: {
              size: 10
            },
            callback: function(value) {
              // Compact number formatting for mobile
              const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                notation: 'compact'
              });
              return formatter.format(value);
            }
          }
        }
      } : undefined,
      
      // Mobile-optimized interaction
      interaction: {
        intersect: false,
        mode: 'nearest'
      },
      
      // Mobile-optimized elements
      elements: {
        ...options.elements,
        point: {
          ...options.elements?.point,
          radius: 3, // Smaller points on mobile
          hoverRadius: 6,
          hitRadius: 10 // Larger hit area for touch
        },
        line: {
          ...options.elements?.line,
          borderWidth: 2, // Thinner lines on mobile
          tension: 0.3
        },
        bar: {
          ...options.elements?.bar,
          borderWidth: 0
        }
      }
    };
  }

  if (isTablet) {
    return {
      ...options,
      responsive: true,
      maintainAspectRatio: false,
      
      // Tablet-optimized animations
      animation: {
        duration: 750,
        easing: 'easeOutQuart'
      },
      
      // Tablet-optimized plugins
      plugins: {
        ...options.plugins,
        legend: {
          ...options.plugins?.legend,
          position: 'top',
          labels: {
            ...options.plugins?.legend?.labels,
            boxWidth: 14,
            padding: 12,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          ...options.plugins?.tooltip,
          titleFont: {
            size: 13,
            weight: '600'
          },
          bodyFont: {
            size: 12
          },
          padding: 10
        }
      },
      
      // Tablet-optimized scales
      scales: options.scales ? {
        x: {
          ...options.scales.x,
          ticks: {
            ...options.scales.x?.ticks,
            maxTicksLimit: 6,
            font: {
              size: 11
            }
          }
        },
        y: {
          ...options.scales.y,
          ticks: {
            ...options.scales.y?.ticks,
            maxTicksLimit: 6,
            font: {
              size: 11
            }
          }
        }
      } : undefined,
      
      // Tablet-optimized elements
      elements: {
        ...options.elements,
        point: {
          ...options.elements?.point,
          radius: 4,
          hoverRadius: 7,
          hitRadius: 8
        },
        line: {
          ...options.elements?.line,
          borderWidth: 2.5
        }
      }
    };
  }

  return options;
};

/**
 * Get touch-optimized chart options for better mobile interaction
 * @param {Object} baseOptions - Base chart options
 * @returns {Object} Touch-optimized options
 */
export const getTouchOptimizedOptions = (baseOptions = {}) => {
  return {
    ...baseOptions,
    
    // Enhanced touch interaction
    interaction: {
      intersect: false,
      mode: 'nearest',
      axis: 'x'
    },
    
    // Larger touch targets
    elements: {
      ...baseOptions.elements,
      point: {
        ...baseOptions.elements?.point,
        hitRadius: 15, // Larger hit area for touch
        hoverRadius: 8
      }
    },
    
    // Touch-friendly tooltips
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins?.tooltip,
        filter: function(tooltipItem) {
          // Only show tooltip for the nearest point on touch devices
          return true;
        },
        external: function(context) {
          // Custom tooltip positioning for touch devices
          const tooltip = context.tooltip;
          if (tooltip.opacity === 0) return;
          
          // Position tooltip to avoid finger obstruction
          const position = context.chart.canvas.getBoundingClientRect();
          const tooltipEl = document.getElementById('chartjs-tooltip');
          
          if (tooltipEl) {
            // Position above finger on touch
            tooltipEl.style.top = (position.top + tooltip.caretY - 60) + 'px';
            tooltipEl.style.left = (position.left + tooltip.caretX) + 'px';
          }
        }
      }
    }
  };
};

/**
 * Get performance-optimized options for mobile devices
 * @param {Object} baseOptions - Base chart options
 * @returns {Object} Performance-optimized options
 */
export const getPerformanceOptimizedOptions = (baseOptions = {}) => {
  return {
    ...baseOptions,
    
    // Disable expensive features on mobile
    animation: {
      duration: 0 // Disable animations for better performance
    },
    
    // Optimize rendering
    responsive: true,
    maintainAspectRatio: false,
    
    // Reduce visual complexity
    elements: {
      ...baseOptions.elements,
      point: {
        ...baseOptions.elements?.point,
        radius: 0, // Hide points for better performance
        hoverRadius: 4
      }
    },
    
    // Simplified plugins
    plugins: {
      ...baseOptions.plugins,
      legend: {
        ...baseOptions.plugins?.legend,
        display: false // Hide legend for performance
      }
    }
  };
};

/**
 * Detect if device needs performance optimizations
 * @returns {boolean} Whether to use performance optimizations
 */
export const shouldUsePerformanceMode = () => {
  // Check for low-end devices
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
  const isLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
  const isOldDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  
  return isSlowConnection || isLowMemory || isOldDevice;
};

export default {
  getMobileOptimizedOptions,
  getTouchOptimizedOptions,
  getPerformanceOptimizedOptions,
  shouldUsePerformanceMode
};