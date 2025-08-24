import React, { useState, useEffect, useMemo } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './SearchResults.css';

const SearchResults = ({
                           results,
                           loading,
                           handleAddToLibrary,
                           filters,
                           handleFilterChange,
                           libraryOptions,
                           onLoadMore,
                           currentQuery,
                           genreOptions,
                           genreTranslations,
                       }) => {
    const [filteredResults, setFilteredResults] = useState(results);
    const [prevQuery, setPrevQuery] = useState(currentQuery);


    useEffect(() => {
        let filtered = [...results];

        // Filter by genre
        if (filters.genre) {
            filtered = filtered.filter(book =>
                (book.categories || []).includes(filters.genre)
            );
        }

        // Filter by year
        if (filters.year) {
            if (filters.year === 'clasicos') {
                filtered = filtered.filter(book => {
                    const year = book.publishedDate ? parseInt(book.publishedDate.split('-')[0]) : 0;
                    return year < 2000;
                });
            } else {
                const [startYear, endYear] = filters.year.split('-').map(Number);
                filtered = filtered.filter(book => {
                    const year = book.publishedDate ? parseInt(book.publishedDate.split('-')[0]) : 0;
                    return year >= startYear && year <= endYear;
                });
            }
        }

        // Sort by filter
        switch (filters.sortBy) {
            case 'rating':
                filtered.sort((a, b) => (b.rating || b.averageRating || 0) - (a.rating || a.averageRating || 0));
                break;
            case 'recent':
                filtered.sort((a, b) => {
                    const yearA = a.publishedDate ? parseInt(a.publishedDate.split('-')[0]) : 0;
                    const yearB = b.publishedDate ? parseInt(b.publishedDate.split('-')[0]) : 0;
                    return yearB - yearA;
                });
                break;
            case 'popular':
                filtered.sort((a, b) => (b.reviewCount || b.ratingsCount || 0) - (a.reviewCount || a.ratingsCount || 0));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                filtered.sort((a, b) => a.author.localeCompare(b.author));
                break;
            default:
                // relevance - keep original order
                break;
        }

        setFilteredResults(filtered);
    }, [results, filters]);

    useEffect(() => {
        setPrevQuery(currentQuery);
    }, [currentQuery]);

    const isNewQueryLoading = loading && currentQuery !== prevQuery;

    return (
        <section className="search-results">
            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                genreOptions={genreOptions}
                genreTranslations={genreTranslations}
            />

            {isNewQueryLoading ? (
                <div className="full-loading-screen">
                    <span className="loading-spinner"></span>
                    <p>Loading results...</p>
                </div>
            ) : filteredResults.length === 0 ? (
                <div>
                    <p>No se encontraron libros con los filtros actuales</p>
                </div>
            ) : (
                <>
                    <div className="results-grid">
                        {filteredResults.map(book => (
                            <BookCard
                                key={book.bookId || book.id}
                                variant={'horizontal'}
                                book={book}
                                handleAddToLibrary={handleAddToLibrary}
                                libraryOptions={libraryOptions}
                                genreTranslations={genreTranslations}
                            />
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', margin: '2em 0' }}>
                        {loading ? (
                            <div>
                                <span className="loading-spinner"></span>
                                <p>Cargando más resultados...</p>
                            </div>
                        ) : (
                            <button
                                className="load-more-btn"
                                onClick={onLoadMore}
                            >
                                Load More
                            </button>
                        )}
                    </div>
                </>
            )}
        </section>
    );
};

export default SearchResults;