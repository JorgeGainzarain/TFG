// frontend/src/components/TrendingBooks/TrendingBooks.jsx
import React, { useRef, useState, useEffect } from 'react';
import { getTrendingBooks } from "../../services/bookService";
import BookCard from '../BookCard/BookCard';
import './TrendingBooks.css';

const TrendingBooks = ({
                           handleAddToLibrary,
                           libraryOptions,
                           genreTranslations
                       }) => {
    const scrollContainerRef = useRef(null);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);
    const [trendingBooks, setTrendingBooks] = useState([]);

    useEffect(() => {
        const fetchTrendingBooks = async () => {
            try {
                const response = await getTrendingBooks();
                if (response && response.data) {
                    setTrendingBooks(response.data);
                } else {
                    console.error('Error al obtener los libros de tendencias:', response);
                }
            } catch (error) {
                console.error('Error al llamar a la API de tendencias:', error);
            }
        };

        fetchTrendingBooks();
    }, []);

    const updateButtonVisibility = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftButton(scrollLeft > 0);
            setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            updateButtonVisibility();
            container.addEventListener('scroll', updateButtonVisibility);
            window.addEventListener('resize', updateButtonVisibility);

            return () => {
                container.removeEventListener('scroll', updateButtonVisibility);
                window.removeEventListener('resize', updateButtonVisibility);
            };
        }
    }, []);

    const scrollLeftBtn = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    };

    const scrollRightBtn = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="section trending-section">
            <div className="section-header">
                <h2 className="section-title">📈 Tendencias</h2>
                <div className="trending-indicators">
                    <span className="trending-badge">
                        🔥Top {trendingBooks.length} libros más populares
                    </span>
                </div>
            </div>

            <div className="scroll-navigation">
                {showLeftButton && (
                    <button
                        className="scroll-btn prev"
                        onClick={scrollLeftBtn}
                        title="Ver anteriores"
                    >
                        ←
                    </button>
                )}

                <div
                    className="cards-grid-horizontal"
                    ref={scrollContainerRef}
                >
                    {trendingBooks.map((book) => (
                        <div key={book.id}>
                            <BookCard
                                book={book}
                                variant="vertical"
                                showDate={true}
                                handleAddToLibrary={handleAddToLibrary}
                                libraryOptions={libraryOptions}
                                hideAddButton={true}
                                genreTranslations={genreTranslations}
                            />
                        </div>
                    ))}
                </div>

                {showRightButton && (
                    <button
                        className="scroll-btn next"
                        onClick={scrollRightBtn}
                        title="Ver siguientes"
                    >
                        →
                    </button>
                )}
            </div>
        </section>
    );
};

export default TrendingBooks;