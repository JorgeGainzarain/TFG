// Faker/Faker.js
import { faker } from '@faker-js/faker';
import fs from 'fs';
import fetch from 'node-fetch';
import bcrypt from "bcrypt";
import cliProgress from 'cli-progress';

const NUM_USERS = 100;
const NUM_REVIEWS = 500;

const BOOK_LIST = [
    { title: "Cien años de soledad", author: "Gabriel García Márquez" },
    { title: "Don Quijote de la Mancha", author: "Miguel de Cervantes" },
    { title: "La sombra del viento", author: "Carlos Ruiz Zafón" },
    { title: "Rayuela", author: "Julio Cortázar" },
    { title: "El amor en los tiempos del cólera", author: "Gabriel García Márquez" },
    { title: "Pedro Páramo", author: "Juan Rulfo" },
    { title: "Ficciones", author: "Jorge Luis Borges" },
    { title: "El túnel", author: "Ernesto Sabato" },
    { title: "La casa de los espíritus", author: "Isabel Allende" },
    { title: "Crónica de una muerte anunciada", author: "Gabriel García Márquez" },
    { title: "Como agua para chocolate", author: "Laura Esquivel" },
    { title: "El Aleph", author: "Jorge Luis Borges" },
    { title: "Sobre héroes y tumbas", author: "Ernesto Sabato" },
    { title: "Los detectives salvajes", author: "Roberto Bolaño" },
    { title: "La ciudad y los perros", author: "Mario Vargas Llosa" },
    { title: "Pantaleón y las visitadoras", author: "Mario Vargas Llosa" },
    { title: "Travesuras de la niña mala", author: "Mario Vargas Llosa" },
    { title: "El coronel no tiene quien le escriba", author: "Gabriel García Márquez" },
    { title: "Aura", author: "Carlos Fuentes" },
    { title: "Terra Nostra", author: "Carlos Fuentes" }
];
const API_KEY = 'AIzaSyD5WzdHI77Y8WLT4vBteP4W3VjtRafBt8Q';

const uniqueGenres = [
    'ANTIQUES & COLLECTIBLES', 'LITERARY COLLECTIONS', 'ARCHITECTURE', 'LITERARY CRITICISM', 'ART', 'MATHEMATICS',
    'BIBLES', 'MEDICAL', 'BIOGRAPHY & AUTOBIOGRAPHY', 'MUSIC', 'BODY, MIND & SPIRIT', 'NATURE', 'BUSINESS & ECONOMICS',
    'PERFORMING ARTS', 'COMICS & GRAPHIC NOVELS', 'PETS', 'COMPUTERS', 'PHILOSOPHY', 'COOKING', 'PHOTOGRAPHY',
    'CRAFTS & HOBBIES', 'POETRY', 'DESIGN', 'POLITICAL SCIENCE', 'DRAMA', 'PSYCHOLOGY', 'EDUCATION', 'REFERENCE',
    'FAMILY & RELATIONSHIPS', 'RELIGION', 'FICTION', 'SCIENCE', 'GAMES & ACTIVITIES', 'SELF-HELP', 'GARDENING',
    'SOCIAL SCIENCE', 'HEALTH & FITNESS', 'SPORTS & RECREATION', 'HISTORY', 'STUDY AIDS', 'HOUSE & HOME',
    'TECHNOLOGY & ENGINEERING', 'HUMOR', 'TRANSPORTATION', 'JUVENILE FICTION', 'TRAVEL', 'JUVENILE NONFICTION',
    'TRUE CRIME', 'LANGUAGE ARTS & DISCIPLINES', 'YOUNG ADULT FICTION', 'LANGUAGE STUDY', 'YOUNG ADULT NONFICTION', 'LAW'
];

