import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchResults from '../components/SearchResults/SearchResults';

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
    const navigate = useNavigate();

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
                console.log('Loading recommendations on page reload');

                onSearchLoading && onSearchLoading(true);

                try {
                    // Placeholder function for recommendations
                    const getPlaceholderBooks = () => [
                        {
                            id: 'placeholder-1',
                            title: 'El Quijote de la Mancha',
                            author: 'Miguel de Cervantes',
                            description: 'Una obra maestra de la literatura española que narra las aventuras del ingenioso hidalgo Don Quijote.',
                            image: 'https://via.placeholder.com/150x200?text=Quijote',
                            publishedDate: '1605',
                            categories: ['Clásicos', 'Literatura Española'],
                            rating: 4.2,
                            ratingsCount: 15420,
                            pageCount: 863,
                            language: 'es',
                            previewLink: '',
                            infoLink: '',
                            isPlaceholder: true
                        },
                        {
                            id: 'placeholder-2',
                            title: 'Cien años de soledad',
                            author: 'Gabriel García Márquez',
                            description: 'La obra cumbre del realismo mágico que cuenta la historia de la familia Buendía.',
                            image: 'https://via.placeholder.com/150x200?text=Soledad',
                            publishedDate: '1967',
                            categories: ['Realismo Mágico', 'Literatura Latinoamericana'],
                            rating: 4.5,
                            ratingsCount: 23150,
                            pageCount: 417,
                            language: 'es',
                            previewLink: '',
                            infoLink: '',
                            isPlaceholder: true
                        },
                        {
                            id: 'placeholder-3',
                            title: 'Rayuela',
                            author: 'Julio Cortázar',
                            description: 'Una novela experimental que desafía las convenciones narrativas tradicionales.',
                            image: 'https://via.placeholder.com/150x200?text=Rayuela',
                            publishedDate: '1963',
                            categories: ['Literatura Latinoamericana', 'Experimental'],
                            rating: 4.1,
                            ratingsCount: 18750,
                            pageCount: 600,
                            language: 'es',
                            previewLink: '',
                            infoLink: '',
                            isPlaceholder: true
                        },
                        {
                            id: 'placeholder-4',
                            title: '1984',
                            author: 'George Orwell',
                            description: 'Una distopía que explora temas de vigilancia, control político y represión.',
                            image: 'https://via.placeholder.com/150x200?text=1984',
                            publishedDate: '1949',
                            categories: ['Distopía', 'Ciencia Ficción'],
                            rating: 4.4,
                            ratingsCount: 28340,
                            pageCount: 328,
                            language: 'en',
                            previewLink: '',
                            infoLink: '',
                            isPlaceholder: true
                        }
                    ];

                    // Simulate delay for more realistic loading
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const recommendations = getPlaceholderBooks();
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