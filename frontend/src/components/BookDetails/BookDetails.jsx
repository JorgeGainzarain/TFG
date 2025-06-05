// frontend/src/components/BookDetails/BookDetails.jsx

import React, { useState } from 'react';
import './BookDetails.css';

const BookDetails = ({ book, user, isAuthenticated, onShowAuth, onGoBack }) => {
    const [addingToLibrary, setAddingToLibrary] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Datos de ejemplo si no se pasa libro (para testing)
    const defaultBook = {
        id: "example-book-1",
        title: "El Nombre del Viento",
        author: "Patrick Rothfuss",
        genres: ["Fantasía", "Aventura", "Épico"],
        rating: 4.8,
        reviewCount: 28470,
        coverEmoji: "🌪️",
        publishedDate: "2007-03-27",
        pageCount: 662,
        language: "es",
        thumbnail: "",
        description: "En una posada en tierra de nadie, un hombre se dispone a relatar, por primera vez, la auténtica historia de su vida. Una historia que únicamente él conoce y que ha dado lugar a su leyenda. Arrebatador, íntimo y atemporal, El Nombre del Viento es una novela de aventuras, de magia y de misterio. Una historia épica narrada de forma magistral que nos recuerda por qué amamos las historias. En una posada en tierra de nadie, un hombre se dispone a relatar, por primera vez, la auténtica historia de su vida. Una historia que únicamente él conoce y que ha dado lugar a su leyenda. Arrebatador, íntimo y atemporal, El Nombre del Viento es una novela de aventuras, de magia y de misterio. Una historia épica narrada de forma magistral que nos recuerda por qué amamos las historias.",
        previewLink: "https://books.google.com/preview",
        infoLink: "https://books.google.com/info"
    };

    // Usar el libro pasado como prop o el por defecto
    const currentBook = book || defaultBook;

    // Better cover image handling
    const getCoverImage = (book) => {
        const possibleImages = [
            book.thumbnail,
            book.cover,
            book.coverImage,
            book.image,
            book.volumeInfo?.imageLinks?.thumbnail,
            book.volumeInfo?.imageLinks?.smallThumbnail,
            book.volumeInfo?.imageLinks?.medium,
            book.volumeInfo?.imageLinks?.large,
            book.imageLinks?.thumbnail,
            book.imageLinks?.smallThumbnail,
            book.imageLinks?.medium,
            book.imageLinks?.large,
            typeof book.thumbnail === 'object' ? book.thumbnail?.thumbnail : null,
            typeof book.thumbnail === 'object' ? book.thumbnail?.smallThumbnail : null
        ];

        for (const img of possibleImages) {
            if (img && typeof img === 'string' && img.trim() !== '') {
                let enhancedUrl = img
                    .replace('zoom=1', 'zoom=2')
                    .replace('http://', 'https://');
                return enhancedUrl;
            }
        }
        return null;
    };

    const coverImageUrl = getCoverImage(currentBook);

    const renderStars = (rating) => {
        const stars = [];
        const numericRating = Math.round(rating || 0);

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className="star">
                    {i <= numericRating ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    const handleAddToLibrary = async () => {
        if (!isAuthenticated) {
            if (onShowAuth) {
                onShowAuth();
            } else {
                alert('Debes iniciar sesión para añadir libros a tu librería');
            }
            return;
        }

        setAddingToLibrary(true);
        try {
            console.log('Añadiendo a la librería:', currentBook);
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`"${currentBook.title}" añadido a tu librería!`);
        } catch (err) {
            console.error('Error adding to library:', err);
            alert('Error al añadir el libro a la librería');
        } finally {
            setAddingToLibrary(false);
        }
    };

    const handleGoBack = () => {
        if (onGoBack) {
            onGoBack();
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            alert('Función de navegación no disponible');
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Desconocido';
        return new Date(dateString).getFullYear();
    };

    const formatPageCount = (count) => {
        if (!count) return 'Desconocido';
        return count.toLocaleString();
    };

    const formatLanguage = (lang) => {
        if (!lang) return 'Desconocido';
        return lang.toUpperCase();
    };

    const cleanDescription = (description) => {
        if (!description) return 'Descripción no disponible';
        const cleaned = description.replace(/<[^>]*>/g, '');
        return cleaned;
    };

    return (
        <div className="book-details">
            {/* Header con botón de regreso */}
            <div className="book-details-header">
                <button className="back-btn" onClick={handleGoBack}>
                    ← Volver
                </button>
            </div>

            {/* Contenedor principal con diseño de libro */}
            <div className="book-details-container glass">

                {/* Sección 1: Título y Autor - Ancho completo */}
                <div className="book-title-header">
                    <h1 className="book-title">{currentBook.title}</h1>
                    <p className="book-author">por {currentBook.author}</p>
                </div>

                {/* Sección 2: Portada + Información */}
                <div className="book-main-section">

                    {/* Portada del libro */}
                    <div className="book-cover-section">
                        <div className="book-cover-large">
                            {coverImageUrl && !imageError ? (
                                <img
                                    src={coverImageUrl}
                                    alt={`Portada de ${currentBook.title}`}
                                    onError={handleImageError}
                                />
                            ) : (
                                <div className="cover-emoji-fallback">
                                    {currentBook.coverEmoji || '📖'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del libro */}
                    <div className="book-info-section">

                        {/* Géneros */}
                        {currentBook.genres && currentBook.genres.length > 0 && (
                            <div className="book-genres">
                                {currentBook.genres.map((genre, index) => (
                                    <span key={index} className="genre-tag">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Metadatos */}
                        <div className="book-metadata">
                            <div className="metadata-grid">
                                <div className="metadata-item">
                                    <div className="metadata-icon">📅</div>
                                    <div className="metadata-content">
                                        <span className="metadata-value">{formatDate(currentBook.publishedDate)}</span>
                                        <span className="metadata-label">Año</span>
                                    </div>
                                </div>
                                <div className="metadata-item">
                                    <div className="metadata-icon">📄</div>
                                    <div className="metadata-content">
                                        <span className="metadata-value">{formatPageCount(currentBook.pageCount)}</span>
                                        <span className="metadata-label">Páginas</span>
                                    </div>
                                </div>
                                <div className="metadata-item">
                                    <div className="metadata-icon">🌐</div>
                                    <div className="metadata-content">
                                        <span className="metadata-value">{formatLanguage(currentBook.language)}</span>
                                        <span className="metadata-label">Idioma</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rating y Botones */}
                        <div className="book-actions-row">

                            {/* Rating */}
                            <div className="rating-container">
                                <div className="stars-container">
                                    {renderStars(currentBook.rating)}
                                </div>
                                <p className="rating-number">
                                    {currentBook.rating ? currentBook.rating.toFixed(1) : 'Sin calificar'}
                                </p>
                                <p className="rating-count">
                                    {currentBook.reviewCount ? `${currentBook.reviewCount.toLocaleString()} reseñas` : 'Sin reseñas'}
                                </p>
                            </div>

                            {/* Botones de acción */}
                            <div className="action-buttons">
                                <button
                                    className={`add-to-library-btn ${addingToLibrary ? 'loading' : ''}`}
                                    onClick={handleAddToLibrary}
                                    disabled={addingToLibrary}
                                >
                                    {addingToLibrary ? '⏳ Añadiendo...' : '📚 Add Library'}
                                </button>

                                {currentBook.previewLink && (
                                    <a
                                        href={currentBook.previewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="preview-btn"
                                    >
                                        👁️ Preview
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección 3: Descripción - Ancho completo */}
                <div className="book-description-section">
                    <h3 className="description-title">Description</h3>
                    <div className="book-description">
                        {cleanDescription(currentBook.description)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;