const genreTranslations = {
    'ANTIQUES & COLLECTIBLES': 'Antigüedades y Coleccionables',
    'LITERARY COLLECTIONS': 'Colecciones Literarias',
    'ARCHITECTURE': 'Arquitectura',
    'LITERARY CRITICISM': 'Crítica Literaria',
    'ART': 'Arte',
    'MATHEMATICS': 'Matemáticas',
    'BIBLES': 'Biblias',
    'MEDICAL': 'Medicina',
    'BIOGRAPHY & AUTOBIOGRAPHY': 'Biografía y Autobiografía',
    'MUSIC': 'Música',
    'BODY, MIND & SPIRIT': 'Cuerpo, Mente y Espíritu',
    'NATURE': 'Naturaleza',
    'BUSINESS & ECONOMICS': 'Negocios y Economía',
    'PERFORMING ARTS': 'Artes Escénicas',
    'COMICS & GRAPHIC NOVELS': 'Cómics y Novelas Gráficas',
    'PETS': 'Mascotas',
    'COMPUTERS': 'Informática',
    'PHILOSOPHY': 'Filosofía',
    'COOKING': 'Cocina',
    'PHOTOGRAPHY': 'Fotografía',
    'CRAFTS & HOBBIES': 'Manualidades y Pasatiempos',
    'POETRY': 'Poesía',
    'DESIGN': 'Diseño',
    'POLITICAL SCIENCE': 'Ciencias Políticas',
    'DRAMA': 'Drama',
    'PSYCHOLOGY': 'Psicología',
    'EDUCATION': 'Educación',
    'REFERENCE': 'Referencia',
    'FAMILY & RELATIONSHIPS': 'Familia y Relaciones',
    'RELIGION': 'Religión',
    'FICTION': 'Ficción',
    'SCIENCE': 'Ciencia',
    'GAMES & ACTIVITIES': 'Juegos y Actividades',
    'SELF-HELP': 'Autoayuda',
    'GARDENING': 'Jardinería',
    'SOCIAL SCIENCE': 'Ciencias Sociales',
    'HEALTH & FITNESS': 'Salud y Bienestar',
    'SPORTS & RECREATION': 'Deportes y Recreación',
    'HISTORY': 'Historia',
    'STUDY AIDS': 'Material de Estudio',
    'HOUSE & HOME': 'Hogar',
    'TECHNOLOGY & ENGINEERING': 'Tecnología e Ingeniería',
    'HUMOR': 'Humor',
    'TRANSPORTATION': 'Transporte',
    'JUVENILE FICTION': 'Ficción Juvenil',
    'TRAVEL': 'Viajes',
    'JUVENILE NONFICTION': 'No Ficción Juvenil',
    'TRUE CRIME': 'Crimen Real',
    'LANGUAGE ARTS & DISCIPLINES': 'Artes y Disciplinas del Lenguaje',
    'YOUNG ADULT FICTION': 'Ficción para Jóvenes Adultos',
    'LANGUAGE STUDY': 'Estudio de Idiomas',
    'YOUNG ADULT NONFICTION': 'No Ficción para Jóvenes Adultos',
    'LAW': 'Derecho'
};

const hashedPassword = await bcrypt.hash("password123", 12);

