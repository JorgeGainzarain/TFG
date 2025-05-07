import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import BookLabel from './book';
import InfiniteScroll from 'react-infinite-scroll-component';
import './search.css';

const Search = () => {
    const [books, setBooks] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ genre: '', year: '' });
    const [sortOption, setSortOption] = useState('title');

    var i = 1;

    const fetchBooks = (page = 1) => {
        const startIndex = i;
        i += 10;
        const newBooks = Array.from({ length: 10 }, (_, i) => ({
            id: startIndex + i,
            title: `Book ${startIndex + i}`,
            author: `Author ${startIndex + i}`,
            genres: ['Genre1', 'Genre2'],
            year: 2000 + ((startIndex + i) % 24),
            rating: Math.floor(Math.random() * 5) + 1,
        }));

        setBooks((prevBooks) => {
            const uniqueBooks = [...prevBooks];
            newBooks.forEach((book) => {
                if (!uniqueBooks.some((b) => b.id === book.id)) {
                    uniqueBooks.push(book);
                }
            });
            if (uniqueBooks.length >= 100) {
                setHasMore(false);
            }
            return uniqueBooks.sort((a, b) => a.id - b.id);
        });
    };

    useEffect(() => {
        fetchBooks(currentPage);
    }, [currentPage]);

    const loadMoreBooks = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const sortedBooks = [...books]
        .filter((book) => {
            if (filters.genre && !book.genres.includes(filters.genre)) return false;
            return !(filters.year && book.year.toString() !== filters.year);

        })
        .sort((a, b) => {
            if (sortOption === 'title') return a.title.localeCompare(b.title);
            if (sortOption === 'year') return b.year - a.year;
            if (sortOption === 'rating') return b.rating - a.rating;
            return 0;
        });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    const handleSortChange = (e) => {
        setSortOption(e.target.value);
    };

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
                next={loadMoreBooks}
                hasMore={hasMore}
                loader={<h4>Loading...</h4>}
                endMessage={<p>No more books to display</p>}
            >
                <div className="book-list">
                    {sortedBooks.map((book) => (
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