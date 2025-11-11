import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import './MarketData.css';

const MarketData = () => {
  const [marketData, setMarketData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('indices');

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      // Mock market data
      const mockData = {
        indices: [
          { symbol: 'SPY', name: 'S&P 500', price: 4185.47, change: 23.45, changePercent: 0.56 },
          { symbol: 'QQQ', name: 'NASDAQ 100', price: 351.23, change: -2.18, changePercent: -0.62 },
          { symbol: 'DIA', name: 'Dow Jones', price: 338.92, change: 8.76, changePercent: 0.26 },
          { symbol: 'IWM', name: 'Russell 2000', price: 198.45, change: 1.23, changePercent: 0.62 }
        ],
        trending: [
          { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 2.45, changePercent: 1.66 },
          { symbol: 'MSFT', name: 'Microsoft Corp.', price: 305.18, change: -1.82, changePercent: -0.59 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2485.63, change: 15.42, changePercent: 0.62 },
          { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3245.87, change: -8.23, changePercent: -0.25 },
          { symbol: 'TSLA', name: 'Tesla Inc.', price: 742.15, change: 18.92, changePercent: 2.62 }
        ],
        crypto: [
          { symbol: 'BTC', name: 'Bitcoin', price: 42350.25, change: 1250.45, changePercent: 3.04 },
          { symbol: 'ETH', name: 'Ethereum', price: 2845.67, change: -45.23, changePercent: -1.56 },
          { symbol: 'ADA', name: 'Cardano', price: 1.23, change: 0.05, changePercent: 4.23 },
          { symbol: 'DOT', name: 'Polkadot', price: 18.45, change: -0.67, changePercent: -3.51 }
        ],
        news: [
          {
            title: 'Federal Reserve Maintains Interest Rates',
            summary: 'The Fed decided to keep rates unchanged at 5.25-5.50% range',
            time: '2 hours ago',
            impact: 'neutral'
          },
          {
            title: 'Tech Earnings Season Begins',
            summary: 'Major tech companies report earnings this week',
            time: '4 hours ago',
            impact: 'positive'
          },
          {
            title: 'Oil Prices Rise on Supply Concerns',
            summary: 'Crude oil futures up 3% on geopolitical tensions',
            time: '6 hours ago',
            impact: 'mixed'
          }
        ]
      };

      setMarketData(mockData);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatChange = (change, changePercent) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const getChangeColor = (change) => {
    return change >= 0 ? '#10b981' : '#ef4444';
  };

  if (loading) {
    return (
      <div className="market-data">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="market-data">
      <div className="market-header">
        <h2>📈 Market Data</h2>
        <p>Real-time market information and trends</p>
        <Button onClick={fetchMarketData} className="refresh-btn">
          🔄 Refresh Data
        </Button>
      </div>

      <div className="market-tabs">
        <Button 
          className={selectedTab === 'indices' ? 'active' : ''}
          onClick={() => setSelectedTab('indices')}
        >
          📊 Indices
        </Button>
        <Button 
          className={selectedTab === 'trending' ? 'active' : ''}
          onClick={() => setSelectedTab('trending')}
        >
          🔥 Trending
        </Button>
        <Button 
          className={selectedTab === 'crypto' ? 'active' : ''}
          onClick={() => setSelectedTab('crypto')}
        >
          ₿ Crypto
        </Button>
        <Button 
          className={selectedTab === 'news' ? 'active' : ''}
          onClick={() => setSelectedTab('news')}
        >
          📰 News
        </Button>
      </div>

      <div className="market-content">
        {selectedTab !== 'news' && (
          <div className="securities-list">
            {marketData[selectedTab]?.map((item, index) => (
              <Card key={index} className="security-card">
                <CardContent>
                  <div className="security-header">
                    <div className="security-info">
                      <h3 className="symbol">{item.symbol}</h3>
                      <p className="name">{item.name}</p>
                    </div>
                    <div className="security-price">
                      <span className="price">{formatPrice(item.price)}</span>
                      <span 
                        className="change"
                        style={{ color: getChangeColor(item.change) }}
                      >
                        {formatChange(item.change, item.changePercent)}
                      </span>
                    </div>
                  </div>
                  <div className="security-actions">
                    <Button className="action-btn">View Chart</Button>
                    <Button className="action-btn">Add to Watchlist</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedTab === 'news' && (
          <div className="news-list">
            {marketData.news?.map((article, index) => (
              <Card key={index} className="news-card">
                <CardContent>
                  <div className="news-header">
                    <h3 className="news-title">{article.title}</h3>
                    <div className="news-meta">
                      <span className="news-time">{article.time}</span>
                      <span className={`impact-badge ${article.impact}`}>
                        {article.impact}
                      </span>
                    </div>
                  </div>
                  <p className="news-summary">{article.summary}</p>
                  <div className="news-actions">
                    <Button className="action-btn">Read More</Button>
                    <Button className="action-btn">Share</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Market Summary */}
      <div className="market-summary">
        <Card>
          <CardHeader>
            <CardTitle>📊 Market Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Market Status</span>
                <span className="value status open">Open</span>
              </div>
              <div className="summary-item">
                <span className="label">Trading Volume</span>
                <span className="value">2.4B shares</span>
              </div>
              <div className="summary-item">
                <span className="label">Advancing</span>
                <span className="value positive">1,847</span>
              </div>
              <div className="summary-item">
                <span className="label">Declining</span>
                <span className="value negative">1,234</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Watchlist */}
      <div className="watchlist-section">
        <Card>
          <CardHeader>
            <CardTitle>⭐ My Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="watchlist-empty">
              <p>Your watchlist is empty</p>
              <Button className="add-btn">+ Add Securities</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketData;