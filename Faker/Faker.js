import { faker } from '@faker-js/faker';
import fs from 'fs';
import fetch from 'node-fetch';
import bcrypt from "bcrypt";

const NUM_USERS = 100;
const NUM_BOOKS = 250;
const NUM_REVIEWS = 1000;
const SEARCH_WORDS = [
    'magic', 'science', 'history', 'adventure', 'fantasy', 'technology', 'art', 'music',
    'romance', 'mystery', 'philosophy', 'psychology', 'travel', 'nature', 'business',
    'health', 'education', 'sports', 'biography', 'children'
];
const API_KEY = 'AIzaSyD5WzdHI77Y8WLT4vBteP4W3VjtRafBt8Q';

const hashedPassword = await bcrypt.hash("password123", 12);

const users = Array.from({ length: NUM_USERS }, (_, i) => ({
    id: i + 1,
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: hashedPassword,
    createdAt: faker.date.past()
}));

async function fetchBooks() {
    const books = [];
    const seenBookIds = new Set();

    for (const word of SEARCH_WORDS) {
        let startIndex = 0;
        while (books.length < NUM_BOOKS && startIndex < 120) {
            const response = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
                    word
                )}&startIndex=${startIndex}&maxResults=40&key=${API_KEY}`
            );
            const data = await response.json();

            if (!data.items || data.items.length === 0) break;

            data.items.forEach(item => {
                if (books.length < NUM_BOOKS && !seenBookIds.has(item.id)) {
                    const v = item.volumeInfo;
                    books.push({
                        bookId: item.id,
                        title: v.title,
                        authors: v.authors ? v.authors.join(', ') : 'Unknown',
                        publishedDate: v.publishedDate || 'Unknown',
                        description: v.description || 'No description available.',
                        pageCount: v.pageCount || faker.number.int({ min: 100, max: 3000 }),
                        categories: v.categories ? v.categories.join(', ') : 'Uncategorized',
                        thumbnail: v.imageLinks ? v.imageLinks.thumbnail : '',
                        language: v.language || 'en',
                        previewLink: v.previewLink || ''
                    });
                    seenBookIds.add(item.id);
                }
            });

            startIndex += 40;
        }
        if (books.length >= NUM_BOOKS) break;
    }

    return books.slice(0, NUM_BOOKS);
}

async function main() {
    const books = await fetchBooks();
    if (books.length === 0) {
        console.error("No se pudieron obtener libros desde Google Books");
        return;
    }
    const bookIds = books.map(b => b.bookId);

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
                bookIds: libraryBooks.join(',')
            });
        }
    }

    // --- Generate reviews without likes field ---
    const reviews = [];
    for (let i = 0; i < NUM_REVIEWS; i++) {
        reviews.push({
            id: i + 1,
            bookId: faker.helpers.arrayElement(bookIds),
            userId: faker.number.int({ min: 1, max: NUM_USERS }),
            rating: faker.number.int({ min: 1, max: 5 }),
            comment: faker.lorem.sentence(),
            createdAt: faker.date.recent()
        });
    }

    // --- Generate likes ---
    let likeId = 1;
    const likes = reviews.flatMap(review =>
        Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
            id: likeId++,
            reviewId: review.id,
            userId: faker.number.int({ min: 1, max: NUM_USERS })
        }))
    );

    // --- Set likes count in each review ---
    const likesCountMap = {};
    likes.forEach(like => {
        likesCountMap[like.reviewId] = (likesCountMap[like.reviewId] || 0) + 1;
    });
    reviews.forEach(review => {
        review.likes = likesCountMap[review.id] || 0;
    });

    fs.writeFileSync("../Faker/users.json", JSON.stringify(users, null, 2));
    fs.writeFileSync("../Faker/books.json", JSON.stringify(books, null, 2));
    fs.writeFileSync("../Faker/libraries.json", JSON.stringify(libraries, null, 2));
    fs.writeFileSync("../Faker/reviews.json", JSON.stringify(reviews, null, 2));
    fs.writeFileSync("../Faker/likes.json", JSON.stringify(likes, null, 2));

    console.log("✅ Datos simulados generados correctamente!");
}

main();