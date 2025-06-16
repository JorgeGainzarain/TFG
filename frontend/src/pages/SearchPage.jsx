import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchResults from '../components/SearchResults/SearchResults';
import {getRecommendations} from "../services/api";

const SearchPage = ({
                        searchResults,
                        searchQuery,
                        isSearching,
                        searchError,
                        onClearSearch,
                        onSearchResults,
                        onSearchLoading,
                        onSearchError,
                        user,
                        isAuthenticated,
                        handleAddToLibrary
                    }) => {
    const [searchParams] = useSearchParams();

    const query = searchParams.get('q');
    const isRecommendations = searchParams.get('recommendations') === 'true';

    // Auto-search when component mounts and there's a query in URL
    useEffect(() => {
        const performAutoSearch = async () => {
            // Only perform search if:
            // 1. There's a query in URL params
            // 2. We don't already have results for this query
            // 3. We're not currently searching
            // 4. It's not recommendations mode
            if (query && query !== searchQuery && !isSearching && !isRecommendations) {
                console.log('Auto-performing search on page load for:', query);

                // Import the search functionality
                const { bookAPI, handleApiError } = await import('../services/api');

                onSearchLoading && onSearchLoading(true);

                try {
                    const results = await bookAPI.searchBooks(query);
                    console.log('Auto-search results:', results);
                    onSearchResults && onSearchResults(results, query);
                    onSearchError && onSearchError(null);
                } catch (error) {
                    console.error('Auto-search error:', error);
                    const errorMessage = handleApiError(error);
                    onSearchError && onSearchError(errorMessage);
                    onSearchResults && onSearchResults([], query);
                } finally {
                    onSearchLoading && onSearchLoading(false);
                }
            } else if (isRecommendations && searchResults.length === 0 && !isSearching) {
                // Handle recommendations case

                onSearchLoading && onSearchLoading(true);

                try {
                    const recommendations = getRecommendations();
                    onSearchResults && onSearchResults(recommendations, '');
                    onSearchError && onSearchError(null);
                } catch (error) {
                    console.error('Error loading recommendations:', error);
                    onSearchError && onSearchError('Error cargando recomendaciones');
                } finally {
                    onSearchLoading && onSearchLoading(false);
                }
            }
        };

        performAutoSearch();
    }, [query, isRecommendations]); // Dependencies: re-run when URL query changes

    const handleClearSearch = () => {
        onClearSearch();
    };

    const handleRetry = () => {
        if (query && !isRecommendations) {
            console.log('Retry search for:', query);
            // Force re-search by updating the effect dependencies
            const currentUrl = window.location.href;
            window.location.href = currentUrl;
        }
    };

    return (
        <SearchResults
            results={searchResults}
            query={query || searchQuery}
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