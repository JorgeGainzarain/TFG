// noinspection UnnecessaryLocalVariableJS,JSCheckFunctionSignatures,JSUnresolvedReference

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { initDatabase } = require('./config/database');
let db;
initDatabase().then(database => { db = database; });

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Secret - En producción debe estar en .env
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Middleware
app.use(cors());
app.use(express.json());

// Google Books API configuration
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido o expirado' });
        }
        req.user = user;
        next();
    });
};

// Genera y almacena el refresh token en la base de datos
const generateTokens = async (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    // Guardar refresh token en la base de datos (borra los antiguos si quieres)
    await db.run(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATETIME("now", "+7 day"))',
        userId, refreshToken
    );

    return { accessToken, refreshToken };
};

// Validación de email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validación de contraseña
const isValidPassword = (password) => {
    return password && password.length >= 6;
};

// RUTAS DE AUTENTICACIÓN

// Registro de usuario
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ...validaciones...

        // Verificar si el usuario ya existe (ANTES era con users.find)
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
        if (existingUser) {
            return res.status(409).json({
                error: 'Usuario ya existe',
                details: 'Ya hay una cuenta registrada con este email'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generar un id único (puedes usar uuid o similar)
        const { v4: uuidv4 } = require('uuid');
        const userId = uuidv4();

        // Guardar en la base de datos
        await db.run(
            'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
            userId, name, email.toLowerCase(), hashedPassword
        );

        // Generar tokens y retornar
        const tokens = generateTokens(userId);
        res.json({ user: { id: userId, name, email }, ...tokens });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// Login de usuario
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        // Buscar usuario en la base de datos
        const user = await db.get('SELECT * FROM users WHERE email = ?', email.toLowerCase());
        if (!user) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Comparar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        // Generar tokens y retornar
        const tokens = generateTokens(user.id);
        res.json({ user: { id: user.id, name: user.name, email: user.email }, ...tokens });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

// Refresh token
app.post('/api/auth/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Token requerido' });

    // Buscar el refresh token en la BD
    const tokenRow = await db.get('SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > DATETIME("now")', refreshToken);
    if (!tokenRow) return res.status(403).json({ error: 'Token inválido o expirado' });

    // Verificar y renovar
    jwt.verify(refreshToken, JWT_SECRET, async (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });

        const newTokens = await generateTokens(user.userId);
        res.json(newTokens);
    });
});

// Logout (invalidar token - en una app real usarías una blacklist)
app.post("/api/auth/logout", authenticateToken, (req, res) => {
    // En una aplicación real, aquí añadirías el token a una blacklist
    res.json({ message: 'Logout exitoso' });
    console.log(`✅ Usuario deslogueado: ${req.user.userId}`);
});

// RUTAS DE LIBRERÍA PERSONAL (requieren autenticación)

