import React from 'react';
import ReviewCard from '../ReviewCard/ReviewCard';
import './ReviewsSection.css';

const ReviewsSection = () => {
    const featuredReviews = [
        {
            userName: "María González",
            userAvatar: null,
            reviewDate: "Hace 2 días",
            reviewText: "Una obra maestra absoluta. Rothfuss ha creado un mundo tan rico y detallado que te sientes completamente inmerso. La prosa es poética sin ser pretenciosa, y Kvothe es un protagonista fascinante que te mantiene enganchado desde la primera página hasta la última.",
            rating: 5,
            likes: 234,
            bookTitle: "El Nombre del Viento"
        },
        {
            userName: "Alex Chen",
            userAvatar: null,
            reviewDate: "Hace 1 semana",
            reviewText: "Un libro que cambia perspectivas. Clear presenta conceptos complejos de manera accesible y práctica. Cada capítulo está lleno de ejemplos reales y estrategias que realmente funcionan. Lo he releído tres veces y sigo encontrando nuevas ideas.",
            rating: 4,
            likes: 187,
            bookTitle: "Atomic Habits"
        },
        {
            userName: "Sofia Martínez",
            userAvatar: null,
            reviewDate: "Hace 3 días",
            reviewText: "Una montaña rusa emocional increíble. Jenkins Reid tiene un don para crear personajes complejos y reales. Evelyn Hugo es inolvidable, y cada revelación me dejó sin aliento. Una historia sobre amor, ambición y los sacrificios que hacemos por nuestros sueños.",
            rating: 5,
            likes: 312,
            bookTitle: "The Seven Husbands of Evelyn Hugo"
        }
    ];

    return (
        <section className="section reviews-section">
            <div className="section-header">
                <h2 className="section-title">💭 Reseñas Destacadas</h2>
                <a href="#" className="view-all">Ver todas</a>
            </div>

            <div className="reviews-container">
                {featuredReviews.map((review, index) => (
                    <ReviewCard
                        key={index}
                        userName={review.userName}
                        userAvatar={review.userAvatar}
                        reviewDate={review.reviewDate}
                        reviewText={review.reviewText}
                        rating={review.rating}
                        likes={review.likes}
                        bookTitle={review.bookTitle}
                    />
                ))}
            </div>
        </section>
    );
};

export default ReviewsSection;