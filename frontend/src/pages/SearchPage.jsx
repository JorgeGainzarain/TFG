import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResults from '../components/SearchResults/SearchResults';

const SearchPage = ({
                        searchResults,
                        searchQuery,
                        isSearching,
                        searchError,
                        onClearSearch,
                        user,
                        isAuthenticated
                    }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || searchQuery;

    const handleClearSearch = () => {
        onClearSearch();
        // Navegar de vuelta al home
        window.history.pushState({}, '', '/');
    };

    const handleRetry = () => {
        if (query) {
            console.log('Retry search for:', query);
            // Aquí podrías disparar la búsqueda nuevamente
        }
    };

    return (
        <SearchResults
            results={searchResults}
            query={query}
            loading={isSearching}
            error={searchError}
            onClearSearch={handleClearSearch}
            onRetry={handleRetry}
            user={user}
            isAuthenticated={isAuthenticated}
        />
    );
};

export default SearchPage;