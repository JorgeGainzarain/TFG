// models/RefreshToken.js
const { getDb } = require('../config/database');

class RefreshToken {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.token = data.token;
        this.expires_at = data.expires_at;
        this.created_at = data.created_at;
    }

    // Create a new refresh token
    static async create(userId, token, expiresAt) {
        const query = `
            INSERT INTO refresh_tokens (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [userId, token, expiresAt]);

            return await RefreshToken.findById(result.lastID);
        } catch (error) {
            throw error;
        }
    }

    // Find refresh token by token string
    static async findByToken(token) {
        const query = 'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime("now")';

        try {
            const db = getDb();
            const row = await db.get(query, [token]);

            if (!row) {
                return null;
            }

            return new RefreshToken(row);
        } catch (error) {
            throw error;
        }
    }

    // Find refresh token by ID
    static async findById(id) {
        const query = 'SELECT * FROM refresh_tokens WHERE id = ?';

        try {
            const db = getDb();
            const row = await db.get(query, [id]);

            if (!row) {
                return null;
            }

            return new RefreshToken(row);
        } catch (error) {
            throw error;
        }
    }

    // Get all tokens for a user
    static async findByUserId(userId) {
        const query = `
            SELECT * FROM refresh_tokens 
            WHERE user_id = ? AND expires_at > datetime("now")
            ORDER BY created_at DESC
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [userId]);

            return rows.map(row => new RefreshToken(row));
        } catch (error) {
            throw error;
        }
    }

    // Delete a refresh token
    static async deleteToken(token) {
        const query = 'DELETE FROM refresh_tokens WHERE token = ?';

        try {
            const db = getDb();
            const result = await db.run(query, [token]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    // Delete all tokens for a user (logout from all devices)
    static async deleteAllUserTokens(userId) {
        const query = 'DELETE FROM refresh_tokens WHERE user_id = ?';

        try {
            const db = getDb();
            const result = await db.run(query, [userId]);

            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    // Delete expired tokens
    static async deleteExpiredTokens() {
        const query = 'DELETE FROM refresh_tokens WHERE expires_at <= datetime("now")';

        try {
            const db = getDb();
            const result = await db.run(query);

            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    // Update token (rotate refresh token)
    static async updateToken(oldToken, newToken, newExpiresAt) {
        const query = `
            UPDATE refresh_tokens 
            SET token = ?, expires_at = ? 
            WHERE token = ? AND expires_at > datetime("now")
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [newToken, newExpiresAt, oldToken]);

            if (result.changes === 0) {
                throw new Error('Token not found or expired');
            }

            return await RefreshToken.findByToken(newToken);
        } catch (error) {
            throw error;
        }
    }

    // Check if token is valid
    static async isValidToken(token) {
        const query = `
            SELECT COUNT(*) as count 
            FROM refresh_tokens 
            WHERE token = ? AND expires_at > datetime("now")
        `;

        try {
            const db = getDb();
            const row = await db.get(query, [token]);

            return row.count > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get token statistics
    static async getStats() {
        const query = `
            SELECT 
                COUNT(*) as total_tokens,
                COUNT(CASE WHEN expires_at > datetime("now") THEN 1 END) as active_tokens,
                COUNT(CASE WHEN expires_at <= datetime("now") THEN 1 END) as expired_tokens,
                COUNT(DISTINCT user_id) as unique_users
            FROM refresh_tokens
        `;

        try {
            const db = getDb();
            const row = await db.get(query);
            return row;
        } catch (error) {
            throw error;
        }
    }

    // Clean up old tokens (older than 30 days, regardless of expiry)
    static async cleanupOldTokens(daysOld = 30) {
        const query = `
            DELETE FROM refresh_tokens 
            WHERE created_at < datetime("now", "-${daysOld} days")
        `;

        try {
            const db = getDb();
            const result = await db.run(query);

            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    // Check if user has too many active tokens (security measure)
    static async countUserTokens(userId) {
        const query = `
            SELECT COUNT(*) as count 
            FROM refresh_tokens 
            WHERE user_id = ? AND expires_at > datetime("now")
        `;

        try {
            const db = getDb();
            const row = await db.get(query, [userId]);

            return row.count;
        } catch (error) {
            throw error;
        }
    }

    // Delete oldest tokens for user if they exceed limit
    static async limitUserTokens(userId, maxTokens = 5) {
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM refresh_tokens 
            WHERE user_id = ? AND expires_at > datetime("now")
        `;

        try {
            const db = getDb();
            const countResult = await db.get(countQuery, [userId]);

            if (countResult.count > maxTokens) {
                const deleteQuery = `
                    DELETE FROM refresh_tokens 
                    WHERE id IN (
                        SELECT id FROM refresh_tokens 
                        WHERE user_id = ? AND expires_at > datetime("now")
                        ORDER BY created_at ASC 
                        LIMIT ?
                    )
                `;

                const tokensToDelete = countResult.count - maxTokens;
                const result = await db.run(deleteQuery, [userId, tokensToDelete]);

                return result.changes;
            }

            return 0;
        } catch (error) {
            throw error;
        }
    }

    // Get user's most recent token
    static async getUserLatestToken(userId) {
        const query = `
            SELECT * FROM refresh_tokens 
            WHERE user_id = ? AND expires_at > datetime("now")
            ORDER BY created_at DESC 
            LIMIT 1
        `;

        try {
            const db = getDb();
            const row = await db.get(query, [userId]);

            if (!row) {
                return null;
            }

            return new RefreshToken(row);
        } catch (error) {
            throw error;
        }
    }

    // Check if token belongs to user
    static async verifyTokenOwnership(token, userId) {
        const query = `
            SELECT COUNT(*) as count 
            FROM refresh_tokens 
            WHERE token = ? AND user_id = ? AND expires_at > datetime("now")
        `;

        try {
            const db = getDb();
            const row = await db.get(query, [token, userId]);

            return row.count > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get tokens that will expire soon (for proactive refresh)
    static async getTokensExpiringSoon(hoursBeforeExpiry = 24) {
        const query = `
            SELECT * FROM refresh_tokens 
            WHERE expires_at > datetime("now") 
            AND expires_at <= datetime("now", "+${hoursBeforeExpiry} hours")
            ORDER BY expires_at ASC
        `;

        try {
            const db = getDb();
            const rows = await db.all(query);

            return rows.map(row => new RefreshToken(row));
        } catch (error) {
            throw error;
        }
    }

    // Update token's last used timestamp (for tracking activity)
    static async updateLastUsed(token) {
        const query = `
            UPDATE refresh_tokens 
            SET created_at = datetime("now") 
            WHERE token = ? AND expires_at > datetime("now")
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [token]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    // Batch delete multiple tokens
    static async deleteTokens(tokens) {
        if (!tokens || tokens.length === 0) {
            return 0;
        }

        const placeholders = tokens.map(() => '?').join(',');
        const query = `DELETE FROM refresh_tokens WHERE token IN (${placeholders})`;

        try {
            const db = getDb();
            const result = await db.run(query, tokens);

            return result.changes;
        } catch (error) {
            throw error;
        }
    }

    // Get all active sessions for a user (for security dashboard)
    static async getUserSessions(userId) {
        const query = `
            SELECT 
                id,
                token,
                expires_at,
                created_at,
                CASE 
                    WHEN created_at > datetime("now", "-1 hour") THEN "Active"
                    WHEN created_at > datetime("now", "-24 hours") THEN "Recent"
                    ELSE "Inactive"
                END as status
            FROM refresh_tokens 
            WHERE user_id = ? AND expires_at > datetime("now")
            ORDER BY created_at DESC
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [userId]);

            return rows.map(row => ({
                id: row.id,
                token: row.token.substring(0, 10) + '...', // Masked for security
                expires_at: row.expires_at,
                created_at: row.created_at,
                status: row.status
            }));
        } catch (error) {
            throw error;
        }
    }

    // Convert to JSON (mask sensitive token data)
    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            token: this.token ? this.token.substring(0, 10) + '...' : null, // Masked
            expires_at: this.expires_at,
            created_at: this.created_at
        };
    }

    // Check if token is expired
    isExpired() {
        return new Date(this.expires_at) <= new Date();
    }

    // Get time until expiration
    getTimeUntilExpiry() {
        const now = new Date();
        const expiry = new Date(this.expires_at);
        return Math.max(0, expiry.getTime() - now.getTime());
    }

    // Get human-readable expiry time
    getExpiryDescription() {
        const timeUntilExpiry = this.getTimeUntilExpiry();

        if (timeUntilExpiry === 0) {
            return 'Expired';
        }

        const days = Math.floor(timeUntilExpiry / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeUntilExpiry % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
            return `${days} day${days !== 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
        } else {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        }
    }
}

module.exports = RefreshToken;