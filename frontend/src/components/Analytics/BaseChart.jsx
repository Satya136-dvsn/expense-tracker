import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Default chart options following the existing design system
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index',
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: 'Inter, system-ui, sans-serif'
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#f9fafb',
      bodyColor: '#f9fafb',
      borderColor: '#374151',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        size: 14,
        weight: '600'
      },
      bodyFont: {
        size: 13
      },
      displayColors: true,
      callbacks: {
        label: function(context) {
          const label = context.dataset.label || '';
          const value = context.parsed.y || context.parsed;
          
          // Format currency values
          if (typeof value === 'number') {
            const formatter = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            });
            return `${label}: ${formatter.format(value)}`;
          }
          
          return `${label}: ${value}`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6b7280'
      }
    },
    y: {
      grid: {
        color: '#f3f4f6',
        drawBorder: false
      },
      ticks: {
        font: {
          size: 11,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#6b7280',
        callback: function(value) {
          // Format y-axis labels as currency
          const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
            notation: value >= 1000 ? 'compact' : 'standard'
          });
          return formatter.format(value);
        }
      }
    }
  }
};

// Color palette following the existing design system
export const chartColors = {
  primary: '#10b981',      // emerald-500 (main brand color)
  secondary: '#3b82f6',    // blue-500
  accent: '#8b5cf6',       // violet-500
  warning: '#f59e0b',      // amber-500
  danger: '#ef4444',       // red-500
  success: '#22c55e',      // green-500
  info: '#06b6d4',         // cyan-500
  gray: '#6b7280',         // gray-500
  
  // Gradient colors for income/expense
  income: '#10b981',       // emerald-500
  expense: '#ef4444',      // red-500
  savings: '#3b82f6',      // blue-500
  
  // Category colors (cycling through palette)
  categories: [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', 
    '#ef4444', '#22c55e', '#06b6d4', '#ec4899',
    '#84cc16', '#f97316', '#6366f1', '#14b8a6'
  ]
};

// Utility function to get category color
export const getCategoryColor = (index) => {
  return chartColors.categories[index % chartColors.categories.length];
};

// Utility function to create gradient
export const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

// Base chart component wrapper
const BaseChart = ({ children, ...props }) => {
  return (
    <div className="base-chart" {...props}>
      {children}
    </div>
  );
};

export default BaseChart;