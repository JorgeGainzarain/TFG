// frontend/src/components/AuthWrapper/AuthWrapper.jsx

import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthWrapper = ({ children }) => {
    const { isAuthenticated, user, initialized } = useAuthContext();
    const [key, setKey] = useState(0);
    const location = useLocation();

    // Forzar re-render cuando cambia el estado de autenticación
    useEffect(() => {
        const handleAuthChange = () => {
            console.log('🔄 AuthWrapper: Detectado cambio de autenticación');
            setKey(prev => prev + 1);
        };

        // Escuchar cambios de autenticación
        window.addEventListener('auth-changed', handleAuthChange);

        return () => {
            window.removeEventListener('auth-changed', handleAuthChange);
        };
    }, []);

    // También forzar re-render cuando cambia el estado interno
    useEffect(() => {
        console.log('🔄 AuthWrapper: Estado de auth actualizado', {
            isAuthenticated,
            user: user?.email || null,
            initialized
        });
        setKey(prev => prev + 1);
    }, [isAuthenticated, user, initialized]);

    return (
        <div key={`auth-wrapper-${key}`}>
            {children}
        </div>
    );
};

export default AuthWrapper;