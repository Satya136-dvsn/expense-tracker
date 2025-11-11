# Bill Reminder and Notification System Setup Guide

## Overview
The Bill Reminder and Notification System has been successfully implemented and integrated into the BudgetWise application. This guide will help you access and use the new features.

## New Features Added

### 1. Bill Management Dashboard
- **Location**: Navigate to "Bills" in the sidebar (📋 icon)
- **URL**: `/bills`
- **Features**:
  - Bill Tracker: Create, edit, and manage recurring bills
  - Calendar View: Visual calendar showing bill due dates
  - Payment History: Track all bill payments with filtering
  - Cash Flow Projection: Forecast upcoming expenses and cash flow

### 2. Notification Center
- **Location**: Navigate to "Notifications" in the sidebar (🔔 icon)
- **URL**: `/notifications`
- **Features**:
  - View all notifications with filtering options
  - Mark notifications as read/unread
  - Customize notification preferences
  - Real-time unread count badge in sidebar

## How to Access

### Step 1: Start the Application
1. Make sure your backend is running on port 8080
2. Make sure your frontend is running on port 3000
3. Log in to your BudgetWise account

### Step 2: Navigate to Bills
1. Look for the "Bills" option in the left sidebar (📋 icon)
2. Click on it to access the Bill Management Dashboard
3. You'll see 4 tabs: Bill Tracker, Calendar, Payment History, and Cash Flow

### Step 3: Navigate to Notifications
1. Look for the "Notifications" option in the left sidebar (🔔 icon)
2. If you have unread notifications, you'll see a red badge with the count
3. Click on it to access the Notification Center

## Database Setup

The following tables have been added to your database:

1. **bills** - Stores bill information
2. **bill_payments** - Tracks payment history
3. **notifications** - Stores all notifications
4. **notification_preferences** - User notification settings

### To Set Up the Database:
1. Run the updated `backend/database_setup.sql` script
2. The tables will be created automatically when you start the Spring Boot application

## API Endpoints

### Bill Management
- `GET /api/bills` - Get user's bills
- `POST /api/bills` - Create new bill
- `PUT /api/bills/{id}` - Update bill
- `DELETE /api/bills/{id}` - Delete bill
- `POST /api/bills/{id}/payments` - Mark bill as paid
- `GET /api/bills/cash-flow-projection` - Get cash flow projection

### Notifications
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update preferences

## Features in Detail

### Bill Tracker
- Add recurring bills with different frequencies (weekly, monthly, yearly, etc.)
- Set reminder days before due date
- Enable/disable auto-pay tracking
- Categorize bills (Utilities, Rent, Insurance, etc.)
- Add payee information and website URLs

### Bill Calendar
- Visual calendar view of all bills
- Color-coded by status (overdue, due today, upcoming)
- Switch between calendar and list views
- Click on dates to see bills due that day

### Payment History
- Complete history of all bill payments
- Filter by status (paid, pending, overdue, late)
- Sort by date, amount, or bill name
- Track late fees and payment methods
- View payment statistics and trends

### Cash Flow Projection
- Forecast future cash flow including upcoming bills
- Visual timeline of income, expenses, and bill payments
- Summary cards showing projected balances
- Warnings for potential cash flow issues

### Notification System
- Automatic bill reminders based on user preferences
- Overdue bill alerts with escalating urgency
- Payment confirmations
- Customizable notification channels (email, push, in-app)
- Quiet hours and timezone settings

## Troubleshooting

### If Bills/Notifications Don't Appear in Sidebar:
1. Make sure you're logged in
2. Refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Check browser console for any JavaScript errors

### If API Calls Fail:
1. Ensure backend is running on port 8080
2. Check that database tables were created successfully
3. Verify JWT token is valid (try logging out and back in)

### If Notifications Don't Work:
1. Check notification preferences in the Notification Center
2. Ensure email service is configured (if using email notifications)
3. Check browser console for any errors

## Testing the System

### Test Bill Creation:
1. Go to Bills → Bill Tracker
2. Click "Add New Bill"
3. Fill in required fields (name, amount, category, frequency, due date)
4. Save and verify it appears in the list

### Test Notifications:
1. Create a bill with due date in 1-3 days
2. Set reminder days to 3
3. The system will automatically create notifications
4. Check the Notification Center for bill reminders

### Test Payment Tracking:
1. Create a bill
2. Click "Mark as Paid" on the bill
3. Fill in payment details
4. Check Payment History tab to see the record

## Next Steps

The system is now fully functional and ready for use. You can:

1. Start adding your real bills to track them
2. Customize notification preferences to your liking
3. Use the cash flow projection to plan your finances
4. Set up email notifications (requires SMTP configuration)

## Support

If you encounter any issues or need help with the system, the components are well-documented and include error handling for common scenarios.