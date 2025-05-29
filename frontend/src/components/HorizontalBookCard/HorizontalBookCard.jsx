import React from 'react';
import './HorizontalBookCard.css';

const HorizontalBookCard = ({
                                title,
                                author,
                                genres = [],
                                rating,
                                reviewCount,
                                thumbnail, // Real cover image
                                description,
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

    // Generate a default description if none is provided
    const getDefaultDescription = () => {
        const descriptions = [
            "A captivating work that will keep you hooked from the first page to the last.",
            "An extraordinary book that combines immersive storytelling with memorable characters.",
            "A must-read offering a unique and transformative perspective.",
            "A fascinating story exploring deep themes with mastery and sensitivity.",
            "A powerful tale that challenges conventions and offers new insights."
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    return (
        <div className="horizontal-book-card glass">
            <div className="book-cover-horizontal">
                {thumbnail ? (
                    <img src={thumbnail} alt={`${title} cover`} className="book-thumbnail" />
                ) : (
                    <div className="placeholder-cover">No Cover</div>
                )}
            </div>

            <div className="book-content">
                <div className="book-main-info">
                    <div className="book-header">
                        <h3 className="book-title">{title}</h3>
                        <p className="book-author">by {author}</p>
                    </div>

                    <div className="book-description">
                        {description || getDefaultDescription()}
                    </div>

                    <div className="book-genres-horizontal">
                        {genres.map((genre, index) => (
                            <span key={index} className="genre-tag-horizontal">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="book-side-info">
                    <div className="book-rating-horizontal">
                        <div className="stars">
                            {renderStars(rating)}
                        </div>
                        <span className="rating-text">
                            {rating} ({reviewCount?.toLocaleString()} reviews)
                        </span>
                    </div>

                    <button className="add-btn-horizontal" onClick={handleAddClick}>
                        <span className="add-icon">+</span>
                        Add to Library
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HorizontalBookCard;