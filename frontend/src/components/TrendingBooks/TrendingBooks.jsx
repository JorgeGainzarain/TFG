import React, { useRef, useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import './TrendingBooks.css';

const TrendingBooks = () => {
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

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
        },
        {
            id: 'trending-7',
            title: 'Project Hail Mary',
            author: 'Andy Weir',
            genres: ['Ciencia Ficción', 'Aventura', 'Humor'],
            rating: 5,
            reviewCount: 78430,
            coverEmoji: '🚀',
            thumbnail: ''
        },
        {
            id: 'trending-8',
            title: 'The Thursday Murder Club',
            author: 'Richard Osman',
            genres: ['Misterio', 'Humor', 'Crimen'],
            rating: 4,
            reviewCount: 56780,
            coverEmoji: '🔍',
            thumbnail: ''
        }
    ];

    // Función para actualizar la visibilidad de los botones
    const updateButtonVisibility = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftButton(scrollLeft > 0);
            setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    // Effect para monitorear el scroll y actualizar botones
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            updateButtonVisibility();
            container.addEventListener('scroll', updateButtonVisibility);

            // También actualizar en resize
            window.addEventListener('resize', updateButtonVisibility);

            return () => {
                container.removeEventListener('scroll', updateButtonVisibility);
                window.removeEventListener('resize', updateButtonVisibility);
            };
        }
    }, []);

    const handleAddToLibrary = (book) => {
        console.log('Añadiendo a la librería:', book);
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    // Función para scroll hacia la izquierda
    const scrollLeftBtn = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    };

    // Función para scroll hacia la derecha
    const scrollRightBtn = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    };

    // DRAG SCROLL FUNCTIONALITY

    // Mouse events
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        scrollContainerRef.current.style.cursor = 'grabbing';
        scrollContainerRef.current.style.userSelect = 'none';
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.userSelect = 'auto';
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Multiplica por 2 para mayor sensibilidad
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        scrollContainerRef.current.style.cursor = 'grab';
        scrollContainerRef.current.style.userSelect = 'auto';
    };

    // Touch events para móvil
    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 1.5; // Sensibilidad para touch
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    // Prevenir click en cards cuando se está arrastrando
    const handleCardClick = (e) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
        }
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

            {/* Container con scroll horizontal y drag */}
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
                    className={`cards-grid-horizontal ${isDragging ? 'dragging' : ''}`}
                    ref={scrollContainerRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    {placeholderBooks.map((book) => (
                        <div key={book.id} onClick={handleCardClick}>
                            <BookCard
                                title={book.title}
                                author={book.author}
                                genres={book.genres}
                                rating={book.rating}
                                reviewCount={book.reviewCount}
                                coverEmoji={book.coverEmoji}
                                thumbnail={book.thumbnail}
                                onAddToLibrary={handleAddToLibrary}
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