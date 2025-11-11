import React, { useState, useEffect } from 'react';
import './NotificationBadge.css';

const NotificationBadge = ({ className = '' }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
        
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch('/api/notifications/unread/count', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const count = await response.json();
                setUnreadCount(count);
            }
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    if (unreadCount === 0) {
        return null;
    }

    return (
        <span className={`notification-badge ${className}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
        </span>
    );
};

export default NotificationBadge;