// noinspection UnnecessaryLocalVariableJS,JSCheckFunctionSignatures,JSUnresolvedReference

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// JWT Secret - En producción debe estar en .env
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Middleware
app.use(cors());
app.use(express.json());

// Simulación de base de datos en memoria (en producción usar MongoDB, PostgresSQL, etc.)
const users = [];
const userLibraries = new Map(); // userId -> { favorites: [], toRead: [], reading: [], read: [] }

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

// Función para generar tokens JWT
const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
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

        // Validaciones
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos',
                details: 'Nombre, email y contraseña son obligatorios'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Email inválido',
                details: 'Por favor ingresa un email válido'
            });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                error: 'Contraseña inválida',
                details: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = users.find(user => user.email === email.toLowerCase());
        if (existingUser) {
            return res.status(409).json({
                error: 'Usuario ya existe',
                details: 'Ya hay una cuenta registrada con este email'
            });
        }

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Crear usuario
        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            preferences: {
                favoriteGenres: [],
                language: 'es'
            }
        };

        users.push(newUser);

        // Inicializar librería del usuario
        userLibraries.set(newUser.id, {
            favorites: [],
            toRead: [],
            reading: [],
            read: [],
            reviews: []
        });

        // Generar tokens
        const { accessToken, refreshToken } = generateTokens(newUser.id);

        // Respuesta (sin incluir password)
        const userResponse = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            createdAt: newUser.createdAt,
            preferences: newUser.preferences
        };

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: userResponse,
            accessToken,
            refreshToken
        });

        console.log(`✅ Usuario registrado: ${newUser.email}`);

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: 'No se pudo completar el registro'
        });
    }
});

// Login de usuario
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones
        if (!email || !password) {
            return res.status(400).json({
                error: 'Credenciales requeridas',
                details: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario
        const user = users.find(u => u.email === email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                details: 'Email o contraseña incorrectos'
            });
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Credenciales inválidas',
                details: 'Email o contraseña incorrectos'
            });
        }

        // Generar tokens
        const { accessToken, refreshToken } = generateTokens(user.id);

        // Respuesta (sin incluir password)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            preferences: user.preferences
        };

        res.json({
            message: 'Login exitoso',
            user: userResponse,
            accessToken,
            refreshToken
        });

        console.log(`✅ Usuario logueado: ${user.email}`);

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            error: 'Error interno del servidor',
            details: 'No se pudo completar el login'
        });
    }
});

// Refresh token
app.post("/api/auth/refresh", (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token requerido' });
        }

        jwt.verify(refreshToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Refresh token inválido' });
            }

            const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

            res.json({
                accessToken,
                refreshToken: newRefreshToken
            });
        });

    } catch (error) {
        console.error("Error en refresh token:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Logout (invalidar token - en una app real usarías una blacklist)
app.post("/api/auth/logout", authenticateToken, (req, res) => {
    // En una aplicación real, aquí añadirías el token a una blacklist
    res.json({ message: 'Logout exitoso' });
    console.log(`✅ Usuario deslogueado: ${req.user.userId}`);
});

// Obtener perfil del usuario
app.get("/api/auth/profile", authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            preferences: user.preferences
        };

        res.json({ user: userResponse });

    } catch (error) {
        console.error("Error obteniendo perfil:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
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

        const books = response.data.items ? response.data.items.map(formatBookData) : [];

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
        auth: "enabled",
        users: users.length
    });
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