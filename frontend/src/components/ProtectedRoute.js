// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg text-gray-600">Verificando autenticación...</span>
    </div>
);

const ProtectedRoute = ({ children, requireAuth = true, redirectTo = '/login' }) => {
    const { isAuthenticated, initialized, loading } = useAuthContext();
    const location = useLocation();

    // Mostrar spinner mientras se inicializa o está cargando
    if (!initialized || loading) {
        return <LoadingSpinner />;
    }

    // Si requiere autenticación y no está autenticado, redirigir
    if (requireAuth && !isAuthenticated) {
        return (
            <Navigate
                to={redirectTo}
                state={{ from: location }}
                replace
            />
        );
    }

    // Si no requiere autenticación pero está autenticado, redirigir a dashboard
    if (!requireAuth && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;