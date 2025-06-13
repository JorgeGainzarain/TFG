// frontend/src/components/BookCard/BookCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({
                      book,
                      onAddToLibrary,
                      variant = 'vertical', // 'vertical' | 'horizontal'
                      showDescription = false,
                      showDate = true
                  }) => {
    const navigate = useNavigate();

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

    const handleAddClick = (e) => {
        // Prevenir que se propague el click al card
        e.stopPropagation();

        if (onAddToLibrary) {
            onAddToLibrary(book);
        }
    };

    const handleCardClick = () => {
        // Navegar a la página de detalles pasando el libro como state
        console.log("Book before navigation:", book);
        navigate(`/book/${book.bookId}`, {
            state: { book }
        });
    };

    const formatReviewCount = (count) => {
        if (!count) return 'Sin reseñas';
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k reseñas`;
        }
        return `${count} reseñas`;
    };

    const formatPublishedDate = (dateString) => {
        if (!dateString) return '';
        // Extraer solo el año si es una fecha completa
        const year = dateString.split('-')[0];
        return year;
    };

    const getDefaultDescription = () => {
        const descriptions = [
            "Una obra cautivadora que te mantendrá enganchado desde la primera página hasta la última.",
            "Un libro extraordinario que combina una narrativa inmersiva con personajes memorables.",
            "Una lectura imprescindible que ofrece una perspectiva única y transformadora.",
            "Una historia fascinante que explora temas profundos con maestría y sensibilidad.",
            "Un relato poderoso que desafía las convenciones y ofrece nuevas perspectivas."
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    const displayGenres = (book.genres || book.categories || []).slice(0, 3);
    const displayRating = book.rating || book.averageRating || 0;
    const reviewCount = book.reviewCount || book.ratingsCount || 0;
    const description = book.description || (showDescription ? getDefaultDescription() : '');
    const publishedYear = formatPublishedDate(book.publishedDate);

    if (variant === 'horizontal') {
        return (
            <div className="book-card horizontal glass" onClick={handleCardClick}>
                <div className="book-cover">
                    {book.thumbnail ? (
                        <img
                            src={book.thumbnail}
                            alt={`${book.title} cover`}
                            className="book-thumbnail"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div
                        className="cover-emoji-fallback"
                        style={{ display: book.thumbnail ? 'none' : 'flex' }}
                    >
                        {book.coverEmoji || '📖'}
                    </div>
                </div>

                <div className="book-content">
                    <div className="book-main-info">
                        <div className="book-header">
                            <h3 className="book-title">{book.title}</h3>
                            <p className="book-author">por {book?.authors.join(',')}</p>
                            {showDate && publishedYear && (
                                <p className="book-date">📅 {publishedYear}</p>
                            )}
                        </div>

                        {showDescription && description && (
                            <div className="book-description">
                                {description}
                            </div>
                        )}

                        <div className="book-genres">
                            {displayGenres.map((genre, index) => (
                                <span key={index} className="genre-tag">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="book-side-info">
                        <div className="book-rating">
                            <div className="stars">
                                {renderStars(displayRating)}
                            </div>
                            <span className="rating-text">
                                {displayRating > 0 ? displayRating.toFixed(1) : 'Sin calificar'} ({formatReviewCount(reviewCount)})
                            </span>
                        </div>

                        <button className="add-btn" onClick={handleAddClick}>
                            <span className="add-icon">+</span>
                            Añadir a mi librería
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Variante vertical (por defecto)
    return (
        <div className="book-card vertical glass" onClick={handleCardClick}>
            <div className="book-cover">
                {book.thumbnail ? (
                    <img
                        src={book.thumbnail}
                        alt={`Portada de ${book.title}`}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="cover-emoji-fallback"
                    style={{ display: book.thumbnail ? 'none' : 'flex' }}
                >
                    {book.coverEmoji || '📖'}
                </div>
            </div>

            <div className="book-info">
                <div className="book-main-content">
                    <h3 title={book.title}>{book.title}</h3>
                    <p className="book-author" title={book.authors.join(', ')}>{book.authors.join(',')}</p>
                    {showDate && publishedYear && (
                        <p className="book-date">📅 {publishedYear}</p>
                    )}

                    {displayGenres.length > 0 && (
                        <div className="book-genres">
                            {displayGenres.map((genre, index) => (
                                <span key={index} className="genre-tag">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="book-bottom-content">
                    <div className="book-rating">
                        <div className="stars">
                            {renderStars(displayRating)}
                        </div>
                        <span className="rating-text">
                            {displayRating > 0 ? displayRating.toFixed(1) : 'Sin calificar'} ({formatReviewCount(reviewCount)})
                        </span>
                    </div>

                    <button className="add-btn" onClick={handleAddClick}>
                        Añadir a mi librería
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookCard;