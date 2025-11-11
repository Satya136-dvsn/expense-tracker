-- Create user_profiles table for managing user preferences and settings
CREATE TABLE user_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    preferred_currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    number_format VARCHAR(20) DEFAULT 'IN',
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    budget_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    bill_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    investment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_summary BOOLEAN NOT NULL DEFAULT TRUE,
    monthly_report BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_user_profiles_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_profiles_user_id (user_id),
    INDEX idx_user_profiles_currency (preferred_currency),
    INDEX idx_user_profiles_notifications (email_notifications, sms_notifications, push_notifications)
);

-- Insert default profiles for existing users with INR as default currency
INSERT INTO user_profiles (user_id, preferred_currency, timezone, date_format, number_format)
SELECT id, 'INR', 'Asia/Kolkata', 'DD/MM/YYYY', 'IN'
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_profiles);

-- Update existing currency references to default to INR
-- This ensures all existing data uses INR as the base currency
UPDATE transactions SET currency = 'INR' WHERE currency IS NULL OR currency = '';
UPDATE budgets SET currency = 'INR' WHERE currency IS NULL OR currency = '';
UPDATE savings_goals SET currency = 'INR' WHERE currency IS NULL OR currency = '';