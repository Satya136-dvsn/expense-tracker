-- Performance optimization indexes for BudgetWise database
-- Run these commands to improve query performance for analytics

-- Index on user_id and transaction_date for time-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions(user_id, transaction_date);

-- Index on user_id, type, and transaction_date for filtered queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_date 
ON transactions(user_id, type, transaction_date);

-- Index on user_id and category for category-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_category 
ON transactions(user_id, category);

-- Index on user_id, category, and transaction_date for category trends
CREATE INDEX IF NOT EXISTS idx_transactions_user_category_date 
ON transactions(user_id, category, transaction_date);

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_transactions_analytics 
ON transactions(user_id, type, category, transaction_date);

-- Index on budgets for budget analysis
CREATE INDEX IF NOT EXISTS idx_budgets_user_month_year 
ON budgets(user_id, budget_month, budget_year);

-- Index on budgets for category analysis
CREATE INDEX IF NOT EXISTS idx_budgets_user_category 
ON budgets(user_id, category);

-- Index on savings goals for progress tracking
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_status 
ON savings_goals(user_id, status);

-- Index on savings goals for date-based queries
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_target_date 
ON savings_goals(user_id, target_date);

-- Index on categories for lookup performance
CREATE INDEX IF NOT EXISTS idx_categories_name_type 
ON categories(name, type);

-- Index on users for authentication
CREATE INDEX IF NOT EXISTS idx_users_username 
ON users(username);

-- Index on users for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Performance statistics
-- Run these to analyze query performance after creating indexes

-- ANALYZE TABLE transactions;
-- ANALYZE TABLE budgets;
-- ANALYZE TABLE savings_goals;
-- ANALYZE TABLE categories;
-- ANALYZE TABLE users;

-- Query to check index usage
-- SHOW INDEX FROM transactions;
-- SHOW INDEX FROM budgets;
-- SHOW INDEX FROM savings_goals;

-- Example query to test performance
-- EXPLAIN SELECT * FROM transactions 
-- WHERE user_id = 1 AND transaction_date BETWEEN '2024-01-01' AND '2024-12-31' 
-- ORDER BY transaction_date DESC;