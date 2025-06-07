// src/services/api.js
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

        console.log(`API Request: ${config.method || 'GET'} ${url}`);

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
    searchBooks: async (query, options = {}) => {
        try {
            console.log(`Searching books with query: ${query}`);
            const response = await apiRequest(`/book/?q=${encodeURIComponent(query)}`, options);
            console.log(`Search response:`, response);
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