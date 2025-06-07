// src/services/authService.js
// noinspection UnnecessaryLocalVariableJS,ExceptionCaughtLocallyJS

const React = require('react');
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Estado de autenticación
let authState = {
    user: null,
    isAuthenticated: false,
    loading: false
};

// Listeners para cambios de estado
const authListeners = [];

// Función para notificar cambios de estado
const notifyAuthChange = () => {
    authListeners.forEach(listener => listener(authState));
};

// Función para suscribirse a cambios de autenticación
export const subscribeToAuthChanges = (listener) => {
    authListeners.push(listener);

    // Retornar función para desuscribirse
    return () => {
        const index = authListeners.indexOf(listener);
        if (index > -1) {
            authListeners.splice(index, 1);
        }
    };
};

// Función para hacer requests con auth
const authRequest = async (endpoint, options = {}) => {
    const token = getAccessToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Si el token expiró, intentar refresh
        if (response.status === 403 && token) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                // Reintentar la request original con el nuevo token
                config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
                return await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                // Refresh falló, logout automático
                await logout();
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.details || errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Auth request failed:', error);
        throw error;
    }
};

// Funciones de token management
export const getAccessToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    authState.user = user;
    authState.isAuthenticated = true;
    notifyAuthChange();
};

export const getStoredUser = () => {
    try {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    } catch {
        return null;
    }
};

// Refresh token automático
export const refreshAccessToken = async () => {
    try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        setTokens(data.accessToken, data.refreshToken);
        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
};

// Funciones principales de autenticación
export const register = async (userData) => {
    try {
        authState.loading = true;
        notifyAuthChange();

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || 'Error en el registro');
        }

        // Guardar tokens y usuario
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);

        return {
            success: true,
            user: data.user,
            message: data.message
        };

    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    } finally {
        authState.loading = false;
        notifyAuthChange();
    }
};

export const login = async (credentials) => {
    try {
        authState.loading = true;
        notifyAuthChange();

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || 'Error en el login');
        }

        // Guardar tokens y usuario
        setTokens(data.accessToken, data.refreshToken);
        setUser(data.user);

        return {
            success: true,
            user: data.user,
            message: data.message
        };

    } catch (error) {
        console.error('Login error:', error);
        throw error;
    } finally {
        authState.loading = false;
        notifyAuthChange();
    }
};

export const logout = async () => {
    try {
        const token = getAccessToken();
        if (token) {
            // Notificar al servidor (opcional)
            await authRequest('/auth/logout', { method: 'POST' }).catch(() => {
                // Ignorar errores de logout del servidor
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Limpiar datos locales siempre
        clearTokens();
        authState.user = null;
        authState.isAuthenticated = false;
        notifyAuthChange();
    }
};

export const getCurrentUser = async () => {
    const token = getAccessToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.user;
};

// Inicializar estado de autenticación al cargar
export const initializeAuth = async () => {
    try {
        const storedUser = getStoredUser();
        const token = getAccessToken();

        if (storedUser && token) {
            // Verificar si el token sigue siendo válido
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    authState.user = currentUser;
                    authState.isAuthenticated = true;
                } else {
                    // Token inválido, limpiar
                    clearTokens();
                }
            } catch (error) {
                // Error verificando usuario, limpiar
                clearTokens();
            }
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
    } finally {
        notifyAuthChange();
    }
};

// Funciones para la librería personal
export const getUserLibrary = async () => {
    try {
        const data = await authRequest('/library');
        return data.library;
    } catch (error) {
        console.error('Error getting user library:', error);
        throw error;
    }
};

export const addBookToShelf = async (shelf, bookId, bookData) => {
    try {
        const data = await authRequest(`/library/${shelf}`, {
            method: 'POST',
            body: JSON.stringify({ bookId, bookData }),
        });
        return data;
    } catch (error) {
        console.error('Error adding book to shelf:', error);
        throw error;
    }
};

export const removeBookFromShelf = async (shelf, bookId) => {
    try {
        const data = await authRequest(`/library/${shelf}/${bookId}`, {
            method: 'DELETE',
        });
        return data;
    } catch (error) {
        console.error('Error removing book from shelf:', error);
        throw error;
    }
};

// Función para verificar si está autenticado
export const isAuthenticated = () => {
    return authState.isAuthenticated && !!getAccessToken();
};

// Función para obtener el estado actual
export const getAuthState = () => {
    return { ...authState };
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

// Hook personalizado para React (opcional)
export const useAuth = () => {
    const [state, setState] = React.useState(authState);

    React.useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(setState);
        return unsubscribe;
    }, []);

    return {
        ...state,
        login,
        register,
        logout,
        isAuthenticated: isAuthenticated(),
    };
};