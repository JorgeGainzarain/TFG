import { faker } from '@faker-js/faker';
import fs from 'fs';
import fetch from 'node-fetch';
import bcrypt from "bcrypt";

// Cantidades a simular
const NUM_USERS = 50;
const NUM_BOOKS = 100;
const NUM_REVIEWS = 200;

// Palabra de búsqueda para libros
const SEARCH_WORD = 'magic'; // cambia esto a lo que quieras buscar
const API_KEY = 'AIzaSyD5WzdHI77Y8WLT4vBteP4W3VjtRafBt8Q'; // reemplaza con tu API Key

const hashedPassword = await bcrypt.hash("password123", 12);

// --- Generar usuarios ---
const users = Array.from({ length: NUM_USERS }, (_, i) => ({
    id: i + 1,
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: hashedPassword,
    createdAt: faker.date.past()
}));

// --- Buscar libros en Google Books usando palabra ---
async function fetchBooks() {
    const books = [];
    let startIndex = 0;

    while (books.length < NUM_BOOKS) {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                SEARCH_WORD
            )}&startIndex=${startIndex}&maxResults=40&key=${API_KEY}`
        );
        const data = await response.json();

        if (!data.items || data.items.length === 0) break;

        data.items.forEach(item => {
            if (books.length < NUM_BOOKS) {
                const v = item.volumeInfo;
                books.push({
                    bookId: item.id,
                    title: v.title,
                    authors: v.authors ? v.authors.join(', ') : 'Unknown',
                    publishedDate: v.publishedDate || 'Unknown',
                    description: v.description || 'No description available.',
                    pageCount: v.pageCount || faker.number.int({ min: 100, max: 900 }),
                    categories: v.categories ? v.categories.join(', ') : 'Uncategorized',
                    thumbnail: v.imageLinks ? v.imageLinks.thumbnail : '',
                    language: v.language || 'en',
                    previewLink: v.previewLink || ''
                });
            }
        });

        startIndex += 41;
    }

    // Remove duplicate books by bookId
    const uniqueBooks = [];
    const seenBookIds = new Set();
    for (const book of books) {
        if (!seenBookIds.has(book.bookId)) {
            uniqueBooks.push(book);
            seenBookIds.add(book.bookId);
        }
    }

    return uniqueBooks;
}

// --- Función principal ---
async function main() {
    const books = await fetchBooks();

    if (books.length === 0) {
        console.error("❌ No se pudieron obtener libros desde Google Books");
        return;
    }

    const bookIds = books.map(b => b.bookId);

    // --- Generar bibliotecas ---
    const LIBRARY_TITLES = ["Leyendo", "Completados", "Por Leer", "Favoritos"];
    const libraries = [];

    for (let userId = 1; userId <= NUM_USERS; userId++) {
        for (const title of LIBRARY_TITLES) {
            const numBooks = faker.number.int({ min: 0, max: Math.min(10, bookIds.length) });
            const libraryBooks = faker.helpers.shuffle(bookIds).slice(0, numBooks);
            libraries.push({
                id: libraries.length + 1,
                userId,
                title,
                bookIds: libraryBooks.join(',') // <-- now a comma-separated string
            });
        }
    }

    // --- Generar reseñas ---
    const reviews = Array.from({ length: NUM_REVIEWS }, (_, i) => ({
        id: i + 1,
        bookId: faker.helpers.arrayElement(bookIds),
        userId: faker.number.int({ min: 1, max: NUM_USERS }),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence(),
        createdAt: faker.date.recent(),
        likes: 0
    }));

    // --- Generar likes ---
    let likeId = 1;
    const likes = reviews.flatMap(review =>
        Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
            id: likeId++, // Incremental number
            reviewId: review.id,
            userId: faker.number.int({ min: 1, max: NUM_USERS })
        }))
    );

    // --- Guardar JSON ---
    fs.writeFileSync("../Faker/users.json", JSON.stringify(users, null, 2));
    fs.writeFileSync("../Faker/books.json", JSON.stringify(books, null, 2));
    fs.writeFileSync("../Faker/libraries.json", JSON.stringify(libraries, null, 2));
    fs.writeFileSync("../Faker/reviews.json", JSON.stringify(reviews, null, 2));
    fs.writeFileSync("../Faker/likes.json", JSON.stringify(likes, null, 2));

    console.log("✅ Datos simulados generados correctamente!");
}

main();