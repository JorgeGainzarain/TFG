import React, { useState } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './AIRecommendations.css';

const AIRecommendations = () => {
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance'
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        // Aquí iría la lógica para añadir el libro a la librería
    };

    const books = [
        {
            title: "El Nombre del Viento",
            author: "Patrick Rothfuss",
            genres: ["Fantasía", "Aventura"],
            rating: 5,
            reviewCount: 2847,
            coverEmoji: "📖"
        },
        {
            title: "Atomic Habits",
            author: "James Clear",
            genres: ["Autoayuda", "Productividad"],
            rating: 5,
            reviewCount: 1923,
            coverEmoji: "🌟"
        },
        {
            title: "Dune",
            author: "Frank Herbert",
            genres: ["Ciencia Ficción", "Épico"],
            rating: 4,
            reviewCount: 3156,
            coverEmoji: "🚀"
        }
    ];

    return (
        <section className="ai-section">
            <div className="ai-header">
                <h2 className="ai-title">Recomendaciones Personalizadas</h2>
                <p className="ai-description">
                    Nuestra IA analiza tus gustos y te sugiere libros que realmente amarás
                </p>
            </div>

            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

            <div className="cards-grid">
                {books.map((book, index) => (
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

export default AIRecommendations;