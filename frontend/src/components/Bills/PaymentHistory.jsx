import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import './PaymentHistory.css';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'paid', 'pending', 'overdue'
    const [sortBy, setSortBy] = useState('paymentDate'); // 'paymentDate', 'amount', 'billName'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
    const [selectedPayment, setSelectedPayment] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bills/payments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            } else {
                setError('Failed to fetch payment history');
            }
        } catch (err) {
            setError('Error loading payment history');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredAndSortedPayments = () => {
        let filtered = payments;

        // Apply filter
        if (filter !== 'all') {
            filtered = payments.filter(payment => {
                switch (filter) {
                    case 'paid':
                        return payment.status === 'PAID';
                    case 'pending':
                        return payment.status === 'PENDING';
                    case 'overdue':
                        return payment.status === 'OVERDUE';
                    case 'late':
                        return payment.isLate;
                    default:
                        return true;
                }
            });
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'paymentDate':
                    aValue = new Date(a.paymentDate);
                    bValue = new Date(b.paymentDate);
                    break;
                case 'amount':
                    aValue = parseFloat(a.amountPaid);
                    bValue = parseFloat(b.amountPaid);
                    break;
                case 'billName':
                    aValue = a.billName?.toLowerCase() || '';
                    bValue = b.billName?.toLowerCase() || '';
                    break;
                default:
                    aValue = a[sortBy];
                    bValue = b[sortBy];
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    };

    const getStatusClass = (payment) => {
        switch (payment.status) {
            case 'PAID':
                return payment.isLate ? 'status-paid-late' : 'status-paid';
            case 'PENDING':
                return 'status-pending';
            case 'OVERDUE':
                return 'status-overdue';
            case 'FAILED':
                return 'status-failed';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return 'status-unknown';
        }
    };

    const getPaymentMethodIcon = (method) => {
        switch (method) {
            case 'CREDIT_CARD':
                return '💳';
            case 'DEBIT_CARD':
                return '💳';
            case 'BANK_TRANSFER':
                return '🏦';
            case 'CASH':
                return '💵';
            case 'CHECK':
                return '📝';
            case 'AUTO_PAY':
                return '🔄';
            case 'ONLINE_PAYMENT':
                return '💻';
            case 'MOBILE_PAYMENT':
                return '📱';
            default:
                return '💰';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTotalPaid = () => {
        return getFilteredAndSortedPayments()
            .filter(payment => payment.status === 'PAID')
            .reduce((total, payment) => total + parseFloat(payment.amountPaid), 0);
    };

    const calculateTotalLateFees = () => {
        return getFilteredAndSortedPayments()
            .reduce((total, payment) => total + parseFloat(payment.lateFee || 0), 0);
    };

    const getPaymentStats = () => {
        const filteredPayments = getFilteredAndSortedPayments();
        const paidPayments = filteredPayments.filter(p => p.status === 'PAID');
        const latePayments = filteredPayments.filter(p => p.isLate);
        
        return {
            total: filteredPayments.length,
            paid: paidPayments.length,
            late: latePayments.length,
            onTime: paidPayments.length - latePayments.length
        };
    };

    if (loading) return <LoadingSpinner />;

    const filteredPayments = getFilteredAndSortedPayments();
    const stats = getPaymentStats();

    return (
        <div className="payment-history">
            <div className="payment-history-header">
                <h2>Payment History</h2>
                <div className="payment-stats">
                    <div className="stat-item">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total Payments</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.paid}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.onTime}</span>
                        <span className="stat-label">On Time</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{stats.late}</span>
                        <span className="stat-label">Late</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <Card className="payment-summary">
                <div className="summary-grid">
                    <div className="summary-item">
                        <h3>Total Paid</h3>
                        <div className="summary-value">{formatCurrency(calculateTotalPaid())}</div>
                    </div>
                    <div className="summary-item">
                        <h3>Late Fees</h3>
                        <div className="summary-value late-fees">{formatCurrency(calculateTotalLateFees())}</div>
                    </div>
                    <div className="summary-item">
                        <h3>On-Time Rate</h3>
                        <div className="summary-value">
                            {stats.paid > 0 ? Math.round((stats.onTime / stats.paid) * 100) : 0}%
                        </div>
                    </div>
                </div>
            </Card>

            <div className="payment-controls">
                <div className="filter-controls">
                    <label htmlFor="filter">Filter:</label>
                    <select
                        id="filter"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                        <option value="late">Late Payments</option>
                    </select>
                </div>

                <div className="sort-controls">
                    <label htmlFor="sortBy">Sort by:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="paymentDate">Payment Date</option>
                        <option value="amount">Amount</option>
                        <option value="billName">Bill Name</option>
                    </select>
                    <Button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="sort-order-btn"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                </div>
            </div>

            <div className="payments-list">
                {filteredPayments.length === 0 ? (
                    <Card className="no-payments">
                        <p>No payment history found.</p>
                    </Card>
                ) : (
                    filteredPayments.map(payment => (
                        <Card 
                            key={payment.id} 
                            className={`payment-card ${getStatusClass(payment)}`}
                            onClick={() => setSelectedPayment(payment)}
                        >
                            <div className="payment-main">
                                <div className="payment-info">
                                    <div className="payment-bill-name">{payment.billName}</div>
                                    <div className="payment-date">
                                        Paid: {formatDate(payment.paymentDate)}
                                        {payment.dueDate && (
                                            <span className="due-date">
                                                (Due: {formatDate(payment.dueDate)})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="payment-amount">
                                    {formatCurrency(payment.amountPaid)}
                                    {payment.lateFee > 0 && (
                                        <div className="late-fee">
                                            +{formatCurrency(payment.lateFee)} late fee
                                        </div>
                                    )}
                                </div>
                                
                                <div className="payment-status">
                                    <span className={`status-badge ${getStatusClass(payment)}`}>
                                        {payment.status}
                                    </span>
                                    {payment.isLate && (
                                        <span className="late-badge">
                                            {payment.daysLate} day{payment.daysLate !== 1 ? 's' : ''} late
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="payment-details">
                                {payment.paymentMethod && (
                                    <div className="payment-method">
                                        <span className="method-icon">
                                            {getPaymentMethodIcon(payment.paymentMethod)}
                                        </span>
                                        <span className="method-text">
                                            {payment.paymentMethod.replace('_', ' ')}
                                        </span>
                                    </div>
                                )}
                                
                                {payment.isAutoPay && (
                                    <div className="auto-pay-indicator">
                                        <span className="auto-pay-badge">Auto Pay</span>
                                    </div>
                                )}
                                
                                {payment.confirmationNumber && (
                                    <div className="confirmation">
                                        Confirmation: {payment.confirmationNumber}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {selectedPayment && (
                <div className="payment-modal-overlay" onClick={() => setSelectedPayment(null)}>
                    <Card className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Payment Details</h3>
                            <Button 
                                onClick={() => setSelectedPayment(null)}
                                className="close-btn"
                            >
                                ×
                            </Button>
                        </div>
                        
                        <div className="modal-content">
                            <div className="detail-row">
                                <span className="detail-label">Bill:</span>
                                <span className="detail-value">{selectedPayment.billName}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Amount Paid:</span>
                                <span className="detail-value">{formatCurrency(selectedPayment.amountPaid)}</span>
                            </div>
                            
                            {selectedPayment.lateFee > 0 && (
                                <div className="detail-row">
                                    <span className="detail-label">Late Fee:</span>
                                    <span className="detail-value late-fees">{formatCurrency(selectedPayment.lateFee)}</span>
                                </div>
                            )}
                            
                            <div className="detail-row">
                                <span className="detail-label">Payment Date:</span>
                                <span className="detail-value">{formatDate(selectedPayment.paymentDate)}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Due Date:</span>
                                <span className="detail-value">{formatDate(selectedPayment.dueDate)}</span>
                            </div>
                            
                            <div className="detail-row">
                                <span className="detail-label">Status:</span>
                                <span className={`detail-value status-badge ${getStatusClass(selectedPayment)}`}>
                                    {selectedPayment.status}
                                </span>
                            </div>
                            
                            {selectedPayment.paymentMethod && (
                                <div className="detail-row">
                                    <span className="detail-label">Payment Method:</span>
                                    <span className="detail-value">
                                        {getPaymentMethodIcon(selectedPayment.paymentMethod)} {selectedPayment.paymentMethod.replace('_', ' ')}
                                    </span>
                                </div>
                            )}
                            
                            {selectedPayment.confirmationNumber && (
                                <div className="detail-row">
                                    <span className="detail-label">Confirmation:</span>
                                    <span className="detail-value">{selectedPayment.confirmationNumber}</span>
                                </div>
                            )}
                            
                            {selectedPayment.notes && (
                                <div className="detail-row">
                                    <span className="detail-label">Notes:</span>
                                    <span className="detail-value">{selectedPayment.notes}</span>
                                </div>
                            )}
                            
                            <div className="detail-row">
                                <span className="detail-label">Created:</span>
                                <span className="detail-value">{formatDateTime(selectedPayment.createdAt)}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default PaymentHistory;