const users = Array.from({ length: NUM_USERS }, (_, i) => {
    const favoriteGenres = faker.helpers.shuffle(uniqueGenres).slice(0, faker.number.int({ min: 1, max: 3 }));
    return {
        id: i + 1,
        username: faker.internet.username(),
        email: faker.internet.email(),
        password: hashedPassword,
        createdAt: faker.date.past(),
        favoriteGenres
    };
});

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
                // Filter categories to only those in uniqueGenres
                let categories = Array.isArray(v.categories)
                    ? v.categories.filter(cat => uniqueGenres.includes(cat.toUpperCase()))
                    : [];
                if (categories.length === 0) categories = ['Uncategorized'];
                books.push({
                    bookId: match.id,
                    title: v.title,
                    authors: v.authors ? v.authors.join(', ') : 'Unknown',
                    publishedDate: v.publishedDate || 'Unknown',
                    description: v.description || 'No description available.',
                    pageCount: v.pageCount || faker.number.int({ min: 100, max: 3000 }),
                    categories,
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

    // --- Generate libraries ---
    const LIBRARY_TITLES = ["Leyendo", "Completados", "Por Leer", "Favoritos"];
    const libraries = [];
    for (let userId = 1; userId <= NUM_USERS; userId++) {
        const user = users.find(u => u.id === userId);
        for (const title of LIBRARY_TITLES) {
            let libraryBooks;
            if (title === "Favoritos") {
                const favBooks = books.filter(b =>
                    b.categories.some(g => user.favoriteGenres.includes(g))
                );
                const maxFavBooks = Math.min(10, favBooks.length);
                if (maxFavBooks > 0) {
                    libraryBooks = faker.helpers.shuffle(favBooks.map(b => b.bookId))
                        .slice(0, faker.number.int({ min: 1, max: maxFavBooks }));
                } else {
                    libraryBooks = [];
                }
            } else {
                const maxBooks = Math.min(10, bookIds.length);
                libraryBooks = maxBooks > 0
                    ? faker.helpers.shuffle(bookIds).slice(0, faker.number.int({ min: 1, max: maxBooks }))
                    : [];
            }
            libraries.push({
                id: libraries.length + 1,
                userId,
                title,
                bookIds: libraryBooks.join(',')
            });
        }
    }

// --- Generate reviews ---
    const positiveTemplates = [
        "Me encantó la temática de {genre}. ¡Muy recomendable!",
        "Una lectura fascinante para quienes disfrutan de {genre}. Lo disfruté mucho.",
        "La historia es cautivadora y los elementos de {genre} están muy bien logrados."
    ];
    const negativeTemplates = [
        "La temática de {genre} no es de mi estilo. No lo recomendaría.",
        "El libro no logró atraparme, especialmente por su enfoque en {genre}.",
        "No es mi tipo de lectura, sobre todo por el género {genre}."
    ];

    const reviews = [];
    for (let i = 0; i < NUM_REVIEWS; i++) {
        const user = faker.helpers.arrayElement(users);
        const book = faker.helpers.arrayElement(books);
        const matchesTaste = book.categories.some(g => user.favoriteGenres.includes(g.toUpperCase()));
        const genre = genreTranslations[(faker.helpers.arrayElement(book.categories)).toUpperCase()];
        // If genre is undefined, skip this review
        if (genre === undefined) {
            i--;
            continue;
        }
        let comment;
        if (matchesTaste) {
            const template = faker.helpers.arrayElement(positiveTemplates);
            comment = template
                .replace("{genre}", genre)
        } else {
            const template = faker.helpers.arrayElement(negativeTemplates);
            comment = template
                .replace("{genre}", genre)
        }
        const rating = matchesTaste ? faker.number.int({ min: 4, max: 5 }) : faker.number.int({ min: 1, max: 3 });
        reviews.push({
            id: i + 1,
            bookId: book.bookId,
            userId: user.id,
            rating,
            comment,
            createdAt: faker.date.recent(),
            categories: book.categories
        });
    }

    // --- Generate likes ---
    let likeId = 1;
    const likes = [];
    for (const user of users) {
        // User likes reviews that match their taste and are positive
        const matchingReviews = reviews.filter(r =>
            r.categories.some(g => user.favoriteGenres.includes(g)) && r.rating >= 4
        );
        const maxLikes = Math.min(10, matchingReviews.length);
        let reviewsToLike = [];
        if (maxLikes > 0) {
            reviewsToLike = faker.helpers.shuffle(matchingReviews)
                .slice(0, faker.number.int({ min: 1, max: maxLikes }));
        }
        for (const review of reviewsToLike) {
            likes.push({
                id: likeId++,
                reviewId: review.id,
                userId: user.id
            });
        }
    }

    // --- Set likes count in each review ---
    const likesCountMap = {};
    likes.forEach(like => {
        likesCountMap[like.reviewId] = (likesCountMap[like.reviewId] || 0) + 1;
    });
    reviews.forEach(review => {
        review.likes = likesCountMap[review.id] || 0;
        delete review.categories; // Remove categories from review before saving
    });

    fs.writeFileSync("../Faker/users.json", JSON.stringify(users, null, 2));
    fs.writeFileSync("../Faker/books.json", JSON.stringify(books, null, 2));
    fs.writeFileSync("../Faker/libraries.json", JSON.stringify(libraries, null, 2));
    fs.writeFileSync("../Faker/reviews.json", JSON.stringify(reviews, null, 2));
    fs.writeFileSync("../Faker/likes.json", JSON.stringify(likes, null, 2));

    console.log("✅ Simulated data generated successfully!");
}

main();