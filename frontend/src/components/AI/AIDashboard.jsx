import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import { Badge } from '../Common/Badge';
import PersonalizedInsights from './PersonalizedInsights';
import SpendingAnomalies from './SpendingAnomalies';
import PredictiveAnalytics from './PredictiveAnalytics';
import FinancialCoach from './FinancialCoach';
import './AIDashboard.css';

const AIDashboard = ({ userId = 1 }) => {
  const [activeTab, setActiveTab] = useState('insights');

  const tabs = [
    {
      id: 'insights',
      label: 'AI Insights',
      icon: '🧠',
      component: <PersonalizedInsights userId={userId} />
    },
    {
      id: 'anomalies',
      label: 'Anomaly Detection',
      icon: '🛡️',
      component: <SpendingAnomalies userId={userId} />
    },
    {
      id: 'predictions',
      label: 'Predictions',
      icon: '📈',
      component: <PredictiveAnalytics userId={userId} />
    },
    {
      id: 'coach',
      label: 'AI Coach',
      icon: '💬',
      component: <FinancialCoach userId={userId} />
    }
  ];

  return (
    <div className="ai-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>
            <span className="dashboard-icon">🤖</span>
            AI-Powered Financial Insights
          </h1>
          <p>Get personalized recommendations, detect spending anomalies, and predict future financial trends</p>
        </div>
        <div className="ai-status">
          <Badge className="status-badge active">
            AI Analysis Active
          </Badge>
        </div>
      </div>

      <div className="dashboard-tabs">
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-content">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default AIDashboard;