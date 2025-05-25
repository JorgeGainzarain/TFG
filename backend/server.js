const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Google Books API configuration
const GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
const API_KEY = process.env.GOOGLE_BOOKS_API_KEY; // Optional but recommended for higher rate limits

// Helper function to format book data from Google Books API
const formatBookData = (book) => {
    const volumeInfo = book.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    return {
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
        thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || "",
        previewLink: volumeInfo.previewLink || "",
        infoLink: volumeInfo.infoLink || "",
        // Generate emoji based on category or use default
        coverEmoji: getCoverEmoji(volumeInfo.categories),
        language: volumeInfo.language || "es"
    };
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

// API Routes

// Search books
app.get("/api/books/search", async (req, res) => {
    try {
        const { q, maxResults = 12, startIndex = 0, orderBy = "relevance" } = req.query;

        if (!q) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        // Build the API URL
        let apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(q)}&maxResults=${maxResults}&startIndex=${startIndex}&orderBy=${orderBy}`;

        if (API_KEY) {
            apiUrl += `&key=${API_KEY}`;
        }

        console.log(`Searching books: ${q}`);
        const response = await axios.get(apiUrl);

        const books = response.data.items ? response.data.items.map(formatBookData) : [];

        res.json({
            books,
            totalItems: response.data.totalItems || 0,
            query: q,
            startIndex: parseInt(startIndex),
            maxResults: parseInt(maxResults)
        });

    } catch (error) {
        console.error("Error searching books:", error.message);
        res.status(500).json({
            error: "Error searching books",
            message: error.response?.data?.error?.message || error.message
        });
    }
});

// Get book by ID
app.get("/api/books/:id", async (req, res) => {
    try {
        const { id } = req.params;

        let apiUrl = `${GOOGLE_BOOKS_API_URL}/${id}`;
        if (API_KEY) {
            apiUrl += `?key=${API_KEY}`;
        }

        const response = await axios.get(apiUrl);
        const book = formatBookData(response.data);

        res.json(book);

    } catch (error) {
        console.error("Error fetching book:", error.message);
        if (error.response?.status === 404) {
            res.status(404).json({ error: "Book not found" });
        } else {
            res.status(500).json({
                error: "Error fetching book",
                message: error.response?.data?.error?.message || error.message
            });
        }
    }
});

// Get trending books (popular recent books)
app.get("/api/books/trending", async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const queries = [
            `subject:fiction+publishedDate:${currentYear}`,
            `subject:romance+publishedDate:${currentYear}`,
            `bestseller+${currentYear}`
        ];

        const allBooks = [];

        for (const query of queries) {
            let apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=4&orderBy=newest`;
            if (API_KEY) {
                apiUrl += `&key=${API_KEY}`;
            }

            try {
                const response = await axios.get(apiUrl);
                if (response.data.items) {
                    const books = response.data.items.map(formatBookData);
                    allBooks.push(...books);
                }
            } catch (queryError) {
                console.warn(`Error with query "${query}":`, queryError.message);
            }
        }

        // Remove duplicates and limit results
        const uniqueBooks = allBooks.filter((book, index, self) =>
            index === self.findIndex(b => b.id === book.id)
        ).slice(0, 12);

        res.json({ books: uniqueBooks });

    } catch (error) {
        console.error("Error fetching trending books:", error.message);
        res.status(500).json({ error: "Error fetching trending books" });
    }
});

// Get AI recommendations (books based on genres/categories)
app.get("/api/books/recommendations", async (req, res) => {
    try {
        const { genre, limit = 12 } = req.query;

        let query = "subject:fiction OR subject:science OR subject:history";
        if (genre) {
            query = `subject:${genre}`;
        }

        let apiUrl = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=${limit}&orderBy=relevance`;
        if (API_KEY) {
            apiUrl += `&key=${API_KEY}`;
        }

        const response = await axios.get(apiUrl);
        const books = response.data.items ? response.data.items.map(formatBookData) : [];

        res.json({ books });

    } catch (error) {
        console.error("Error fetching recommendations:", error.message);
        res.status(500).json({ error: "Error fetching recommendations" });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "OK", message: "BookHub API is running!" });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({
            message: "BookHub API Server",
            endpoints: [
                "GET /api/health - Health check",
                "GET /api/books/search?q=query - Search books",
                "GET /api/books/:id - Get book by ID",
                "GET /api/books/trending - Get trending books",
                "GET /api/books/recommendations?genre=fiction - Get recommendations"
            ]
        });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
    if (!API_KEY) {
        console.log("⚠️  Consider adding GOOGLE_BOOKS_API_KEY to .env for higher rate limits");
    }
});