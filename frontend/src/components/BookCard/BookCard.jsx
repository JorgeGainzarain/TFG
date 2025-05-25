import React from 'react';
import './BookCard.css';

const BookCard = ({
                      title,
                      author,
                      genres = [],
                      rating,
                      reviewCount,
                      coverEmoji,
                      thumbnail,
                      onAddToLibrary
                  }) => {
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

    const handleAddClick = () => {
        if (onAddToLibrary) {
            onAddToLibrary({ title, author });
        }
    };

    const formatReviewCount = (count) => {
        if (!count) return 'Sin reseñas';
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k reseñas`;
        }
        return `${count} reseñas`;
    };

    const displayGenres = genres.slice(0, 3); // Limit to 3 genres for better display
    const displayRating = rating || 0;

    return (
        <div className="book-card glass">
            <div className="book-cover">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={`Portada de ${title}`}
                        onError={(e) => {
                            // Fallback to emoji if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div
                    className="cover-emoji-fallback"
                    style={{ display: thumbnail ? 'none' : 'flex' }}
                >
                    {coverEmoji}
                </div>
            </div>

            <div className="book-info">
                <h3 title={title}>{title}</h3>
                <p className="book-author" title={author}>{author}</p>

                {displayGenres.length > 0 && (
                    <div className="book-genres">
                        {displayGenres.map((genre, index) => (
                            <span key={index} className="genre-tag">
                                {genre}
                            </span>
                        ))}
                    </div>
                )}

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
    );
};

export default BookCard;