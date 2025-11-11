import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import BillTracker from './BillTracker';
import BillCalendar from './BillCalendar';
import PaymentHistory from './PaymentHistory';
import CashFlowProjection from './CashFlowProjection';
import './BillsDashboard.css';

const BillsDashboard = () => {
    const [activeTab, setActiveTab] = useState('tracker');

    const tabs = [
        { id: 'tracker', label: 'Bill Tracker', icon: '📋' },
        { id: 'calendar', label: 'Calendar', icon: '📅' },
        { id: 'payments', label: 'Payment History', icon: '💳' },
        { id: 'cashflow', label: 'Cash Flow', icon: '📊' }
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'tracker':
                return <BillTracker />;
            case 'calendar':
                return <BillCalendar />;
            case 'payments':
                return <PaymentHistory />;
            case 'cashflow':
                return <CashFlowProjection />;
            default:
                return <BillTracker />;
        }
    };

    return (
        <div className="bills-dashboard">
            <div className="dashboard-header">
                <div className="welcome-section">
                    <h1>Bill Management</h1>
                    <p>Track, manage, and get reminders for all your bills</p>
                </div>
            </div>

            <div className="bills-dashboard-tabs">
                {tabs.map(tab => (
                    <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </Button>
                ))}
            </div>

            <div className="bills-dashboard-content">
                {renderActiveComponent()}
            </div>
        </div>
    );
};

export default BillsDashboard;