import { faker } from '@faker-js/faker';
import fs from 'fs';
import fetch from 'node-fetch';
import bcrypt from "bcrypt";
import cliProgress from 'cli-progress';

const NUM_USERS = 100;
const API_KEY = 'AIzaSyD5WzdHI77Y8WLT4vBteP4W3VjtRafBt8Q';

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

const libraries = ["Leyendo", "Completados", "Por Leer", "Favoritos"];

const personalityTypes = [
    {
        name: "casual_reader",
        genrePreferences: ["FICTION", "ROMANCE", "YOUNG ADULT FICTION", "JUVENILE FICTION"],
        ratingTendency: 4.2,
        reviewStyle: "positive_simple"
    },
    {
        name: "critical_reader",
        genrePreferences: ["LITERARY COLLECTIONS", "LITERARY CRITICISM", "PHILOSOPHY", "HISTORY"],
        ratingTendency: 3.5,
        reviewStyle: "analytical"
    },
    {
        name: "genre_fan",
        genrePreferences: ["SCIENCE", "SCIENCE FICTION", "FANTASY", "MYSTERY", "THRILLER"],
        ratingTendency: 4.0,
        reviewStyle: "enthusiastic"
    },
    {
        name: "diverse_reader",
        genrePreferences: ["BIOGRAPHY & AUTOBIOGRAPHY", "HISTORY", "CONTEMPORARY", "NONFICTION"],
        ratingTendency: 3.8,
        reviewStyle: "thoughtful"
    },
    {
        name: "emotional_reader",
        genrePreferences: ["ROMANCE", "CONTEMPORARY", "HISTORICAL FICTION", "FICTION"],
        ratingTendency: 4.3,
        reviewStyle: "emotional"
    },
    {
        name: "knowledge_seeker",
        genrePreferences: ["SCIENCE", "PHILOSOPHY", "MATHEMATICS", "TECHNOLOGY & ENGINEERING", "REFERENCE"],
        ratingTendency: 4.1,
        reviewStyle: "informative"
    },
    {
        name: "thrill_seeker",
        genrePreferences: ["TRUE CRIME", "HORROR", "MYSTERY", "THRILLER", "DRAMA"],
        ratingTendency: 4.0,
        reviewStyle: "dramatic"
    },
    {
        name: "adventurous_reader",
        genrePreferences: ["TRAVEL", "SPORTS & RECREATION", "GAMES & ACTIVITIES", "NATURE", "ADVENTURE"],
        ratingTendency: 4.2,
        reviewStyle: "imaginative"
    },
    {
        name: "creative_lover",
        genrePreferences: ["ART", "PHOTOGRAPHY", "DESIGN", "PERFORMING ARTS", "MUSIC", "COMICS & GRAPHIC NOVELS"],
        ratingTendency: 4.3,
        reviewStyle: "expressive"
    },
    {
        name: "practical_reader",
        genrePreferences: ["COOKING", "GARDENING", "HOUSE & HOME", "PETS", "HEALTH & FITNESS"],
        ratingTendency: 4.0,
        reviewStyle: "practical"
    },
    {
        name: "humoristic_reader",
        genrePreferences: ["HUMOR"],
        ratingTendency: 4.2,
        reviewStyle: "funny"
    },
    {
        name: "spiritual_reader",
        genrePreferences: ["RELIGION", "BIBLES", "BODY, MIND & SPIRIT"],
        ratingTendency: 4.1,
        reviewStyle: "introspective"
    },
    {
        name: "family_oriented",
        genrePreferences: ["FAMILY & RELATIONSHIPS", "SELF-HELP", "PSYCHOLOGY"],
        ratingTendency: 4.0,
        reviewStyle: "empathetic"
    },
    {
        name: "studious_reader",
        genrePreferences: ["EDUCATION", "STUDY AIDS", "LANGUAGE ARTS & DISCIPLINES", "LANGUAGE STUDY"],
        ratingTendency: 3.9,
        reviewStyle: "academic"
    },
    {
        name: "collector_reader",
        genrePreferences: ["ANTIQUES & COLLECTIBLES", "TRANSPORTATION"],
        ratingTendency: 4.1,
        reviewStyle: "curious"
    },
    {
        name: "legal_mind",
        genrePreferences: ["LAW", "POLITICAL SCIENCE", "SOCIAL SCIENCE"],
        ratingTendency: 3.8,
        reviewStyle: "analytical"
    },
    {
        name: "juvenile_reader",
        genrePreferences: ["JUVENILE NONFICTION", "YOUNG ADULT NONFICTION"],
        ratingTendency: 4.0,
        reviewStyle: "enthusiastic"
    }
];


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
    ],
    informative: [
        "Muy informativo y claro.",
        "Aprendí mucho con este libro.",
        "Excelente fuente de conocimiento.",
        "Explica los conceptos de manera precisa."
    ],
    dramatic: [
        "¡Qué trama tan intensa!",
        "No pude dejar de leer, muy emocionante.",
        "La historia me mantuvo al borde del asiento.",
        "Un relato dramático y absorbente."
    ],
    imaginative: [
        "La creatividad de este libro es impresionante.",
        "Una historia muy original y divertida.",
        "Me transportó a un mundo completamente nuevo.",
        "Fantástico, lleno de imaginación."
    ],
    expressive: [
        "El autor transmite emociones de forma brillante.",
        "Una narrativa muy expresiva y viva.",
        "Cada página tiene un estilo único.",
        "Hermosa forma de contar la historia."
    ],
    practical: [
        "Muy útil y práctico.",
        "Aplicable en la vida real.",
        "Consejos claros y directos.",
        "Me ayudó mucho con ideas prácticas."
    ],
    funny: [
        "¡Me hizo reír a carcajadas!",
        "Humor muy ingenioso.",
        "Divertidísimo y entretenido.",
        "No podía parar de sonreír mientras leía."
    ],
    introspective: [
        "Me hizo reflexionar profundamente.",
        "Una lectura que invita a mirar dentro de uno mismo.",
        "Profundo y enriquecedor.",
        "Ideas que te acompañan por mucho tiempo."
    ],
    empathetic: [
        "Me hizo sentir identificado con los personajes.",
        "Una lectura muy humana y cercana.",
        "Conmovedor y emotivo.",
        "Te conecta con la experiencia de los demás."
    ],
    academic: [
        "Muy bien documentado y riguroso.",
        "Excelente fuente académica.",
        "Claramente basado en investigación profunda.",
        "Perfecto para estudios y análisis."
    ],
    curious: [
        "Me despertó mucha curiosidad.",
        "Un libro que invita a explorar más sobre el tema.",
        "Interesante y enriquecedor.",
        "Hace que quieras aprender aún más."
    ]
};


