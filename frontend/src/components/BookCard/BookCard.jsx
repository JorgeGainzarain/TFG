import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookCard.css';

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

const BookCard = ({
                      book,
                      handleAddToLibrary,
                      handleRemoveFromLibrary,
                      libraryOptions,
                      variant = 'vertical',
                      showDescription = false,
                      showDate = true,
                      isInLibrary = false,
                      hideAddButton = false,
                      genreTranslations
                  }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const isMobile = useIsMobile();
    const effectiveVariant = isMobile ? 'vertical' : variant;

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
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    const handleOptionClick = (option) => {
        if (handleAddToLibrary) {
            handleAddToLibrary(book, option);
        }
        setShowDropdown(false);
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        if (handleRemoveFromLibrary) {
            handleRemoveFromLibrary(book);
        }
        setShowDropdown(false);
    };

    const handleCardClick = () => {
        if (!showDropdown) {
            navigate(`/book/${book.bookId}`, {
                state: { book }
            });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatReviewCount = (count) => {
        if (!count) return 'Sin reseñas';
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k reseñas`;
        }
        return `${count} reseñas`;
    };

    const formatPublishedDate = (dateString) => {
        if (!dateString) return '';
        if (typeof dateString === 'string') {
            const year = dateString.split('-')[0];
            return year;
        }
        return dateString;
    };

    const displayGenres = (book.categories || []).map(
        genre => genreTranslations[genre?.toUpperCase()] || "Sin categorizar"
    );

    const displayRating = book.rating || book.averageRating || 0;
    const reviewCount = book.reviewCount || book.ratingsCount || 0;
    const description = book.description || '';
    const publishedYear = formatPublishedDate(book.publishedDate);
    const currentShelf = book.status;

    if (effectiveVariant === 'horizontal') {
        return (
            <div
                className={`book-card horizontal glass ${showDropdown ? 'dropdown-active' : ''}`}
                onClick={handleCardClick}
                style={{ zIndex: showDropdown ? 100 : 1 }}
            >
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
                            <p className="book-author">
                                por {Array.isArray(book?.authors) ? book.authors.join(',') : book?.authors}
                            </p>
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

                        {!hideAddButton && (
                            <div className="add-button-container">
                                <button
                                    ref={buttonRef}
                                    className={`add-btn ${showDropdown ? 'active' : ''}`}
                                    onClick={handleAddClick}
                                >
                                    <span className="add-icon">{isInLibrary ? '✔' : '+'}</span>
                                    {isInLibrary && currentShelf
                                        ? `${currentShelf}`
                                        : 'Añadir a mi librería'}
                                    <span className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`}>▼</span>
                                </button>

                                {showDropdown && (
                                    <div ref={dropdownRef} className="library-dropdown">
                                        {libraryOptions.map((option) => (
                                            <button
                                                key={option.id}
                                                className="dropdown-option"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleOptionClick(option.title);
                                                }}
                                            >
                                                <span className="option-label">{option.title}</span>
                                            </button>
                                        ))}
                                        {isInLibrary && (
                                            <button
                                                className="dropdown-option"
                                                style={{ color: '#ef4444' }}
                                                onClick={handleRemoveClick}
                                            >
                                                <span className="option-emoji">🗑️</span>
                                                <span className="option-label">Quitar de mi librería</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    
    return (
        <div
            className={`book-card vertical glass ${showDropdown ? 'dropdown-active' : ''}`}
            onClick={handleCardClick}
            style={{ zIndex: showDropdown ? 100 : 1 }}
        >
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
                    <p className="book-author"
                       title={Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}>
                        {Array.isArray(book.authors) ? book.authors.join(',') : book.authors}
                    </p>
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

                    {!hideAddButton && (
                        <div className="add-button-container">
                            <button
                                ref={buttonRef}
                                className={`add-btn ${showDropdown ? 'active' : ''}`}
                                onClick={handleAddClick}
                            >
                                <span className="add-icon">{isInLibrary ? '✔' : '+'}</span>
                                {isInLibrary && currentShelf
                                    ? ` ${currentShelf}`
                                    : 'Añadir a mi librería'}
                                <span className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`}>▼</span>
                            </button>

                            {showDropdown && (
                                <div ref={dropdownRef} className="library-dropdown">
                                    {libraryOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            className="dropdown-option"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOptionClick(option.title);
                                            }}
                                        >
                                            <span className="option-emoji">{option.emoji}</span>
                                            <span className="option-label">{option.title}</span>
                                        </button>
                                    ))}
                                    {isInLibrary && (
                                        <button
                                            className="dropdown-option"
                                            style={{ color: '#ef4444' }}
                                            onClick={handleRemoveClick}
                                        >
                                            <span className="option-emoji">🗑️</span>
                                            <span className="option-label">Quitar de mi librería</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookCard;