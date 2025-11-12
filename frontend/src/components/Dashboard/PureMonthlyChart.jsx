import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/currencyFormatter';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PureMonthlyChart = ({ months = 3 }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const generateDemoData = () => {
      const monthNames = ['Jul 25', 'Aug 25', 'Sep 25'];
      const incomeData = [5000, 5200, 5100];
      const expenseData = [3500, 3700, 3600];
      const savingsData = [1500, 1500, 1500];

      return {
        labels: monthNames,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: 'var(--accent-500)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: 'var(--error)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Net Savings',
            data: savingsData,
            borderColor: 'var(--primary-500)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
          }
        ]
      };
    };

    setChartData(generateDemoData());
  }, [months]);

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
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'var(--neutral-400)',
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'var(--neutral-400)',
          callback: function(value) {
            return '₹' + (value / 1000) + 'k';
          }
        }
      }
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default PureMonthlyChart;
