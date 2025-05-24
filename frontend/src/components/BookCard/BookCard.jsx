import React from 'react';
import './BookCard.css';

const BookCard = ({
                      title,
                      author,
                      genres = [],
                      rating,
                      reviewCount,
                      coverEmoji,
                      onAddToLibrary
                  }) => {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className="star">
          {i <= rating ? '★' : '☆'}
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

    return (
        <div className="book-card glass">
            <div className="book-cover">
                {coverEmoji}
            </div>
            <div className="book-info">
                <h3>{title}</h3>
                <p className="book-author">{author}</p>

                <div className="book-genres">
                    {genres.map((genre, index) => (
                        <span key={index} className="genre-tag">
              {genre}
            </span>
                    ))}
                </div>

                <div className="book-rating">
                    <div className="stars">
                        {renderStars(rating)}
                    </div>
                    <span className="rating-text">
            {rating} ({reviewCount?.toLocaleString()} reseñas)
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