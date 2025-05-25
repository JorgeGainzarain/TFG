import React from 'react';
import BookCard from '../BookCard/BookCard';
import './SearchResults.css';

const SearchResults = ({ results, query, loading, error, onClearSearch, onRetry }) => {
    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    if (loading) {
        return (
            <section className="search-results">
                <div className="search-header">
                    <h2>Buscando...</h2>
                    <button className="back-btn" onClick={onClearSearch}>
                        ← Volver al inicio
                    </button>
                </div>
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
                    <h2>Error en la búsqueda</h2>
                    <button className="back-btn" onClick={onClearSearch}>
                        ← Volver al inicio
                    </button>
                </div>
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
                    <h2>Sin resultados</h2>
                    <button className="back-btn" onClick={onClearSearch}>
                        ← Volver al inicio
                    </button>
                </div>
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
                    <p className="search-query">
                        {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
                    </p>
                </div>
                <button className="back-btn" onClick={onClearSearch}>
                    ← Volver al inicio
                </button>
            </div>

            <div className="results-grid">
                {results.map((book) => (
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
        </section>
    );
};

export default SearchResults;