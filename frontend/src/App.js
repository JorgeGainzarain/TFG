import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/WelcomeMessage/WelcomeMessage';
import AIRecommendations from './components/AIRecommnedations/AIRecommendations';
import TrendingBooks from './components/TrendingBooks/TrendingBooks';
import ReviewsSection from './components/ReviewsSection/ReviewsSection';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import SearchResults from './components/SearchResults/SearchResults';
import AuthOverlay from './components/AuthOverlay/AuthOverlay';
import { useAuth } from './hooks/useAuth';
import { healthCheck } from './services/api';
import './App.css';

const App = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [apiStatus, setApiStatus] = useState('checking');
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    // Hook de autenticación
    const { user, isAuthenticated, initialized } = useAuth();

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Check API health on mount
    useEffect(() => {
        checkApiHealth();
    }, []);

    // Mostrar prompt de auth después de un tiempo si no está autenticado
    useEffect(() => {
        if (initialized && !isAuthenticated) {
            const timer = setTimeout(() => {
                setShowAuthPrompt(true);
            }, 10000); // Mostrar después de 10 segundos

            return () => clearTimeout(timer);
        }
    }, [initialized, isAuthenticated]);

    const checkApiHealth = async () => {
        try {
            await healthCheck();
            setApiStatus('connected');
            console.log('✅ Connected to BookHub API');
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
    };

    const handleAuthSuccess = (userData) => {
        console.log('Usuario autenticado:', userData);
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

    const showSearchResults = searchQuery || searchResults.length > 0 || searchError;

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

                {/* Show search results or main content */}
                {showSearchResults ? (
                    <SearchResults
                        results={searchResults}
                        query={searchQuery}
                        loading={isSearching}
                        error={searchError}
                        onClearSearch={clearSearch}
                        onRetry={() => {
                            if (searchQuery) {
                                console.log('Retry search for:', searchQuery);
                            }
                        }}
                        user={user}
                        isAuthenticated={isAuthenticated}
                    />
                ) : (
                    <>
                        <Hero/>
                        <AIRecommendations
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                        />
                        <div className="section-spacing"></div>
                        <TrendingBooks/>
                        <ReviewsSection/>
                    </>
                )}
            </main>

            {isMobile && <MobileNavigation/>}

            {/* Auth Modal */}
            <AuthOverlay
                isVisible={showAuthOverlay}
                onClose={handleCloseAuth}
                onAuthSuccess={handleAuthSuccess}
            />
        </div>
    );
};

export default App;