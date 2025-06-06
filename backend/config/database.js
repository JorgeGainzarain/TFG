// config/database.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

let db = null;

// Database configuration
const dbConfig = {
    filename: process.env.DB_PATH || path.join(__dirname, '..', 'data', 'bookhub.db'),
    driver: sqlite3.Database
};

// Initialize database connection and create tables
const initDatabase = async () => {
    try {
        // Ensure data directory exists
        const fs = require('fs');
        const dataDir = path.dirname(dbConfig.filename);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Open database connection
        db = await open(dbConfig);

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        // Create tables if they don't exist
        await createTables();

        console.log('✅ SQLite database connected and initialized');
        return db;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        process.exit(1);
    }
};

// Create database tables
const createTables = async () => {
    try {
        // Users table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                preferences TEXT DEFAULT NULL
            );
        `);

        // Create index on email
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        `);

        // User libraries table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS user_libraries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                book_id TEXT NOT NULL,
                shelf TEXT NOT NULL CHECK (shelf IN ('favorites', 'toRead', 'reading', 'read')),
                book_data TEXT NOT NULL,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id, shelf)
            );
        `);

        // Create indexes for user_libraries
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_libraries_user_shelf ON user_libraries(user_id, shelf);
        `);

        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_libraries_book_id ON user_libraries(book_id);
        `);

        // User reviews table (for future use)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS user_reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                book_id TEXT NOT NULL,
                rating INTEGER CHECK (rating >= 1 AND rating <= 5),
                review_text TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, book_id)
            );
        `);

        // Create indexes for user_reviews
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_reviews_user ON user_reviews(user_id);
        `);

        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_user_reviews_book ON user_reviews(book_id);
        `);

        // Refresh tokens table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                token TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Create indexes for refresh_tokens
        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
        `);

        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
        `);

        await db.exec(`
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at);
        `);

        // Create trigger to update updated_at on users table
        await db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_users_timestamp
            AFTER UPDATE ON users
            BEGIN
                UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
        `);

        // Create trigger to update updated_at on user_reviews table
        await db.exec(`
            CREATE TRIGGER IF NOT EXISTS update_reviews_timestamp
            AFTER UPDATE ON user_reviews
            BEGIN
                UPDATE user_reviews SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
        `);

        console.log('✅ Database tables created/verified');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        throw error;
    }
};

// Get database instance
const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return db;
};

// Test connection function
const testConnection = async () => {
    try {
        const db = getDb();
        await db.get('SELECT 1');
        console.log('✅ Database connection test successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection test failed:', error.message);
        return false;
    }
};

// Clean up expired refresh tokens
const cleanupExpiredTokens = async () => {
    try {
        const db = getDb();
        const result = await db.run(
            'DELETE FROM refresh_tokens WHERE expires_at < datetime("now")'
        );
        if (result.changes > 0) {
            console.log(`🧹 Cleaned up ${result.changes} expired refresh tokens`);
        }
    } catch (error) {
        console.error('❌ Error cleaning up tokens:', error.message);
    }
};

// Graceful shutdown
const closeDatabase = async () => {
    try {
        if (db) {
            await db.close();
            console.log('✅ Database connection closed');
        }
    } catch (error) {
        console.error('❌ Error closing database:', error.message);
    }
};

// Handle process termination
process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await closeDatabase();
    process.exit(0);
});

// Run token cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
    initDatabase,
    getDb,
    testConnection,
    closeDatabase,
    cleanupExpiredTokens
};