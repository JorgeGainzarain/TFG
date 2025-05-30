// frontend/src/components/ReviewCard/ReviewCard.jsx
import React, { useState } from 'react';
import './ReviewCard.css';

const ReviewCard = ({ review }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(review.likes || 0);

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

    const handleLike = () => {
        if (isLiked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="review-card glass">
            <div className="review-header">
                <div className="user-avatar">
                    {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.userName} />
                    ) : (
                        getInitials(review.userName)
                    )}
                </div>
                <div className="review-meta">
                    <h4>{review.userName}</h4>
                    <p className="review-date">{review.reviewDate}</p>
                </div>
                <div className="book-rating">
                    <div className="stars">
                        {renderStars(review.rating)}
                    </div>
                </div>
            </div>

            <p className="review-text">{review.reviewText}</p>

            <div className="review-actions">
                <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <span>{isLiked ? '❤️' : '♡'}</span>
                    <span>{likeCount} me gusta</span>
                </button>
                <span className="book-title">{review.bookTitle}</span>
            </div>
        </div>
    );
};

export default ReviewCard;