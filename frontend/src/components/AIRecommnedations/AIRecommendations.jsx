// frontend/src/components/AIRecommnedations/AIRecommendations.jsx
import React, { useState, useRef, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './AIRecommendations.css';

const AIRecommendations = ({ user, isAuthenticated, onShowAuth, genreOptions, genreTranslations }) => {
    const scrollContainerRef = useRef(null);
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance'
    });
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

    // Mostrar popup después de un delay si no está autenticado
    React.useEffect(() => {
        if (!isAuthenticated) {
            setShowAuthPrompt(true);
        } else {
            setShowAuthPrompt(false);
        }
    }, [isAuthenticated]);

    // Datos placeholder para recomendaciones de IA - ahora como objetos completos
    const allPlaceholderBooks = [
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

    // Filtrar y ordenar libros basado en los filtros
    const getFilteredBooks = () => {
        let filtered = [...allPlaceholderBooks];

        // Aplicar filtro de género
        if (filters.genre) {
            const genreMap = {
                'ficcion': ['Ficción', 'Drama'],
                'no-ficcion': ['No ficción', 'Biografía', 'Historia', 'Ciencia'],
                'fantasia': ['Fantasía'],
                'romance': ['Romance'],
                'misterio': ['Misterio', 'Thriller'],
                'ciencia-ficcion': ['Ciencia Ficción'],
                'autoayuda': ['Autoayuda', 'Psicología', 'Finanzas'],
                'drama': ['Drama'],
                'historico': ['Histórico', 'Historia']
            };

            const targetGenres = genreMap[filters.genre] || [filters.genre];
            filtered = filtered.filter(book =>
                book.genres.some(genre =>
                    targetGenres.some(target =>
                        genre.toLowerCase().includes(target.toLowerCase())
                    )
                )
            );
        }

        // Aplicar filtro de año
        if (filters.year) {
            if (filters.year === 'clasicos') {
                filtered = filtered.filter(book => {
                    const year = parseInt(book.publishedDate.split('-')[0]);
                    return year < 2000;
                });
            } else {
                filtered = filtered.filter(book =>
                    book.publishedDate.includes(filters.year)
                );
            }
        }

        // Aplicar ordenamiento
        switch (filters.sortBy) {
            case 'rating':
                filtered.sort((a, b) => (b.rating || b.averageRating) - (a.rating || a.averageRating));
                break;
            case 'recent':
                filtered.sort((a, b) => {
                    const yearA = parseInt(a.publishedDate.split('-')[0]);
                    const yearB = parseInt(b.publishedDate.split('-')[0]);
                    return yearB - yearA;
                });
                break;
            case 'popular':
                filtered.sort((a, b) => (b.reviewCount || b.ratingsCount) - (a.reviewCount || a.ratingsCount));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                filtered.sort((a, b) => a.author.localeCompare(b.author));
                break;
            default:
                // relevance - mantener orden original
                break;
        }

        return filtered;
    };

    const filteredBooks = getFilteredBooks();

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleAddToLibrary = (book) => {
        if (!isAuthenticated) {
            setShowAuthPrompt(true);
            return;
        }
        console.log('Añadiendo a la librería:', book);
        alert(`"${book.title}" será añadido a tu librería (funcionalidad pendiente)`);
    };

    const resetFilters = () => {
        setFilters({
            genre: '',
            year: '',
            sortBy: 'relevance'
        });
    };

    const handleCloseAuth = () => {
        setShowAuthPrompt(false);
    };

    const handleShowAuthModal = () => {
        setShowAuthPrompt(false);
        onShowAuth();
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
        <section className="ai-section">
            <div className="ai-header">
                <h2 className="ai-title">🤖 Recomendaciones Personalizadas</h2>
                {isAuthenticated && (
                    <div className="ai-badges">
                        <span className="user-badge">
                            👤 Para {user?.name}
                        </span>
                    </div>
                )}
                <p className="ai-description">
                    {isAuthenticated
                        ? `Hola ${user?.name}! Estas son tus recomendaciones personalizadas basadas en tus preferencias`
                        : 'Descubre libros increíbles seleccionados especialmente para ti'
                    }
                </p>
            </div>

            <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                genreOptions={genreOptions}
                genreTranslations={genreTranslations}
            />

            {filteredBooks.length > 0 ? (
                <>
                    <div className="ai-results-info">
                        <p className="results-count">
                            🎯 {filteredBooks.length} recomendaciones {isAuthenticated ? 'personalizadas' : 'disponibles'}
                        </p>
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
                            {filteredBooks.map((book) => (
                                <div key={book.id} onClick={handleCardClick} style={{ height: '100%' }}>
                                    <BookCard
                                        book={book}
                                        variant="vertical"
                                        showDate={true}
                                        onAddToLibrary={handleAddToLibrary}
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
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>📚 No se encontraron recomendaciones con los filtros actuales.</p>
                    <button className="reset-filters-btn" onClick={resetFilters}>
                        🗑️ Limpiar filtros
                    </button>
                </div>
            )}

            {/* Blur PERMANENTE - Siempre presente si no está logueado */}
            {!isAuthenticated && (
                <div className="ai-blur-backdrop-permanent" />
            )}

            {/* Auth Popup - Aparece/desaparece sobre el blur */}
            {showAuthPrompt && !isAuthenticated && (
                <div className="ai-auth-popup">
                    <div className="ai-auth-card">
                        <div className="ai-auth-content">
                            <div className="ai-auth-icon">🤖✨</div>
                            <h3 className="ai-auth-title">
                                ¡Desbloquea recomendaciones personalizadas!
                            </h3>
                            <p className="ai-auth-description">
                                Crea una cuenta para que nuestra IA aprenda tus gustos y te recomiende libros perfectos para ti.
                            </p>

                            <div className="ai-auth-features">
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">🎯</span>
                                    <span>Recomendaciones ultra-personalizadas</span>
                                </div>
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">📚</span>
                                    <span>Organiza tu librería personal</span>
                                </div>
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">⚡</span>
                                    <span>Sincronización automática</span>
                                </div>
                            </div>

                            <div className="ai-auth-actions">
                                <button
                                    className="ai-auth-btn primary"
                                    onClick={handleShowAuthModal}
                                >
                                    🚀 Crear cuenta gratis
                                </button>
                                <button
                                    className="ai-auth-btn secondary"
                                    onClick={handleShowAuthModal}
                                >
                                    🔑 Iniciar sesión
                                </button>
                            </div>

                            <p className="ai-auth-note">
                                ⏱️ Solo toma 30 segundos • 🔒 100% seguro
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AIRecommendations;