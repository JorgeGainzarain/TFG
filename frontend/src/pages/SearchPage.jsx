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
                        isAuthenticated,
                        handleAddToLibrary
                    }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get('q') || searchQuery;
    const isRecommendations = searchParams.get('recommendations') === 'true';

    const handleClearSearch = () => {
        onClearSearch();
        navigate('/?recommendations=true'); // Redirige a la página de recomendaciones
    };

    const handleRetry = () => {
        if (query && !isRecommendations) {
            console.log('Retry search for:', query);
            // disparar la búsqueda nuevamente
            navigate(`/search?q=${encodeURIComponent(query)}`);
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
            handleAddToLibrary={handleAddToLibrary}
        />
    );
};

export default SearchPage;