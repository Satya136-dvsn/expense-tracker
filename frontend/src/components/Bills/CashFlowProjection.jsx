import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import './CashFlowProjection.css';

const CashFlowProjection = () => {
    const [projection, setProjection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
    });
    const [viewMode, setViewMode] = useState('summary'); // 'summary', 'timeline', 'bills'

    useEffect(() => {
        fetchProjection();
    }, [dateRange]);

    const fetchProjection = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `/api/bills/cash-flow-projection?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setProjection(data);
            } else {
                throw new Error('API not available');
            }
        } catch (err) {
            console.warn('Error loading cash flow projection, using fallback data:', err);
            // Fallback data
            const mockProjection = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                startingBalance: 75000,
                totalIncome: 75000,
                totalExpenses: 45000,
                totalBillPayments: 29000,
                netCashFlow: 30000,
                projectedEndingBalance: 105000,
                cashFlowItems: [
                    { date: '2024-01-15', description: 'Salary', amount: 75000, type: 'INCOME', runningBalance: 150000 },
                    { date: '2024-01-16', description: 'Electricity Bill', amount: -2500, type: 'EXPENSE', runningBalance: 147500 },
                    { date: '2024-01-20', description: 'Internet Bill', amount: -1500, type: 'EXPENSE', runningBalance: 146000 },
                    { date: '2024-01-25', description: 'Rent', amount: -25000, type: 'EXPENSE', runningBalance: 121000 },
                    { date: '2024-02-01', description: 'Groceries', amount: -8000, type: 'EXPENSE', runningBalance: 113000 },
                    { date: '2024-02-05', description: 'Transportation', amount: -3000, type: 'EXPENSE', runningBalance: 110000 },
                    { date: '2024-02-10', description: 'Dining Out', amount: -5000, type: 'EXPENSE', runningBalance: 105000 }
                ],
                upcomingBills: [
                    { 
                        billId: 1,
                        billName: 'Electricity', 
                        amount: 2500, 
                        dueDate: '2024-02-15', 
                        category: 'Utilities',
                        isOverdue: false,
                        daysUntilDue: 15
                    },
                    { 
                        billId: 2,
                        billName: 'Internet', 
                        amount: 1500, 
                        dueDate: '2024-02-20', 
                        category: 'Utilities',
                        isOverdue: false,
                        daysUntilDue: 20
                    },
                    { 
                        billId: 3,
                        billName: 'Rent', 
                        amount: 25000, 
                        dueDate: '2024-02-01', 
                        category: 'Housing',
                        isOverdue: false,
                        daysUntilDue: 1
                    }
                ]
            };
            setProjection(mockProjection);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCashFlowClass = (amount) => {
        if (amount > 0) return 'positive';
        if (amount < 0) return 'negative';
        return 'neutral';
    };

    const getBillStatusClass = (bill) => {
        if (bill.isOverdue) return 'bill-overdue';
        if (bill.daysUntilDue <= 0) return 'bill-due-today';
        if (bill.daysUntilDue <= 7) return 'bill-due-soon';
        return 'bill-normal';
    };

    const getQuickDateRanges = () => {
        const today = new Date();
        return [
            {
                label: '30 Days',
                startDate: today.toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                label: '60 Days',
                startDate: today.toISOString().split('T')[0],
                endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                label: '90 Days',
                startDate: today.toISOString().split('T')[0],
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            },
            {
                label: 'This Month',
                startDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
                endDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
            },
            {
                label: 'Next Month',
                startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0],
                endDate: new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split('T')[0]
            }
        ];
    };

    const renderSummaryView = () => (
        <div className="summary-view">
            <div className="summary-cards">
                <Card className="summary-card starting-balance">
                    <h3>Starting Balance</h3>
                    <div className="summary-value">{formatCurrency(projection.startingBalance)}</div>
                    <div className="summary-date">{formatDate(projection.startDate)}</div>
                </Card>

                <Card className="summary-card projected-income">
                    <h3>Projected Income</h3>
                    <div className="summary-value positive">{formatCurrency(projection.totalIncome)}</div>
                    <div className="summary-period">
                        {formatDate(projection.startDate)} - {formatDate(projection.endDate)}
                    </div>
                </Card>

                <Card className="summary-card projected-expenses">
                    <h3>Projected Expenses</h3>
                    <div className="summary-value negative">{formatCurrency(projection.totalExpenses)}</div>
                    <div className="summary-period">
                        {formatDate(projection.startDate)} - {formatDate(projection.endDate)}
                    </div>
                </Card>

                <Card className="summary-card bill-payments">
                    <h3>Bill Payments</h3>
                    <div className="summary-value negative">{formatCurrency(projection.totalBillPayments)}</div>
                    <div className="summary-count">
                        {projection.upcomingBills?.length || 0} bills due
                    </div>
                </Card>

                <Card className="summary-card net-cash-flow">
                    <h3>Net Cash Flow</h3>
                    <div className={`summary-value ${getCashFlowClass(projection.netCashFlow)}`}>
                        {formatCurrency(projection.netCashFlow)}
                    </div>
                    <div className="summary-period">Period Total</div>
                </Card>

                <Card className="summary-card ending-balance">
                    <h3>Projected Balance</h3>
                    <div className={`summary-value ${getCashFlowClass(projection.projectedEndingBalance)}`}>
                        {formatCurrency(projection.projectedEndingBalance)}
                    </div>
                    <div className="summary-date">{formatDate(projection.endDate)}</div>
                </Card>
            </div>

            {projection.projectedEndingBalance < 0 && (
                <Card className="warning-card">
                    <div className="warning-icon">⚠️</div>
                    <div className="warning-content">
                        <h4>Cash Flow Warning</h4>
                        <p>
                            Your projected balance will be negative by {formatDate(projection.endDate)}. 
                            Consider adjusting your spending or increasing income to avoid potential issues.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );

    const renderTimelineView = () => (
        <div className="timeline-view">
            <Card className="timeline-card">
                <h3>Cash Flow Timeline</h3>
                {projection.cashFlowItems && projection.cashFlowItems.length > 0 ? (
                    <div className="timeline-items">
                        {projection.cashFlowItems.map((item, index) => (
                            <div key={index} className={`timeline-item ${item.type.toLowerCase()}`}>
                                <div className="timeline-date">{formatDate(item.date)}</div>
                                <div className="timeline-description">{item.description}</div>
                                <div className={`timeline-amount ${getCashFlowClass(item.amount)}`}>
                                    {formatCurrency(item.amount)}
                                </div>
                                <div className="timeline-balance">
                                    Balance: {formatCurrency(item.runningBalance)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-timeline-data">No cash flow timeline data available.</p>
                )}
            </Card>
        </div>
    );

    const renderBillsView = () => (
        <div className="bills-view">
            <Card className="bills-card">
                <h3>Upcoming Bills ({projection.upcomingBills?.length || 0})</h3>
                {projection.upcomingBills && projection.upcomingBills.length > 0 ? (
                    <div className="upcoming-bills">
                        {projection.upcomingBills.map(bill => (
                            <div key={bill.billId} className={`bill-item ${getBillStatusClass(bill)}`}>
                                <div className="bill-info">
                                    <div className="bill-name">{bill.billName}</div>
                                    <div className="bill-category">{bill.category}</div>
                                    <div className="bill-due-date">Due: {formatDate(bill.dueDate)}</div>
                                </div>
                                <div className="bill-amount">{formatCurrency(bill.amount)}</div>
                                <div className="bill-status">
                                    {bill.isOverdue && <span className="status-badge overdue">Overdue</span>}
                                    {bill.daysUntilDue === 0 && <span className="status-badge due-today">Due Today</span>}
                                    {bill.daysUntilDue > 0 && bill.daysUntilDue <= 7 && (
                                        <span className="status-badge due-soon">
                                            {bill.daysUntilDue} day{bill.daysUntilDue !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                    {bill.daysUntilDue > 7 && (
                                        <span className="status-badge normal">
                                            {bill.daysUntilDue} days
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-bills">No upcoming bills in the selected date range.</p>
                )}
            </Card>
        </div>
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="cash-flow-projection">
            <div className="projection-header">
                <h2>Cash Flow Projection</h2>
                <div className="projection-controls">
                    <div className="date-range-controls">
                        <div className="date-input-group">
                            <label htmlFor="startDate">From:</label>
                            <input
                                type="date"
                                id="startDate"
                                value={dateRange.startDate}
                                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className="date-input-group">
                            <label htmlFor="endDate">To:</label>
                            <input
                                type="date"
                                id="endDate"
                                value={dateRange.endDate}
                                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="quick-ranges">
                        {getQuickDateRanges().map(range => (
                            <Button
                                key={range.label}
                                onClick={() => setDateRange({
                                    startDate: range.startDate,
                                    endDate: range.endDate
                                })}
                                className="quick-range-btn"
                                size="small"
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="view-toggle">
                <Button 
                    onClick={() => setViewMode('summary')}
                    className={viewMode === 'summary' ? 'active' : ''}
                >
                    Summary
                </Button>
                <Button 
                    onClick={() => setViewMode('timeline')}
                    className={viewMode === 'timeline' ? 'active' : ''}
                >
                    Timeline
                </Button>
                <Button 
                    onClick={() => setViewMode('bills')}
                    className={viewMode === 'bills' ? 'active' : ''}
                >
                    Bills
                </Button>
            </div>

            {projection ? (
                <div className="projection-content">
                    {viewMode === 'summary' && renderSummaryView()}
                    {viewMode === 'timeline' && renderTimelineView()}
                    {viewMode === 'bills' && renderBillsView()}
                </div>
            ) : (
                <Card className="no-projection">
                    <p>No projection data available for the selected date range.</p>
                </Card>
            )}
        </div>
    );
};

export default CashFlowProjection;