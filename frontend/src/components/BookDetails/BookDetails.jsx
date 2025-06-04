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

    // Better cover image handling - try multiple possible property names
    const getCoverImage = (book) => {
        console.log('Getting cover image for book:', book);

        // Try different possible property names for the cover image
        const possibleImages = [
            // Direct properties (formatted by server)
            book.thumbnail,
            book.cover,
            book.coverImage,
            book.image,

            // Google Books API format (if passed directly)
            book.volumeInfo?.imageLinks?.thumbnail,
            book.volumeInfo?.imageLinks?.smallThumbnail,
            book.volumeInfo?.imageLinks?.medium,
            book.volumeInfo?.imageLinks?.large,

            // Nested imageLinks (if formatted differently)
            book.imageLinks?.thumbnail,
            book.imageLinks?.smallThumbnail,
            book.imageLinks?.medium,
            book.imageLinks?.large,

            // Sometimes the whole imageLinks object is passed as thumbnail
            typeof book.thumbnail === 'object' ? book.thumbnail?.thumbnail : null,
            typeof book.thumbnail === 'object' ? book.thumbnail?.smallThumbnail : null
        ];

        // Log all possible images for debugging
        console.log('Possible images found:', possibleImages.filter(Boolean));

        // Return the first valid image URL found
        for (const img of possibleImages) {
            if (img && typeof img === 'string' && img.trim() !== '') {
                // Enhance quality and ensure HTTPS
                let enhancedUrl = img
                    .replace('zoom=1', 'zoom=2')
                    .replace('http://', 'https://');
                console.log('Using cover image URL:', enhancedUrl);
                return enhancedUrl;
            }
        }

        console.log('No valid cover image found, using fallback emoji');
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
            // Aquí irá tu lógica para añadir a la librería
            console.log('Añadiendo a la librería:', currentBook);

            // Simular delay
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
        console.log('Image failed to load:', coverImageUrl);
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
        // Limpiar HTML tags si existen
        const cleaned = description.replace(/<[^>]*>/g, '');
        // No limitar caracteres para mostrar todo el contenido
        return cleaned;
    };

    // Debug logging
    console.log('BookDetails - Current book:', currentBook);
    console.log('BookDetails - Cover image URL:', coverImageUrl);
    console.log('BookDetails - Image error:', imageError);

    return (
        <div className="book-details">
            {/* Header con botón de regreso */}
            <div className="book-details-header">
                <button
                    className="back-btn"
                    onClick={handleGoBack}
                >
                    ← Volver
                </button>
            </div>

            {/* Contenido principal */}
            <div className="book-details-container glass">
                <div className="book-details-grid">
                    {/* Portada del libro */}
                    <div className="book-cover-section">
                        <div className="book-cover-large">
                            {coverImageUrl && !imageError ? (
                                <img
                                    src={coverImageUrl}
                                    alt={`Portada de ${currentBook.title}`}
                                    onError={handleImageError}
                                    onLoad={() => console.log('Image loaded successfully:', coverImageUrl)}
                                />
                            ) : (
                                <div className="cover-emoji-fallback">
                                    {currentBook.coverEmoji || '📖'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información principal */}
                    <div className="book-main-content">
                        <h1 className="book-title">{currentBook.title}</h1>
                        <p className="book-author">por {currentBook.author}</p>

                        {/* Géneros */}
                        {currentBook.genres && currentBook.genres.length > 0 && (
                            <div className="book-genres">
                                {currentBook.genres.slice(0, 5).map((genre, index) => (
                                    <span key={index} className="genre-tag">
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Información adicional */}
                        <div className="book-metadata">
                            <div className="metadata-item">
                                <h4>Fecha de publicación</h4>
                                <p>{formatDate(currentBook.publishedDate)}</p>
                            </div>

                            <div className="metadata-item">
                                <h4>Páginas</h4>
                                <p>{formatPageCount(currentBook.pageCount)}</p>
                            </div>

                            <div className="metadata-item">
                                <h4>Idioma</h4>
                                <p>{formatLanguage(currentBook.language)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Panel lateral con rating y acciones */}
                    <div className="book-sidebar">
                        {/* Rating */}
                        <div className="rating-section">
                            <h3>⭐ Valoración</h3>

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

                        {/* Botón de añadir a librería */}
                        <button
                            className={`add-to-library-btn ${addingToLibrary ? 'loading' : ''}`}
                            onClick={handleAddToLibrary}
                            disabled={addingToLibrary}
                        >
                            {addingToLibrary ? '⏳ Añadiendo...' : '📚 Añadir a mi librería'}
                        </button>

                        {/* Enlaces adicionales */}
                        {(currentBook.previewLink || currentBook.infoLink) && (
                            <div className="book-links">
                                {currentBook.previewLink && (
                                    <a
                                        href={currentBook.previewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="book-link preview-link"
                                    >
                                        👁️ Vista previa
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Descripción - Ahora en su propia sección de ancho completo */}
                <div className="book-description-section">
                    <h3>📋 Descripción</h3>
                    <div className="book-description">
                        {cleanDescription(currentBook.description)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;