async function fetchBooksFromAPI() {
    const genres = [
        'ANTIQUES & COLLECTIBLES',
        'LITERARY COLLECTIONS',
        'ARCHITECTURE',
        'LITERARY CRITICISM',
        'ART',
        'MATHEMATICS',
        'BIBLES',
        'MEDICAL',
        'BIOGRAPHY & AUTOBIOGRAPHY',
        'MUSIC',
        'BODY, MIND & SPIRIT',
        'NATURE',
        'BUSINESS & ECONOMICS',
        'PERFORMING ARTS',
        'COMICS & GRAPHIC NOVELS',
        'PETS',
        'COMPUTERS',
        'PHILOSOPHY',
        'COOKING',
        'PHOTOGRAPHY',
        'CRAFTS & HOBBIES',
        'POETRY',
        'DESIGN',
        'POLITICAL SCIENCE',
        'DRAMA',
        'PSYCHOLOGY',
        'EDUCATION',
        'REFERENCE',
        'FAMILY & RELATIONSHIPS',
        'RELIGION',
        'FICTION',
        'SCIENCE',
        'GAMES & ACTIVITIES',
        'SELF-HELP',
        'GARDENING',
        'SOCIAL SCIENCE',
        'HEALTH & FITNESS',
        'SPORTS & RECREATION',
        'HISTORY',
        'STUDY AIDS',
        'HOUSE & HOME',
        'TECHNOLOGY & ENGINEERING',
        'HUMOR',
        'TRANSPORTATION',
        'JUVENILE FICTION',
        'TRAVEL',
        'JUVENILE NONFICTION',
        'TRUE CRIME',
        'LANGUAGE ARTS & DISCIPLINES',
        'YOUNG ADULT FICTION',
        'LANGUAGE STUDY',
        'YOUNG ADULT NONFICTION',
        'LAW'
    ];

    const books = [];
    const bar = new cliProgress.SingleBar({
        format: 'Obteniendo libros |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(genres.length, 0);

    for (const genre of genres) {
        let collected = 0;
        let startIndex = 0;

        console.log(`📖 Buscando libros de género: ${genre}`);

        while (collected < 5) {
            try {
                const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${encodeURIComponent(genre)}&maxResults=10&startIndex=${startIndex}&key=${API_KEY}`;
                const response = await fetch(url, {
                    timeout: 10000,
                    headers: { 'User-Agent': 'BookRecommendationSystem/1.0' }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                if (!data.items || data.items.length === 0) {
                    console.warn(`⚠️ No más resultados para ${genre}`);
                    break;
                }

                for (const item of data.items) {
                    if (collected >= 5) break;

                    const v = item.volumeInfo;
                    if (!v.categories) continue;

                    // Verificar que alguna categoría coincide con el género actual
                    const hasGenre = v.categories.some(c =>
                        c.toLowerCase().includes(genre.toLowerCase())
                    );

                    if (hasGenre) {
                        const book = createBookFromAPI(item);
                        books.push(book);
                        collected++;
                    }
                }

                startIndex += 10;
                // Rate limit
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`❌ Error obteniendo libros del género ${genre}: ${error.message}`);
                break;
            }
        }

        console.log(`✅ ${collected} libros añadidos para ${genre}`);
        bar.increment();
    }

    bar.stop();
    console.log(`📚 Total libros obtenidos: ${books.length}`);
    return books;
}


function createBookFromAPI(apiBook) {
    const v = apiBook.volumeInfo;

    return {
        bookId: apiBook.id,
        title: v.title || 'Titulo desconocido',
        authors: v.authors ? v.authors.join(', ') : 'Author desconocido',
        publishedDate: v.publishedDate || null,
        description: v.description || 'No description available.',
        pageCount: v.pageCount || faker.number.int({ min: 100, max: 800 }),
        categories: v.categories ? v.categories.join(',') : 'Sin categorizar',
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
            id: i,
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

function generateLibraries(users, books) {
    console.log("📖 Generating libraries...");
    const librariesData = [];
    const libraryBooks = [];
    let libraryId = 1;
    let libraryBookId = 1;

    const bar = new cliProgress.SingleBar({
        format: 'Libraries |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    const totalLibraries = users.length * libraries.length;
    bar.start(totalLibraries, 0);

    users.forEach(user => {
        libraries.forEach(libraryTitle => {
            const userGenres = user._personality.genrePreferences;
            let selectedBooks = [];

            if (libraryTitle === "Favoritos") {
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
                const numBooks = faker.number.int({ min: 3, max: 15 });
                selectedBooks = faker.helpers.shuffle(books)
                    .slice(0, numBooks)
                    .map(book => book.bookId);
            }

            librariesData.push({
                id: libraryId,
                userId: user.id,
                title: libraryTitle
            });

            selectedBooks.forEach(bookId => {
                libraryBooks.push({
                    id: libraryBookId++,
                    libraryId: libraryId,
                    bookId: bookId
                });
            });

            libraryId++;
            bar.increment();
        });
    });

    bar.stop();
    console.log(`✅ ${librariesData.length} libraries generated\n`);
    return { librariesData, libraryBooks };
}

function generateReviews(users, books) {
    console.log("⭐ Generando reviews...");
    const reviews = [];
    let reviewId = 1;

    const totalReviews = users.length * 8;
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
                likes: 0
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

    const genreMatches = bookCategories.filter(cat =>
        userGenres.some(pref =>
            cat.toLowerCase().includes(pref.toLowerCase()) ||
            pref.toLowerCase().includes(cat.toLowerCase())
        )
    ).length;

    let score = 0.3 + (genreMatches * 0.2);

    score += faker.number.float({ min: -0.1, max: 0.2 });

    return Math.max(0, Math.min(1, score));
}

function generateRatingFromCompatibility(compatibility, ratingTendency) {
    let baseRating = compatibility * 5;

    const tendencyAdjustment = (ratingTendency - 3) * 0.5;
    baseRating += tendencyAdjustment;

    baseRating += faker.number.float({ min: -0.5, max: 0.5 });

    return Math.max(1, Math.min(5, Math.round(baseRating)));
}

function generateComment(rating, reviewStyle, book) {
    const templates = reviewTemplates[reviewStyle];
    let comment = faker.helpers.arrayElement(templates);

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

function generateLikes(users, reviews) {
    console.log("👍 Generando likes...");
    const likes = [];
    let likeId = 1;

    const totalLikes = reviews.length * 2;
    const bar = new cliProgress.SingleBar({
        format: 'Likes |{bar}| {value}/{total} | {percentage}%',
        clearOnComplete: false,
        hideCursor: true
    }, cliProgress.Presets.shades_classic);

    bar.start(totalLikes, 0);

    users.forEach(user => {
        const otherUsersReviews = reviews.filter(review => review.userId !== user.id);

        const numLikes = faker.number.int({ min: 5, max: 25 });
        const selectedReviews = faker.helpers.shuffle(otherUsersReviews).slice(0, numLikes);

        selectedReviews.forEach(review => {
            let likeProbability = 0.3;
            if (review.rating >= 4) likeProbability += 0.3;

            if (review.rating <= 2) likeProbability -= 0.2;

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

function cleanDataForDB(users, books, reviews, likes, libraries) {
    const cleanUsers = users.map(user => {
        const { _personality, _age, ...cleanUser } = user;
        return cleanUser;
    });

    return {
        users: cleanUsers,
        books: books,
        reviews: reviews,
        likes: likes,
        libraries: libraries
    };
}

async function main() {
    console.log("🚀 Generando dataset realista para sistema de recomendaciones...\n");

    try {
        console.log("📚 Obteniendo libros desde Google Books API...");
        const books = await fetchBooksFromAPI();

        if (books.length === 0) {
            console.error("❌ No se pudieron obtener libros. Verifica tu API key y conexión.");
            process.exit(1);
        }

        const users = generateUsers();

        const { librariesData, libraryBooks } = generateLibraries(users, books);

        const reviews = generateReviews(users, books);

        const likes = generateLikes(users, reviews);

        const cleanData = cleanDataForDB(users, books, reviews, likes, librariesData, libraryBooks);

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

        console.log("💾 Guardando archivos...");
        const outputDir = "./";

        fs.writeFileSync(`${outputDir}users.json`, JSON.stringify(cleanData.users, null, 2));
        fs.writeFileSync(`${outputDir}books.json`, JSON.stringify(cleanData.books, null, 2));
        fs.writeFileSync(`${outputDir}reviews.json`, JSON.stringify(cleanData.reviews, null, 2));
        fs.writeFileSync(`${outputDir}likes.json`, JSON.stringify(cleanData.likes, null, 2));
        fs.writeFileSync(`${outputDir}libraries.json`, JSON.stringify(librariesData, null, 2));
        fs.writeFileSync(`${outputDir}library_books.json`, JSON.stringify(libraryBooks, null, 2));
        fs.writeFileSync(`${outputDir}metadata.json`, JSON.stringify(metadata, null, 2));

        const completeDataset = { ...cleanData, metadata };
        fs.writeFileSync(`${outputDir}complete_dataset.json`, JSON.stringify(completeDataset, null, 2));

        console.log("\nDataset generado");
        console.log("\n📊 ESTADÍSTICAS FINALES:");
        console.log("=" + "=".repeat(50));
        console.log(`👥 Usuarios: ${metadata.totalUsers}`);
        console.log(`📚 Libros: ${metadata.totalBooks}`);
        console.log(`⭐ Reviews: ${metadata.totalReviews} (${metadata.avgReviewsPerUser} por usuario)`);
        console.log(`👍 Likes: ${metadata.totalLikes} (${metadata.avgLikesPerReview} por review)`);
        console.log(`📖 Bibliotecas: ${metadata.totalLibraries}`);
        console.log(`⭐ Rating promedio: ${metadata.avgRating}/5.0`);

    } catch (error) {
        console.error("❌ Error durante la generación:", error);
        console.error(error.stack);
        process.exit(1);
    }
}

main();