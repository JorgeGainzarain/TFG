import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import MobileNavbar from './components/MobileNavbar/MobileNavbar';
import AuthOverlay from './components/AuthOverlay/AuthOverlay';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailsPage from './pages/BookDetailsPage';
import LibraryPage from './pages/LibraryPage';
import { AIRecommendationsPage, ProfilePage, NotFoundPage } from './pages/AdditionalPages';
import { useAuth } from './hooks/useAuth';
import { healthCheck, addBookToLibrary } from './services/api';
import './App.css';
import {initializeAuth} from "./services/authService";

// Componente interno que tiene acceso a useLocation
const AppContent = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [apiStatus, setApiStatus] = useState('checking');
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    // Ref para la navbar
    const navbarRef = useRef();

    // Hook de autenticación
    const { user, isAuthenticated, initialized } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        // Check on mount and on resize
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Check API health on mount
    useEffect(() => {
        checkApiHealth().then(r => {
            setApiStatus('connected');
        });
    }, []);

    useEffect(() => {
        initializeAuth().then(() => {
            setApiStatus('connected');
        });
    }, []);

    // Limpiar estado cuando se va al home
    useEffect(() => {
        if (location.pathname === '/') {
            setSearchResults([]);
            setSearchQuery('');
            setSearchError(null);
            setIsSearching(false);
        }
    }, [location.pathname]);

    const checkApiHealth = async () => {
        try {
            await healthCheck();
            setApiStatus('connected');
        } catch (error) {
            setApiStatus('error');
            console.error('❌ Failed to connect to BookHub API:', error);
        }
    };

    const handleSearchResults = (books, query) => {
        setSearchResults(books);
        setSearchQuery(query);
        setSearchError(null);
    };

    const handleSearchLoading = (loading) => {
        setIsSearching(loading);
    };

    const handleSearchError = (error) => {
        setSearchError(error);
        if (error) {
            setSearchResults([]);
        }
    };

    const clearSearch = () => {
        setSearchResults([]);
        setSearchQuery('');
        setSearchError(null);
        setIsSearching(false);

        // Limpiar input de navbar usando ref
        if (navbarRef.current) {
            navbarRef.current.clearInput();
        }
    };

    const handleAuthSuccess = (userData) => {
        setShowAuthPrompt(false);
    };

    const handleShowAuth = () => {
        setShowAuthOverlay(true);
        setShowAuthPrompt(false);
    };

    const handleCloseAuth = () => {
        setShowAuthOverlay(false);
    };

    const handleCloseAuthPrompt = () => {
        setShowAuthPrompt(false);
    };

    const handleAddToLibrary = async (book) => {
        await addBookToLibrary(user.id, book);
    }

    // Mostrar loading mientras se inicializa la auth
    if (!initialized) {
        return (
            <div className="app">
                <div className="app-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando BookHub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <Navbar
                ref={navbarRef}
                onSearchResults={handleSearchResults}
                onSearchLoading={handleSearchLoading}
                onSearchError={handleSearchError}
                user={user}
                isAuthenticated={isAuthenticated}
                onShowAuth={handleShowAuth}
            />

            <main className="main-content">
                {/* API Status Banner */}
                {apiStatus === 'error' && (
                    <div className="api-status-banner error">
                        ⚠️ No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.
                        <button onClick={checkApiHealth} className="retry-connection">
                            🔄 Reintentar
                        </button>
                    </div>
                )}

                {apiStatus === 'checking' && (
                    <div className="api-status-banner checking">
                        🔄 Conectando con el servidor...
                    </div>
                )}

                {/* Rutas principales */}
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <SearchPage
                                searchResults={searchResults}
                                searchQuery={searchQuery}
                                isSearching={isSearching}
                                searchError={searchError}
                                onClearSearch={clearSearch}
                                user={user}
                                isAuthenticated={isAuthenticated}
                                handleAddToLibrary={handleAddToLibrary}
                            />
                        }
                    />
                    <Route
                        path="/book/:bookId"
                        element={
                            <BookDetailsPage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route
                        path="/library"
                        element={<LibraryPage

                        />
                    }
                    />
                    <Route
                        path="/ai-recommendations"
                        element={
                            <AIRecommendationsPage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProfilePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route
                        path="/favorites"
                        element={<LibraryPage />}
                    />
                    <Route
                        path="/stats"
                        element={
                            <ProfilePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProfilePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>

            {isMobile && <MobileNavbar />}

            {/* Auth Modal */}
            <AuthOverlay
                isVisible={showAuthOverlay}
                onClose={handleCloseAuth}
                onAuthSuccess={handleAuthSuccess}
            />

            {/* Auth Prompt - Solo en home */}
            {showAuthPrompt && !isAuthenticated && location.pathname === '/' && (
                <div className="auth-prompt-overlay">
                    <div className="auth-prompt-backdrop" onClick={handleCloseAuthPrompt}></div>
                    <div className="auth-prompt-card">
                        <button className="auth-prompt-close" onClick={handleCloseAuthPrompt}>
                            ✕
                        </button>
                        <div className="auth-prompt-content">
                            <div className="auth-prompt-icon">📚✨</div>
                            <h3 className="auth-prompt-title">
                                ¡Descubre tu próxima lectura favorita!
                            </h3>
                            <p className="auth-prompt-description">
                                Únete a BookHub y accede a recomendaciones personalizadas, tu librería personal y mucho más.
                            </p>

                            <div className="auth-prompt-features">
                                <div className="feature">
                                    <span className="feature-icon">🤖</span>
                                    <span>Recomendaciones con IA</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">📚</span>
                                    <span>Librería personal</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">⭐</span>
                                    <span>Sistema de favoritos</span>
                                </div>
                            </div>

                            <div className="auth-prompt-actions">
                                <button
                                    className="auth-prompt-btn primary"
                                    onClick={handleShowAuth}
                                >
                                    🚀 Crear cuenta gratis
                                </button>
                                <button
                                    className="auth-prompt-btn secondary"
                                    onClick={handleShowAuth}
                                >
                                    🔑 Iniciar sesión
                                </button>
                            </div>

                            <p className="auth-prompt-note">
                                ⏱️ Solo toma 30 segundos • 🔒 100% seguro
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente principal que envuelve todo con Router
const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;