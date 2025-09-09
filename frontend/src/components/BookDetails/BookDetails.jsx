

import React, { useState, useRef, useEffect } from 'react';
import './BookDetails.css';

const BookDetails = ({
                         book,
                         user,
                         isAuthenticated,
                         onShowAuth,
                         onGoBack,
                         libraryOptions = [],
                         handleAddToLibrary,
                         handleRemoveFromLibrary,
                         isInLibrary = false,
                         genreTranslations
                     }) => {
    const [imageError, setImageError] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const currentBook = book;

    const getCoverImage = (book) => book.thumbnail;

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

    const handleAddClick = (e) => {
        e.stopPropagation();
        setShowDropdown(!showDropdown);
    };

    const handleOptionClick = (option) => {
        if (!isAuthenticated) {
            if (onShowAuth) {
                onShowAuth();
            } else {
                alert('Debes iniciar sesión para añadir libros a tu librería');
            }
            setShowDropdown(false);
            return;
        }
        if (handleAddToLibrary) {
            handleAddToLibrary(currentBook, option);
        }
        setShowDropdown(false);
    };

    const handleRemoveClick = (e) => {
        e.stopPropagation();
        if (handleRemoveFromLibrary) {
            handleRemoveFromLibrary(currentBook);
        }
        setShowDropdown(false);
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
        return description.replace(/<[^>]*>/g, '');
    };

    return (
        <div className="book-details">
            <div className="book-details-container glass">
                <div className="book-title-header">
                    <h1 className="book-title">{currentBook.title}</h1>
                    <p className="book-author">por {Array.isArray(currentBook.authors) ? currentBook.authors.join(', ') : currentBook.authors}</p>
                </div>
                <div className="book-main-section">
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
                    <div className="book-info-section">
                        {currentBook.categories && currentBook.categories.length > 0 && (
                            <div className="book-genres">
                                {currentBook.categories.map((genre, index) => (
                                    <span key={index} className="genre-tag">
                                                {genreTranslations && genreTranslations[genre.toUpperCase()]
                                                    ? genreTranslations[genre.toUpperCase()]
                                                    : "Sin categorizar"}
                                    </span>
                                ))}
                            </div>
                        )}
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
                        <div className="book-actions-row">
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
                            <div className="action-buttons">
                                <div className="add-button-container">
                                    <button
                                        ref={buttonRef}
                                        className={`add-btn ${showDropdown ? 'active' : ''}`}
                                        onClick={handleAddClick}
                                    >
                                        <span className="add-icon">{isInLibrary ? '✔' : '+'}</span>
                                        {isInLibrary && currentBook.status
                                            ? `${currentBook.status}`
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
                <div className="book-description-section">
                    <div className="book-description">
                        {cleanDescription(currentBook.description)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetails;