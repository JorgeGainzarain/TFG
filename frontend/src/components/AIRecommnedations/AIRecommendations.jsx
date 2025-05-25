import React, { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import { bookAPI, handleApiError } from '../../services/api';
import './AIRecommendations.css';

const AIRecommendations = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance'
    });

    // Load initial recommendations
    useEffect(() => {
        loadRecommendations();
    }, []);

    // Load recommendations when filters change
    useEffect(() => {
        if (filters.genre || filters.year || filters.sortBy !== 'relevance') {
            loadFilteredRecommendations();
        }
    }, [filters]);

    const loadRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookAPI.getRecommendations();
            setBooks(response.books || []);

        } catch (err) {
            console.error('Error loading recommendations:', err);
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const loadFilteredRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use advanced search for filtered recommendations
            const searchFilters = {
                query: '', // Empty query to get general results
                genre: filters.genre,
                year: filters.year,
                sortBy: filters.sortBy,
                maxResults: 12
            };

            const response = await bookAPI.advancedSearch(searchFilters);
            setBooks(response.books || []);

        } catch (err) {
            console.error('Error loading filtered recommendations:', err);
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        // TODO: Implement add to library functionality
        // This could save to localStorage, send to backend, etc.
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    const handleRetry = () => {
        if (filters.genre || filters.year || filters.sortBy !== 'relevance') {
            loadFilteredRecommendations();
        } else {
            loadRecommendations();
        }
    };

    if (error) {
        return (
            <section className="ai-section">
                <div className="ai-header">
                    <h2 className="ai-title">Recomendaciones Personalizadas</h2>
                </div>
                <div className="error-state">
                    <p className="error-message">❌ {error}</p>
                    <button className="retry-btn" onClick={handleRetry}>
                        🔄 Intentar de nuevo
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="ai-section">
            <div className="ai-header">
                <h2 className="ai-title">Recomendaciones Personalizadas</h2>
                <p className="ai-description">
                    Descubre libros increíbles seleccionados especialmente para ti
                </p>
            </div>

            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando recomendaciones...</p>
                </div>
            ) : books.length > 0 ? (
                <div className="cards-grid">
                    {books.map((book) => (
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
            ) : (
                <div className="empty-state">
                    <p>📚 No se encontraron recomendaciones con los filtros actuales.</p>
                    <button
                        className="reset-filters-btn"
                        onClick={() => {
                            setFilters({
                                genre: '',
                                year: '',
                                sortBy: 'relevance'
                            });
                            loadRecommendations();
                        }}
                    >
                        Limpiar filtros
                    </button>
                </div>
            )}
        </section>
    );
};

export default AIRecommendations;