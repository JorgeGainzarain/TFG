// frontend/src/components/AIRecommnedations/AIRecommendations.jsx
import React, { useState, useRef, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './AIRecommendations.css';

const AIRecommendations = ({ user, isAuthenticated, onShowAuth }) => {
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
        {
            id: 'ai-rec-1',
            title: 'El Nombre del Viento',
            author: 'Patrick Rothfuss',
            genres: ['Fantasía', 'Aventura', 'Épico'],
            categories: ['Fantasía', 'Aventura', 'Épico'],
            rating: 5,
            averageRating: 5,
            reviewCount: 28470,
            ratingsCount: 28470,
            coverEmoji: '🌪️',
            publishedDate: '2007-03-27',
            thumbnail: '',
            description: 'Una historia épica sobre un joven héroe y su búsqueda de la verdad.',
            isPlaceholder: true,
            pageCount: 662,
            language: 'es'
        },
        {
            id: 'ai-rec-2',
            title: 'Sapiens',
            author: 'Yuval Noah Harari',
            genres: ['Historia', 'Antropología', 'Ciencia'],
            categories: ['Historia', 'Antropología', 'Ciencia'],
            rating: 5,
            averageRating: 5,
            reviewCount: 156780,
            ratingsCount: 156780,
            coverEmoji: '🧠',
            publishedDate: '2014-09-04',
            thumbnail: '',
            description: 'Una mirada fascinante a la historia de la humanidad.',
            isPlaceholder: true,
            pageCount: 443,
            language: 'es'
        },
        {
            id: 'ai-rec-3',
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            genres: ['Fantasía', 'Aventura', 'Clásico'],
            categories: ['Fantasía', 'Aventura', 'Clásico'],
            rating: 5,
            averageRating: 5,
            reviewCount: 234560,
            ratingsCount: 234560,
            coverEmoji: '🏔️',
            publishedDate: '1937-09-21',
            thumbnail: '',
            description: 'La aventura que cambió la literatura fantástica para siempre.',
            isPlaceholder: true,
            pageCount: 310,
            language: 'en'
        },
        {
            id: 'ai-rec-4',
            title: 'Educated',
            author: 'Tara Westover',
            genres: ['Biografía', 'Memoir', 'No ficción'],
            categories: ['Biografía', 'Memoir', 'No ficción'],
            rating: 4,
            averageRating: 4,
            reviewCount: 87340,
            ratingsCount: 87340,
            coverEmoji: '📖',
            publishedDate: '2018-02-20',
            thumbnail: '',
            description: 'Una poderosa historia sobre educación y superación personal.',
            isPlaceholder: true,
            pageCount: 334,
            language: 'en'
        },
        {
            id: 'ai-rec-5',
            title: 'Dune',
            author: 'Frank Herbert',
            genres: ['Ciencia Ficción', 'Épico', 'Aventura'],
            categories: ['Ciencia Ficción', 'Épico', 'Aventura'],
            rating: 4,
            averageRating: 4,
            reviewCount: 198760,
            ratingsCount: 198760,
            coverEmoji: '🏜️',
            publishedDate: '1965-08-01',
            thumbnail: '',
            description: 'La obra maestra de la ciencia ficción que definió un género.',
            isPlaceholder: true,
            pageCount: 688,
            language: 'en'
        },
        {
            id: 'ai-rec-6',
            title: 'The Psychology of Money',
            author: 'Morgan Housel',
            genres: ['Finanzas', 'Psicología', 'Autoayuda'],
            categories: ['Finanzas', 'Psicología', 'Autoayuda'],
            rating: 5,
            averageRating: 5,
            reviewCount: 45670,
            ratingsCount: 45670,
            coverEmoji: '💰',
            publishedDate: '2020-09-08',
            thumbnail: '',
            description: 'Perspectivas únicas sobre la relación entre dinero y comportamiento.',
            isPlaceholder: true,
            pageCount: 256,
            language: 'en'
        },
        {
            id: 'ai-rec-7',
            title: 'Klara and the Sun',
            author: 'Kazuo Ishiguro',
            genres: ['Ficción', 'Ciencia Ficción', 'Drama'],
            categories: ['Ficción', 'Ciencia Ficción', 'Drama'],
            rating: 4,
            averageRating: 4,
            reviewCount: 32450,
            ratingsCount: 32450,
            coverEmoji: '☀️',
            publishedDate: '2021-03-02',
            thumbnail: '',
            description: 'Una reflexión conmovedora sobre amor, familia y humanidad.',
            isPlaceholder: true,
            pageCount: 303,
            language: 'en'
        },
        {
            id: 'ai-rec-8',
            title: 'The Invisible Life of Addie LaRue',
            author: 'V.E. Schwab',
            genres: ['Fantasía', 'Romance', 'Histórico'],
            categories: ['Fantasía', 'Romance', 'Histórico'],
            rating: 4,
            averageRating: 4,
            reviewCount: 78920,
            ratingsCount: 78920,
            coverEmoji: '🌹',
            publishedDate: '2020-10-06',
            thumbnail: '',
            description: 'Una historia mágica sobre memoria, amor y el precio de la inmortalidad.',
            isPlaceholder: true,
            pageCount: 560,
            language: 'en'
        },
        {
            id: 'ai-rec-9',
            title: 'Becoming',
            author: 'Michelle Obama',
            genres: ['Biografía', 'Política', 'Memoir'],
            categories: ['Biografía', 'Política', 'Memoir'],
            rating: 5,
            averageRating: 5,
            reviewCount: 245670,
            ratingsCount: 245670,
            coverEmoji: '👑',
            publishedDate: '2018-11-13',
            thumbnail: '',
            description: 'Las memorias inspiradoras de una de las primeras damas más influyentes.',
            isPlaceholder: true,
            pageCount: 448,
            language: 'en'
        },
        {
            id: 'ai-rec-10',
            title: 'The Alchemist',
            author: 'Paulo Coelho',
            genres: ['Ficción', 'Filosofía', 'Inspiracional'],
            categories: ['Ficción', 'Filosofía', 'Inspiracional'],
            rating: 4,
            averageRating: 4,
            reviewCount: 189340,
            ratingsCount: 189340,
            coverEmoji: '✨',
            publishedDate: '1988-01-01',
            thumbnail: '',
            description: 'Una fábula sobre seguir nuestros sueños y encontrar nuestro destino.',
            isPlaceholder: true,
            pageCount: 163,
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

            <FilterBar filters={filters} onFilterChange={handleFilterChange} />

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