// Obtener la librería del usuario
app.get("/api/library", authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const library = userLibraries.get(userId) || {
            favorites: [],
            toRead: [],
            reading: [],
            read: [],
            reviews: []
        };

        res.json({ library });

    } catch (error) {
        console.error("Error obteniendo librería:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Añadir libro a una shelf específica
app.post("/api/library/:shelf", authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { shelf } = req.params;
        const { bookId, bookData } = req.body;

        const validShelves = ['favorites', 'toRead', 'reading', 'read'];
        if (!validShelves.includes(shelf)) {
            return res.status(400).json({ error: 'Shelf inválida' });
        }

        if (!bookId || !bookData) {
            return res.status(400).json({ error: 'ID del libro y datos son requeridos' });
        }

        let library = userLibraries.get(userId);
        if (!library) {
            library = { favorites: [], toRead: [], reading: [], read: [], reviews: [] };
            userLibraries.set(userId, library);
        }

        // Verificar si el libro ya está en esta shelf
        const existingBook = library[shelf].find(book => book.id === bookId);
        if (existingBook) {
            return res.status(409).json({
                error: 'El libro ya está en esta lista',
                details: `El libro ya está en tu lista de ${shelf}`
            });
        }

        // Añadir libro con timestamp
        const bookEntry = {
            ...bookData,
            id: bookId,
            addedAt: new Date().toISOString()
        };

        library[shelf].push(bookEntry);

        res.json({
            message: 'Libro añadido exitosamente',
            book: bookEntry,
            shelf
        });

        console.log(`📚 Libro añadido a ${shelf}: ${bookData.title} (Usuario: ${userId})`);

    } catch (error) {
        console.error("Error añadiendo libro:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Remover libro de una shelf
app.delete("/api/library/:shelf/:bookId", authenticateToken, (req, res) => {
    try {
        const userId = req.user.userId;
        const { shelf, bookId } = req.params;

        const validShelves = ['favorites', 'toRead', 'reading', 'read'];
        if (!validShelves.includes(shelf)) {
            return res.status(400).json({ error: 'Shelf inválida' });
        }

        const library = userLibraries.get(userId);
        if (!library) {
            return res.status(404).json({ error: 'Librería no encontrada' });
        }

        const bookIndex = library[shelf].findIndex(book => book.id === bookId);
        if (bookIndex === -1) {
            return res.status(404).json({ error: 'Libro no encontrado en esta lista' });
        }

        const removedBook = library[shelf].splice(bookIndex, 1)[0];

        res.json({
            message: 'Libro removido exitosamente',
            book: removedBook,
            shelf
        });

        console.log(`🗑️ Libro removido de ${shelf}: ${removedBook.title} (Usuario: ${userId})`);

    } catch (error) {
        console.error("Error removiendo libro:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// [Mantener todas las rutas existentes de Google Books API...]

// Helper function to format book data from Google Books API
const formatBookData = (book) => {
    const volumeInfo = book.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    // Enhanced image URL extraction with better fallbacks
    const getThumbnailUrl = (imageLinks) => {
        const possibleUrls = [
            imageLinks.thumbnail,
            imageLinks.smallThumbnail,
            imageLinks.medium,
            imageLinks.large,
            imageLinks.extraLarge
        ];

        for (const url of possibleUrls) {
            if (url && typeof url === 'string' && url.trim() !== '') {
                // Enhance image quality and ensure HTTPS
                return url
                    .replace('zoom=1', 'zoom=2')
                    .replace('http://', 'https://');
            }
        }

        return "";
    };

    const formattedBook = {
        id: book.id,
        title: volumeInfo.title || "Título no disponible",
        author: volumeInfo.authors ? volumeInfo.authors.join(", ") : "Autor desconocido",
        authors: volumeInfo.authors || [],
        description: volumeInfo.description || "Sin descripción disponible",
        publishedDate: volumeInfo.publishedDate || "",
        pageCount: volumeInfo.pageCount || 0,
        categories: volumeInfo.categories || [],
        genres: volumeInfo.categories ? volumeInfo.categories.slice(0, 3) : ["General"],
        averageRating: volumeInfo.averageRating || 0,
        ratingsCount: volumeInfo.ratingsCount || 0,
        rating: Math.round(volumeInfo.averageRating || 0),
        reviewCount: volumeInfo.ratingsCount || 0,
        thumbnail: getThumbnailUrl(imageLinks), // Enhanced thumbnail extraction
        previewLink: volumeInfo.previewLink || "",
        infoLink: volumeInfo.infoLink || "",
        coverEmoji: getCoverEmoji(volumeInfo.categories),
        language: volumeInfo.language || "es",

        // Additional debug info - remove in production
        debug: {
            originalImageLinks: imageLinks,
            hasImageLinks: Object.keys(imageLinks).length > 0,
            availableImageTypes: Object.keys(imageLinks)
        }
    };

    // Log for debugging - remove in production
    console.log(`Book formatted: ${formattedBook.title} - Thumbnail: ${formattedBook.thumbnail ? 'Found' : 'Missing'}`);
    if (!formattedBook.thumbnail && Object.keys(imageLinks).length > 0) {
        console.log('Available image links:', imageLinks);
    }

    return formattedBook;
};

// Helper function to get emoji based on book category
const getCoverEmoji = (categories) => {
    if (!categories || categories.length === 0) return "📖";

    const category = categories[0].toLowerCase();
    const emojiMap = {
        "fiction": "📚",
        "fantasy": "🐉",
        "romance": "💕",
        "mystery": "🔍",
        "science fiction": "🚀",
        "biography": "👤",
        "history": "📜",
        "science": "🔬",
        "technology": "💻",
        "business": "💼",
        "self-help": "🌟",
        "health": "💪",
        "cooking": "🍳",
        "travel": "✈️",
        "art": "🎨",
        "music": "🎵",
        "sports": "⚽",
        "religion": "⛪",
        "philosophy": "🤔",
        "poetry": "🎭"
    };

    for (const [key, emoji] of Object.entries(emojiMap)) {
        if (category.includes(key)) return emoji;
    }

    return "📖";
};

// Enhanced API request function with retry logic
const makeGoogleBooksRequest = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'BookHub/1.0'
                }
            });
            return response;
        } catch (error) {
            console.warn(`Request attempt ${i + 1} failed:`, error.message);

            if (error.response?.status === 503 && i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                continue;
            }

            if (error.response?.status === 429) {
                throw new Error("Google Books API rate limit exceeded");
            }

            if (i === retries - 1) {
                throw error;
            }
        }
    }
};

// Search books
app.get("/api/books/search", async (req, res) => {
    try {
        const { q, maxResults = 12, startIndex = 0, orderBy = "relevance" } = req.query;

        if (!q) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        let apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(q)}&maxResults=${maxResults}&startIndex=${startIndex}&orderBy=${orderBy}`;

        if (API_KEY) {
            apiUrl += `&key=${API_KEY}`;
        }

        console.log(`Searching books: ${q}`);
        const response = await makeGoogleBooksRequest(apiUrl);

        console.log("Response: ", response.data.items);
        console.log("Response Lenght: ", response.data.items ? response.data.items.length : 0);

        const books = response.data.items ? response.data.items.map(formatBookData) : [];
        console.log("Number of books", books.length);

       // console.log("Books found:", books.length);
        //console.log("Books:", books);

        res.json({
            books,
            totalItems: response.data.totalItems || 0,
            query: q,
            startIndex: parseInt(startIndex),
            maxResults: parseInt(maxResults)
        });

    } catch (error) {
        console.error("Error searching books:", error.message);

        if (error.message.includes("rate limit")) {
            return res.status(429).json({
                error: "Rate limit exceeded",
                message: "Too many requests to Google Books API. Please try again later."
            });
        }

        res.status(503).json({
            error: "Service temporarily unavailable",
            message: error.response?.data?.error?.message || "Google Books API is currently unavailable"
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "BookHub API is running!",
        timestamp: new Date().toISOString(),
        auth: "enabled"
    });
});

// Nuevo endpoint para obtener el usuario autenticado desde la base de datos
app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
        const db = getDb();
        const user = await db.get('SELECT id, name, email, created_at as createdAt, preferences FROM users WHERE id = ?', req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ user });
    } catch (error) {
        console.error("Error obteniendo perfil:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Internal server error",
        message: "Something went wrong!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🔐 Authentication enabled`);
    console.log(`🎯 JWT Secret configured: ${JWT_SECRET ? 'Yes' : 'No'}`);
    if (!API_KEY) {
        console.log("⚠️  Consider adding GOOGLE_BOOKS_API_KEY to .env for higher rate limits");
    }
});