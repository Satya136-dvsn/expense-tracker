-- BudgetWise Application - Sample Data for Testing

-- Ensure testuser1 exists for testing (insert if not exists)
INSERT IGNORE INTO users (username, email, password, role, created_at, updated_at, is_account_non_expired, is_account_non_locked, is_credentials_non_expired, is_enabled, monthly_income, target_expenses, current_savings) 
VALUES ('testuser1', 'testuser1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'USER', NOW(), NOW(), true, true, true, true, 30000.00, 20000.00, 10000.00);

-- Clean database - remove any existing sample data for testuser1
DELETE FROM transactions WHERE user_id = (SELECT id FROM users WHERE username = 'testuser1');
DELETE FROM budgets WHERE user_id = (SELECT id FROM users WHERE username = 'testuser1');
DELETE FROM savings_goals WHERE user_id = (SELECT id FROM users WHERE username = 'testuser1');

-- Add sample transactions for testuser1 to demonstrate the system
INSERT INTO transactions (user_id, title, description, amount, type, category, transaction_date, created_at, updated_at)
SELECT 
    u.id,
    'Monthly Salary',
    'Software Engineer Salary',
    30000.00,
    'INCOME',
    'Salary',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    NOW(),
    NOW()
FROM users u WHERE u.username = 'testuser1';

INSERT INTO transactions (user_id, title, description, amount, type, category, transaction_date, created_at, updated_at)
SELECT 
    u.id,
    'Freelance Project',
    'Web development project',
    15000.00,
    'INCOME',
    'Freelance',
    DATE_SUB(NOW(), INTERVAL 3 DAYS),
    NOW(),
    NOW()
FROM users u WHERE u.username = 'testuser1';

INSERT INTO transactions (user_id, title, description, amount, type, category, transaction_date, created_at, updated_at)
SELECT 
    u.id,
    'Grocery Shopping',
    'Weekly groceries',
    2500.00,
    'EXPENSE',
    'Food & Dining',
    DATE_SUB(NOW(), INTERVAL 2 DAYS),
    NOW(),
    NOW()
FROM users u WHERE u.username = 'testuser1';

INSERT INTO transactions (user_id, title, description, amount, type, category, transaction_date, created_at, updated_at)
SELECT 
    u.id,
    'Electricity Bill',
    'Monthly electricity bill',
    1800.00,
    'EXPENSE',
    'Bills & Utilities',
    DATE_SUB(NOW(), INTERVAL 5 DAYS),
    NOW(),
    NOW()
FROM users u WHERE u.username = 'testuser1';

INSERT INTO transactions (user_id, title, description, amount, type, category, transaction_date, created_at, updated_at)
SELECT 
    u.id,
    'Transportation',
    'Metro and bus fare',
    800.00,
    'EXPENSE',
    'Transportation',
    DATE_SUB(NOW(), INTERVAL 1 DAYS),
    NOW(),
    NOW()
FROM users u WHERE u.username = 'testuser1';