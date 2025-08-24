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
    const allBooks = [];

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