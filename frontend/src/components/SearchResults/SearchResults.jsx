import React, { useState, useEffect } from 'react';
import HorizontalBookCard from '../HorizontalBookCard/HorizontalBookCard';
import FilterBar from '../FilterBar/FilterBar';
import './SearchResults.css';

const SearchResults = ({
                           results,
                           query,
                           loading,
                           error,
                           onClearSearch,
                           onRetry,
                           isRecommendations = false
                       }) => {
    const [filteredResults, setFilteredResults] = useState(results);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance'
    });

    // Detectar si son resultados placeholder (recomendaciones de IA)
    const isPlaceholderResults = results.length > 0 && results[0]?.isPlaceholder;

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
        if (book.isPlaceholder) {
            alert(`"${book.title}" es una recomendación de IA. ¡Funcionalidad completa próximamente!`);
        } else {
            alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
        }
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
                        {!isRecommendations && query && (
                            <button className="clear-search-btn" onClick={onClearSearch}>
                                ✕ Limpiar búsqueda
                            </button>
                        )}
                    </div>
                </div>

                <FilterBar filters={filters} onFilterChange={handleFilterChange} />

                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>
                        {isRecommendations ?
                            'Preparando recomendaciones...' :
                            `Buscando "${query}"...`
                        }
                    </p>
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
                        {!isRecommendations && query && (
                            <button className="clear-search-btn" onClick={onClearSearch}>
                                ✕ Limpiar búsqueda
                            </button>
                        )}
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

    if (results.length === 0 && query && !isRecommendations) {
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
                    <h2>
                        {isPlaceholderResults || isRecommendations ?
                            '🤖 Recomendaciones IA' :
                            'Resultados de búsqueda'
                        }
                    </h2>
                    <div className="search-meta">
                        <p className="search-query">
                            {filteredResults.length} de {results.length} resultado{results.length !== 1 ? 's' : ''}
                            {isPlaceholderResults || isRecommendations ?
                                ' (recomendaciones personalizadas)' :
                                ` para "${query}"`
                            }
                        </p>
                        {!isPlaceholderResults && !isRecommendations && query && (
                            <button className="clear-search-btn" onClick={onClearSearch}>
                                ✕ Limpiar búsqueda
                            </button>
                        )}
                    </div>
                </div>

                {(isPlaceholderResults || isRecommendations) && (
                    <div className="ai-notice">
                        <div className="ai-notice-content">
                            <span className="ai-icon">🤖✨</span>
                            <div className="ai-text">
                                <h4>Recomendaciones impulsadas por IA</h4>
                                <p>Estos libros han sido seleccionados especialmente para ti. ¡Pronto tendremos recomendaciones aún más personalizadas!</p>
                            </div>
                        </div>
                    </div>
                )}
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
                            <HorizontalBookCard
                                key={book.id}
                                title={book.title}
                                author={book.author}
                                genres={book.genres}
                                rating={book.rating}
                                reviewCount={book.reviewCount}
                                coverEmoji={book.coverEmoji}
                                thumbnail={book.thumbnail}
                                onAddToLibrary={handleAddToLibrary}
                                isPlaceholder={book.isPlaceholder}
                            />
                        ))}
                    </div>

                    {results.length > 0 && !isPlaceholderResults && !isRecommendations && (
                        <div className="search-actions">
                            <button className="load-more-btn disabled">
                                📚 Cargar más resultados (próximamente)
                            </button>
                        </div>
                    )}

                    {(isPlaceholderResults || isRecommendations) && (
                        <div className="ai-footer">
                            <div className="ai-footer-content">
                                <h4>🎯 ¿Quieres recomendaciones más precisas?</h4>
                                <p>Crea una cuenta para obtener sugerencias basadas en tus gustos de lectura y historial.</p>
                                <button className="upgrade-ai-btn">
                                    ✨ Mejorar recomendaciones
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default SearchResults;