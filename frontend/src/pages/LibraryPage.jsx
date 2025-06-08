// frontend/src/pages/LibraryPage.jsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import LibraryContent from '../components/LibraryContent/LibraryContent';
import './Pages.css';

const LibraryPage = () => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="page-container">
                <div className="app-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando tu librería...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <div className="auth-required">
                    <div className="auth-required-icon">📚</div>
                    <h2>Inicia sesión para ver tu librería</h2>
                    <p>Guarda y organiza tus libros favoritos creando una cuenta.</p>
                    <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
                        🔑 Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <LibraryContent user={user} isAuthenticated={isAuthenticated} />
        </div>
    );
};

export default LibraryPage;