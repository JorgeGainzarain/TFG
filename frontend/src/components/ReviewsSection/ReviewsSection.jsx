// frontend/src/components/ReviewsSection/ReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import { addReviewToBook, getReviewsFromBook, updateReview, deleteReview } from "../../services/api";
import './ReviewsSection.css';
import { useAuth } from "../../hooks/useAuth";

const ReviewsSection = ({ book, isAuthenticated, onShowAuth }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddReview, setShowAddReview] = useState(false);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [likedReviews, setLikedReviews] = useState(new Set());
    const { user } = useAuth();

    useEffect(() => {
        getReviews(book);
    }, [book]);

    const getReviews = async (book) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getReviewsFromBook(book);
            if (response && Array.isArray(response)) {
                setReviews(response);
                const initialLiked = new Set(response.filter(r => r.likes > 0).map(r => r.id || r._id));
                setLikedReviews(initialLiked);
            } else {
                setError("No se encontraron reseñas para este libro");
            }
        } catch (err) {
            setError("Error al cargar reseñas");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) return onShowAuth();
        if (newReview.rating === 0) return alert("Selecciona una calificación");
        if (newReview.comment.trim().length < 5) return alert("Escribe una reseña más larga");

        try {
            setSubmitting(true);
            if (editingReviewId) {
                const updated = {
                    ...reviews.find(r => (r._id || r.id) === editingReviewId),
                    rating: newReview.rating,
                    comment: newReview.comment + ` (Editado el ${new Date().toLocaleDateString()})`
                };
                await updateReview(user.userId, updated);
                setReviews(reviews.map(r => (r._id || r.id) === editingReviewId ? updated : r));
                setEditingReviewId(null);
            } else {
                const res = await addReviewToBook(book, newReview);
                if (res.status === 409) return alert("Ya has escrito una reseña");
                if (!res.ok) throw new Error("Error al enviar reseña");
                const data = await res.json();
                const enriched = {
                    ...data,
                    user: {
                        _id: user.userId,
                        username: user.username || user.name || 'Tú',
                        avatar: user.avatar || null
                    }
                };
                setReviews([enriched, ...reviews]);
            }
            setNewReview({ rating: 0, comment: '' });
            setShowAddReview(false);
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLikeReview = (review) => {
        if (!isAuthenticated) return onShowAuth();
        const id = review.id || review._id;
        const isLiked = likedReviews.has(id);
        const newSet = new Set(likedReviews);

        isLiked ? newSet.delete(id) : newSet.add(id);
        setLikedReviews(newSet);

        setReviews(reviews.map(r =>
            (r.id || r._id) === id ? { ...r, likes: (r.likes || 0) + (isLiked ? -1 : 1) } : r
        ));

        updateReview(user.userId, {
            ...review,
            likes: (review.likes || 0) + (isLiked ? -1 : 1)
        });
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar esta reseña?")) return;
        console.log("Deleting review with ID:", id);
        await deleteReview(id);
        setReviews(reviews.filter(r => (r._id || r.id) !== id));
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review._id || review.id);
        setNewReview({ rating: review.rating, comment: review.comment.replace(/\s*\(Editado.*\)$/, '') });
        setShowAddReview(true);
    };

    const renderRatingStars = () => (
        <div className="rating-selector">
            {[1, 2, 3, 4, 5].map(star => (
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

    const renderReviewStars = (rating) => (
        Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="review-star">{i < rating ? '★' : '☆'}</span>
        ))
    );

    const formatDate = (str) => {
        const date = new Date(str);
        return isNaN(date.getTime()) ? "Fecha desconocida" : date.toLocaleDateString();
    };

    return (
        <section className="reviews-section">
            <div className="section-header">
                <h2 className="section-title">💭 Reseñas del Libro</h2>
                <button className="add-review-btn" onClick={() => {
                    if (!isAuthenticated) return onShowAuth();
                    setEditingReviewId(null);
                    setShowAddReview(!showAddReview);
                }}>
                    {showAddReview ? 'Cancelar' : '✍️ Escribir Reseña'}
                </button>
            </div>

            {showAddReview && isAuthenticated && (
                <form onSubmit={handleSubmitReview} className="add-review-form">
                    <div className="form-group">
                        <label>Tu calificación:</label>
                        {renderRatingStars()}
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Tu reseña:</label>
                        <textarea
                            id="comment"
                            className="review-textarea"
                            value={newReview.comment}
                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                            placeholder="Comparte tu opinión sobre este libro..."
                            rows="5"
                            minLength="5"
                            required
                        />
                    </div>
                    <button type="submit" className="submit-review-btn" disabled={submitting}>
                        {submitting ? 'Enviando...' : (editingReviewId ? 'Guardar Cambios' : 'Publicar Reseña')}
                    </button>
                </form>
            )}

            <div className="reviews-container">
                {loading && <div className="loading">Cargando reseñas...</div>}
                {error && <div className="error">{error}</div>}
                {!loading && !error && reviews.length === 0 && (
                    <div className="no-reviews">No hay reseñas todavía. ¡Sé el primero en escribir una!</div>
                )}
                {!loading && !error && reviews.map((review) => {
                    const id = review.id || review._id;
                    const isLiked = likedReviews.has(id);
                    const isOwner = user != null && (review.user?._id === user?.userId);

                    return (
                        <div key={id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar">
                                        {review.user?.avatar ? (
                                            <img src={review.user.avatar} alt={review.user.username} />
                                        ) : (
                                            <span>👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="reviewer-name">{review.user.username || 'Anónimo'}</div>
                                        <div className="review-date">{formatDate(review.createdAt)}</div>
                                    </div>
                                </div>
                                <div className="review-rating">{renderReviewStars(review.rating)}</div>
                                {isOwner && (
                                    <div className="review-controls">
                                        <button className="edit-btn" onClick={() => handleEditReview(review)}>🖉</button>
                                        <button className="delete-btn" onClick={() => handleDeleteReview(id)}>🗑️</button>
                                    </div>
                                )}
                            </div>
                            <div className="review-text">{review.comment}</div>
                            <div className="review-actions">
                                <button className={`review-action like-action ${isLiked ? 'liked' : ''}`} onClick={() => handleLikeReview(review)}>
                                    <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
                                    <span className="like-count">{review.likes || 0}</span>
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
