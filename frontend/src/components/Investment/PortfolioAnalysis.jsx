import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './PortfolioAnalysis.css';

const PortfolioAnalysis = () => {
  const [analysis, setAnalysis] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      // Mock analysis data
      const mockAnalysis = {
        allocation: {
          stocks: 65,
          bonds: 25,
          cash: 10
        },
        riskMetrics: {
          beta: 1.15,
          volatility: 18.5,
          sharpeRatio: 1.2,
          maxDrawdown: -12.3
        },
        performance: {
          ytd: 8.5,
          oneYear: 12.3,
          threeYear: 9.8,
          fiveYear: 11.2
        },
        diversification: {
          sectors: [
            { name: 'Technology', percentage: 28 },
            { name: 'Healthcare', percentage: 18 },
            { name: 'Financial', percentage: 15 },
            { name: 'Consumer', percentage: 12 },
            { name: 'Industrial', percentage: 10 },
            { name: 'Other', percentage: 17 }
          ],
          geography: [
            { name: 'US', percentage: 70 },
            { name: 'International Developed', percentage: 20 },
            { name: 'Emerging Markets', percentage: 10 }
          ]
        }
      };

      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error fetching analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portfolio-analysis">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Analyzing portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-analysis">
      <div className="analysis-header">
        <h2>📊 Portfolio Analysis</h2>
        <p>Comprehensive analysis of your investment portfolio</p>
      </div>

      {/* Asset Allocation */}
      <div className="allocation-section">
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="allocation-chart">
              {Object.entries(analysis.allocation || {}).map(([asset, percentage]) => (
                <div key={asset} className="allocation-item">
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="allocation-label">
                    <span className="asset-name">{asset}</span>
                    <span className="asset-percentage">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics */}
      <div className="risk-metrics">
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="metrics-grid">
              <div className="metric-item">
                <span className="metric-label">Beta</span>
                <span className="metric-value">{analysis.riskMetrics?.beta}</span>
                <span className="metric-description">Market sensitivity</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Volatility</span>
                <span className="metric-value">{analysis.riskMetrics?.volatility}%</span>
                <span className="metric-description">Price fluctuation</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Sharpe Ratio</span>
                <span className="metric-value">{analysis.riskMetrics?.sharpeRatio}</span>
                <span className="metric-description">Risk-adjusted return</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Max Drawdown</span>
                <span className="metric-value">{analysis.riskMetrics?.maxDrawdown}%</span>
                <span className="metric-description">Largest decline</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance */}
      <div className="performance-section">
        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="performance-grid">
              <div className="performance-item">
                <span className="period">YTD</span>
                <span className="return positive">{analysis.performance?.ytd}%</span>
              </div>
              <div className="performance-item">
                <span className="period">1 Year</span>
                <span className="return positive">{analysis.performance?.oneYear}%</span>
              </div>
              <div className="performance-item">
                <span className="period">3 Years</span>
                <span className="return positive">{analysis.performance?.threeYear}%</span>
              </div>
              <div className="performance-item">
                <span className="period">5 Years</span>
                <span className="return positive">{analysis.performance?.fiveYear}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diversification */}
      <div className="diversification-section">
        <div className="diversification-grid">
          <Card>
            <CardHeader>
              <CardTitle>Sector Diversification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="sector-list">
                {analysis.diversification?.sectors?.map((sector, index) => (
                  <div key={index} className="sector-item">
                    <span className="sector-name">{sector.name}</span>
                    <div className="sector-bar">
                      <div 
                        className="sector-fill"
                        style={{ width: `${sector.percentage}%` }}
                      ></div>
                    </div>
                    <span className="sector-percentage">{sector.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Diversification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="geography-list">
                {analysis.diversification?.geography?.map((region, index) => (
                  <div key={index} className="geography-item">
                    <span className="region-name">{region.name}</span>
                    <div className="region-bar">
                      <div 
                        className="region-fill"
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                    <span className="region-percentage">{region.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAnalysis;