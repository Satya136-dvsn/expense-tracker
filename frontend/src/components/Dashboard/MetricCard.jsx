import React from 'react';
import { GlassCard } from '../Glass';
import './MetricCard.css';

const MetricCard = ({ title, value, trend, icon }) => {
  const trendColor = trend > 0 ? 'var(--success)' : 'var(--error)';
  return (
    <GlassCard elevation={3} glow={true}>
      <div className="metric-card">
        <div className="metric-card-header">
          <div className="metric-card-icon">{icon}</div>
          <div className="metric-card-trend" style={{ color: trendColor }}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </div>
        </div>
        <div className="metric-card-value">{value}</div>
        <div className="metric-card-title">{title}</div>
      </div>
    </GlassCard>
  );
};

export default MetricCard;
