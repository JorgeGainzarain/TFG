import React, { useState } from 'react';
import BookCard from '../BookCard/BookCard';
import FilterBar from '../FilterBar/FilterBar';
import './AIRecommendations.css';

const AIRecommendations = ({ user, isAuthenticated, onShowAuth }) => {
    const [filters, setFilters] = useState({
        genre: '',
        year: '',
        sortBy: 'relevance'
    });
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [showAllBooks, setShowAllBooks] = useState(false);

    // Mostrar popup después de un delay si no está autenticado
    React.useEffect(() => {
        if (!isAuthenticated) {
            setShowAuthPrompt(true);
        } else {
            setShowAuthPrompt(false);
        }
    }, [isAuthenticated]);

    // Datos placeholder para recomendaciones de IA
    const allPlaceholderBooks = [
        {
            id: 'ai-rec-1',
            title: 'El Nombre del Viento',
            author: 'Patrick Rothfuss',
            genres: ['Fantasía', 'Aventura', 'Épico'],
            rating: 5,
            reviewCount: 28470,
            coverEmoji: '🌪️',
            publishedDate: '2007',
            thumbnail: ''
        },
        {
            id: 'ai-rec-2',
            title: 'Sapiens',
            author: 'Yuval Noah Harari',
            genres: ['Historia', 'Antropología', 'Ciencia'],
            rating: 5,
            reviewCount: 156780,
            coverEmoji: '🧠',
            publishedDate: '2014',
            thumbnail: ''
        },
        {
            id: 'ai-rec-3',
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            genres: ['Fantasía', 'Aventura', 'Clásico'],
            rating: 5,
            reviewCount: 234560,
            coverEmoji: '🏔️',
            publishedDate: '1937',
            thumbnail: ''
        },
        {
            id: 'ai-rec-4',
            title: 'Educated',
            author: 'Tara Westover',
            genres: ['Biografía', 'Memoir', 'No ficción'],
            rating: 4,
            reviewCount: 87340,
            coverEmoji: '📖',
            publishedDate: '2018',
            thumbnail: ''
        },
        {
            id: 'ai-rec-5',
            title: 'Dune',
            author: 'Frank Herbert',
            genres: ['Ciencia Ficción', 'Épico', 'Aventura'],
            rating: 4,
            reviewCount: 198760,
            coverEmoji: '🏜️',
            publishedDate: '1965',
            thumbnail: ''
        },
        {
            id: 'ai-rec-6',
            title: 'The Psychology of Money',
            author: 'Morgan Housel',
            genres: ['Finanzas', 'Psicología', 'Autoayuda'],
            rating: 5,
            reviewCount: 45670,
            coverEmoji: '💰',
            publishedDate: '2020',
            thumbnail: ''
        },
        {
            id: 'ai-rec-7',
            title: 'Klara and the Sun',
            author: 'Kazuo Ishiguro',
            genres: ['Ficción', 'Ciencia Ficción', 'Drama'],
            rating: 4,
            reviewCount: 32450,
            coverEmoji: '☀️',
            publishedDate: '2021',
            thumbnail: ''
        },
        {
            id: 'ai-rec-8',
            title: 'The Invisible Life of Addie LaRue',
            author: 'V.E. Schwab',
            genres: ['Fantasía', 'Romance', 'Histórico'],
            rating: 4,
            reviewCount: 78920,
            coverEmoji: '🌹',
            publishedDate: '2020',
            thumbnail: ''
        },
        {
            id: 'ai-rec-9',
            title: 'Becoming',
            author: 'Michelle Obama',
            genres: ['Biografía', 'Política', 'Memoir'],
            rating: 5,
            reviewCount: 245670,
            coverEmoji: '👑',
            publishedDate: '2018',
            thumbnail: ''
        },
        {
            id: 'ai-rec-10',
            title: 'The Alchemist',
            author: 'Paulo Coelho',
            genres: ['Ficción', 'Filosofía', 'Inspiracional'],
            rating: 4,
            reviewCount: 189340,
            coverEmoji: '✨',
            publishedDate: '1988',
            thumbnail: ''
        }
    ];

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
                    const year = parseInt(book.publishedDate);
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
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'recent':
                filtered.sort((a, b) => parseInt(b.publishedDate) - parseInt(a.publishedDate));
                break;
            case 'popular':
                filtered.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                filtered.sort((a, b) => a.author.localeCompare(b.author));
                break;
            default:
                // relevance - mantener orden original (algoritmo de IA simulado)
                break;
        }

        return filtered.slice(0, showAllBooks ? 8 : 4); // Mostrar 4 o todos
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
        setShowAuthPrompt(false); // Solo cierra el popup, NO el blur
    };

    const handleShowAuthModal = () => {
        setShowAuthPrompt(false); // Cierra popup
        onShowAuth(); // Abre modal principal
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

                    <div className="cards-grid">
                        {filteredBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                title={book.title}
                                author={book.author}
                                genres={book.genres}
                                rating={book.rating}
                                reviewCount={book.reviewCount}
                                coverEmoji={book.coverEmoji}
                                thumbnail={book.thumbnail}
                                onAddToLibrary={handleAddToLibrary}
                            />
                        ))}
                    </div>

                    {!showAllBooks && filteredBooks.length >= 4 && (
                        <div className="show-more-container">
                            <button
                                className="show-more-btn"
                                onClick={() => setShowAllBooks(true)}
                            >
                                📚 Ver todas las recomendaciones ({getFilteredBooks().length - 4} más)
                            </button>
                        </div>
                    )}

                    {showAllBooks && (
                        <div className="show-less-container">
                            <button
                                className="show-less-btn"
                                onClick={() => setShowAllBooks(false)}
                            >
                                📖 Ver menos recomendaciones
                            </button>
                        </div>
                    )}
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