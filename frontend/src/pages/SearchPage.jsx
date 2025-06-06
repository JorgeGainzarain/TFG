import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

    const query = searchParams.get('q') || searchQuery;
    const isRecommendations = searchParams.get('recommendations') === 'true';

    const handleClearSearch = () => {
        onClearSearch();
        navigate('/'); // Redirige a la página principal
    };

    const handleRetry = () => {
        if (query && !isRecommendations) {
            console.log('Retry search for:', query);
            // Aquí podrías disparar la búsqueda nuevamente
            window.location.reload();
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
            isRecommendations={isRecommendations}
        />
    );
};

export default SearchPage;