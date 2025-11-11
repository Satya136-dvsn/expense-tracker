import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import './BillTracker.css';

const BillTracker = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        category: '',
        frequency: 'MONTHLY',
        dueDate: '',
        autoPay: false,
        reminderDaysBefore: 3,
        payee: '',
        accountNumber: '',
        websiteUrl: '',
        notes: ''
    });

    const frequencies = [
        { value: 'ONE_TIME', label: 'One Time' },
        { value: 'WEEKLY', label: 'Weekly' },
        { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
        { value: 'MONTHLY', label: 'Monthly' },
        { value: 'QUARTERLY', label: 'Quarterly' },
        { value: 'SEMI_ANNUALLY', label: 'Semi-Annually' },
        { value: 'ANNUALLY', label: 'Annually' }
    ];

    const categories = [
        'Utilities', 'Rent/Mortgage', 'Insurance', 'Phone/Internet',
        'Subscriptions', 'Loans', 'Credit Cards', 'Other'
    ];

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bills', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBills(data);
                setError(null);
            } else {
                throw new Error('API not available');
            }
        } catch (err) {
            console.warn('Error loading bills, using fallback data:', err);
            // Fallback bills data
            const mockBills = [
                {
                    id: 1,
                    name: 'Electricity Bill',
                    amount: 2500,
                    category: 'Utilities',
                    frequency: 'MONTHLY',
                    nextDueDate: '2024-02-15',
                    daysUntilDue: 15,
                    autoPay: false,
                    isOverdue: false,
                    isDueToday: false,
                    needsReminder: false
                },
                {
                    id: 2,
                    name: 'Internet Bill',
                    amount: 1500,
                    category: 'Phone/Internet',
                    frequency: 'MONTHLY',
                    nextDueDate: '2024-02-20',
                    daysUntilDue: 20,
                    autoPay: true,
                    isOverdue: false,
                    isDueToday: false,
                    needsReminder: false
                },
                {
                    id: 3,
                    name: 'Rent',
                    amount: 25000,
                    category: 'Rent/Mortgage',
                    frequency: 'MONTHLY',
                    nextDueDate: '2024-02-01',
                    daysUntilDue: 1,
                    autoPay: false,
                    isOverdue: false,
                    isDueToday: false,
                    needsReminder: true
                },
                {
                    id: 4,
                    name: 'Car Insurance',
                    amount: 8000,
                    category: 'Insurance',
                    frequency: 'QUARTERLY',
                    nextDueDate: '2024-03-15',
                    daysUntilDue: 45,
                    autoPay: true,
                    isOverdue: false,
                    isDueToday: false,
                    needsReminder: false
                }
            ];
            setBills(mockBills);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            const url = editingBill ? `/api/bills/${editingBill.id}` : '/api/bills';
            const method = editingBill ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount)
                })
            });

            if (response.ok) {
                await fetchBills();
                resetForm();
                setShowAddForm(false);
                setEditingBill(null);
            } else {
                setError('Failed to save bill');
            }
        } catch (err) {
            setError('Error saving bill');
        }
    };

    const handleEdit = (bill) => {
        setEditingBill(bill);
        setFormData({
            name: bill.name || '',
            description: bill.description || '',
            amount: bill.amount?.toString() || '',
            category: bill.category || '',
            frequency: bill.frequency || 'MONTHLY',
            dueDate: bill.dueDate || '',
            autoPay: bill.autoPay || false,
            reminderDaysBefore: bill.reminderDaysBefore || 3,
            payee: bill.payee || '',
            accountNumber: bill.accountNumber || '',
            websiteUrl: bill.websiteUrl || '',
            notes: bill.notes || ''
        });
        setShowAddForm(true);
    };

    const handleDelete = async (billId) => {
        if (!window.confirm('Are you sure you want to delete this bill?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/bills/${billId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                await fetchBills();
            } else {
                setError('Failed to delete bill');
            }
        } catch (err) {
            setError('Error deleting bill');
        }
    };

    const handleMarkAsPaid = async (bill) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/bills/${bill.id}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    billId: bill.id,
                    amountPaid: bill.amount,
                    paymentDate: new Date().toISOString().split('T')[0],
                    dueDate: bill.nextDueDate,
                    status: 'PAID',
                    paymentMethod: 'OTHER'
                })
            });

            if (response.ok) {
                await fetchBills();
            } else {
                setError('Failed to mark bill as paid');
            }
        } catch (err) {
            setError('Error marking bill as paid');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            amount: '',
            category: '',
            frequency: 'MONTHLY',
            dueDate: '',
            autoPay: false,
            reminderDaysBefore: 3,
            payee: '',
            accountNumber: '',
            websiteUrl: '',
            notes: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const getBillStatusClass = (bill) => {
        if (bill.isOverdue) return 'bill-overdue';
        if (bill.isDueToday) return 'bill-due-today';
        if (bill.needsReminder) return 'bill-reminder';
        return 'bill-normal';
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bill-tracker">
            <div className="bill-tracker-header">
                <h2>Bill Tracker</h2>
                <Button 
                    onClick={() => setShowAddForm(true)}
                    className="add-bill-btn"
                >
                    Add New Bill
                </Button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {showAddForm && (
                <Card className="bill-form-card">
                    <h3>{editingBill ? 'Edit Bill' : 'Add New Bill'}</h3>
                    <form onSubmit={handleSubmit} className="bill-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Bill Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="amount">Amount *</label>
                                <input
                                    type="number"
                                    id="amount"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="category">Category *</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="frequency">Frequency *</label>
                                <select
                                    id="frequency"
                                    name="frequency"
                                    value={formData.frequency}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {frequencies.map(freq => (
                                        <option key={freq.value} value={freq.value}>
                                            {freq.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="dueDate">Due Date *</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="reminderDaysBefore">Reminder Days Before</label>
                                <input
                                    type="number"
                                    id="reminderDaysBefore"
                                    name="reminderDaysBefore"
                                    value={formData.reminderDaysBefore}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="30"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="payee">Payee</label>
                                <input
                                    type="text"
                                    id="payee"
                                    name="payee"
                                    value={formData.payee}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="websiteUrl">Website URL</label>
                                <input
                                    type="url"
                                    id="websiteUrl"
                                    name="websiteUrl"
                                    value={formData.websiteUrl}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="autoPay"
                                    checked={formData.autoPay}
                                    onChange={handleInputChange}
                                />
                                Auto Pay Enabled
                            </label>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" className="save-btn">
                                {editingBill ? 'Update Bill' : 'Add Bill'}
                            </Button>
                            <Button 
                                type="button" 
                                onClick={() => {
                                    setShowAddForm(false);
                                    setEditingBill(null);
                                    resetForm();
                                }}
                                className="cancel-btn"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="bills-grid">
                {bills.length === 0 ? (
                    <Card className="no-bills">
                        <p>No bills found. Add your first bill to get started!</p>
                    </Card>
                ) : (
                    bills.map(bill => (
                        <Card key={bill.id} className={`bill-card ${getBillStatusClass(bill)}`}>
                            <div className="bill-header">
                                <h3>{bill.name}</h3>
                                <div className="bill-amount">
                                    {formatCurrency(bill.amount)}
                                </div>
                            </div>
                            
                            <div className="bill-details">
                                <div className="bill-info">
                                    <span className="label">Category:</span>
                                    <span>{bill.category}</span>
                                </div>
                                <div className="bill-info">
                                    <span className="label">Frequency:</span>
                                    <span>{frequencies.find(f => f.value === bill.frequency)?.label}</span>
                                </div>
                                <div className="bill-info">
                                    <span className="label">Next Due:</span>
                                    <span>{formatDate(bill.nextDueDate)}</span>
                                </div>
                                {bill.daysUntilDue !== null && (
                                    <div className="bill-info">
                                        <span className="label">Days Until Due:</span>
                                        <span className={bill.daysUntilDue < 0 ? 'overdue' : ''}>
                                            {bill.daysUntilDue < 0 ? 
                                                `${Math.abs(bill.daysUntilDue)} days overdue` : 
                                                `${bill.daysUntilDue} days`
                                            }
                                        </span>
                                    </div>
                                )}
                                {bill.autoPay && (
                                    <div className="bill-info">
                                        <span className="auto-pay-badge">Auto Pay</span>
                                    </div>
                                )}
                            </div>

                            <div className="bill-actions">
                                <Button 
                                    onClick={() => handleMarkAsPaid(bill)}
                                    className="pay-btn"
                                    size="small"
                                >
                                    Mark as Paid
                                </Button>
                                <Button 
                                    onClick={() => handleEdit(bill)}
                                    className="edit-btn"
                                    size="small"
                                >
                                    Edit
                                </Button>
                                <Button 
                                    onClick={() => handleDelete(bill.id)}
                                    className="delete-btn"
                                    size="small"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default BillTracker;