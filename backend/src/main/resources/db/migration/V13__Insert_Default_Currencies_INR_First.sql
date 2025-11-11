-- Insert default currencies with INR (Indian Rupee) as the primary currency
-- This ensures INR is available for all users by default

INSERT IGNORE INTO currencies (code, name, symbol, is_active, created_at, updated_at) VALUES
-- Indian Rupee - Primary currency for Indian market
('INR', 'Indian Rupee', '₹', TRUE, NOW(), NOW()),

-- Major world currencies
('USD', 'US Dollar', '$', TRUE, NOW(), NOW()),
('EUR', 'Euro', '€', TRUE, NOW(), NOW()),
('GBP', 'British Pound', '£', TRUE, NOW(), NOW()),
('JPY', 'Japanese Yen', '¥', TRUE, NOW(), NOW()),
('CAD', 'Canadian Dollar', 'C$', TRUE, NOW(), NOW()),
('AUD', 'Australian Dollar', 'A$', TRUE, NOW(), NOW()),
('CHF', 'Swiss Franc', 'CHF', TRUE, NOW(), NOW()),
('CNY', 'Chinese Yuan', '¥', TRUE, NOW(), NOW()),
('SGD', 'Singapore Dollar', 'S$', TRUE, NOW(), NOW()),

-- Other popular currencies
('KRW', 'South Korean Won', '₩', TRUE, NOW(), NOW()),
('HKD', 'Hong Kong Dollar', 'HK$', TRUE, NOW(), NOW()),
('NZD', 'New Zealand Dollar', 'NZ$', TRUE, NOW(), NOW()),
('SEK', 'Swedish Krona', 'kr', TRUE, NOW(), NOW()),
('NOK', 'Norwegian Krone', 'kr', TRUE, NOW(), NOW()),
('DKK', 'Danish Krone', 'kr', TRUE, NOW(), NOW()),
('PLN', 'Polish Zloty', 'zł', TRUE, NOW(), NOW()),
('CZK', 'Czech Koruna', 'Kč', TRUE, NOW(), NOW()),
('HUF', 'Hungarian Forint', 'Ft', TRUE, NOW(), NOW()),
('RUB', 'Russian Ruble', '₽', TRUE, NOW(), NOW()),

-- South Asian currencies (relevant for Indian users)
('PKR', 'Pakistani Rupee', '₨', TRUE, NOW(), NOW()),
('BDT', 'Bangladeshi Taka', '৳', TRUE, NOW(), NOW()),
('LKR', 'Sri Lankan Rupee', '₨', TRUE, NOW(), NOW()),
('NPR', 'Nepalese Rupee', '₨', TRUE, NOW(), NOW()),

-- Middle Eastern currencies
('AED', 'UAE Dirham', 'د.إ', TRUE, NOW(), NOW()),
('SAR', 'Saudi Riyal', '﷼', TRUE, NOW(), NOW()),
('QAR', 'Qatari Riyal', '﷼', TRUE, NOW(), NOW()),

-- Other major currencies
('BRL', 'Brazilian Real', 'R$', TRUE, NOW(), NOW()),
('MXN', 'Mexican Peso', '$', TRUE, NOW(), NOW()),
('ZAR', 'South African Rand', 'R', TRUE, NOW(), NOW()),
('TRY', 'Turkish Lira', '₺', TRUE, NOW(), NOW()),
('THB', 'Thai Baht', '฿', TRUE, NOW(), NOW()),
('MYR', 'Malaysian Ringgit', 'RM', TRUE, NOW(), NOW()),
('IDR', 'Indonesian Rupiah', 'Rp', TRUE, NOW(), NOW()),
('PHP', 'Philippine Peso', '₱', TRUE, NOW(), NOW()),
('VND', 'Vietnamese Dong', '₫', TRUE, NOW(), NOW());

-- Insert default exchange rates with INR as base currency (rate = 1.0)
INSERT IGNORE INTO exchange_rates (from_currency, to_currency, rate, created_at, updated_at) VALUES
-- INR as base currency
('INR', 'INR', 1.0000, NOW(), NOW()),

-- Sample exchange rates (these should be updated with real-time data)
-- Approximate rates as of 2024 (these will be updated by the exchange rate service)
('INR', 'USD', 0.0120, NOW(), NOW()),
('INR', 'EUR', 0.0110, NOW(), NOW()),
('INR', 'GBP', 0.0095, NOW(), NOW()),
('INR', 'JPY', 1.8000, NOW(), NOW()),
('INR', 'CAD', 0.0165, NOW(), NOW()),
('INR', 'AUD', 0.0185, NOW(), NOW()),
('INR', 'CHF', 0.0108, NOW(), NOW()),
('INR', 'CNY', 0.0870, NOW(), NOW()),
('INR', 'SGD', 0.0162, NOW(), NOW()),

-- Reverse rates (from other currencies to INR)
('USD', 'INR', 83.0000, NOW(), NOW()),
('EUR', 'INR', 90.0000, NOW(), NOW()),
('GBP', 'INR', 105.0000, NOW(), NOW()),
('JPY', 'INR', 0.5556, NOW(), NOW()),
('CAD', 'INR', 60.6061, NOW(), NOW()),
('AUD', 'INR', 54.0541, NOW(), NOW()),
('CHF', 'INR', 92.5926, NOW(), NOW()),
('CNY', 'INR', 11.4943, NOW(), NOW()),
('SGD', 'INR', 61.7284, NOW(), NOW());