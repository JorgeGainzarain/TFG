const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const cliProgress = require('cli-progress'); // Progress bar

// --- Paths ---
const jsonFolder = path.resolve(__dirname, '../Faker');
const dbFolder = path.resolve(__dirname, '../backend/src/data');
const dbPath = path.join(dbFolder, 'dev-books.db');

// Create folder if not exists
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
}

async function importJsonToDb() {
    // Open database
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON;');

    // --- Create tables if not exist ---
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY,
                                             username TEXT,
                                             email TEXT,
                                             password TEXT,
                                             createdAt TEXT
        );
        CREATE TABLE IF NOT EXISTS books (
                                             bookId TEXT PRIMARY KEY,
                                             title TEXT,
                                             authors TEXT,
                                             publishedDate TEXT,
                                             description TEXT,
                                             pageCount INTEGER,
                                             categories TEXT,
                                             thumbnail TEXT,
                                             language TEXT,
                                             previewLink TEXT
        );
        CREATE TABLE IF NOT EXISTS libraries (
                                                 id INTEGER PRIMARY KEY,
                                                 userId INTEGER,
                                                 title TEXT
        );
        CREATE TABLE IF NOT EXISTS library_books (
                                                     id INTEGER PRIMARY KEY,
                                                     libraryId INTEGER,
                                                     bookId TEXT
        );
        CREATE TABLE IF NOT EXISTS reviews (
                                               id INTEGER PRIMARY KEY,
                                               bookId TEXT,
                                               userId INTEGER,
                                               rating INTEGER,
                                               comment TEXT,
                                               createdAt TEXT,
                                               likes INTEGER
        );
        CREATE TABLE IF NOT EXISTS likes (
                                             id TEXT PRIMARY KEY,
                                             reviewId INTEGER,
                                             userId INTEGER
        );
    `);

    // --- Read JSONs from ../Faker ---
// --- Read JSONs ---
    const users = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'users.json'), 'utf-8'));
    const books = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'books.json'), 'utf-8'));
    const libraries = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'libraries.json'), 'utf-8'));
    const libraryBooks = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'library_books.json'), 'utf-8'));
    const reviews = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'reviews.json'), 'utf-8'));
    const likes = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'likes.json'), 'utf-8'));

    // --- Progress bars setup ---
    const bar = new cliProgress.MultiBar({
        clearOnComplete: false,
        hideCursor: true,
        format: '{type} |{bar}| {value}/{total}'
    }, cliProgress.Presets.shades_classic);

// --- Progress bars setup ---
    const bars = {
        users: bar.create(users.length, 0, { type: 'Users   ' }),
        books: bar.create(books.length, 0, { type: 'Books   ' }),
        libraries: bar.create(libraries.length, 0, { type: 'Libraries' }),
        libraryBooks: bar.create(libraryBooks.length, 0, { type: 'LibBooks ' }),
        reviews: bar.create(reviews.length, 0, { type: 'Reviews  ' }),
        likes: bar.create(likes.length, 0, { type: 'Likes    ' }),
    };

    // --- Insert users ---
    for (const user of users) {
        try {
            await db.run(
                `INSERT INTO users (id, username, email, password, createdAt) VALUES (?, ?, ?, ?, ?)`,
                [user.id, user.username, user.email, user.password, user.createdAt]
            );
        } catch (err) {
            console.error('User insert error:', user.id, err.message);
        }
        bars.users.increment();
    }

// --- Insert books ---
    const insertedBookIds = new Set();
    for (const book of books) {
        if (insertedBookIds.has(book.bookId)) {
            // Skip duplicate bookId
            continue;
        }
        try {
            await db.run(
                `INSERT INTO books (bookId, title, authors, publishedDate, description, pageCount, categories, thumbnail, language, previewLink)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    book.bookId,
                    book.title,
                    book.authors,
                    book.publishedDate,
                    book.description,
                    book.pageCount,
                    book.categories,
                    book.thumbnail,
                    book.language,
                    book.previewLink,
                ]
            );
            insertedBookIds.add(book.bookId);
        } catch (err) {
            console.error('Book insert error:', book.bookId, err.message);
        }
        bars.books.increment();
    }

// --- Insert libraries ---
    for (const lib of libraries) {
        await db.run(
            `INSERT INTO libraries (id, userId, title) VALUES (?, ?, ?)`,
            [lib.id, lib.userId, lib.title]
        );
        bars.libraries.increment();
    }

// --- Insert library_books ---
    for (const lb of libraryBooks) {
        await db.run(
            `INSERT INTO library_books (id, libraryId, bookId) VALUES (?, ?, ?)`,
            [lb.id, lb.libraryId, lb.bookId]
        );
        bars.libraryBooks.increment();
    }

    // --- Insert reviews ---
    for (const review of reviews) {
        await db.run(
            `INSERT INTO reviews (id, bookId, userId, rating, comment, createdAt, likes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [review.id, review.bookId, review.userId, review.rating, review.comment, review.createdAt, review.likes]
        );
        bars.reviews.increment();
    }

    // --- Insert likes ---
    for (const like of likes) {
        await db.run(
            `INSERT INTO likes (id, reviewId, userId) VALUES (?, ?, ?)`,
            [like.id, like.reviewId, like.userId]
        );
        bars.likes.increment();
    }

    bar.stop();

    console.log('✅ Todos los datos importados a SQLite en', dbPath);
    await db.close();
}

// Delete existing database to avoid conflicts
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

importJsonToDb().catch(err => console.error(err));