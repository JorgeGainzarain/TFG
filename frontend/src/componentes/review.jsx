import React from "react";
import "./review.css";

const ReviewLabel = ({
                         user = "Usuario",
                         date = "dd/mm/yyyy",
                         text = "Suspendisse consectetur cursus nulla, at ornare ipsum cursus non. Mauris tempor ligula a molestie fringilla. Fusce libero est, dictum non est et, suscipit congue turpis. Pellentesque elementum auctor libero in ultrices. Curabitur bibendum libero ut sodales egestas. Nam et neque vitae leo...",
                         likes = 123,
                         rating = 4,
                         avatar = "/user.png" // Default avatar image
                     }) => {
    // Render stars based on rating
    const stars = Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "star filled" : "star"}>
      ★
    </span>
    ));

    return (
        <div className="review-label">
            <div className="review-sidebar">
                <div
                    className="review-avatar"
                    style={{ backgroundImage: `url(${avatar})` }}
                />
                <div className="review-user">{user}</div>
                <div className="review-date">{date}</div>
                <div className="review-likes">
                    <span className="heart">♡</span> {likes}
                </div>
            </div>
            <div className="review-content">
                <div className="review-text">{text}</div>
                <div className="review-rating">{stars}</div>
            </div>
        </div>
    );
};

export default ReviewLabel;