import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResults from '../components/SearchResults/SearchResults';
import { bookAPI, handleApiError, getRecommendations } from '../services/api';

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
                        handleAddToLibrary,
                        libraryOptions
                    }) => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance',
    });

    const handleFilterChange = async (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);

        onSearchLoading(true);
        try {
            const results = await bookAPI.searchBooks(query, {
                orderBy: newFilters.sortBy,
                genre: newFilters.genre,
                year: newFilters.year,
            });
            onSearchResults(results, query);
            onSearchError(null);
        } catch (error) {
            const errorMessage = handleApiError(error);
            onSearchError(errorMessage);
            onSearchResults([], query);
        } finally {
            onSearchLoading(false);
        }
    };


    const query = searchParams.get('q');
    const isRecommendations = searchParams.get('recommendations') === 'true';

    useEffect(() => {
        const performAutoSearch = async () => {
            if (query && query !== searchQuery && !isSearching && !isRecommendations) {
                console.log('Auto-performing search on page load for:', query);

                const { bookAPI, handleApiError } = await import('../services/api');
                onSearchLoading && onSearchLoading(true);

                try {
                    const results = await bookAPI.searchBooks(query);
                    console.log('Auto-search results:', results);
                    onSearchResults(results, query); // Make sure this updates both results and query
                    onSearchError(null);
                } catch (error) {
                    console.error('Auto-search error:', error);
                    const errorMessage = handleApiError(error);
                    onSearchError(errorMessage);
                    onSearchResults([], query);
                } finally {
                    onSearchLoading(false);
                }
            } else if (isRecommendations && searchResults.length === 0 && !isSearching) {
                onSearchLoading(true);
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

        //performAutoSearch();
    }, [query, isRecommendations, isSearching, onSearchError, onSearchLoading, onSearchResults, searchQuery, searchResults]);

    const handleClearSearch = () => {
        onClearSearch();
    };

    const handleRetry = () => {
        if (query && !isRecommendations) {
            console.log('Retry search for:', query);
            // Re-triggering component mount by reloading the current URL
            const currentUrl = window.location.href;
            window.location.href = currentUrl;
        }
    };


    /*
    const handleFilterChange = async (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };

        setFilters(newFilters);

        onSearchLoading(true);
        try {
            const results = await bookAPI.searchBooks(query, {
                orderBy: newFilters.sortBy,
                genre: newFilters.genre,
                year: newFilters.year,
            });
            console.log("Results after filter change:", results);
            onSearchResults(results, query);
            onSearchError(null);
        } catch (error) {
            const errorMessage = handleApiError(error);
            onSearchError(errorMessage);
            onSearchResults([], query);
        } finally {
            onSearchLoading(false);
        }
    };

     */

    return (
        <SearchResults
            results={searchResults}
            query={query || searchQuery}
            loading={isSearching}
            error={searchError}
            libraryOptions={libraryOptions}
            onClearSearch={handleClearSearch}
            onRetry={handleRetry}
            filters={filters}
            handleFilterChange={handleFilterChange}
            user={user}
            isAuthenticated={isAuthenticated}
            isRecommendations={isRecommendations}
            handleAddToLibrary={handleAddToLibrary}
        />
    );
};

export default SearchPage;
