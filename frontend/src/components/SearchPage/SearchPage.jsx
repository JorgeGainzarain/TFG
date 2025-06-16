// frontend/src/components/SearchPage/SearchPage.jsx
import React, { useState, useEffect } from 'react';
import FilterBar from '../FilterBar/FilterBar';
import BookCard from '../BookCard/BookCard';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import SortDropdown from '../SortDropdown/SortDropdown';
import './SearchPage.css';

const SearchPage = ({ searchQuery = "", handleAddToLibrary }) => {
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance',
        category: ''
    });
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentQuery, setCurrentQuery] = useState(searchQuery);

    // Datos de ejemplo - en una app real vendría de una API
    const allBooks = [
        {
            id: 1,
            title: "El Nombre del Viento",
            author: "Patrick Rothfuss",
            genres: ["Fantasía", "Aventura"],
            categories: ["Fantasía", "Aventura"],
            rating: 5,
            averageRating: 5,
            reviewCount: 2847,
            ratingsCount: 2847,
            coverEmoji: "📖",
            thumbnail: "",
            publishedDate: "2007-03-27",
            year: 2007,
            category: "fiction",
            description: "Una historia épica sobre un joven héroe y su búsqueda de la verdad.",
            pageCount: 662,
            language: 'es'
        },
        {
            id: 2,
            title: "Atomic Habits",
            author: "James Clear",
            genres: ["Autoayuda", "Productividad"],
            categories: ["Autoayuda", "Productividad"],
            rating: 5,
            averageRating: 5,
            reviewCount: 1923,
            ratingsCount: 1923,
            coverEmoji: "🌟",
            thumbnail: "",
            publishedDate: "2018-10-16",
            year: 2018,
            category: "self-help",
            description: "La guía definitiva para formar buenos hábitos y romper los malos.",
            pageCount: 320,
            language: 'en'
        },
        {
            id: 3,
            title: "Dune",
            author: "Frank Herbert",
            genres: ["Ciencia Ficción", "Épico"],
            categories: ["Ciencia Ficción", "Épico"],
            rating: 4,
            averageRating: 4,
            reviewCount: 3156,
            ratingsCount: 3156,
            coverEmoji: "🚀",
            thumbnail: "",
            publishedDate: "1965-08-01",
            year: 1965,
            category: "fiction",
            description: "La obra maestra de la ciencia ficción que definió un género.",
            pageCount: 688,
            language: 'en'
        },
        {
            id: 4,
            title: "The Seven Husbands of Evelyn Hugo",
            author: "Taylor Jenkins Reid",
            genres: ["Drama", "Histórico"],
            categories: ["Drama", "Histórico"],
            rating: 5,
            averageRating: 5,
            reviewCount: 2234,
            ratingsCount: 2234,
            coverEmoji: "🎭",
            thumbnail: "",
            publishedDate: "2017-06-13",
            year: 2017,
            category: "fiction",
            description: "Una historia cautivadora sobre amor, fama y los secretos que guardamos.",
            pageCount: 400,
            language: 'en'
        },
        {
            id: 5,
            title: "Educated",
            author: "Tara Westover",
            genres: ["Biografía", "Memoir"],
            categories: ["Biografía", "Memoir"],
            rating: 4,
            averageRating: 4,
            reviewCount: 1876,
            ratingsCount: 1876,
            coverEmoji: "📚",
            thumbnail: "",
            publishedDate: "2018-02-20",
            year: 2018,
            category: "biography",
            description: "Una poderosa historia sobre educación y superación personal.",
            pageCount: 334,
            language: 'en'
        },
        {
            id: 6,
            title: "The Silent Patient",
            author: "Alex Michaelides",
            genres: ["Thriller", "Misterio"],
            categories: ["Thriller", "Misterio"],
            rating: 4,
            averageRating: 4,
            reviewCount: 1456,
            ratingsCount: 1456,
            coverEmoji: "🔍",
            thumbnail: "",
            publishedDate: "2019-02-05",
            year: 2019,
            category: "mystery",
            description: "Un thriller psicológico que te mantendrá adivinando hasta la última página.",
            pageCount: 336,
            language: 'en'
        },
        {
            id: 7,
            title: "Becoming",
            author: "Michelle Obama",
            genres: ["Autobiografía", "Política"],
            categories: ["Autobiografía", "Política"],
            rating: 5,
            averageRating: 5,
            reviewCount: 3421,
            ratingsCount: 3421,
            coverEmoji: "👑",
            thumbnail: "",
            publishedDate: "2018-11-13",
            year: 2018,
            category: "biography",
            description: "Las memorias inspiradoras de una de las primeras damas más influyentes.",
            pageCount: 448,
            language: 'en'
        },
        {
            id: 8,
            title: "The Midnight Library",
            author: "Matt Haig",
            genres: ["Ficción", "Filosofía"],
            categories: ["Ficción", "Filosofía"],
            rating: 4,
            averageRating: 4,
            reviewCount: 2156,
            ratingsCount: 2156,
            coverEmoji: "🌙",
            thumbnail: "",
            publishedDate: "2020-08-13",
            year: 2020,
            category: "fiction",
            description: "Una reflexión profunda sobre las decisiones de la vida y las posibilidades infinitas.",
            pageCount: 288,
            language: 'en'
        }
    ];

    useEffect(() => {
        setCurrentQuery(searchQuery);
        searchBooks();
    }, [searchQuery]);

    useEffect(() => {
        searchBooks();
    }, [filters]);

    const searchBooks = () => {
        setLoading(true);

        // Simular búsqueda con delay
        setTimeout(() => {
            let filteredBooks = allBooks;

            // Filtrar por query de búsqueda
            if (currentQuery) {
                filteredBooks = filteredBooks.filter(book =>
                    book.title.toLowerCase().includes(currentQuery.toLowerCase()) ||
                    book.author.toLowerCase().includes(currentQuery.toLowerCase()) ||
                    book.genres.some(genre => genre.toLowerCase().includes(currentQuery.toLowerCase()))
                );
            }

            // Filtrar por categoría
            if (filters.category) {
                filteredBooks = filteredBooks.filter(book => book.category === filters.category);
            }

            // Filtrar por género
            if (filters.genre) {
                filteredBooks = filteredBooks.filter(book =>
                    book.genres.some(genre => genre.toLowerCase().includes(filters.genre.toLowerCase()))
                );
            }

            // Filtrar por año
            if (filters.year) {
                if (filters.year === 'clasicos') {
                    filteredBooks = filteredBooks.filter(book => book.year < 2000);
                } else {
                    filteredBooks = filteredBooks.filter(book => book.year.toString() === filters.year);
                }
            }

            // Ordenar
            switch (filters.sortBy) {
                case 'rating':
                    filteredBooks.sort((a, b) => (b.rating || b.averageRating) - (a.rating || a.averageRating));
                    break;
                case 'recent':
                    filteredBooks.sort((a, b) => b.year - a.year);
                    break;
                case 'popular':
                    filteredBooks.sort((a, b) => (b.reviewCount || b.ratingsCount) - (a.reviewCount || a.ratingsCount));
                    break;
                case 'title':
                    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
                    break;
                case 'author':
                    filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
                    break;
                default:
                    // relevance - mantener orden original
                    break;
            }

            setBooks(filteredBooks);
            setLoading(false);
        }, 500);
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    return (
        <div className="search-page">
            <div className="search-header">
                <h1 className="search-title">
                    {currentQuery ? `Resultados para "${currentQuery}"` : 'Buscar Libros'}
                </h1>
                <p className="search-subtitle">
                    {loading ? 'Buscando...' : `${books.length} libros encontrados`}
                </p>
            </div>

            <div className="search-controls">
                <CategoryFilter
                    selectedCategory={filters.category}
                    onCategoryChange={(category) => handleFilterChange('category', category)}
                />

                <div className="filters-row">
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                    />
                    <SortDropdown
                        sortBy={filters.sortBy}
                        onSortChange={(sortBy) => handleFilterChange('sortBy', sortBy)}
                    />
                </div>
            </div>

            <div className="search-results">
                {loading ? (
                    <div className="loading-container">
                        <div className="loading"></div>
                        <p>Buscando libros...</p>
                    </div>
                ) : books.length > 0 ? (
                    <div className="books-list">
                        {books.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                variant="horizontal"
                                showDescription={true}
                                showDate={true}
                                onAddToLibrary={handleAddToLibrary}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="no-results">
                        <div className="no-results-icon">📚</div>
                        <h3>No se encontraron libros</h3>
                        <p>Intenta ajustar tus filtros o buscar con términos diferentes</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;