import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { formatCurrency } from '../../utils/currencyFormatter';

ChartJS.register(ArcElement, Tooltip, Legend);

const PureCategoryChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Generate demo data for the chart
    const generateDemoData = () => {
      const categories = [
        { name: 'Food & Dining', amount: 8500, color: '#10b981' },
        { name: 'Transportation', amount: 6200, color: '#3b82f6' },
        { name: 'Shopping', amount: 4800, color: '#8b5cf6' },
        { name: 'Entertainment', amount: 3200, color: '#f59e0b' },
        { name: 'Bills & Utilities', amount: 2800, color: '#ef4444' }
      ];

      const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

      return {
        labels: categories.map(cat => cat.name),
        datasets: [
          {
            data: categories.map(cat => cat.amount),
            backgroundColor: categories.map(cat => cat.color),
            borderColor: categories.map(cat => cat.color),
            borderWidth: 2,
            hoverBackgroundColor: categories.map(cat => cat.color),
            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3,
          }
        ]
      };
    };

    setChartData(generateDemoData());
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide legend for clean look
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        hoverBorderWidth: 3
      }
    },
    cutout: 0, // Full pie chart
    radius: '90%', // Make it fill most of the container
  };

  if (!chartData) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        Loading chart...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default PureCategoryChart;