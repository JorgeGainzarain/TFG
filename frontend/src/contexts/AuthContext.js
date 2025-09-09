
import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuthContext debe usarse dentro de AuthProvider');
    }

    return context;
};

export const useRequireAuth = () => {
    const { isAuthenticated, initialized, user } = useAuthContext();

    return {
        isAuthenticated,
        initialized,
        user,
        isReady: initialized && isAuthenticated
    };
};

export const withAuth = (Component) => {
    return function AuthenticatedComponent(props) {
        const { isAuthenticated, initialized } = useAuthContext();

        if (!initialized) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Acceso requerido</h2>
                        <p className="text-gray-600">Por favor inicia sesión para continuar</p>
                    </div>
                </div>
            );
        }

        return <Component {...props} />;
    };
};