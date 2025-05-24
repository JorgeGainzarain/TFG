import React, { useState } from 'react';
import './ReviewCard.css';

const ReviewCard = ({
                        userName,
                        userAvatar,
                        reviewDate,
                        reviewText,
                        rating,
                        likes,
                        bookTitle
                    }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(likes);

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
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} />
                    ) : (
                        getInitials(userName)
                    )}
                </div>
                <div className="review-meta">
                    <h4>{userName}</h4>
                    <p className="review-date">{reviewDate}</p>
                </div>
                <div className="book-rating">
                    <div className="stars">
                        {renderStars(rating)}
                    </div>
                </div>
            </div>

            <p className="review-text">{reviewText}</p>

            <div className="review-actions">
                <button
                    className={`like-btn ${isLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <span>{isLiked ? '❤️' : '♡'}</span>
                    <span>{likeCount} me gusta</span>
                </button>
                <span className="book-title">{bookTitle}</span>
            </div>
        </div>
    );
};

export default ReviewCard;