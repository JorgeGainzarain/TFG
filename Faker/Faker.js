// Corrected Faker/Faker.js - Estructura correcta de DB y uso real de API
import { faker } from '@faker-js/faker';
import fs from 'fs';
import fetch from 'node-fetch';
import bcrypt from "bcrypt";
import cliProgress from 'cli-progress';

const NUM_USERS = 100;
const API_KEY = 'AIzaSyD5WzdHI77Y8WLT4vBteP4W3VjtRafBt8Q';

// --- Lista simplificada solo con título y autor ---
export const BOOK_LIST = [
    // Fantasía
    { title: "The Lord of the Rings", author: "J.R.R. Tolkien" },
    { title: "Harry Potter and the Philosopher's Stone", author: "J. K. Rowling" },
    { title: "A Game of Thrones", author: "George R. R. Martin" },
    { title: "The Hobbit", author: "J. R. R. Tolkien" },
    { title: "The Name of the Wind", author: "Patrick Rothfuss" },

    // Ciencia ficción
    { title: "Dune", author: "Frank Herbert" },
    { title: "Neuromancer", author: "William Gibson" },
    { title: "Foundation", author: "Isaac Asimov" },
    { title: "1984", author: "George Orwell" },
    { title: "The Martian", author: "Andy Weir" },
    { title: "Ender's Game", author: "Orson Scott Card" },

    // Misterio / Thriller
    { title: "The Da Vinci Code", author: "Dan Brown" },
    { title: "Gone Girl", author: "Gillian Flynn" },
    { title: "Murder on the Orient Express", author: "Agatha Christie" },
    { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson" },
    { title: "Big Little Lies", author: "Liane Moriarty" },

    // Romance
    { title: "Pride and Prejudice", author: "Jane Austen" },
    { title: "Jane Eyre", author: "Charlotte Brontë" },
    { title: "The Seven Husbands of Evelyn Hugo", author: "Taylor Jenkins Reid" },
    { title: "Me Before You", author: "Jojo Moyes" },

    // Clásicos
    { title: "Don Quixote", author: "Miguel de Cervantes" },
    { title: "War and Peace", author: "Leo Tolstoy" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "Moby-Dick", author: "Herman Melville" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },

    // Contemporáneos
    { title: "The Alchemist", author: "Paulo Coelho" },
    { title: "The Kite Runner", author: "Khaled Hosseini" },
    { title: "Life of Pi", author: "Yann Martel" },
    { title: "The Book Thief", author: "Markus Zusak" },
    { title: "Educated", author: "Tara Westover" },

    // No ficción
    { title: "Sapiens", author: "Yuval Noah Harari" },
    { title: "Atomic Habits", author: "James Clear" },
    { title: "The Power of Now", author: "Eckhart Tolle" },

    // Terror
    { title: "It", author: "Stephen King" },
    { title: "Dracula", author: "Bram Stoker" },
    { title: "Frankenstein", author: "Mary Shelley" }
];

// --- Bibliotecas por defecto ---
const libraries = ["Leyendo", "Completados", "Por Leer", "Favoritos"];

// --- Arquetipos de personalidad simplificados ---
const personalityTypes = [
    {
        name: "casual_reader",
        genrePreferences: ["Fiction", "Romance", "Young Adult Fiction"],
        ratingTendency: 4.2, // Tiende a dar ratings altos
        reviewStyle: "positive_simple"
    },
    {
        name: "critical_reader",
        genrePreferences: ["Literary Fiction", "Philosophy", "History"],
        ratingTendency: 3.5, // Más crítico
        reviewStyle: "analytical"
    },
    {
        name: "genre_fan",
        genrePreferences: ["Science Fiction", "Fantasy", "Mystery"],
        ratingTendency: 4.0,
        reviewStyle: "enthusiastic"
    },
    {
        name: "diverse_reader",
        genrePreferences: ["Biography", "History", "Contemporary", "Non-fiction"],
        ratingTendency: 3.8,
        reviewStyle: "thoughtful"
    },
    {
        name: "emotional_reader",
        genrePreferences: ["Romance", "Contemporary", "Historical Fiction"],
        ratingTendency: 4.3,
        reviewStyle: "emotional"
    }
];

// --- Plantillas de comentarios por estilo ---
const reviewTemplates = {
    positive_simple: [
        "¡Me encantó! Muy recomendado.",
        "Una lectura muy entretenida.",
        "Perfecto para relajarse.",
        "No pude parar de leer."
    ],
    analytical: [
        "Una obra compleja que explora temas profundos.",
        "El autor demuestra gran dominio de la narrativa.",
        "Interesante perspectiva, aunque con algunas limitaciones.",
        "Un análisis brillante del tema central."
    ],
    enthusiastic: [
        "¡Increíble! Todo lo que esperaba y más.",
        "Una obra maestra del género.",
        "Adictivo desde la primera página.",
        "El mejor libro que he leído en mucho tiempo."
    ],
    thoughtful: [
        "Me hizo reflexionar sobre muchas cosas.",
        "Una historia que te marca profundamente.",
        "Muy bien documentado y escrito.",
        "Aporta una nueva perspectiva al tema."
    ],
    emotional: [
        "Me hizo llorar varias veces.",
        "Una montaña rusa emocional.",
        "Toca el corazón de manera increíble.",
        "Personajes que se quedan contigo."
    ]
};

// --- Función para obtener libros de Google Books API ---
async function fetchBooksFromAPI() {
    const books = [];
    const bar = new cliProgress.SingleBar({
        format: 'Obteniendo libros |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(BOOK_LIST.length, 0);

    for (const { title, author } of BOOK_LIST) {
        try {
            const query = `intitle:"${title}" inauthor:"${author}"`;
            const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${API_KEY}`;
            console.log()
            console.log(url)

            const response = await fetch(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'BookRecommendationSystem/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                // Buscar la mejor coincidencia
                const match = data.items.find(item => {
                    const v = item.volumeInfo;
                    if (!v.title || !v.authors) return false;

                    const titleMatch = v.title.toLowerCase().includes(title.toLowerCase()) ||
                        title.toLowerCase().includes(v.title.toLowerCase());
                    const authorMatch = v.authors.some(a =>
                        a.toLowerCase().includes(author.toLowerCase()) ||
                        author.toLowerCase().includes(a.toLowerCase())
                    );

                    return titleMatch && authorMatch;
                });

                if (match) {
                    const book = createBookFromAPI(match);
                    books.push(book);
                } else {
                    console.warn(`⚠️  No se encontró coincidencia exacta para: ${title} por ${author}`);
                }
            } else {
                console.warn(`⚠️  No se encontraron resultados para: ${title} por ${author}`);
            }

            // Rate limiting para evitar ser bloqueado
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
            console.error(`❌ Error obteniendo ${title}: ${error.message}`);
        }

        bar.increment();
    }

    bar.stop();
    console.log(`✅ Se obtuvieron ${books.length}/${BOOK_LIST.length} libros exitosamente\n`);
    return books;
}

// --- Función para crear objeto libro desde API ---
function createBookFromAPI(apiBook) {
    const v = apiBook.volumeInfo;

    return {
        bookId: apiBook.id,
        title: v.title || 'Unknown Title',
        authors: v.authors ? v.authors.join(', ') : 'Unknown Author',
        publishedDate: v.publishedDate || null,
        description: v.description || 'No description available.',
        pageCount: v.pageCount || faker.number.int({ min: 100, max: 800 }),
        categories: v.categories ? v.categories.join(',') : 'Fiction',
        thumbnail: v.imageLinks?.thumbnail || '',
        language: v.language || 'en',
        previewLink: v.previewLink || ''
    };
}

// --- Función para generar usuarios según estructura DB ---
function generateUsers() {
    const users = [];
    const hashedPassword = bcrypt.hashSync("password123", 12);

    console.log("👥 Generando usuarios...");
    const bar = new cliProgress.SingleBar({
        format: 'Usuarios |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(NUM_USERS, 0);

    for (let i = 1; i <= NUM_USERS; i++) {
        const personality = faker.helpers.arrayElement(personalityTypes);

        users.push({
            id: i, // ID se manejará por la DB, pero útil para referencias
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: hashedPassword,
            createdAt: faker.date.past({ years: 2 }),
            // Campos adicionales para el algoritmo (no van en DB)
            _personality: personality,
            _age: faker.number.int({ min: 16, max: 65 })
        });

        bar.increment();
    }

    bar.stop();
    console.log(`✅ ${users.length} usuarios generados\n`);
    return users;
}

// --- Función para generar bibliotecas según estructura DB ---
function generateLibraries(users, books) {
    console.log("📖 Generando bibliotecas...");
    const librariesData = [];
    let libraryId = 1;

    const bar = new cliProgress.SingleBar({
        format: 'Bibliotecas |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    const totalLibraries = users.length * libraries.length;
    bar.start(totalLibraries, 0);

    users.forEach(user => {
        libraries.forEach(libraryTitle => {
            // Seleccionar libros basado en preferencias del usuario
            const userGenres = user._personality.genrePreferences;
            let selectedBooks = [];

            if (libraryTitle === "Favoritos") {
                // Menos libros para favoritos, más selectivo
                const compatibleBooks = books.filter(book =>
                    book.categories.split(',').some(cat =>
                        userGenres.some(pref =>
                            cat.toLowerCase().includes(pref.toLowerCase()) ||
                            pref.toLowerCase().includes(cat.toLowerCase())
                        )
                    )
                );
                selectedBooks = faker.helpers.shuffle(compatibleBooks)
                    .slice(0, faker.number.int({ min: 2, max: 8 }))
                    .map(book => book.bookId);
            } else {
                // Para otras bibliotecas, más variedad
                const numBooks = faker.number.int({ min: 3, max: 15 });
                selectedBooks = faker.helpers.shuffle(books)
                    .slice(0, numBooks)
                    .map(book => book.bookId);
            }

            if (selectedBooks.length > 0) {
                librariesData.push({
                    id: libraryId++,
                    userId: user.id,
                    title: libraryTitle,
                    bookIds: selectedBooks // Array de IDs como requiere la estructura
                });
            }

            bar.increment();
        });
    });

    bar.stop();
    console.log(`✅ ${librariesData.length} bibliotecas generadas\n`);
    return librariesData;
}

// --- Función para generar reviews según estructura DB ---
function generateReviews(users, books) {
    console.log("⭐ Generando reviews...");
    const reviews = [];
    let reviewId = 1;

    const totalReviews = users.length * 8; // Aproximadamente
    const bar = new cliProgress.SingleBar({
        format: 'Reviews |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(totalReviews, 0);

    users.forEach(user => {
        const personality = user._personality;
        const numReviews = faker.number.int({ min: 5, max: 12 });

        // Seleccionar libros que el usuario probablemente leería
        const userBooks = selectBooksForUser(user, books, numReviews);

        userBooks.forEach(book => {
            const compatibility = calculateCompatibility(user, book);
            const rating = generateRatingFromCompatibility(compatibility, personality.ratingTendency);

            // Generar comentario basado en rating y estilo del usuario
            const comment = generateComment(rating, personality.reviewStyle, book);

            reviews.push({
                id: reviewId++,
                bookId: book.bookId,
                userId: user.id,
                rating: rating,
                comment: comment,
                createdAt: faker.date.past({ years: 2 }),
                likes: 0 // Se calculará después con los likes generados
            });

            bar.increment();
        });
    });

    bar.stop();
    console.log(`✅ ${reviews.length} reviews generadas\n`);
    return reviews;
}

function selectBooksForUser(user, books, numBooks) {
    const userGenres = user._personality.genrePreferences;

    // Separar libros compatibles y no compatibles
    const compatibleBooks = books.filter(book =>
        book.categories.split(',').some(cat =>
            userGenres.some(pref =>
                cat.toLowerCase().includes(pref.toLowerCase()) ||
                pref.toLowerCase().includes(cat.toLowerCase())
            )
        )
    );

    const otherBooks = books.filter(book => !compatibleBooks.includes(book));

    // 70% libros compatibles, 30% otros
    const numCompatible = Math.floor(numBooks * 0.7);
    const numOthers = numBooks - numCompatible;

    const selectedCompatible = faker.helpers.shuffle(compatibleBooks)
        .slice(0, Math.min(numCompatible, compatibleBooks.length));
    const selectedOthers = faker.helpers.shuffle(otherBooks)
        .slice(0, Math.min(numOthers, otherBooks.length));

    return [...selectedCompatible, ...selectedOthers];
}

function calculateCompatibility(user, book) {
    const userGenres = user._personality.genrePreferences;
    const bookCategories = book.categories.split(',');

    // Calcular coincidencias de género
    const genreMatches = bookCategories.filter(cat =>
        userGenres.some(pref =>
            cat.toLowerCase().includes(pref.toLowerCase()) ||
            pref.toLowerCase().includes(cat.toLowerCase())
        )
    ).length;

    // Score base en función de coincidencias
    let score = 0.3 + (genreMatches * 0.2); // 0.3 base + hasta 0.6 por géneros

    // Agregar algo de randomness
    score += faker.number.float({ min: -0.1, max: 0.2 });

    return Math.max(0, Math.min(1, score));
}

function generateRatingFromCompatibility(compatibility, ratingTendency) {
    let baseRating = compatibility * 5; // 0-5 range

    // Ajustar según tendencia del usuario
    const tendencyAdjustment = (ratingTendency - 3) * 0.5; // -1 a +1
    baseRating += tendencyAdjustment;

    // Agregar variabilidad
    baseRating += faker.number.float({ min: -0.5, max: 0.5 });

    // Redondear y limitar a 1-5
    return Math.max(1, Math.min(5, Math.round(baseRating)));
}

function generateComment(rating, reviewStyle, book) {
    const templates = reviewTemplates[reviewStyle];
    let comment = faker.helpers.arrayElement(templates);

    // Modificar comentario basado en rating
    if (rating <= 2) {
        const negativeModifiers = [
            "Desafortunadamente, ",
            "Aunque tenía esperanzas, ",
            "No me convenció porque ",
            "Esperaba más, pero "
        ];
        comment = faker.helpers.arrayElement(negativeModifiers) + comment.toLowerCase();
    } else if (rating >= 4) {
        const positiveModifiers = [
            "Definitivamente ",
            "Sin duda ",
            "Realmente ",
            "Absolutamente "
        ];
        comment = faker.helpers.arrayElement(positiveModifiers) + comment.toLowerCase();
    }

    return comment;
}

// --- Función para generar likes según estructura DB ---
function generateLikes(users, reviews) {
    console.log("👍 Generando likes...");
    const likes = [];
    let likeId = 1;

    const totalLikes = reviews.length * 2; // Aproximadamente
    const bar = new cliProgress.SingleBar({
        format: 'Likes |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(totalLikes, 0);

    users.forEach(user => {
        // Reviews que el usuario NO escribió
        const otherUsersReviews = reviews.filter(review => review.userId !== user.id);

        // Determinar cuántos likes dar
        const numLikes = faker.number.int({ min: 5, max: 25 });
        const selectedReviews = faker.helpers.shuffle(otherUsersReviews).slice(0, numLikes);

        selectedReviews.forEach(review => {
            // Probabilidad de dar like basada en rating y compatibilidad
            let likeProbability = 0.3; // Base

            if (review.rating >= 4) likeProbability += 0.3;
            if (review.rating <= 2) likeProbability -= 0.2;

            // Agregar algo de sesgo por personalidad similar
            if (user._personality.name === getUserPersonality(review.userId, users)) {
                likeProbability += 0.2;
            }

            if (faker.datatype.boolean({ probability: likeProbability })) {
                likes.push({
                    id: likeId++,
                    reviewId: review.id,
                    userId: user.id
                });

                bar.increment();
            }
        });
    });

    bar.stop();

    // Actualizar contador de likes en reviews
    const likesCount = new Map();
    likes.forEach(like => {
        likesCount.set(like.reviewId, (likesCount.get(like.reviewId) || 0) + 1);
    });

    reviews.forEach(review => {
        review.likes = likesCount.get(review.id) || 0;
    });

    console.log(`✅ ${likes.length} likes generados\n`);
    return likes;
}

function getUserPersonality(userId, users) {
    const user = users.find(u => u.id === userId);
    return user ? user._personality.name : 'casual_reader';
}

// --- Función para limpiar datos para DB ---
function cleanDataForDB(users, books, reviews, likes, libraries) {
    // Limpiar usuarios (remover campos internos)
    const cleanUsers = users.map(user => {
        const { _personality, _age, ...cleanUser } = user;
        return cleanUser;
    });

    // Los demás datos ya están limpios
    return {
        users: cleanUsers,
        books: books,
        reviews: reviews,
        likes: likes,
        libraries: libraries
    };
}

// --- Función principal ---
async function main() {
    console.log("🚀 Generando dataset realista para sistema de recomendaciones...\n");

    try {
        // 1. Obtener libros desde Google Books API
        console.log("📚 Obteniendo libros desde Google Books API...");
        const books = await fetchBooksFromAPI();

        if (books.length === 0) {
            console.error("❌ No se pudieron obtener libros. Verifica tu API key y conexión.");
            process.exit(1);
        }

        // 2. Generar usuarios
        const users = generateUsers();

        // 3. Generar bibliotecas
        const libraries = generateLibraries(users, books);

        // 4. Generar reviews
        const reviews = generateReviews(users, books);

        // 5. Generar likes
        const likes = generateLikes(users, reviews);

        // 6. Limpiar datos para la estructura de DB
        const cleanData = cleanDataForDB(users, books, reviews, likes, libraries);

        // 7. Generar estadísticas
        const metadata = {
            generatedAt: new Date().toISOString(),
            version: "2.0.0",
            description: "Dataset para sistema de recomendaciones - estructura DB",
            totalUsers: cleanData.users.length,
            totalBooks: cleanData.books.length,
            totalReviews: cleanData.reviews.length,
            totalLikes: cleanData.likes.length,
            totalLibraries: cleanData.libraries.length,
            avgReviewsPerUser: (cleanData.reviews.length / cleanData.users.length).toFixed(2),
            avgRating: (cleanData.reviews.reduce((sum, r) => sum + r.rating, 0) / cleanData.reviews.length).toFixed(2),
            avgLikesPerReview: (cleanData.likes.length / cleanData.reviews.length).toFixed(2)
        };

        // 8. Guardar archivos
        console.log("💾 Guardando archivos...");
        const outputDir = "./";

        // Crear archivos individuales según estructura de tablas
        fs.writeFileSync(`${outputDir}users.json`, JSON.stringify(cleanData.users, null, 2));
        fs.writeFileSync(`${outputDir}books.json`, JSON.stringify(cleanData.books, null, 2));
        fs.writeFileSync(`${outputDir}reviews.json`, JSON.stringify(cleanData.reviews, null, 2));
        fs.writeFileSync(`${outputDir}likes.json`, JSON.stringify(cleanData.likes, null, 2));
        fs.writeFileSync(`${outputDir}libraries.json`, JSON.stringify(cleanData.libraries, null, 2));
        fs.writeFileSync(`${outputDir}metadata.json`, JSON.stringify(metadata, null, 2));

        // Dataset completo
        const completeDataset = { ...cleanData, metadata };
        fs.writeFileSync(`${outputDir}complete_dataset.json`, JSON.stringify(completeDataset, null, 2));

        console.log("\n🎉 ¡Dataset generado exitosamente!");
        console.log("\n📊 ESTADÍSTICAS FINALES:");
        console.log("=" + "=".repeat(50));
        console.log(`👥 Usuarios: ${metadata.totalUsers}`);
        console.log(`📚 Libros: ${metadata.totalBooks}`);
        console.log(`⭐ Reviews: ${metadata.totalReviews} (${metadata.avgReviewsPerUser} por usuario)`);
        console.log(`👍 Likes: ${metadata.totalLikes} (${metadata.avgLikesPerReview} por review)`);
        console.log(`📖 Bibliotecas: ${metadata.totalLibraries}`);
        console.log(`⭐ Rating promedio: ${metadata.avgRating}/5.0`);
        console.log("=" + "=".repeat(50));
        console.log("\n📁 Archivos guardados en el directorio actual");
        console.log("🗄️  Estructura compatible con tu base de datos");
        console.log("🤖 ¡Listo para entrenar tu IA!");

    } catch (error) {
        console.error("❌ Error durante la generación:", error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Ejecutar
main();