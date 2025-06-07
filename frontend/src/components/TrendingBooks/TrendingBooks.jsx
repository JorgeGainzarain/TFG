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