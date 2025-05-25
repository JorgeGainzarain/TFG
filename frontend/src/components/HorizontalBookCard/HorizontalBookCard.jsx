import React from 'react';
import './HorizontalBookCard.css';

const HorizontalBookCard = ({
                                title,
                                author,
                                genres = [],
                                rating,
                                reviewCount,
                                coverEmoji,
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

    // Generar una descripción por defecto si no se proporciona
    const getDefaultDescription = () => {
        const descriptions = [
            "Una obra cautivadora que te mantendrá enganchado desde la primera página hasta la última.",
            "Un libro extraordinario que combina una narrativa envolvente con personajes memorables.",
            "Una lectura imprescindible que ofrece una perspectiva única y transformadora.",
            "Una historia fascinante que explora temas profundos con maestría y sensibilidad.",
            "Un relato poderoso que desafía las convenciones y ofrece nuevas perspectivas."
        ];
        return descriptions[Math.floor(Math.random() * descriptions.length)];
    };

    return (
        <div className="horizontal-book-card glass">
            <div className="book-cover-horizontal">
                {coverEmoji}
            </div>

            <div className="book-content">
                <div className="book-main-info">
                    <div className="book-header">
                        <h3 className="book-title">{title}</h3>
                        <p className="book-author">por {author}</p>
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
                            {rating} ({reviewCount?.toLocaleString()} reseñas)
                        </span>
                    </div>

                    <button className="add-btn-horizontal" onClick={handleAddClick}>
                        <span className="add-icon">+</span>
                        Añadir a librería
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HorizontalBookCard;