import React from 'react';
import './Pages.css';

// Página de Recomendaciones IA
export const AIRecommendationsPage = ({ user, isAuthenticated, onShowAuth }) => {
    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🤖 Recomendaciones IA</h1>
                <p>Descubre libros personalizados con inteligencia artificial</p>
            </div>
            <div className="coming-soon">
                <div className="coming-soon-icon">🚧</div>
                <h3>Próximamente</h3>
                <p>Las recomendaciones personalizadas con IA estarán disponibles pronto.</p>
            </div>
        </div>
    );
};

// Página de Perfil
export const ProfilePage = ({ user, isAuthenticated, onShowAuth, handleLogout }) => {
    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <div className="auth-required">
                    <div className="auth-required-icon">👤</div>
                    <h2>Inicia sesión para ver tu perfil</h2>
                    <p>Gestiona tu cuenta y preferencias de lectura.</p>
                    <button className="btn btn-primary" onClick={onShowAuth}>
                        🔑 Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>👤 Mi Perfil</h1>
                <p>Gestiona tu cuenta y preferencias</p>
            </div>
            <div className="profile-info">
                <div className="user-card glass">
                    <div className="user-avatar large">
                        {user.username.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="user-details">
                        <h3>{user.username}</h3>
                        <p>{user.email}</p>
                        <button className="btn btn-primary" onClick={handleLogout}>
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
            <div className="coming-soon">
                <div className="coming-soon-icon">🚧</div>
                <h3>Configuración completa próximamente</h3>
                <p>Pronto podrás personalizar tu experiencia de lectura.</p>
            </div>
        </div>
    );
};

// Página 404
export const NotFoundPage = () => {
    return (
        <div className="page-container">
            <div className="not-found">
                <div className="not-found-icon">📚</div>
                <h1>404 - Página no encontrada</h1>
                <p>Lo sentimos, la página que buscas no existe.</p>
                <a href="/" className="btn btn-primary">
                    🏠 Volver al inicio
                </a>
            </div>
        </div>
    );
};