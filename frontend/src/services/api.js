// src/services/api.js
import {getAccessToken, logout, refreshAccessToken, isTokenExpired} from './authService.js';

const API_BASE_URL = 'http://localhost:5000/api';

// Generic API request function
export const apiRequest = async (endpoint, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            signal: controller.signal,
            ...options,
        };

        const response = await fetch(url, config);
        clearTimeout(timer);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timer);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out.');
        }
        console.error('API Request failed:', error);
        throw error;
    }
};

export const makeAuthenticatedRequest = async (endpoint, options = {}) => {
    let token = getAccessToken();

    // Verificar si el token está expirado
    if (token && isTokenExpired(token)) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            await logout();
            throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
        }
        token = getAccessToken();
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Si recibimos 401, intentar refresh una vez
        if (response.status === 401 && token) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
                response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                await logout();
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }

        return await response;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
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