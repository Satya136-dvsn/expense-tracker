import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import LoadingSpinner from '../Common/LoadingSpinner';
import './NotificationCenter.css';

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'bill_reminder', 'bill_overdue'
    const [preferences, setPreferences] = useState(null);
    const [showPreferences, setShowPreferences] = useState(false);

    useEffect(() => {
        fetchNotifications();
        fetchPreferences();
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            } else {
                throw new Error('API not available');
            }
        } catch (err) {
            console.error('Error loading notifications, using mock data:', err);
            // Fallback to mock data
            const mockNotifications = [
                {
                    id: 1,
                    type: 'bill_reminder',
                    title: 'Electricity Bill Due',
                    message: 'Your electricity bill of ₹2,500 is due in 3 days',
                    status: 'unread',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    priority: 'high'
                },
                {
                    id: 2,
                    type: 'budget_alert',
                    title: 'Budget Exceeded',
                    message: 'You have exceeded your dining budget by ₹1,200 this month',
                    status: 'unread',
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    priority: 'medium'
                },
                {
                    id: 3,
                    type: 'goal_progress',
                    title: 'Savings Goal Update',
                    message: 'Great job! You\'re 75% towards your emergency fund goal',
                    status: 'read',
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    priority: 'low'
                }
            ];
            setNotifications(mockNotifications);
        } finally {
            setLoading(false);
        }
    };

    const fetchPreferences = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications/preferences', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (err) {
            console.error('Error loading preferences:', err);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, status: 'READ', readAt: new Date().toISOString() }
                        : notif
                )
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setNotifications(prev => 
                prev.map(notif => ({ 
                    ...notif, 
                    status: 'READ', 
                    readAt: new Date().toISOString() 
                }))
            );
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const updatePreferences = async (updatedPreferences) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/notifications/preferences', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedPreferences)
            });

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
                setShowPreferences(false);
            }
        } catch (err) {
            console.error('Error updating preferences:', err);
        }
    };

    const getFilteredNotifications = () => {
        let filtered = notifications;

        switch (filter) {
            case 'unread':
                filtered = notifications.filter(n => n.status === 'UNREAD');
                break;
            case 'bill_reminder':
                filtered = notifications.filter(n => n.type === 'BILL_REMINDER');
                break;
            case 'bill_overdue':
                filtered = notifications.filter(n => n.type === 'BILL_OVERDUE');
                break;
            default:
                break;
        }

        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'BILL_REMINDER':
                return '🔔';
            case 'BILL_OVERDUE':
                return '⚠️';
            case 'PAYMENT_CONFIRMATION':
                return '✅';
            case 'BUDGET_ALERT':
                return '💰';
            case 'GOAL_MILESTONE':
                return '🎯';
            case 'SYSTEM_NOTIFICATION':
                return 'ℹ️';
            case 'SECURITY_ALERT':
                return '🔒';
            default:
                return '📢';
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'priority-urgent';
            case 'HIGH':
                return 'priority-high';
            case 'MEDIUM':
                return 'priority-medium';
            case 'LOW':
                return 'priority-low';
            default:
                return 'priority-medium';
        }
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

    const getUnreadCount = () => {
        return notifications.filter(n => n.status === 'UNREAD').length;
    };

    if (loading) return <LoadingSpinner />;

    const filteredNotifications = getFilteredNotifications();

    return (
        <div className="notification-center">
            <div className="notification-header">
                <div className="header-title">
                    <h2>Notification Center</h2>
                    {getUnreadCount() > 0 && (
                        <span className="unread-badge">{getUnreadCount()}</span>
                    )}
                </div>
                <div className="header-actions">
                    {getUnreadCount() > 0 && (
                        <Button 
                            onClick={markAllAsRead}
                            className="mark-all-read-btn"
                        >
                            Mark All Read
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}



            <div className="notification-filters">
                <Button 
                    onClick={() => setFilter('all')}
                    className={filter === 'all' ? 'active' : ''}
                >
                    All ({notifications.length})
                </Button>
                <Button 
                    onClick={() => setFilter('unread')}
                    className={filter === 'unread' ? 'active' : ''}
                >
                    Unread ({getUnreadCount()})
                </Button>
                <Button 
                    onClick={() => setFilter('bill_reminder')}
                    className={filter === 'bill_reminder' ? 'active' : ''}
                >
                    Bill Reminders
                </Button>
                <Button 
                    onClick={() => setFilter('bill_overdue')}
                    className={filter === 'bill_overdue' ? 'active' : ''}
                >
                    Overdue Bills
                </Button>
            </div>

            <div className="notifications-list">
                {filteredNotifications.length === 0 ? (
                    <Card className="no-notifications">
                        <div className="no-notifications-content">
                            <span className="no-notifications-icon">🔕</span>
                            <h3>No notifications</h3>
                            <p>You're all caught up! No {filter === 'all' ? '' : filter.replace('_', ' ')} notifications to show.</p>
                        </div>
                    </Card>
                ) : (
                    filteredNotifications.map(notification => (
                        <Card 
                            key={notification.id} 
                            className={`notification-card ${notification.status === 'UNREAD' ? 'unread' : 'read'} ${getPriorityClass(notification.priority)}`}
                        >
                            <div className="notification-content">
                                <div className="notification-header-row">
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-title">
                                        {notification.title}
                                    </div>
                                    <div className="notification-actions">
                                        {notification.status === 'UNREAD' && (
                                            <Button 
                                                onClick={() => markAsRead(notification.id)}
                                                className="mark-read-btn"
                                                size="small"
                                            >
                                                Mark Read
                                            </Button>
                                        )}
                                        <Button 
                                            onClick={() => deleteNotification(notification.id)}
                                            className="delete-btn"
                                            size="small"
                                        >
                                            ×
                                        </Button>
                                    </div>
                                </div>
                                
                                <div className="notification-message">
                                    {notification.message}
                                </div>
                                
                                <div className="notification-footer">
                                    <div className="notification-time">
                                        {formatDateTime(notification.createdAt)}
                                    </div>
                                    {notification.actionUrl && (
                                        <Button 
                                            onClick={() => window.location.href = notification.actionUrl}
                                            className="action-btn"
                                            size="small"
                                        >
                                            {notification.actionText || 'View'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

// Notification Preferences Component
const NotificationPreferences = ({ preferences, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState(preferences);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="preferences-form">
            <div className="preference-section">
                <h4>Email Notifications</h4>
                <label className="preference-item">
                    <input
                        type="checkbox"
                        checked={formData.emailEnabled}
                        onChange={(e) => handleChange('emailEnabled', e.target.checked)}
                    />
                    <span>Enable email notifications</span>
                </label>
                <label className="preference-item">
                    <input
                        type="checkbox"
                        checked={formData.emailBillReminders}
                        onChange={(e) => handleChange('emailBillReminders', e.target.checked)}
                        disabled={!formData.emailEnabled}
                    />
                    <span>Bill reminders</span>
                </label>
                <label className="preference-item">
                    <input
                        type="checkbox"
                        checked={formData.emailOverdueBills}
                        onChange={(e) => handleChange('emailOverdueBills', e.target.checked)}
                        disabled={!formData.emailEnabled}
                    />
                    <span>Overdue bill alerts</span>
                </label>
            </div>

            <div className="preference-section">
                <h4>Push Notifications</h4>
                <label className="preference-item">
                    <input
                        type="checkbox"
                        checked={formData.pushEnabled}
                        onChange={(e) => handleChange('pushEnabled', e.target.checked)}
                    />
                    <span>Enable push notifications</span>
                </label>
                <label className="preference-item">
                    <input
                        type="checkbox"
                        checked={formData.pushBillReminders}
                        onChange={(e) => handleChange('pushBillReminders', e.target.checked)}
                        disabled={!formData.pushEnabled}
                    />
                    <span>Bill reminders</span>
                </label>
            </div>

            <div className="preference-section">
                <h4>Settings</h4>
                <div className="preference-item">
                    <label htmlFor="reminderAdvanceDays">Reminder days in advance:</label>
                    <input
                        type="number"
                        id="reminderAdvanceDays"
                        value={formData.reminderAdvanceDays}
                        onChange={(e) => handleChange('reminderAdvanceDays', parseInt(e.target.value))}
                        min="0"
                        max="30"
                    />
                </div>
            </div>

            <div className="preference-actions">
                <Button type="submit" className="save-btn">
                    Save Preferences
                </Button>
                <Button type="button" onClick={onCancel} className="cancel-btn">
                    Cancel
                </Button>
            </div>
        </form>
    );
};

export default NotificationCenter;