const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// --- Rutas correctas ---
const jsonFolder = path.resolve(__dirname, '../Faker');
const dbFolder = path.resolve(__dirname, '../backend/src/data');
const dbPath = path.join(dbFolder, 'dev-books.db');

// Crear carpeta si no existe
if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true });
}

async function importJsonToDb() {
    // Abrir la base de datos
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON;');

    // --- Crear tablas si no existen ---
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
                                                 title TEXT,
                                                 bookIds TEXT
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

    // --- Leer JSONs desde ../Faker ---
    const users = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'users.json'), 'utf-8'));
    const books = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'books.json'), 'utf-8'));
    const libraries = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'libraries.json'), 'utf-8'));
    const reviews = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'reviews.json'), 'utf-8'));
    const likes = JSON.parse(fs.readFileSync(path.join(jsonFolder, 'likes.json'), 'utf-8'));

    // --- Insertar usuarios ---
    for (const user of users) {
        try {
            await db.run(
                `INSERT INTO users (id, username, email, password, createdAt) VALUES (?, ?, ?, ?, ?)`,
                [user.id, user.username, user.email, user.password, user.createdAt]
            );
        } catch (err) {
            console.error('User insert error:', user.id, err.message);
        }
    }

    // --- Insertar libros ---
    for (const book of books) {
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
    }

// --- Insertar bibliotecas ---
    for (const lib of libraries) {
        await db.run(
            `INSERT INTO libraries (id, userId, title, bookIds) VALUES (?, ?, ?, ?)`,
            [lib.id, lib.userId, lib.title, lib.bookIds] // <-- no JSON.stringify
        );
    }

    // --- Insertar reseñas ---
    for (const review of reviews) {
        await db.run(
            `INSERT INTO reviews (id, bookId, userId, rating, comment, createdAt, likes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [review.id, review.bookId, review.userId, review.rating, review.comment, review.createdAt, review.likes]
        );
    }

    // --- Insertar likes ---
    for (const like of likes) {
        await db.run(
            `INSERT INTO likes (id, reviewId, userId) VALUES (?, ?, ?)`,
            [like.id, like.reviewId, like.userId]
        );
    }

    console.log('✅ Todos los datos importados a SQLite en', dbPath);
    await db.close();
}

importJsonToDb().catch(err => console.error(err));
