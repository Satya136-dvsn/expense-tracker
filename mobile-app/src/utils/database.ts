import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const DATABASE_NAME = 'BudgetWise.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAYNAME = 'BudgetWise Database';
const DATABASE_SIZE = 200000;

let database: SQLite.SQLiteDatabase;

export const initializeDatabase = async (): Promise<void> => {
  try {
    database = await SQLite.openDatabase({
      name: DATABASE_NAME,
      version: DATABASE_VERSION,
      displayName: DATABASE_DISPLAYNAME,
      size: DATABASE_SIZE,
    });

    console.log('Database opened successfully');
    await createTables();
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const createTables = async (): Promise<void> => {
  try {
    // Transactions table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        amount REAL NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
        date TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Budgets table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        spent REAL DEFAULT 0,
        period TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Goals table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        target_amount REAL NOT NULL,
        current_amount REAL DEFAULT 0,
        target_date TEXT,
        category TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User preferences table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sync queue table
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_name TEXT NOT NULL,
        record_id TEXT NOT NULL,
        action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
        data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Failed to create tables:', error);
    throw error;
  }
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!database) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return database;
};

// Transaction operations
export const addTransaction = async (transaction: any): Promise<void> => {
  try {
    const db = getDatabase();
    await db.executeSql(
      `INSERT INTO transactions (id, amount, description, category, type, date, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.amount,
        transaction.description,
        transaction.category,
        transaction.type,
        transaction.date,
        transaction.synced ? 1 : 0,
      ]
    );
  } catch (error) {
    console.error('Failed to add transaction:', error);
    throw error;
  }
};

export const getTransactions = async (limit = 50): Promise<any[]> => {
  try {
    const db = getDatabase();
    const results = await db.executeSql(
      'SELECT * FROM transactions ORDER BY date DESC LIMIT ?',
      [limit]
    );
    
    const transactions = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      transactions.push(results[0].rows.item(i));
    }
    
    return transactions;
  } catch (error) {
    console.error('Failed to get transactions:', error);
    throw error;
  }
};

export const getPendingTransactions = async (): Promise<any[]> => {
  try {
    const db = getDatabase();
    const results = await db.executeSql(
      'SELECT * FROM transactions WHERE synced = 0 ORDER BY created_at ASC'
    );
    
    const transactions = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      transactions.push(results[0].rows.item(i));
    }
    
    return transactions;
  } catch (error) {
    console.error('Failed to get pending transactions:', error);
    throw error;
  }
};

export const markTransactionSynced = async (id: string): Promise<void> => {
  try {
    const db = getDatabase();
    await db.executeSql(
      'UPDATE transactions SET synced = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  } catch (error) {
    console.error('Failed to mark transaction as synced:', error);
    throw error;
  }
};

// Budget operations
export const addBudget = async (budget: any): Promise<void> => {
  try {
    const db = getDatabase();
    await db.executeSql(
      `INSERT INTO budgets (id, category, amount, spent, period, start_date, end_date, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        budget.id,
        budget.category,
        budget.amount,
        budget.spent || 0,
        budget.period,
        budget.startDate,
        budget.endDate,
        budget.synced ? 1 : 0,
      ]
    );
  } catch (error) {
    console.error('Failed to add budget:', error);
    throw error;
  }
};

export const getBudgets = async (): Promise<any[]> => {
  try {
    const db = getDatabase();
    const results = await db.executeSql(
      'SELECT * FROM budgets ORDER BY created_at DESC'
    );
    
    const budgets = [];
    for (let i = 0; i < results[0].rows.length; i++) {
      budgets.push(results[0].rows.item(i));
    }
    
    return budgets;
  } catch (error) {
    console.error('Failed to get budgets:', error);
    throw error;
  }
};

// User preferences
export const setUserPreference = async (key: string, value: string): Promise<void> => {
  try {
    const db = getDatabase();
    await db.executeSql(
      'INSERT OR REPLACE INTO user_preferences (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value]
    );
  } catch (error) {
    console.error('Failed to set user preference:', error);
    throw error;
  }
};

export const getUserPreference = async (key: string): Promise<string | null> => {
  try {
    const db = getDatabase();
    const results = await db.executeSql(
      'SELECT value FROM user_preferences WHERE key = ?',
      [key]
    );
    
    if (results[0].rows.length > 0) {
      return results[0].rows.item(0).value;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to get user preference:', error);
    throw error;
  }
};

// Cleanup and maintenance
export const clearOldData = async (daysOld = 90): Promise<void> => {
  try {
    const db = getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    await db.executeSql(
      'DELETE FROM transactions WHERE synced = 1 AND created_at < ?',
      [cutoffDate.toISOString()]
    );
    
    console.log('Old synced data cleaned up');
  } catch (error) {
    console.error('Failed to clean up old data:', error);
  }
};

export const getPendingSyncCount = async (): Promise<number> => {
  try {
    const db = getDatabase();
    const results = await db.executeSql(
      'SELECT COUNT(*) as count FROM transactions WHERE synced = 0'
    );
    
    return results[0].rows.item(0).count;
  } catch (error) {
    console.error('Failed to get pending sync count:', error);
    return 0;
  }
};