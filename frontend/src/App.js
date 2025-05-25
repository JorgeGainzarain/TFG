import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/WelcomeMessage/WelcomeMessage.css';
import AIRecommendations from './components/AIRecommnedations/AIRecommendations';
import TrendingBooks from './components/TrendingBooks/TrendingBooks';
import ReviewsSection from './components/ReviewsSection/ReviewsSection';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import SearchResults from './components/SearchResults/SearchResults';
import { healthCheck } from './services/api';
import './App.css';

const App = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [apiStatus, setApiStatus] = useState('checking');

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

    const showSearchResults = searchQuery || searchResults.length > 0 || searchError;

    return (
        <div className="app">
            <Navbar
                onSearchResults={handleSearchResults}
                onSearchLoading={handleSearchLoading}
                onSearchError={handleSearchError}
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
                                // Re-trigger search - this would need to be passed down or handled differently
                                console.log('Retry search for:', searchQuery);
                            }
                        }}
                    />
                ) : (
                    <>
                        <Hero />
                        <AIRecommendations />
                        <TrendingBooks />
                        <ReviewsSection />
                    </>
                )}
            </main>

            {isMobile && <MobileNavigation />}
        </div>
    );
};

export default App;