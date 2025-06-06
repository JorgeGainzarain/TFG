// models/Library.js
const { getDb } = require('../config/database');

class Library {
    constructor(data) {
        this.id = data.id;
        this.user_id = data.user_id;
        this.book_id = data.book_id;
        this.shelf = data.shelf;
        this.book_data = JSON.parse(data.book_data);
        this.added_at = data.added_at;
    }

    // Add book to user's library
    static async addBook(userId, bookId, shelf, bookData) {
        const validShelves = ['favorites', 'toRead', 'reading', 'read'];

        if (!validShelves.includes(shelf)) {
            throw new Error('Invalid shelf type');
        }

        const query = `
            INSERT INTO user_libraries (user_id, book_id, shelf, book_data) 
            VALUES (?, ?, ?, ?)
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [
                userId,
                bookId,
                shelf,
                JSON.stringify(bookData)
            ]);

            return await Library.findById(result.lastID);
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Book already exists in this shelf');
            }
            throw error;
        }
    }

    // Get user's complete library
    static async getUserLibrary(userId) {
        const query = `
            SELECT * FROM user_libraries 
            WHERE user_id = ? 
            ORDER BY added_at DESC
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [userId]);

            const library = {
                favorites: [],
                toRead: [],
                reading: [],
                read: []
            };

            rows.forEach(row => {
                const bookData = JSON.parse(row.book_data);
                const libraryEntry = {
                    id: row.id,
                    book_id: row.book_id,
                    added_at: row.added_at,
                    ...bookData
                };

                library[row.shelf].push(libraryEntry);
            });

            return library;
        } catch (error) {
            throw error;
        }
    }

    // Get books from specific shelf
    static async getShelf(userId, shelf) {
        const validShelves = ['favorites', 'toRead', 'reading', 'read'];

        if (!validShelves.includes(shelf)) {
            throw new Error('Invalid shelf type');
        }

        const query = `
            SELECT * FROM user_libraries 
            WHERE user_id = ? AND shelf = ? 
            ORDER BY added_at DESC
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [userId, shelf]);

            return rows.map(row => {
                const bookData = JSON.parse(row.book_data);
                return {
                    id: row.id,
                    book_id: row.book_id,
                    added_at: row.added_at,
                    ...bookData
                };
            });
        } catch (error) {
            throw error;
        }
    }

    // Remove book from shelf
    static async removeBook(userId, bookId, shelf) {
        const query = `
            DELETE FROM user_libraries 
            WHERE user_id = ? AND book_id = ? AND shelf = ?
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [userId, bookId, shelf]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    // Move book between shelves
    static async moveBook(userId, bookId, fromShelf, toShelf) {
        const validShelves = ['favorites', 'toRead', 'reading', 'read'];

        if (!validShelves.includes(fromShelf) || !validShelves.includes(toShelf)) {
            throw new Error('Invalid shelf type');
        }

        const query = `
            UPDATE user_libraries 
            SET shelf = ? 
            WHERE user_id = ? AND book_id = ? AND shelf = ?
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [toShelf, userId, bookId, fromShelf]);

            return result.changes > 0;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Book already exists in destination shelf');
            }
            throw error;
        }
    }

    // Check if book exists in user's library
    static async hasBook(userId, bookId, shelf = null) {
        let query = 'SELECT COUNT(*) as count FROM user_libraries WHERE user_id = ? AND book_id = ?';
        const params = [userId, bookId];

        if (shelf) {
            query += ' AND shelf = ?';
            params.push(shelf);
        }

        try {
            const db = getDb();
            const row = await db.get(query, params);
            return row.count > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get library statistics for user
    static async getStats(userId) {
        const query = `
            SELECT 
                shelf,
                COUNT(*) as count
            FROM user_libraries 
            WHERE user_id = ? 
            GROUP BY shelf
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [userId]);

            const stats = {
                favorites: 0,
                toRead: 0,
                reading: 0,
                read: 0,
                total: 0
            };

            rows.forEach(row => {
                stats[row.shelf] = row.count;
                stats.total += row.count;
            });

            return stats;
        } catch (error) {
            throw error;
        }
    }

    // Find library entry by ID
    static async findById(id) {
        const query = 'SELECT * FROM user_libraries WHERE id = ?';

        try {
            const db = getDb();
            const row = await db.get(query, [id]);

            if (!row) {
                return null;
            }

            return new Library(row);
        } catch (error) {
            throw error;
        }
    }

    // Update book data in library
    static async updateBookData(userId, bookId, shelf, newBookData) {
        const query = `
            UPDATE user_libraries 
            SET book_data = ? 
            WHERE user_id = ? AND book_id = ? AND shelf = ?
        `;

        try {
            const db = getDb();
            const result = await db.run(query, [
                JSON.stringify(newBookData),
                userId,
                bookId,
                shelf
            ]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    // Get recently added books across all shelves
    static async getRecentlyAdded(userId, limit = 10) {
        const query = `
            SELECT * FROM user_libraries 
            WHERE user_id = ? 
            ORDER BY added_at DESC 
            LIMIT ?
        `;

        try {
            const db = getDb();
            const rows = await db.all(query, [userId, limit]);

            return rows.map(row => {
                const bookData = JSON.parse(row.book_data);
                return {
                    id: row.id,
                    book_id: row.book_id,
                    shelf: row.shelf,
                    added_at: row.added_at,
                    ...bookData
                };
            });
        } catch (error) {
            throw error;
        }
    }

    // Search books in user's library
    static async searchUserBooks(userId, searchTerm, shelf = null) {
        let query = `
            SELECT * FROM user_libraries 
            WHERE user_id = ? AND (
                json_extract(book_data, '$.title') LIKE ? OR 
                json_extract(book_data, '$.author') LIKE ?
            )
        `;

        const params = [userId, `%${searchTerm}%`, `%${searchTerm}%`];

        if (shelf) {
            query += ' AND shelf = ?';
            params.push(shelf);
        }

        query += ' ORDER BY added_at DESC';

        try {
            const db = getDb();
            const rows = await db.all(query, params);

            return rows.map(row => {
                const bookData = JSON.parse(row.book_data);
                return {
                    id: row.id,
                    book_id: row.book_id,
                    shelf: row.shelf,
                    added_at: row.added_at,
                    ...bookData
                };
            });
        } catch (error) {
            throw error;
        }
    }

    // Get books by genre from user's library
    static async getBooksByGenre(userId, genre, shelf = null) {
        let query = `
            SELECT * FROM user_libraries 
            WHERE user_id = ? AND json_extract(book_data, '$.genres') LIKE ?
        `;

        const params = [userId, `%${genre}%`];

        if (shelf) {
            query += ' AND shelf = ?';
            params.push(shelf);
        }

        query += ' ORDER BY added_at DESC';

        try {
            const db = getDb();
            const rows = await db.all(query, params);

            return rows.map(row => {
                const bookData = JSON.parse(row.book_data);
                return {
                    id: row.id,
                    book_id: row.book_id,
                    shelf: row.shelf,
                    added_at: row.added_at,
                    ...bookData
                };
            });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Library;