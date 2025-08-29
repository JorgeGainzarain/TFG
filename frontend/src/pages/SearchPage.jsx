import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchResults from '../components/SearchResults/SearchResults';
import { handleApiError } from '../services/api';
import { bookAPI } from '../services/bookService';

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
                        libraryOptions,
                        genreOptions,
                        genreTranslations,
                    }) => {
    const [searchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance',
    });

    const [page, setPage] = useState(0);


    const handleFilterChange = async (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);
        setPage(0);

        onSearchLoading(true);
        try {
            const results = await bookAPI.searchBooks(query, {
                orderBy: newFilters.sortBy,
                genre: newFilters.genre,
                year: newFilters.year,
                page: 0,
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

    const handleLoadMore = async () => {
        const nextPage = page + 1;
        setPage(nextPage);
        onSearchLoading(true);
        try {
            const moreResults = await bookAPI.searchBooks(query, {
                orderBy: filters.sortBy,
                genre: filters.genre,
                year: filters.year,
                page: nextPage,
            });
            onSearchResults([...searchResults, ...moreResults], query);
            onSearchError(null);
        } catch (error) {
            const errorMessage = handleApiError(error);
            onSearchError(errorMessage);
        } finally {
            onSearchLoading(false);
        }
    };


    const query = searchParams.get('q');
    const isRecommendations = searchParams.get('recommendations') === 'true';

    useEffect(() => {
        const performAutoSearch = async () => {
            if (query && query !== searchQuery && !isSearching && !isRecommendations && searchResults.length === 0) {
                onSearchLoading(true);
                try {
                    const results = await bookAPI.searchBooks(query);
                    onSearchResults(results, query);
                    onSearchError(null);
                } catch (error) {
                    const errorMessage = handleApiError(error);
                    onSearchError(errorMessage);
                    onSearchResults([], query);
                } finally {
                    onSearchLoading(false);
                }
            } else if (isRecommendations && searchResults.length === 0 && !isSearching) {
                onSearchLoading(true);
                try {
                    const recommendations = [];
                    onSearchResults(recommendations, '');
                    onSearchError(null);
                } catch (error) {
                    onSearchError('Error loading recommendations');
                } finally {
                    onSearchLoading(false);
                }
            }
        };

        performAutoSearch();
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
            onLoadMore={handleLoadMore}
            genreOptions={genreOptions}
            genreTranslations={genreTranslations}
        />
    );
};

export default SearchPage;
