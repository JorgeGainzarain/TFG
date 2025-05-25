import React from 'react';
import BookCard from '../BookCard/BookCard';
import './TrendingBooks.css';

const TrendingBooks = () => {
    // Datos placeholder para libros en tendencia
    const placeholderBooks = [
        {
            id: 'trending-1',
            title: 'It Ends with Us',
            author: 'Colleen Hoover',
            genres: ['Romance', 'Drama', 'Contemporáneo'],
            rating: 5,
            reviewCount: 45230,
            coverEmoji: '💕',
            thumbnail: ''
        },
        {
            id: 'trending-2',
            title: 'The Seven Moons of Maali Almeida',
            author: 'Shehan Karunatilaka',
            genres: ['Ficción', 'Fantasía', 'Premiado'],
            rating: 4,
            reviewCount: 18760,
            coverEmoji: '🌙',
            thumbnail: ''
        },
        {
            id: 'trending-3',
            title: 'Atomic Habits',
            author: 'James Clear',
            genres: ['Autoayuda', 'Productividad', 'Psicología'],
            rating: 5,
            reviewCount: 89430,
            coverEmoji: '⚡',
            thumbnail: ''
        },
        {
            id: 'trending-4',
            title: 'The Midnight Library',
            author: 'Matt Haig',
            genres: ['Ficción', 'Filosofía', 'Drama'],
            rating: 4,
            reviewCount: 67890,
            coverEmoji: '📚',
            thumbnail: ''
        },
        {
            id: 'trending-5',
            title: 'Where the Crawdads Sing',
            author: 'Delia Owens',
            genres: ['Ficción', 'Misterio', 'Naturaleza'],
            rating: 5,
            reviewCount: 123450,
            coverEmoji: '🦆',
            thumbnail: ''
        },
        {
            id: 'trending-6',
            title: 'The Silent Patient',
            author: 'Alex Michaelides',
            genres: ['Thriller', 'Psicológico', 'Misterio'],
            rating: 4,
            reviewCount: 95670,
            coverEmoji: '🤫',
            thumbnail: ''
        }
    ];

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    return (
        <section className="section trending-section">
            <div className="section-header">
                <h2 className="section-title">📈 Tendencias</h2>
                <div className="trending-indicators">
                    <span className="trending-badge">
                        🔥 {placeholderBooks.length} libros populares
                    </span>
                </div>
            </div>

            <div className="cards-grid">
                {placeholderBooks.map((book) => (
                    <BookCard
                        key={book.id}
                        title={book.title}
                        author={book.author}
                        genres={book.genres}
                        rating={book.rating}
                        reviewCount={book.reviewCount}
                        coverEmoji={book.coverEmoji}
                        thumbnail={book.thumbnail}
                        onAddToLibrary={handleAddToLibrary}
                    />
                ))}
            </div>

            <div className="trending-footer">
            </div>
        </section>
    );
};

export default TrendingBooks;