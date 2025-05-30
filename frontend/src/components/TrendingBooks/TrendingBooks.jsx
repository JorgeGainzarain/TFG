// frontend/src/components/TrendingBooks/TrendingBooks.jsx
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

    // Datos placeholder para libros en tendencia - ahora como objetos completos
    const placeholderBooks = [
        {
            id: 'trending-1',
            title: 'It Ends with Us',
            author: 'Colleen Hoover',
            genres: ['Romance', 'Drama', 'Contemporáneo'],
            categories: ['Romance', 'Drama', 'Contemporáneo'],
            rating: 5,
            averageRating: 5,
            reviewCount: 45230,
            ratingsCount: 45230,
            coverEmoji: '💕',
            thumbnail: '',
            description: 'Una historia emotiva sobre amor, pérdida y encontrar la fuerza para seguir adelante.',
            publishedDate: '2016-08-02',
            pageCount: 384,
            language: 'en'
        },
        {
            id: 'trending-2',
            title: 'The Seven Moons of Maali Almeida',
            author: 'Shehan Karunatilaka',
            genres: ['Ficción', 'Fantasía', 'Premiado'],
            categories: ['Ficción', 'Fantasía', 'Premiado'],
            rating: 4,
            averageRating: 4,
            reviewCount: 18760,
            ratingsCount: 18760,
            coverEmoji: '🌙',
            thumbnail: '',
            description: 'Una obra ganadora del Premio Booker que mezcla realismo mágico con crítica social.',
            publishedDate: '2022-08-25',
            pageCount: 432,
            language: 'en'
        },
        {
            id: 'trending-3',
            title: 'Atomic Habits',
            author: 'James Clear',
            genres: ['Autoayuda', 'Productividad', 'Psicología'],
            categories: ['Autoayuda', 'Productividad', 'Psicología'],
            rating: 5,
            averageRating: 5,
            reviewCount: 89430,
            ratingsCount: 89430,
            coverEmoji: '⚡',
            thumbnail: '',
            description: 'La guía definitiva para formar buenos hábitos y romper los malos.',
            publishedDate: '2018-10-16',
            pageCount: 320,
            language: 'en'
        },
        {
            id: 'trending-4',
            title: 'The Midnight Library',
            author: 'Matt Haig',
            genres: ['Ficción', 'Filosofía', 'Drama'],
            categories: ['Ficción', 'Filosofía', 'Drama'],
            rating: 4,
            averageRating: 4,
            reviewCount: 67890,
            ratingsCount: 67890,
            coverEmoji: '📚',
            thumbnail: '',
            description: 'Una reflexión profunda sobre las decisiones de la vida y las posibilidades infinitas.',
            publishedDate: '2020-08-13',
            pageCount: 288,
            language: 'en'
        },
        {
            id: 'trending-5',
            title: 'Where the Crawdads Sing',
            author: 'Delia Owens',
            genres: ['Ficción', 'Misterio', 'Naturaleza'],
            categories: ['Ficción', 'Misterio', 'Naturaleza'],
            rating: 5,
            averageRating: 5,
            reviewCount: 123450,
            ratingsCount: 123450,
            coverEmoji: '🦆',
            thumbnail: '',
            description: 'Una historia cautivadora sobre soledad, supervivencia y el poder de la naturaleza.',
            publishedDate: '2018-08-14',
            pageCount: 384,
            language: 'en'
        },
        {
            id: 'trending-6',
            title: 'The Silent Patient',
            author: 'Alex Michaelides',
            genres: ['Thriller', 'Psicológico', 'Misterio'],
            categories: ['Thriller', 'Psicológico', 'Misterio'],
            rating: 4,
            averageRating: 4,
            reviewCount: 95670,
            ratingsCount: 95670,
            coverEmoji: '🤫',
            thumbnail: '',
            description: 'Un thriller psicológico que te mantendrá adivinando hasta la última página.',
            publishedDate: '2019-02-05',
            pageCount: 336,
            language: 'en'
        },
        {
            id: 'trending-7',
            title: 'Project Hail Mary',
            author: 'Andy Weir',
            genres: ['Ciencia Ficción', 'Aventura', 'Humor'],
            categories: ['Ciencia Ficción', 'Aventura', 'Humor'],
            rating: 5,
            averageRating: 5,
            reviewCount: 78430,
            ratingsCount: 78430,
            coverEmoji: '🚀',
            thumbnail: '',
            description: 'Una aventura espacial llena de ciencia, humor y supervivencia.',
            publishedDate: '2021-05-04',
            pageCount: 496,
            language: 'en'
        },
        {
            id: 'trending-8',
            title: 'The Thursday Murder Club',
            author: 'Richard Osman',
            genres: ['Misterio', 'Humor', 'Crimen'],
            categories: ['Misterio', 'Humor', 'Crimen'],
            rating: 4,
            averageRating: 4,
            reviewCount: 56780,
            ratingsCount: 56780,
            coverEmoji: '🔍',
            thumbnail: '',
            description: 'Un grupo de jubilados resuelve crímenes en una residencia para ancianos.',
            publishedDate: '2020-09-03',
            pageCount: 368,
            language: 'en'
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

    // DRAG SCROLL FUNCTIONALITY
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
        const walk = (x - startX) * 2;
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
        const walk = (x - startX) * 1.5;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

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
                        <div key={book.id} onClick={handleCardClick} style={{ height: '100%' }}>
                            <BookCard
                                book={book}
                                variant="vertical"
                                showDate={true}
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