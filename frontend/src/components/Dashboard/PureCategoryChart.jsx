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
    const generateDemoData = () => {
      const categories = [
        { name: 'Food & Dining', amount: 8500, color: 'var(--accent-500)' },
        { name: 'Transportation', amount: 6200, color: 'var(--primary-500)' },
        { name: 'Shopping', amount: 4800, color: 'var(--secondary-500)' },
        { name: 'Entertainment', amount: 3200, color: 'var(--warning)' },
        { name: 'Bills & Utilities', amount: 2800, color: 'var(--error)' }
      ];

      return {
        labels: categories.map(cat => cat.name),
        datasets: [
          {
            data: categories.map(cat => cat.amount),
            backgroundColor: categories.map(cat => cat.color),
            borderColor: 'rgba(0,0,0,0.2)',
            borderWidth: 2,
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
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
      animateRotate: true,
      animateScale: true,
    },
  };

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Pie data={chartData} options={chartOptions} />
    </div>
  );
};

export default PureCategoryChart;
