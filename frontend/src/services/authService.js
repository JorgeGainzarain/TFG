// src/services/authService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Claves para localStorage
const TOKEN_KEY = 'bookhub_access_token';
const REFRESH_TOKEN_KEY = 'bookhub_refresh_token';
const USER_KEY = 'bookhub_user';

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
    return () => {
        const index = authListeners.indexOf(listener);
        if (index > -1) {
            authListeners.splice(index, 1);
        }
    };
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
                config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
                return await fetch(`${API_BASE_URL}${endpoint}`, config);
            } else {
                await logout();
                throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
            }
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Auth request failed:', error);
        throw error;
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

// Funciones principales de autenticación
export const register = async (userData) => {
    try {
        authState.loading = true;
        notifyAuthChange();

        const registrationData = {
            username: userData.name,
            email: userData.email,
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

        if (response.status === 409) {
            throw new Error('El correo electrónico ya existe');
        }

        if (!response.ok) {
            throw new Error(result.message || 'Error en el registro');
        }

        if (result.status === 'success' && result.data) {
            // Guardar tokens y usuario
            setTokens(result.data.accessToken, result.data.refreshToken);
            setUser(result.data.user);

            const id = result.data.user.id;

            const response2 = await fetch(`${API_BASE_URL}/library/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title: 'default' }),
            });

            const result2 = await response2.json();
            if (!response2.ok) {
                throw new Error(result2.error || 'Error creando biblioteca del usuario');
            }
            console.log("Library created for user:", result2);

            return {
                success: true,
                user: result.data.user,
                message: result.error
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

        // Convertir email a username si se proporciona email
        const loginData = {
            email: credentials.email,
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
            throw new Error(result.error || 'Error en el login');
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
    try {
        const token = getAccessToken();
        if (!token) return null;

        const result = await authRequest('/auth/me');

        if (result.status === 'success' && result.data) {
            return result.data.user;
        }

        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

// Inicializar estado de autenticación al cargar
export const initializeAuth = async () => {
    try {

        const storedUser = getStoredUser();
        const token = getAccessToken();

        if (storedUser && token) {
            // Primero establecer el usuario del localStorage
            authState.user = storedUser;
            authState.isAuthenticated = true;

            // Luego verificar si el token sigue siendo válido (opcional)
            try {
                const currentUser = await getCurrentUser();
                if (currentUser) {
                    // Token válido, actualizar con datos más recientes
                    authState.user = currentUser;
                    setUser(currentUser);
                }
            } catch (error) {
                console.log('⚠️ Error verifying token, keeping stored user');
            }
        } else {
            clearTokens();
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
        clearTokens();
    } finally {
        notifyAuthChange();
    }
};

// Función para verificar si está autenticado
export const isAuthenticated = () => {
    return authState.isAuthenticated && !!getAccessToken();
};

// Función para obtener el estado actual
export const getAuthState = () => {
    // Inicializar con datos del localStorage si existen
    const storedUser = getStoredUser();
    const token = getAccessToken();

    return {
        user: storedUser,
        isAuthenticated: !!(storedUser && token),
        loading: false
    };
};