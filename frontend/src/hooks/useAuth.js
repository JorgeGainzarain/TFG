// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import {
    subscribeToAuthChanges,
    getAuthState,
    isAuthenticated,
    login,
    register,
    logout,
    initializeAuth,
    getUserLibrary,
    addBookToShelf,
    removeBookFromShelf
} from '../services/authService';

export const useAuth = () => {
    const [authState, setAuthState] = useState(getAuthState());
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        // Suscribirse a cambios de autenticación
        const unsubscribe = subscribeToAuthChanges((newState) => {
            setAuthState(newState);
        });

        // Inicializar estado de autenticación al montar
        const initialize = async () => {
            await initializeAuth();
            setInitialized(true);
        };

        initialize();

        // Cleanup
        return unsubscribe;
    }, []);

    return {
        // Estado
        user: authState.user,
        isAuthenticated: isAuthenticated(),
        loading: authState.loading,
        initialized,

        // Funciones de autenticación
        login,
        register,
        logout,

        // Funciones de librería
        getUserLibrary,
        addBookToShelf,
        removeBookFromShelf,
    };
};