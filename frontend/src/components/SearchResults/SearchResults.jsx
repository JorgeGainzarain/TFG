import React, { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './SearchResults.css';

// Archivo CSS actualizado - agregar estos estilos a SearchResults.css

const SearchResults = ({ results, query, loading, error, onClearSearch, onRetry }) => {
    const [filteredResults, setFilteredResults] = useState(results);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance'
    });

    // Update filtered results when results or filters change
    useEffect(() => {
        let filtered = [...results];

        // Apply genre filter
        if (filters.genre) {
            filtered = filtered.filter(book =>
                    book.genres && book.genres.some(genre =>
                        genre.toLowerCase().includes(filters.genre.toLowerCase())
                    )
            );
        }

        // Apply year filter
        if (filters.year) {
            if (filters.year === 'clasicos') {
                filtered = filtered.filter(book => {
                    const year = book.publishedDate ? parseInt(book.publishedDate.split('-')[0]) : 0;
                    return year < 2000;
                });
            } else {
                filtered = filtered.filter(book =>
                    book.publishedDate && book.publishedDate.includes(filters.year)
                );
            }
        }

        // Apply sorting
        switch (filters.sortBy) {
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'recent':
                filtered.sort((a, b) => {
                    const yearA = a.publishedDate ? parseInt(a.publishedDate.split('-')[0]) : 0;
                    const yearB = b.publishedDate ? parseInt(b.publishedDate.split('-')[0]) : 0;
                    return yearB - yearA;
                });
                break;
            case 'popular':
                filtered.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
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

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    const clearFilters = () => {
        setFilters({
            genre: '',
            year: '',
            sortBy: 'relevance'
        });
    };

    if (loading) {
        return (
            <section className="search-results">
                <div className="search-header">
                    <div className="search-info">
                        <h2>Buscando...</h2>
                        <button className="clear-search-btn" onClick={onClearSearch}>
                            ✕ Limpiar búsqueda
                        </button>
                    </div>
                </div>

                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Buscando "{query}"...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="search-results">
                <div className="search-header">
                    <div className="search-info">
                        <h2>Error en la búsqueda</h2>
                        <button className="clear-search-btn" onClick={onClearSearch}>
                            ✕ Limpiar búsqueda
                        </button>
                    </div>
                </div>

                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                <div className="error-state">
                    <p className="error-message">❌ {error}</p>
                    <div className="error-actions">
                        <button className="retry-btn" onClick={onRetry}>
                            🔄 Intentar de nuevo
                        </button>
                        <button className="clear-btn" onClick={onClearSearch}>
                            🏠 Volver al inicio
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (results.length === 0 && query) {
        return (
            <section className="search-results">
                <div className="search-header">
                    <div className="search-info">
                        <h2>Sin resultados</h2>
                        <button className="clear-search-btn" onClick={onClearSearch}>
                            ✕ Limpiar búsqueda
                        </button>
                    </div>
                </div>

                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <p>No se encontraron libros para "{query}"</p>
                    <div className="suggestions">
                        <h4>Sugerencias:</h4>
                        <ul>
                            <li>Verifica la ortografía</li>
                            <li>Intenta con términos más generales</li>
                            <li>Busca por autor o género</li>
                        </ul>
                    </div>
                    <button className="clear-btn" onClick={onClearSearch}>
                        🏠 Explorar recomendaciones
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="search-results">
            <div className="search-header">
                <div className="search-info">
                    <h2>Resultados de búsqueda</h2>
                    <div className="search-meta">
                        <p className="search-query">
                            {filteredResults.length} de {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
                        </p>
                        <button className="clear-search-btn" onClick={onClearSearch}>
                            ✕ Limpiar búsqueda
                        </button>
                    </div>
                </div>
            </div>

            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {filteredResults.length === 0 ? (
                <div className="filtered-empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>No se encontraron libros con los filtros actuales</p>
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        🗑️ Limpiar filtros
                    </button>
                </div>
            ) : (
                <>
                    <div className="results-grid">
                        {filteredResults.map((book) => (
                            <BookCard
                                key={book.id}
                                title={book.title}
                                author={book.author}
                                genres={book.genres}
                                rating={book.rating}
                                reviewCount={book.reviewCount}
                                coverEmoji={book.coverEmoji}
                                thumbnail={book.thumbnail}
                                onAddToLibrary={handleAddToLibrary}
                            />
                        ))}
                    </div>

                    {results.length > 0 && (
                        <div className="search-actions">
                            <button className="load-more-btn disabled">
                                📚 Cargar más resultados (próximamente)
                            </button>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default SearchResults;