// frontend/src/hooks/useAuth.js

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    subscribeToAuthChanges,
    getAuthState,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
    getCurrentUser,
    refreshAccessToken
} from '../services/authService';

export const useAuth = () => {
    const [authState, setAuthState] = useState(getAuthState());
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);
    const initializationRef = useRef(false);

    // === EFECTOS ===

    useEffect(() => {
        // Prevenir múltiples inicializaciones
        if (initializationRef.current) return;
        initializationRef.current = true;

        // Suscribirse a cambios de autenticación
        const unsubscribe = subscribeToAuthChanges((newState) => {
            setAuthState(newState);
            setInitialized(newState.initialized);
        });

        // Inicializar estado de autenticación
        const initialize = async () => {
            try {
                await initializeAuth();
                setError(null);
            } catch (err) {
                console.error('Error inicializando autenticación:', err);
                setError('Error al inicializar la autenticación');
            } finally {
                setInitialized(true);
            }
        };

        initialize();

        // Cleanup
        return () => {
            unsubscribe();
            initializationRef.current = false;
        };
    }, []);

    // === FUNCIONES WRAPPED ===

    const handleLogin = useCallback(async (credentials) => {
        try {
            setError(null);
            const result = await login(credentials);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Error en el login';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const handleRegister = useCallback(async (userData) => {
        try {
            setError(null);
            const result = await register(userData);
            return result;
        } catch (err) {
            const errorMessage = err.message || 'Error en el registro';
            setError(errorMessage);
            throw err;
        }
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            setError(null);
            await logout();
        } catch (err) {
            console.error('Error en logout:', err);
            // No propagar error de logout para no interrumpir UX
        }
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            if (!isAuthenticated()) {
                throw new Error('Usuario no autenticado');
            }

            const user = await getCurrentUser();
            return user;
        } catch (err) {
            console.error('Error refrescando usuario:', err);
            setError('Error al actualizar datos del usuario');
            throw err;
        }
    }, []);

    const checkAuthStatus = useCallback(() => {
        return isAuthenticated();
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // === VALORES DE RETORNO (mantiene tu interfaz actual) ===

    return {
        // Estado actual que ya usas
        user: authState.user,
        isAuthenticated: checkAuthStatus(),
        loading: authState.loading,
        initialized,

        // Funciones que ya usas
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,

        // Nuevas funciones disponibles
        error,
        refreshUser,
        clearError,
        checkAuthStatus,

        // Información adicional
        isLoading: authState.loading,
        hasUser: !!authState.user,
    };
};