// models/User.js
const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.preferences = data.preferences ? JSON.parse(data.preferences) : {};
    }

    // Create a new user
    static async create(userData) {
        const { name, email, password, preferences = {} } = userData;
        const id = uuidv4();

        const query = `
            INSERT INTO users (id, name, email, password, preferences) 
            VALUES (?, ?, ?, ?, ?)
        `;

        try {
            const db = getDb();
            await db.run(query, [
                id,
                name.trim(),
                email.toLowerCase().trim(),
                password,
                JSON.stringify(preferences)
            ]);

            return await User.findById(id);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('User with this email already exists');
            }
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';

        try {
            const db = getDb();
            const row = await db.get(query, [id]);

            if (!row) {
                return null;
            }

            return new User(row);
        } catch (error) {
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';

        try {
            const db = getDb();
            const row = await db.get(query, [email.toLowerCase().trim()]);

            if (!row) {
                return null;
            }

            return new User(row);
        } catch (error) {
            throw error;
        }
    }

    // Update user
    static async update(id, updateData) {
        const { name, email, preferences } = updateData;
        const updates = [];
        const values = [];

        if (name !== undefined) {
            updates.push('name = ?');
            values.push(name.trim());
        }

        if (email !== undefined) {
            updates.push('email = ?');
            values.push(email.toLowerCase().trim());
        }

        if (preferences !== undefined) {
            updates.push('preferences = ?');
            values.push(JSON.stringify(preferences));
        }

        if (updates.length === 0) {
            throw new Error('No fields to update');
        }

        values.push(id);

        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        try {
            const db = getDb();
            const result = await db.run(query, values);

            if (result.changes === 0) {
                throw new Error('User not found');
            }

            return await User.findById(id);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    // Delete user
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';

        try {
            const db = getDb();
            const result = await db.run(query, [id]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get all users (admin function)
    static async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT id, name, email, created_at, updated_at, preferences 
            FROM users 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [limit, offset]);

            return rows.map(userData => new User(userData));
        } catch (error) {
            throw error;
        }
    }

    // Count total users
    static async count() {
        const query = 'SELECT COUNT(*) as total FROM users';

        try {
            const db = getDb();
            const row = await db.get(query);
            return row.total;
        } catch (error) {
            throw error;
        }
    }

    // Convert to JSON (remove password)
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }

    // Get user's public profile
    getPublicProfile() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            created_at: this.created_at,
            preferences: this.preferences || {}
        };
    }

    // Search users by name or email (admin function)
    static async search(searchTerm, limit = 20) {
        const query = `
            SELECT id, name, email, created_at, updated_at, preferences 
            FROM users 
            WHERE name LIKE ? OR email LIKE ?
            ORDER BY created_at DESC 
            LIMIT ?
        `;

        try {
            const db = getDb();
            const searchPattern = `%${searchTerm}%`;
            const rows = await db.all(query, [searchPattern, searchPattern, limit]);

            return rows.map(userData => new User(userData));
        } catch (error) {
            throw error;
        }
    }

    // Update user preferences
    static async updatePreferences(id, newPreferences) {
        const query = 'UPDATE users SET preferences = ? WHERE id = ?';

        try {
            const db = getDb();
            const result = await db.run(query, [JSON.stringify(newPreferences), id]);

            if (result.changes === 0) {
                throw new Error('User not found');
            }

            return await User.findById(id);
        } catch (error) {
            throw error;
        }
    }

    // Get user statistics
    static async getStats() {
        const query = `
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN created_at >= date('now', '-7 days') THEN 1 END) as new_this_week,
                COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as new_this_month
            FROM users
        `;

        try {
            const db = getDb();
            const row = await db.get(query);
            return row;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;