// frontend/src/components/ReviewsSection/ReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import { getReviewsFromBook } from "../../services/api";
import './ReviewsSection.css';

const ReviewsSection = ({ bookId, isAuthenticated, user, onShowAuth }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddReview, setShowAddReview] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 0,
        reviewText: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [likedReviews, setLikedReviews] = useState(new Set());

    // Cargar reviews del libro
    useEffect(() => {
        getReviewsFromBook(bookId);
    }, [bookId]);

    // Manejar el envío de nueva reseña
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            onShowAuth();
            return;
        }

        if (newReview.rating === 0) {
            alert('Por favor, selecciona una calificación');
            return;
        }

        if (newReview.reviewText.trim().length < 10) {
            alert('Por favor, escribe una reseña de al menos 10 caracteres');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`/api/review/${bookId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    rating: newReview.rating,
                    reviewText: newReview.reviewText
                })
            });

            if (!response.ok) {
                throw new Error('Error al enviar la reseña');
            }

            const newReviewData = await response.json();

            // Añadir la nueva reseña al principio de la lista
            setReviews([newReviewData, ...reviews]);

            // Limpiar el formulario
            setNewReview({ rating: 0, reviewText: '' });
            setShowAddReview(false);
        } catch (err) {
            alert('Error al enviar la reseña: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Manejar likes
    const handleLikeReview = (reviewId) => {
        if (!isAuthenticated) {
            onShowAuth();
            return;
        }

        const newLikedReviews = new Set(likedReviews);
        if (likedReviews.has(reviewId)) {
            newLikedReviews.delete(reviewId);
        } else {
            newLikedReviews.add(reviewId);
        }
        setLikedReviews(newLikedReviews);

        // Actualizar el contador de likes localmente
        setReviews(reviews.map(review => {
            if (review.id === reviewId || review._id === reviewId) {
                return {
                    ...review,
                    likes: likedReviews.has(reviewId) ? review.likes - 1 : review.likes + 1
                };
            }
            return review;
        }));
    };

    // Renderizar estrellas para selección
    const renderRatingStars = () => {
        return (
            <div className="rating-selector">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`star-button ${newReview.rating >= star ? 'filled' : ''}`}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                    >
                        {newReview.rating >= star ? '★' : '☆'}
                    </button>
                ))}
            </div>
        );
    };

    // Renderizar estrellas de calificación
    const renderReviewStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="review-star">
                {i < rating ? '★' : '☆'}
            </span>
        ));
    };

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
        return `Hace ${Math.floor(diffDays / 365)} años`;
    };

    return (
        <section className="reviews-section">
            <div className="section-header">
                <h2 className="section-title">💭 Reseñas del Libro</h2>
                <button
                    className="add-review-btn"
                    onClick={() => {
                        if (!isAuthenticated) {
                            onShowAuth();
                        } else {
                            setShowAddReview(!showAddReview);
                        }
                    }}
                >
                    {showAddReview ? 'Cancelar' : '✍️ Escribir Reseña'}
                </button>
            </div>

            {/* Formulario para añadir reseña */}
            {showAddReview && isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="add-review-form">
                    <div className="form-group">
                        <label>Tu calificación:</label>
                        {renderRatingStars()}
                    </div>
                    <div className="form-group">
                        <label htmlFor="reviewText">Tu reseña:</label>
                        <textarea
                            id="reviewText"
                            className="review-textarea"
                            value={newReview.reviewText}
                            onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
                            placeholder="Comparte tu opinión sobre este libro..."
                            rows="5"
                            minLength="10"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="submit-review-btn"
                        disabled={submitting}
                    >
                        {submitting ? 'Enviando...' : 'Publicar Reseña'}
                    </button>
                </form>
            )}

            {/* Lista de reseñas */}
            <div className="reviews-container">
                {loading && <div className="loading">Cargando reseñas...</div>}
                {error && <div className="error">Error: {error}</div>}
                {!loading && !error && reviews.length === 0 && (
                    <div className="no-reviews">
                        <p>No hay reseñas todavía. ¡Sé el primero en escribir una!</p>
                    </div>
                )}
                {!loading && !error && reviews.map((review) => {
                    const reviewId = review.id || review._id;
                    const isLiked = likedReviews.has(reviewId);

                    return (
                        <div key={reviewId} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {review.userAvatar || review.user?.avatar ? (
                                            <img src={review.userAvatar || review.user?.avatar} alt={review.userName} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="reviewer-name">
                                            {review.userName || review.user?.name || 'Usuario anónimo'}
                                        </div>
                                        <div className="review-date">
                                            {formatDate(review.reviewDate || review.createdAt || new Date())}
                                        </div>
                                    </div>
                                </div>
                                <div className="review-rating">
                                    {renderReviewStars(review.rating)}
                                </div>
                            </div>

                            <div className="review-text">
                                {review.reviewText}
                            </div>

                            <div className="review-actions">
                                <button
                                    className={`review-action like-action ${isLiked ? 'liked' : ''}`}
                                    onClick={() => handleLikeReview(reviewId)}
                                >
                                    <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
                                    <span className="like-count">{review.likes || 0}</span>
                                </button>
                                <button className="review-action reply-action">
                                    💬 Responder
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default ReviewsSection;