// frontend/src/services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Cambiar a sessionStorage para mayor seguridad
const TOKEN_KEY = 'bookhub_access_token';
const REFRESH_TOKEN_KEY = 'bookhub_refresh_token';
const USER_KEY = 'bookhub_user';

// Estado de autenticación centralizado
let authState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    initialized: false
};

// Listeners para cambios de estado
const authListeners = [];

// Sistema de notificaciones de cambios
const notifyAuthChange = () => {
    authListeners.forEach(listener => {
        try {
            listener({ ...authState });
        } catch (error) {
            console.error('Error en listener de auth:', error);
        }
    });
};

// Suscripción a cambios de autenticación
export const subscribeToAuthChanges = (listener) => {
    if (typeof listener !== 'function') {
        throw new Error('El listener debe ser una función');
    }

    authListeners.push(listener);

    return () => {
        const index = authListeners.indexOf(listener);
        if (index > -1) {
            authListeners.splice(index, 1);
        }
    };
};

// === GESTIÓN DE TOKENS ===

export const getAccessToken = () => {
    try {
        return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error accessing sessionStorage:', error);
        return null;
    }
};

export const getRefreshToken = () => {
    try {
        return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Error accessing sessionStorage:', error);
        return null;
    }
};

export const setTokens = (accessToken, refreshToken) => {
    try {
        if (!accessToken || !refreshToken) {
            throw new Error('Tokens inválidos');
        }

        sessionStorage.setItem(TOKEN_KEY, accessToken);
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
        console.error('Error storing tokens:', error);
        throw error;
    }
};

export const clearTokens = () => {
    try {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error clearing tokens:', error);
    }
};

// === GESTIÓN DE USUARIO ===

export const setUser = (user) => {
    try {
        if (!user || !user.id) {
            throw new Error('Datos de usuario inválidos');
        }

        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        authState.user = user;
        authState.isAuthenticated = true;
        notifyAuthChange();
    } catch (error) {
        console.error('Error storing user:', error);
        throw error;
    }
};

export const getStoredUser = () => {
    try {
        const userStr = sessionStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
    }
};

// === UTILIDADES DE TOKEN ===

const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= (payload.exp * 1000);
    } catch (error) {
        return true;
    }
};

// === REQUESTS AUTENTICADOS ===

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

        const data = await response;

        return data;
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
    }
};

// === REFRESH TOKEN ===

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

        const result = await response.json();

        if (result.status === 'success' && result.data) {
            setTokens(result.data.accessToken, result.data.refreshToken);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
};

// === FUNCIONES DE AUTENTICACIÓN ===

export const register = async (userData) => {
    try {
        authState.loading = true;
        notifyAuthChange();

        // Validaciones del lado cliente
        if (!userData.name || userData.name.trim().length < 3) {
            throw new Error('El nombre debe tener al menos 3 caracteres');
        }

        if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
            throw new Error('Email inválido');
        }

        if (!userData.password || userData.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const registrationData = {
            username: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            password: userData.password
        };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 409) {
                throw new Error('El correo electrónico ya está registrado');
            }
            throw new Error(result.error || result.message || 'Error en el registro');
        }

        if (result.status === 'success' && result.data) {
            // Guardar tokens y usuario
            setTokens(result.data.accessToken, result.data.refreshToken);
            setUser(result.data.user);

            console.log("User:", result.data.user);

            // Crear biblioteca por defecto
            try {
                await createDefaultLibraries();
            } catch (libraryError) {
                console.warn('Error creando biblioteca por defecto:', libraryError);
            }

            return {
                success: true,
                user: result.data.user,
                message: result.message
            };
        }

        throw new Error('Respuesta inválida del servidor');

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

        // Validaciones básicas
        if (!credentials.email || !credentials.password) {
            throw new Error('Email y contraseña son requeridos');
        }

        const loginData = {
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password
        };

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Email o contraseña incorrectos');
            }
            throw new Error(result.error || result.message || 'Error en el login');
        }

        if (result.status === 'success' && result.data) {
            // Guardar tokens y usuario
            setTokens(result.data.accessToken, result.data.refreshToken);
            setUser(result.data.user);

            return {
                success: true,
                user: result.data.user,
                message: result.message
            };
        }

        throw new Error('Respuesta inválida del servidor');

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

        // Intentar notificar al servidor (no crítico si falla)
        if (token) {
            try {
                await makeAuthenticatedRequest('/auth/logout', { method: 'POST' });
            } catch (error) {
                console.warn('Error notificando logout al servidor:', error);
            }
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
    try {
        const result = await makeAuthenticatedRequest('/auth/me');

        if (result.status === 'success' && result.data) {
            // Actualizar usuario en el estado
            setUser(result.data.user);
            return result.data.user;
        }

        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// === INICIALIZACIÓN ===

export const initializeAuth = async () => {
    try {
        const storedUser = getStoredUser();
        const token = getAccessToken();

        if (storedUser && token && !isTokenExpired(token)) {
            // Token válido, establecer estado
            authState.user = storedUser;
            authState.isAuthenticated = true;

            // Verificar con el servidor en background
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    authState.user = currentUser;
                    setUser(currentUser);
                }
            } catch (error) {
                console.warn('Error verificando usuario con servidor:', error);
            }
        } else if (token && isTokenExpired(token)) {
            // Intentar renovar token
            const refreshed = await refreshAccessToken();
            if (refreshed && storedUser) {
                authState.user = storedUser;
                authState.isAuthenticated = true;
            } else {
                clearTokens();
            }
        } else {
            clearTokens();
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
    } finally {
        authState.initialized = true;
        notifyAuthChange();
    }
};

// === UTILIDADES ===

export const isAuthenticated = () => {
    const token = getAccessToken();
    return authState.isAuthenticated && !!token && !isTokenExpired(token);
};

export const getAuthState = () => {
    return { ...authState };
};

// Función helper para crear biblioteca por defecto
const createDefaultLibraries = async () => {
    try {
        console.log("Creando biblioteca por defecto...");

        const response = await makeAuthenticatedRequest('/library/', {
            method: 'POST',
        });

        const result = await response.json();
        console.log('Biblioteca por defecto creada:', result);
        return result;
    } catch (error) {
        console.error('Error creando biblioteca por defecto:', error);
        throw error;
    }
};

export const getDefaultLibraries = async () => {
    try {
        const response = await makeAuthenticatedRequest('/library/default', {
            method: 'GET',
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error obteniendo bibliotecas por defecto:', error);
        throw error;
    }
}