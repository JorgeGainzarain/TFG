// frontend/src/componentes/search.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import BookLabel from './book';
import InfiniteScroll from 'react-infinite-scroll-component';
import './search.css';

const Search = () => {
    const [books, setBooks] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({ genre: '', year: '' });
    const [sortOption, setSortOption] = useState('title');

    // Simulate fetching books
    const fetchBooks = (page = 1) => {
        // Replace this with an actual API call
        const newBooks = Array.from({ length: 10 }, (_, i) => ({
            id: page * 10 + i,
            title: `Book ${page * 10 + i}`,
            author: `Author ${page * 10 + i}`,
            genres: ['Genre1', 'Genre2'],
            year: 2020 + (i % 3),
            rating: Math.floor(Math.random() * 5) + 1,
        }));

        setBooks((prevBooks) => [...prevBooks, ...newBooks]);
        //if (page === 5) setHasMore(false); // Simulate end of data
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

    const sortedBooks = [...books].sort((a, b) => {
        if (sortOption === 'title') return a.title.localeCompare(b.title);
        if (sortOption === 'year') return b.year - a.year;
        if (sortOption === 'rating') return b.rating - a.rating;
        return 0;
    });

    return (
        <div className="search-container">
            <Navbar />
            <div className="filters">
                <select name="genre" onChange={handleFilterChange}>
                    <option value="">All Genres</option>
                    <option value="Genre1">Genre1</option>
                    <option value="Genre2">Genre2</option>
                </select>
                <select name="year" onChange={handleFilterChange}>
                    <option value="">All Years</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                </select>
                <select onChange={handleSortChange}>
                    <option value="title">Sort by Title</option>
                    <option value="year">Sort by Year</option>
                    <option value="rating">Sort by Rating</option>
                </select>
            </div>
            <InfiniteScroll
                dataLength={books.length}
                next={() => fetchBooks(Math.ceil(books.length / 10) + 1)}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={<p>No more books to display</p>}
            >
                <div className="book-list">
                    {sortedBooks
                        .filter((book) => {
                            if (filters.genre && !book.genres.includes(filters.genre)) return false;
                            if (filters.year && book.year.toString() !== filters.year) return false;
                            return true;
                        })
                        .map((book) => (
                            <BookLabel
                                key={book.id}
                                title={book.title}
                                author={book.author}
                                genres={book.genres}
                                year={book.year}
                                rating={book.rating}
                                variant="default"
                            />
                        ))}
                </div>
            </InfiniteScroll>
        </div>
    );
};

export default Search;