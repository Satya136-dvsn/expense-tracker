import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import './BillCalendar.css';

const BillCalendar = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'list'

    useEffect(() => {
        fetchBills();
    }, [currentDate]);

    const fetchBills = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Get bills for the current month
            const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            const response = await fetch(
                `/api/bills/due-range?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setBills(data);
            } else {
                setError('Failed to fetch bills');
            }
        } catch (err) {
            setError('Error loading bills');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getBillsForDate = (date) => {
        const dateString = date.toISOString().split('T')[0];
        return bills.filter(bill => bill.nextDueDate === dateString);
    };

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + direction);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
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
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getBillStatusClass = (bill) => {
        if (bill.isOverdue) return 'bill-overdue';
        if (bill.isDueToday) return 'bill-due-today';
        if (bill.needsReminder) return 'bill-reminder';
        return 'bill-normal';
    };

    const renderCalendarView = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateString = date.toISOString().split('T')[0];
            const dayBills = getBillsForDate(date);
            const isToday = dateString === todayString;
            const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateString;

            days.push(
                <div
                    key={day}
                    className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayBills.length > 0 ? 'has-bills' : ''}`}
                    onClick={() => setSelectedDate(date)}
                >
                    <div className="day-number">{day}</div>
                    {dayBills.length > 0 && (
                        <div className="day-bills">
                            {dayBills.slice(0, 3).map(bill => (
                                <div
                                    key={bill.id}
                                    className={`bill-indicator ${getBillStatusClass(bill)}`}
                                    title={`${bill.name} - ${formatCurrency(bill.amount)}`}
                                >
                                    {bill.name.substring(0, 10)}...
                                </div>
                            ))}
                            {dayBills.length > 3 && (
                                <div className="more-bills">+{dayBills.length - 3} more</div>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return days;
    };

    const renderListView = () => {
        const sortedBills = [...bills].sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));
        const groupedBills = {};

        sortedBills.forEach(bill => {
            const date = bill.nextDueDate;
            if (!groupedBills[date]) {
                groupedBills[date] = [];
            }
            groupedBills[date].push(bill);
        });

        return Object.entries(groupedBills).map(([date, dateBills]) => (
            <div key={date} className="date-group">
                <h3 className="date-header">{formatDate(date)}</h3>
                <div className="date-bills">
                    {dateBills.map(bill => (
                        <div key={bill.id} className={`bill-item ${getBillStatusClass(bill)}`}>
                            <div className="bill-info">
                                <div className="bill-name">{bill.name}</div>
                                <div className="bill-category">{bill.category}</div>
                            </div>
                            <div className="bill-amount">{formatCurrency(bill.amount)}</div>
                            <div className="bill-status">
                                {bill.isOverdue && <span className="status-badge overdue">Overdue</span>}
                                {bill.isDueToday && <span className="status-badge due-today">Due Today</span>}
                                {bill.needsReminder && !bill.isDueToday && <span className="status-badge reminder">Reminder</span>}
                                {bill.autoPay && <span className="status-badge auto-pay">Auto Pay</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="bill-calendar">
            <div className="calendar-header">
                <div className="calendar-nav">
                    <Button onClick={() => navigateMonth(-1)} className="nav-btn">
                        ← Previous
                    </Button>
                    <h2 className="current-month">
                        {currentDate.toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                        })}
                    </h2>
                    <Button onClick={() => navigateMonth(1)} className="nav-btn">
                        Next →
                    </Button>
                </div>
                
                <div className="calendar-controls">
                    <Button onClick={goToToday} className="today-btn">
                        Today
                    </Button>
                    <div className="view-toggle">
                        <Button 
                            onClick={() => setViewMode('month')}
                            className={viewMode === 'month' ? 'active' : ''}
                        >
                            Calendar
                        </Button>
                        <Button 
                            onClick={() => setViewMode('list')}
                            className={viewMode === 'list' ? 'active' : ''}
                        >
                            List
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {viewMode === 'month' ? (
                <div className="calendar-container">
                    <div className="calendar-grid">
                        <div className="weekday-header">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="weekday">{day}</div>
                            ))}
                        </div>
                        <div className="calendar-days">
                            {renderCalendarView()}
                        </div>
                    </div>

                    {selectedDate && (
                        <Card className="selected-date-details">
                            <h3>{formatDate(selectedDate.toISOString().split('T')[0])}</h3>
                            {getBillsForDate(selectedDate).length === 0 ? (
                                <p>No bills due on this date.</p>
                            ) : (
                                <div className="selected-date-bills">
                                    {getBillsForDate(selectedDate).map(bill => (
                                        <div key={bill.id} className={`selected-bill ${getBillStatusClass(bill)}`}>
                                            <div className="bill-details">
                                                <div className="bill-name">{bill.name}</div>
                                                <div className="bill-category">{bill.category}</div>
                                            </div>
                                            <div className="bill-amount">{formatCurrency(bill.amount)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            ) : (
                <div className="list-container">
                    {bills.length === 0 ? (
                        <Card className="no-bills">
                            <p>No bills found for this month.</p>
                        </Card>
                    ) : (
                        renderListView()
                    )}
                </div>
            )}
        </div>
    );
};

export default BillCalendar;