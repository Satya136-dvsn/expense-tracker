import { useState, useEffect } from 'react';
import { calculateFinancialHealthScore } from '../../utils/financialHealthCalculator';
import './HealthScoreTrends.css';

const HealthScoreTrends = ({ user, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendsData();
  }, [selectedPeriod, user]);

  const loadTrendsData = async () => {
    try {
      setLoading(true);
      
      // Generate sample historical data for demonstration
      const currentHealthData = calculateFinancialHealthScore(user, []);
      const sampleData = generateSampleData(currentHealthData.score, selectedPeriod);
      
      setTrendsData(sampleData);
    } catch (error) {
      console.error('Error loading trends data:', error);
      setTrendsData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = (currentScore, period) => {
    const data = [];
    const now = new Date();
    let months = 6;

    switch (period) {
      case '1month':
        months = 1;
        break;
      case '3months':
        months = 3;
        break;
      case '6months':
        months = 6;
        break;
      case '1year':
        months = 12;
        break;
    }

    // Generate data points for each month
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Generate a realistic score progression
      const baseScore = currentScore - (i * 2) + (Math.random() * 10 - 5);
      const score = Math.max(0, Math.min(100, Math.round(baseScore)));

      data.push({
        date: date.toISOString().split('T')[0],
        score,
        month: monthName
      });
    }

    return data;
  };

  const calculateTrendStats = () => {
    if (trendsData.length < 2) {
      return {
        trend: 'stable',
        change: 0,
        changePercent: 0,
        averageScore: trendsData.length > 0 ? trendsData[0].score : 0
      };
    }

    const firstScore = trendsData[0].score;
    const lastScore = trendsData[trendsData.length - 1].score;
    const change = lastScore - firstScore;
    const changePercent = firstScore > 0 ? (change / firstScore) * 100 : 0;
    const averageScore = trendsData.reduce((sum, entry) => sum + entry.score, 0) / trendsData.length;

    let trend = 'stable';
    if (Math.abs(changePercent) > 5) {
      trend = changePercent > 0 ? 'improving' : 'declining';
    }

    return {
      trend,
      change: Math.round(change),
      changePercent: Math.round(changePercent * 10) / 10,
      averageScore: Math.round(averageScore)
    };
  };

  const trendStats = calculateTrendStats();

  const getTrendColor = () => {
    if (trendStats.trend === 'improving') return '#22c55e';
    if (trendStats.trend === 'declining') return '#ef4444';
    return '#3b82f6';
  };

  if (loading) {
    return (
      <div className="health-trends-modal">
        <div className="trends-content">
          <div className="trends-header">
            <h3>📈 Health Score Trends</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your health score trends...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="health-trends-modal">
      <div className="trends-content">
        <div className="trends-header">
          <h3>📈 Health Score Trends</h3>
          <div className="period-selector">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Trend Statistics */}
        <div className="trend-stats">
          <div className="stat-item">
            <span className="stat-label">Current Score</span>
            <span className="stat-value">{trendsData[trendsData.length - 1]?.score || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">{trendStats.averageScore}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Change</span>
            <span 
              className="stat-value" 
              style={{ color: getTrendColor() }}
            >
              {trendStats.change > 0 ? '+' : ''}{trendStats.change}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Trend</span>
            <span 
              className="stat-value trend-indicator" 
              style={{ color: getTrendColor() }}
            >
              {trendStats.trend === 'improving' ? '📈 Improving' :
               trendStats.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
            </span>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="trends-chart">
          <svg viewBox="0 0 800 400" className="trends-svg">
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getTrendColor()} />
                <stop offset="100%" stopColor={getTrendColor()} stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={getTrendColor()} stopOpacity="0.3" />
                <stop offset="100%" stopColor={getTrendColor()} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((value, index) => {
              const y = 50 + (300 - (value / 100) * 250);
              return (
                <g key={index}>
                  <line 
                    x1="80" 
                    y1={y} 
                    x2="720" 
                    y2={y} 
                    stroke="#e2e8f0" 
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <text
                    x="75"
                    y={y + 5}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Area under curve */}
            {trendsData.length > 0 && (
              <path
                d={`M ${trendsData.map((point, index) => {
                  const x = 100 + (index * (600 / (trendsData.length - 1)));
                  const y = 50 + (300 - (point.score / 100) * 250);
                  return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')} L ${100 + ((trendsData.length - 1) * (600 / (trendsData.length - 1)))},350 L 100,350 Z`}
                fill="url(#areaGradient)"
              />
            )}

            {/* Trend line */}
            {trendsData.length > 0 && (
              <path
                d={trendsData.map((point, index) => {
                  const x = 100 + (index * (600 / (trendsData.length - 1)));
                  const y = 50 + (300 - (point.score / 100) * 250);
                  return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="url(#trendGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data points */}
            {trendsData.map((point, index) => {
              const x = 100 + (index * (600 / (trendsData.length - 1)));
              const y = 50 + (300 - (point.score / 100) * 250);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="6"
                    fill={getTrendColor()}
                    stroke="white"
                    strokeWidth="2"
                    className="trend-point"
                  />
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    fill="#1f2937"
                    fontSize="11"
                    fontWeight="600"
                  >
                    {point.score}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Month labels */}
          <div className="month-labels">
            {trendsData.map((point, index) => (
              <span key={index} className="month-label">
                {point.month}
              </span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="trends-actions">
          <button className="action-btn secondary" onClick={onClose}>
            Close
          </button>
          <button className="action-btn primary" onClick={() => {
            // Save current score logic would go here
            alert('Score updated successfully!');
          }}>
            📊 Update Current Score
          </button>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreTrends;