// frontend/src/components/SearchResults/SearchResults.jsx
import React, { useState, useEffect, useMemo } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './SearchResults.css';


const SearchResults = ({
                           results,
                           query,
                           loading,
                           error,
                           onClearSearch,
                           onRetry,
                           handleAddToLibrary,
                           filters,
                           handleFilterChange,
                           libraryOptions,
                           isRecommendations = false
                       }) => {
    const [filteredResults, setFilteredResults] = useState(results);

    // Extraer categorías únicas (géneros) de todos los libros actuales
const uniqueGenres = useMemo(() => [
    'ANTIQUES & COLLECTIBLES',
    'LITERARY COLLECTIONS',
    'ARCHITECTURE',
    'LITERARY CRITICISM',
    'ART',
    'MATHEMATICS',
    'BIBLES',
    'MEDICAL',
    'BIOGRAPHY & AUTOBIOGRAPHY',
    'MUSIC',
    'BODY, MIND & SPIRIT',
    'NATURE',
    'BUSINESS & ECONOMICS',
    'PERFORMING ARTS',
    'COMICS & GRAPHIC NOVELS',
    'PETS',
    'COMPUTERS',
    'PHILOSOPHY',
    'COOKING',
    'PHOTOGRAPHY',
    'CRAFTS & HOBBIES',
    'POETRY',
    'DESIGN',
    'POLITICAL SCIENCE',
    'DRAMA',
    'PSYCHOLOGY',
    'EDUCATION',
    'REFERENCE',
    'FAMILY & RELATIONSHIPS',
    'RELIGION',
    'FICTION',
    'SCIENCE',
    'GAMES & ACTIVITIES',
    'SELF-HELP',
    'GARDENING',
    'SOCIAL SCIENCE',
    'HEALTH & FITNESS',
    'SPORTS & RECREATION',
    'HISTORY',
    'STUDY AIDS',
    'HOUSE & HOME',
    'TECHNOLOGY & ENGINEERING',
    'HUMOR',
    'TRANSPORTATION',
    'JUVENILE FICTION',
    'TRAVEL',
    'JUVENILE NONFICTION',
    'TRUE CRIME',
    'LANGUAGE ARTS & DISCIPLINES',
    'YOUNG ADULT FICTION',
    'LANGUAGE STUDY',
    'YOUNG ADULT NONFICTION',
    'LAW'
], []);

    // Actualizar resultados filtrados cuando cambian resultados o filtros
    useEffect(() => {
        let filtered = [...results];

        // Filtrar por género (category)
        if (filters.genre) {
            filtered = filtered.filter(book =>
                (book.categories || []).includes(filters.genre)
            );
        }

        // Filtrar por año
        if (filters.year) {
            if (filters.year === 'clasicos') {
                filtered = filtered.filter(book => {
                    const year = book.publishedDate ? parseInt(book.publishedDate.split('-')[0]) : 0;
                    return year < 2000;
                });
            } else {
                const [startYear, endYear] = filters.year.split('-').map(Number);
                filtered = filtered.filter(book => {
                    const year = book.publishedDate ? parseInt(book.publishedDate.split('-')[0]) : 0;
                    return year >= startYear && year <= endYear;
                });
            }
        }

        // Ordenar resultados según filtros.sortBy
        switch (filters.sortBy) {
            case 'rating':
                filtered.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0));
                break;
            case 'recent':
                filtered.sort((a, b) => {
                    const yearA = a.publishedDate ? parseInt(a.publishedDate.split('-')[0]) : 0;
                    const yearB = b.publishedDate ? parseInt(b.publishedDate.split('-')[0]) : 0;
                    return yearB - yearA;
                });
                break;
            case 'popular':
                filtered.sort((a, b) => (b.reviewCount || b.ratingsCount || 0) - (a.reviewCount || a.ratingsCount || 0));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                filtered.sort((a, b) => a.author.localeCompare(b.author));
                break;
            default:
                // relevance - mantener orden original
                break;
        }

        setFilteredResults(filtered);
    }, [results, filters]);

    // Para limpiar filtros:
    const clearFilters = () => {
        handleFilterChange('genre', 'Todos Los Géneros');
        handleFilterChange('year', '');
        handleFilterChange('sortBy', 'relevance');
    };

    // Add this before rendering results
    if (loading) {
        return (
            <section className="search-results">
                <div className="loading-spinner"></div>
                <p>Cargando Resultados...</p>
            </section>
        );
    }

    // Renderizado simplificado para foco en el filtro
    return (
        <section className="search-results">
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                genreOptions={uniqueGenres}
            />

            {filteredResults.length === 0 ? (
                <div>
                    <p>No se encontraron libros con los filtros actuales</p>
                </div>
            ) : (
                <div className="results-grid">
                    {filteredResults.map(book => (
                        <BookCard
                            key={book.bookId || book.id}
                            variant={'horizontal'}
                            book={book}
                            handleAddToLibrary={handleAddToLibrary}
                            libraryOptions={libraryOptions}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default SearchResults;
