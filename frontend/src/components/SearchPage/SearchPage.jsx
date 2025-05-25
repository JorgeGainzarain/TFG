import React, { useState, useEffect } from 'react';
import FilterBar from '../FilterBar/FilterBar';
import HorizontalBookCard from '../HorizontalBookCard/HorizontalBookCard';
import CategoryFilter from '../CategoryFilter/CategoryFilter';
import SortDropdown from '../SortDropdown/SortDropdown';
import './SearchPage.css';

const SearchPage = ({ searchQuery = "" }) => {
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
            rating: 5,
            reviewCount: 2847,
            coverEmoji: "📖",
            year: 2007,
            category: "fiction"
        },
        {
            id: 2,
            title: "Atomic Habits",
            author: "James Clear",
            genres: ["Autoayuda", "Productividad"],
            rating: 5,
            reviewCount: 1923,
            coverEmoji: "🌟",
            year: 2018,
            category: "self-help"
        },
        {
            id: 3,
            title: "Dune",
            author: "Frank Herbert",
            genres: ["Ciencia Ficción", "Épico"],
            rating: 4,
            reviewCount: 3156,
            coverEmoji: "🚀",
            year: 1965,
            category: "fiction"
        },
        {
            id: 4,
            title: "The Seven Husbands of Evelyn Hugo",
            author: "Taylor Jenkins Reid",
            genres: ["Drama", "Histórico"],
            rating: 5,
            reviewCount: 2234,
            coverEmoji: "🎭",
            year: 2017,
            category: "fiction"
        },
        {
            id: 5,
            title: "Educated",
            author: "Tara Westover",
            genres: ["Biografía", "Memoir"],
            rating: 4,
            reviewCount: 1876,
            coverEmoji: "📚",
            year: 2018,
            category: "biography"
        },
        {
            id: 6,
            title: "The Silent Patient",
            author: "Alex Michaelides",
            genres: ["Thriller", "Misterio"],
            rating: 4,
            reviewCount: 1456,
            coverEmoji: "🔍",
            year: 2019,
            category: "mystery"
        },
        {
            id: 7,
            title: "Becoming",
            author: "Michelle Obama",
            genres: ["Autobiografía", "Política"],
            rating: 5,
            reviewCount: 3421,
            coverEmoji: "👑",
            year: 2018,
            category: "biography"
        },
        {
            id: 8,
            title: "The Midnight Library",
            author: "Matt Haig",
            genres: ["Ficción", "Filosofía"],
            rating: 4,
            reviewCount: 2156,
            coverEmoji: "🌙",
            year: 2020,
            category: "fiction"
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
                    filteredBooks.sort((a, b) => b.rating - a.rating);
                    break;
                case 'recent':
                    filteredBooks.sort((a, b) => b.year - a.year);
                    break;
                case 'popular':
                    filteredBooks.sort((a, b) => b.reviewCount - a.reviewCount);
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

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        // Aquí iría la lógica para añadir el libro a la librería
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
                            <HorizontalBookCard
                                key={book.id}
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