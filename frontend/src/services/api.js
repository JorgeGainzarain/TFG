// src/services/api.js
import {makeAuthenticatedRequest} from './authService.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request failed:', error);
        throw error;
    }
};

// Book API functions - estos endpoints necesitarán ser implementados en tu backend
export const bookAPI = {
    // Search books - este endpoint necesita ser implementado
// Accepts query, orderBy, maxResults, genre, year, etc.
    searchBooks: async (query, { orderBy, maxResults, genre, year } = {}) => {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (orderBy) params.append('orderBy', orderBy);
        if (maxResults) params.append('maxResults', maxResults);
        if (genre) params.append('genre', genre);
        if (year) params.append('year', year);

        try {
            const response = await apiRequest(`/book/?${params.toString()}`);
            return response.data || [];
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    },

};

// Health check
export const healthCheck = async () => {
    return apiRequest('/health');
};

// Error handling utility
export const handleApiError = (error) => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }

    if (error.message.includes('404')) {
        return 'Recurso no encontrado.';
    }

    if (error.message.includes('500')) {
        return 'Error interno del servidor. Inténtalo más tarde.';
    }

    return error.message || 'Ha ocurrido un error inesperado.';
};

// Library API functions

export const getReviewsFromBook = async (book) => {
    try {
        const response = await makeAuthenticatedRequest(`/review/${book.bookId}`);
        console.log("Response from getReviewsFromBook:", response);
        return response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
}

export const addReviewToBook = async (book, review) => {
    if (!review.createdAt) {
        review.createdAt = new Date().toISOString();
    }
    if (!review.likedBy) {
        review.likedBy = '';
    }
    review.book = book;
    console.log("Adding review to book:", book.bookId, review);
    try {
        const response = await makeAuthenticatedRequest(`/review/${book.bookId}`, {
            method: 'POST',
            body: JSON.stringify(review),
        });
        console.log("Response from addReviewToBook:", response);
        return response;
    } catch (error) {
        console.error('Error adding review:', error);
        throw error;
    }
}

export const addBookToLibrary = async (userId, book, libraryId) => {
    try {
        console.log('Adding book with ID:', book.bookId, 'to library with ID:', libraryId);
        return await makeAuthenticatedRequest(`/library/${libraryId}`, {
            method: 'POST',
            body: JSON.stringify(book),
        });
    } catch (error) {
        console.error('Error adding book to library:', error);
    }
};

export const updateBook = async (book) => {
    try {
        return await makeAuthenticatedRequest(`/library/${book.bookId}`, {
            method: 'PUT',
            body: JSON.stringify(book),
        });
    } catch (error) {
        console.error('Error updating book:', error);
    }
}

export const likeReview = async (userId, reviewId) => {
    console.log("Liking review:", reviewId);
    try {
        const response = await makeAuthenticatedRequest(`/like`, {
            method: 'POST',
            body: JSON.stringify({ reviewId: reviewId}),
        });
        return response.json();
    } catch (error) {
        console.error('Error liking review:', error);
    }
}

export const isLiked = async (userId, reviewId) => {
    console.log("Checking if review is liked:", reviewId);
    try {
        const response = await makeAuthenticatedRequest(`/like/${reviewId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    } catch (error) {
        console.error('Error checking if review is liked:', error);
    }
}

export const updateReview = async (userId, review) => {
    console.log("Review in updateReview:", review);
    try {
        return await makeAuthenticatedRequest(`/review/${review.id}`, {
            method: 'PUT',
            body: JSON.stringify(review),
        });
    } catch (error) {
        console.error('Error updating review:', error);
    }
}

export const deleteReview = async (reviewId) => {
    try {
        return await makeAuthenticatedRequest(`/review/${reviewId}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Error deleting review:', error);
    }
}

// Función para obtener recomendaciones de libros (placeholders)
export const getRecommendations = () => {
    return [
        {
            id: 'placeholder-1',
            title: 'El Nombre del Viento',
            authors: ['Patrick Rothfuss'],
            genres: ['Fantasía', 'Aventura'],
            categories: ['Fantasía', 'Aventura'],
            rating: 5,
            averageRating: 5,
            reviewCount: 28470,
            ratingsCount: 28470,
            coverEmoji: '🌪️',
            thumbnail: '',
            image: 'https://via.placeholder.com/150x200?text=El+Nombre+del+Viento',
            isPlaceholder: true,
            publishedDate: '2007',
            description: 'Una historia épica sobre un joven héroe y su búsqueda de la verdad.',
            pageCount: 662,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-2',
            title: 'Cien años de soledad',
            authors: ['Gabriel García Márquez'],
            genres: ['Realismo Mágico', 'Literatura'],
            categories: ['Realismo Mágico', 'Literatura'],
            rating: 5,
            averageRating: 5,
            reviewCount: 45230,
            ratingsCount: 45230,
            coverEmoji: '📖',
            thumbnail: '',
            image: 'https://via.placeholder.com/150x200?text=Cien+años+de+soledad',
            isPlaceholder: true,
            publishedDate: '1967',
            description: 'Una obra maestra del realismo mágico latinoamericano.',
            pageCount: 417,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-3',
            title: 'Sapiens',
            authors: ['Yuval Noah Harari'],
            genres: ['Historia', 'Antropología'],
            categories: ['Historia', 'Antropología'],
            rating: 5,
            averageRating: 5,
            reviewCount: 67890,
            ratingsCount: 67890,
            coverEmoji: '🧠',
            thumbnail: '',
            image: 'https://via.placeholder.com/150x200?text=Sapiens',
            isPlaceholder: true,
            publishedDate: '2014',
            description: 'Una mirada fascinante a la historia de la humanidad.',
            pageCount: 413,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-4',
            title: 'La Odisea',
            authors: ['Homero'],
            genres: ['Épica', 'Clásico'],
            categories: ['Épica', 'Clásico'],
            rating: 4.2,
            averageRating: 4.2,
            reviewCount: 15670,
            ratingsCount: 15670,
            coverEmoji: '⚓',
            thumbnail: '',
            image: 'https://via.placeholder.com/150x200?text=La+Odisea',
            isPlaceholder: true,
            publishedDate: '-800',
            description: 'El viaje épico de Odiseo de regreso a casa.',
            pageCount: 541,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-5',
            title: '1984',
            authors: ['George Orwell'],
            genres: ['Distopía', 'Ciencia Ficción'],
            categories: ['Distopía', 'Ciencia Ficción'],
            rating: 4.4,
            averageRating: 4.4,
            reviewCount: 28340,
            ratingsCount: 28340,
            coverEmoji: '👁️',
            thumbnail: '',
            image: 'https://via.placeholder.com/150x200?text=1984',
            isPlaceholder: true,
            publishedDate: '1949',
            description: 'Una visión aterradora del futuro en una sociedad totalitaria.',
            pageCount: 328,
            language: 'es',
            previewLink: '',
            infoLink: ''
        }
    ];
};

// Validaciones del lado cliente
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password && password.length >= 6;
};

export const validateName = (name) => {
    return name && name.trim().length >= 2;
};