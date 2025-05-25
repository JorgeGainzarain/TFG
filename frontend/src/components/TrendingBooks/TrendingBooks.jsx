import React, { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import { bookAPI, handleApiError } from '../../services/api';
import './TrendingBooks.css';

const TrendingBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTrendingBooks();
    }, []);

    const loadTrendingBooks = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await bookAPI.getTrendingBooks();
            setBooks(response.books || []);

        } catch (err) {
            console.error('Error loading trending books:', err);
            setError(handleApiError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        // TODO: Implement add to library functionality
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    const handleRetry = () => {
        loadTrendingBooks();
    };

    if (loading) {
        return (
            <section className="section trending-section">
                <div className="section-header">
                    <h2 className="section-title">📈 Tendencias</h2>
                </div>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Cargando libros en tendencia...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="section trending-section">
                <div className="section-header">
                    <h2 className="section-title">📈 Tendencias</h2>
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

    if (books.length === 0) {
        return (
            <section className="section trending-section">
                <div className="section-header">
                    <h2 className="section-title">📈 Tendencias</h2>
                </div>
                <div className="empty-state">
                    <p>📚 No se pudieron cargar los libros en tendencia en este momento.</p>
                    <button className="retry-btn" onClick={handleRetry}>
                        🔄 Intentar de nuevo
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="section trending-section">
            <div className="section-header">
                <h2 className="section-title">📈 Tendencias</h2>
                <span className="trending-badge">
                    🔥 {books.length} libros populares
                </span>
            </div>

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
        </section>
    );
};

export default TrendingBooks;