import { faker } from '@faker-js/faker';
import fs from 'fs';
import fetch from 'node-fetch';
import bcrypt from "bcrypt";
import cliProgress from 'cli-progress'; // Progress bar

const NUM_USERS = 100;
const NUM_REVIEWS = 1000;

// List of books to fetch
const BOOK_LIST = [
    { title: "Don Quijote de la Mancha", author: "Miguel de Cervantes" },
    { title: "Historia de dos ciudades", author: "Charles Dickens" },
    { title: "El Señor de los Anillos", author: "J. R. R. Tolkien" },
    { title: "El Principito", author: "Antoine de Saint-Exupéry" },
    { title: "Harry Potter y la piedra filosofal", author: "J. K. Rowling" },
    { title: "Harry Potter y la cámara secreta", author: "J. K. Rowling" },
    { title: "Harry Potter y el prisionero de Azkaban", author: "J. K. Rowling" },
    { title: "Harry Potter y el cáliz de fuego", author: "J. K. Rowling" },
    { title: "Harry Potter y la Orden del Fénix", author: "J. K. Rowling" },
    { title: "Harry Potter y el misterio del príncipe", author: "J. K. Rowling" },
    { title: "Harry Potter y las Reliquias de la Muerte", author: "J. K. Rowling" },
    { title: "El Hobbit", author: "J. R. R. Tolkien" },
    { title: "Alicia en el País de las Maravillas", author: "Lewis Carroll" },
    { title: "Las aventuras de Sherlock Holmes", author: "Arthur Conan Doyle" },
    { title: "Orgullo y prejuicio", author: "Jane Austen" },
    { title: "Cien años de soledad", author: "Gabriel García Márquez" },
    { title: "Crimen y castigo", author: "Fiódor Dostoievski" },
    { title: "Anna Karenina", author: "León Tolstói" },
    { title: "Guerra y paz", author: "León Tolstói" },
    { title: "Los miserables", author: "Victor Hugo" },
    { title: "El conde de Montecristo", author: "Alexandre Dumas" },
    { title: "Los tres mosqueteros", author: "Alexandre Dumas" },
    { title: "La Odisea", author: "Homero" },
    { title: "La Ilíada", author: "Homero" },
    { title: "Hamlet", author: "William Shakespeare" },
    { title: "Romeo y Julieta", author: "William Shakespeare" },
    { title: "Macbeth", author: "William Shakespeare" },
    { title: "El viejo y el mar", author: "Ernest Hemingway" },
    { title: "Por quién doblan las campanas", author: "Ernest Hemingway" },
    { title: "El guardián entre el centeno", author: "J. D. Salinger" },
    { title: "Fahrenheit 451", author: "Ray Bradbury" },
    { title: "1984", author: "George Orwell" },
    { title: "Rebelión en la granja", author: "George Orwell" },
    { title: "El código Da Vinci", author: "Dan Brown" },
    { title: "Ángeles y demonios", author: "Dan Brown" },
    { title: "Inferno", author: "Dan Brown" },
    { title: "Los juegos del hambre", author: "Suzanne Collins" },
    { title: "En llamas", author: "Suzanne Collins" },
    { title: "Sinsajo", author: "Suzanne Collins" },
    { title: "Crepúsculo", author: "Stephenie Meyer" },
    { title: "Luna nueva", author: "Stephenie Meyer" },
    { title: "Eclipse", author: "Stephenie Meyer" },
    { title: "Amanecer", author: "Stephenie Meyer" },
    { title: "Cincuenta sombras de Grey", author: "E. L. James" },
    { title: "Cincuenta sombras más oscuras", author: "E. L. James" },
    { title: "Cincuenta sombras liberadas", author: "E. L. James" },
    { title: "It", author: "Stephen King" },
    { title: "El resplandor", author: "Stephen King" },
    { title: "Carrie", author: "Stephen King" },
    { title: "El nombre de la rosa", author: "Umberto Eco" }
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
    const bar = new cliProgress.SingleBar({
        format: 'Fetching books |{bar}| {value}/{total}',
        clearOnComplete: true,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(BOOK_LIST.length, 0);

    for (const { title, author } of BOOK_LIST) {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}&maxResults=5&key=${API_KEY}`
        );
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            const match = data.items.find(item => {
                const v = item.volumeInfo;
                return v.title && v.authors &&
                    v.title.toLowerCase().includes(title.toLowerCase()) &&
                    v.authors.some(a => a.toLowerCase().includes(author.toLowerCase()));
            });
            if (match) {
                const v = match.volumeInfo;
                books.push({
                    bookId: match.id,
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
            }
        }
        bar.increment();
    }
    bar.stop();
    return books;
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