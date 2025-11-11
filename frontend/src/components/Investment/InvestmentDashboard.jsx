import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Common/Card';
import { Button } from '../Common/Button';
import api from '../../services/api';
import './InvestmentDashboard.css';

const InvestmentDashboard = () => {
    const [investments, setInvestments] = useState([]);
    const [portfolioSummary, setPortfolioSummary] = useState({
        totalValue: 0,
        totalGainLoss: 0,
        percentageReturn: 0,
        dayChange: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Simulate real-time market data with slight variations
            const baseTime = Date.now();
            const variation = () => (Math.random() - 0.5) * 0.02; // ±1% variation
            
            // Real-time Indian stock data (simulated)
            const mockInvestments = [
                { 
                    id: 1, 
                    symbol: 'RELIANCE', 
                    name: 'Reliance Industries Ltd', 
                    quantity: 10, 
                    currentPrice: 2456.75 * (1 + variation()), 
                    previousClose: 2445.30,
                    dayChange: 11.45,
                    dayChangePercent: 0.47,
                    totalValue: 0,
                    gainLoss: 0,
                    avgBuyPrice: 2350.00
                },
                { 
                    id: 2, 
                    symbol: 'TCS', 
                    name: 'Tata Consultancy Services', 
                    quantity: 5, 
                    currentPrice: 3890.45 * (1 + variation()), 
                    previousClose: 3875.20,
                    dayChange: 15.25,
                    dayChangePercent: 0.39,
                    totalValue: 0,
                    gainLoss: 0,
                    avgBuyPrice: 3720.00
                },
                { 
                    id: 3, 
                    symbol: 'HDFCBANK', 
                    name: 'HDFC Bank Ltd', 
                    quantity: 15, 
                    currentPrice: 1678.90 * (1 + variation()), 
                    previousClose: 1685.75,
                    dayChange: -6.85,
                    dayChangePercent: -0.41,
                    totalValue: 0,
                    gainLoss: 0,
                    avgBuyPrice: 1720.00
                },
                { 
                    id: 4, 
                    symbol: 'INFY', 
                    name: 'Infosys Ltd', 
                    quantity: 8, 
                    currentPrice: 1456.30 * (1 + variation()), 
                    previousClose: 1442.80,
                    dayChange: 13.50,
                    dayChangePercent: 0.94,
                    totalValue: 0,
                    gainLoss: 0,
                    avgBuyPrice: 1380.00
                },
                { 
                    id: 5, 
                    symbol: 'ICICIBANK', 
                    name: 'ICICI Bank Ltd', 
                    quantity: 12, 
                    currentPrice: 1089.65 * (1 + variation()), 
                    previousClose: 1095.40,
                    dayChange: -5.75,
                    dayChangePercent: -0.52,
                    totalValue: 0,
                    gainLoss: 0,
                    avgBuyPrice: 1050.00
                }
            ];

            // Calculate total values and gains/losses
            let totalValue = 0;
            let totalGainLoss = 0;
            let totalInvested = 0;

            mockInvestments.forEach(investment => {
                investment.totalValue = investment.currentPrice * investment.quantity;
                const invested = investment.avgBuyPrice * investment.quantity;
                investment.gainLoss = investment.totalValue - invested;
                
                totalValue += investment.totalValue;
                totalGainLoss += investment.gainLoss;
                totalInvested += invested;
            });

            const percentageReturn = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
            
            // Calculate day change
            const dayChange = mockInvestments.reduce((sum, inv) => 
                sum + (inv.dayChange * inv.quantity), 0);

            const mockSummary = {
                totalValue: totalValue,
                totalGainLoss: totalGainLoss,
                percentageReturn: percentageReturn,
                dayChange: dayChange,
                totalInvested: totalInvested
            };

            setInvestments(mockInvestments);
            setPortfolioSummary(mockSummary);
        } catch (error) {
            console.error('Error fetching investment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshPrices = async () => {
        try {
            setRefreshing(true);
            // Simulate refresh
            setTimeout(() => {
                fetchData();
                setRefreshing(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to refresh prices:', error);
            setRefreshing(false);
        }
    };

    const handleAddInvestment = () => {
        const symbol = prompt('Enter stock symbol (e.g., RELIANCE, TCS, HDFCBANK):');
        if (symbol) {
            const quantity = prompt('Enter quantity:');
            if (quantity && !isNaN(quantity)) {
                alert(`Investment added: ${quantity} shares of ${symbol.toUpperCase()}\n\nThis would normally be saved to your portfolio.`);
                // In a real app, this would call an API to add the investment
            }
        }
    };

    const handleViewAnalytics = () => {
        alert('Portfolio Analytics\n\n📊 Performance: +2.29% overall return\n📈 Best Performer: TCS (+4.5%)\n📉 Needs Attention: HDFCBANK (-2.9%)\n💡 Suggestion: Consider rebalancing your portfolio');
    };

    const handleSetGoals = () => {
        const goalAmount = prompt('Set your investment goal amount (₹):');
        if (goalAmount && !isNaN(goalAmount)) {
            const timeframe = prompt('Target timeframe (years):');
            if (timeframe && !isNaN(timeframe)) {
                const monthlyRequired = (parseFloat(goalAmount) / (parseFloat(timeframe) * 12)).toFixed(0);
                alert(`Investment Goal Set!\n\nTarget: ₹${parseFloat(goalAmount).toLocaleString('en-IN')}\nTimeframe: ${timeframe} years\nRequired Monthly Investment: ₹${parseFloat(monthlyRequired).toLocaleString('en-IN')}`);
            }
        }
    };

    const handleViewMarketData = () => {
        alert('Market Data Overview\n\n📈 NIFTY 50: 21,456 (+0.8%)\n📊 SENSEX: 70,892 (+0.6%)\n🔥 Top Gainers: RELIANCE, TCS, INFY\n❄️ Top Losers: HDFCBANK, ICICIBANK\n\n💡 Market is showing positive momentum today!');
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const formatPercentage = (value) => {
        const num = parseFloat(value || 0);
        return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
    };

    const getPerformanceColor = (value) => {
        const num = parseFloat(value || 0);
        return num >= 0 ? '#10b981' : '#ef4444';
    };

    if (loading) {
        return (
            <div className="investment-dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading investment data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="investment-dashboard">
            <div className="dashboard-header">
                <h1>📈 Investment Portfolio</h1>
                <p>Track your investments and portfolio performance</p>
                <Button 
                    onClick={handleRefreshPrices} 
                    disabled={refreshing}
                    className="refresh-btn"
                >
                    {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Prices'}
                </Button>
            </div>

            {/* Portfolio Summary */}
            <div className="portfolio-summary">
                <Card>
                    <CardHeader>
                        <CardTitle>Portfolio Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <h3>Total Value</h3>
                                <p className="value-large">{formatCurrency(portfolioSummary.totalValue)}</p>
                            </div>
                            <div className="summary-item">
                                <h3>Total Gain/Loss</h3>
                                <p 
                                    className="value-large"
                                    style={{ color: getPerformanceColor(portfolioSummary.totalGainLoss) }}
                                >
                                    {formatCurrency(portfolioSummary.totalGainLoss)}
                                </p>
                            </div>
                            <div className="summary-item">
                                <h3>Return %</h3>
                                <p 
                                    className="value-large"
                                    style={{ color: getPerformanceColor(portfolioSummary.percentageReturn) }}
                                >
                                    {formatPercentage(portfolioSummary.percentageReturn)}
                                </p>
                            </div>
                            <div className="summary-item">
                                <h3>Day Change</h3>
                                <p 
                                    className="value-large"
                                    style={{ color: getPerformanceColor(portfolioSummary.dayChange) }}
                                >
                                    {formatCurrency(portfolioSummary.dayChange)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Holdings Table */}
            <div className="holdings-section">
                <Card>
                    <CardHeader>
                        <CardTitle>Holdings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="holdings-table">
                            <div className="table-header">
                                <div>Symbol</div>
                                <div>Name</div>
                                <div>Quantity</div>
                                <div>Current Price</div>
                                <div>Total Value</div>
                                <div>Gain/Loss</div>
                            </div>
                            {investments.map((investment) => (
                                <div key={investment.id} className="table-row">
                                    <div className="symbol">{investment.symbol}</div>
                                    <div className="name">{investment.name}</div>
                                    <div>{investment.quantity}</div>
                                    <div>{formatCurrency(investment.currentPrice)}</div>
                                    <div>{formatCurrency(investment.totalValue)}</div>
                                    <div 
                                        style={{ color: getPerformanceColor(investment.gainLoss) }}
                                    >
                                        {formatCurrency(investment.gainLoss)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="action-buttons">
                            <Button 
                                className="action-btn"
                                onClick={() => handleAddInvestment()}
                            >
                                ➕ Add Investment
                            </Button>
                            <Button 
                                className="action-btn"
                                onClick={() => handleViewAnalytics()}
                            >
                                📊 View Analytics
                            </Button>
                            <Button 
                                className="action-btn"
                                onClick={() => handleSetGoals()}
                            >
                                🎯 Set Goals
                            </Button>
                            <Button 
                                className="action-btn"
                                onClick={() => handleViewMarketData()}
                            >
                                📈 Market Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InvestmentDashboard;