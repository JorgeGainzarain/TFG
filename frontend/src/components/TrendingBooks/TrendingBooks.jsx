import React from 'react';
import BookCard from '../BookCard/BookCard';
import './TrendingBooks.css';

const TrendingBooks = () => {
    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        // Aquí iría la lógica para añadir el libro a la librería
    };

    const trendingBooks = [
        {
            title: "Tomorrow, and Tomorrow, and Tomorrow",
            author: "Gabrielle Zevin",
            genres: ["Ficción", "Contemporáneo"],
            rating: 4,
            reviewCount: 892,
            coverEmoji: "💫"
        },
        {
            title: "Fourth Wing",
            author: "Rebecca Yarros",
            genres: ["Romance", "Fantasía"],
            rating: 5,
            reviewCount: 1543,
            coverEmoji: "🔥"
        },
        {
            title: "The Seven Husbands of Evelyn Hugo",
            author: "Taylor Jenkins Reid",
            genres: ["Drama", "Histórico"],
            rating: 5,
            reviewCount: 2234,
            coverEmoji: "🎭"
        }
    ];

    return (
        <section className="section trending-section">
            <div className="section-header">
                <h2 className="section-title">📈 Tendencias</h2>
                <a href="#" className="view-all">Ver todos</a>
            </div>

            <div className="cards-grid">
                {trendingBooks.map((book, index) => (
                    <BookCard
                        key={index}
                        title={book.title}
                        author={book.author}
                        genres={book.genres}
                        rating={book.rating}
                        reviewCount={book.reviewCount}
                        coverEmoji={book.coverEmoji}
                        onAddToLibrary={handleAddToLibrary}
                    />
                ))}
            </div>
        </section>
    );
};

export default TrendingBooks;