// frontend/src/components/ReviewCard/ReviewCard.jsx
import React, { useState } from 'react';
import './ReviewCard.css';
import {updateBook} from "../../services/api";
import {useAuth} from "../../hooks/useAuth";

const ReviewCard = ({ review }) => {
    const { user } = useAuth();
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

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div className="review-card glass">
            <div className="review-header">
                <div className="user-avatar">
                    {review.userAvatar ? (
                        <img src={review.userAvatar} alt={review.user.username} />
                    ) : (
                        getInitials(review.user.username)
                    )}
                </div>
                <div className="review-meta">
                    <h4>{review.user.username}</h4>
                    <p className="review-date">{review.createdAt}</p>
                </div>
                <div className="book-rating">
                    <div className="stars">
                        {renderStars(review.rating)}
                    </div>
                </div>
            </div>

            <p className="review-text">{review.comment}</p>

            <div className="review-actions">
                <span className="book-title">{review.book.title}</span>
            </div>
        </div>
    );
};

export default ReviewCard;