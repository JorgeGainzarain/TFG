// frontend/src/components/LibraryContent/LibraryContent.jsx
import React, { useState, useEffect } from 'react';
import { getLibrariesFromUser } from "../../services/api";
import './LibraryContent.css';

const LibraryContent = ({ onBookSelect, onAddBook, user }) => {
    const [currentShelf, setCurrentShelf] = useState('all');
    const [currentView, setCurrentView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filteredBooks, setFilteredBooks] = useState([]);

    // Datos de estantes
    const shelfData = {
        all: { title: "📚 Todos los libros", icon: "📚" }
    };

    // Get user books with proper error handling and empty array support
    const getUserBooks = () => {
        try {
            if (!user || !user.id) {
                return [];
            }

            let libraries = [];
            getLibrariesFromUser(user.id).then(
                (data) => {
                    libraries = data || [];
                }
            )

            console.log('Libraries:', libraries); // Debugging line to check libraries


            const userBooks = [];

            for (const library of libraries) {
                // Handle different possible structures for books in library
                if (library.bookIds && Array.isArray(library.bookIds)) {
                    userBooks.push(...library.bookIds);
                } else if (library.books && Array.isArray(library.books)) {
                    userBooks.push(...library.books);
                } else if (Array.isArray(library)) {
                    // In case the library itself is an array of books
                    userBooks.push(...library);
                }
            }

            return userBooks;
        } catch (error) {
            console.error('Error getting user books:', error);
            return [];
        }
    };

    const userBooks = getUserBooks();

    // Calcular estadísticas con manejo de arrays vacíos
    const stats = {
        total: userBooks.length,
        reading: userBooks.filter(book => book && book.status === 'reading').length,
        read: userBooks.filter(book => book && book.status === 'read').length,
        toread: userBooks.filter(book => book && book.status === 'toread').length,
        favorites: userBooks.filter(book => book && book.isFavorite === true).length,
        totalPages: userBooks.reduce((acc, book) => acc + (book && book.pageCount ? book.pageCount : 0), 0),
        avgRating: userBooks.length > 0 ?
            (userBooks.reduce((acc, book) => acc + (book && book.rating ? book.rating : 0), 0) / userBooks.length).toFixed(1) : 0
    };

    // Filtrar y ordenar libros
    useEffect(() => {
        let filtered = [...userBooks]; // Create a copy to avoid mutation

        // Handle empty books array
        if (!Array.isArray(filtered) || filtered.length === 0) {
            setFilteredBooks([]);
            return;
        }

        // Filter out any null or undefined books
        filtered = filtered.filter(book => book != null);

        // Filtrar por estante
        if (currentShelf !== 'all') {
            if (currentShelf === 'favorites') {
                filtered = filtered.filter(book => book.isFavorite === true);
            } else {
                filtered = filtered.filter(book => book.status === currentShelf);
            }
        }

        // Filtrar por búsqueda
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(book => {
                if (!book) return false;

                const titleMatch = book.title && book.title.toLowerCase().includes(searchLower);
                const authorMatch = book.authors && Array.isArray(book.authors) &&
                    book.authors.some(author => author && author.toLowerCase().includes(searchLower));
                const categoryMatch = book.categories && Array.isArray(book.categories) &&
                    book.categories.some(cat => cat && cat.toLowerCase().includes(searchLower));

                return titleMatch || authorMatch || categoryMatch;
            });
        }

        // Ordenar libros
        switch (sortBy) {
            case 'title':
                filtered.sort((a, b) => {
                    const titleA = a && a.title ? a.title : '';
                    const titleB = b && b.title ? b.title : '';
                    return titleA.localeCompare(titleB);
                });
                break;
            case 'author':
                filtered.sort((a, b) => {
                    const authorA = a && a.authors && a.authors[0] ? a.authors[0] : '';
                    const authorB = b && b.authors && b.authors[0] ? b.authors[0] : '';
                    return authorA.localeCompare(authorB);
                });
                break;
            case 'rating':
                filtered.sort((a, b) => {
                    const ratingA = a && a.rating ? a.rating : 0;
                    const ratingB = b && b.rating ? b.rating : 0;
                    return ratingB - ratingA;
                });
                break;
            case 'progress':
                filtered.sort((a, b) => {
                    const progressA = a && a.progress ? a.progress : 0;
                    const progressB = b && b.progress ? b.progress : 0;
                    return progressB - progressA;
                });
                break;
            default:
                // Mantener orden original para 'recent'
                break;
        }

        setFilteredBooks(filtered);
    }, [currentShelf, searchTerm, sortBy, userBooks.length]); // Add userBooks.length as dependency

    // Cambiar estante
    const switchShelf = (shelf) => {
        setCurrentShelf(shelf);
    };

    // Cambiar vista
    const switchView = (view) => {
        setCurrentView(view);
    };

    // Renderizar estrellas
    const renderStars = (rating) => {
        const stars = [];
        const numRating = rating || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= numRating ? 'filled' : ''}`}>
                    {i <= numRating ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    // Renderizar tarjeta de libro
    const renderBookCard = (book) => {
        // Safety check for book object
        if (!book) {
            return null;
        }

        const getStatusText = () => {
            switch (book.status) {
                case 'reading':
                    return `${book.progress || 0}% • Página ${book.currentPage || 0} de ${book.pageCount || 0}`;
                case 'read':
                    return '✅ Completado';
                case 'toread':
                    return '📋 En lista de lectura';
                default:
                    return 'Sin estado';
            }
        };

        const getBookEmoji = (book) => {
            if (book.categories && Array.isArray(book.categories) && book.categories.length > 0) {
                const category = book.categories[0].toLowerCase();
                if (category.includes('fantasy')) return '🏰';
                if (category.includes('science')) return '🚀';
                if (category.includes('romance')) return '💕';
                if (category.includes('mystery')) return '🔍';
                if (category.includes('horror')) return '👻';
                if (category.includes('history')) return '📜';
                if (category.includes('biography')) return '👤';
                if (category.includes('business')) return '💼';
            }
            return '📖';
        };

        return (
            <div
                key={book.id || Math.random()} // Fallback key if book.id is missing
                className="book-card"
                onClick={() => onBookSelect && onBookSelect(book)}
            >
                <div className="book-content">
                    <div className="book-cover">
                        {book.thumbnail ? (
                            <img
                                src={book.thumbnail}
                                alt={book.title || 'Book cover'}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className="book-cover-fallback" style={{display: book.thumbnail ? 'none' : 'flex'}}>
                            {getBookEmoji(book)}
                        </div>
                    </div>
                    <h4 className="book-title">{book.title || 'Título no disponible'}</h4>
                    <p className="book-author">
                        {book.authors && Array.isArray(book.authors) && book.authors.length > 0
                            ? book.authors.join(', ')
                            : 'Autor desconocido'
                        }
                    </p>

                    {book.status === 'reading' && (
                        <div className="book-progress-section">
                            <div className="book-progress">
                                <div
                                    className="progress-fill"
                                    style={{width: `${book.progress || 0}%`}}
                                ></div>
                            </div>
                            <p className="progress-text">{getStatusText()}</p>
                        </div>
                    )}

                    {book.status === 'read' && book.rating && (
                        <div className="book-rating">
                            {renderStars(book.rating)}
                        </div>
                    )}

                    {book.status !== 'reading' && (
                        <p className="progress-text">{getStatusText()}</p>
                    )}

                    {book.isFavorite && (
                        <div className="favorite-indicator">⭐</div>
                    )}
                </div>
            </div>
        );
    };

    // Estado vacío mejorado
    const renderEmptyState = () => {
        const getEmptyMessage = () => {
            if (searchTerm && searchTerm.trim() !== '') {
                return {
                    title: 'No se encontraron libros',
                    message: `No hay resultados para "${searchTerm}"`,
                    showClearSearch: true,
                    showAddBook: false
                };
            }

            if (currentShelf === 'all' && userBooks.length === 0) {
                return {
                    title: 'Tu biblioteca está vacía',
                    message: 'Agrega algunos libros para empezar tu biblioteca personal',
                    showClearSearch: false,
                    showAddBook: true
                };
            }

            return {
                title: `No tienes libros en ${shelfData[currentShelf].title.replace(/[📚📖📋✅⭐]\s/, '').toLowerCase()}`,
                message: currentShelf === 'favorites'
                    ? 'Marca algunos libros como favoritos para verlos aquí'
                    : `Agrega libros con estado "${currentShelf}" para verlos en este estante`,
                showClearSearch: false,
                showAddBook: true
            };
        };

        const emptyInfo = getEmptyMessage();

        return (
            <div className="empty-state">
                <div className="empty-icon">📚</div>
                <h3>{emptyInfo.title}</h3>
                <p>{emptyInfo.message}</p>

                {emptyInfo.showClearSearch && (
                    <button
                        className="clear-search-btn"
                        onClick={() => setSearchTerm('')}
                    >
                        Limpiar búsqueda
                    </button>
                )}

                {emptyInfo.showAddBook && onAddBook && (
                    <button
                        className="add-book-btn"
                        onClick={onAddBook}
                    >
                        Buscar libros
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="library-container">
            {/* Hero Header */}
            <div className="library-hero">
                <div className="hero-background"></div>
                <h1 className="library-title">Mi Librería Personal</h1>
                <p className="library-subtitle">
                    ¡Hola {user?.name || 'Usuario'}! Bienvenido a tu espacio de lectura personal.
                    Aquí puedes gestionar y disfrutar de tu colección de libros.
                </p>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.total}</span>
                        <span className="hero-stat-label">Total Libros</span>
                    </div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.reading}</span>
                        <span className="hero-stat-label">Leyendo</span>
                    </div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.read}</span>
                        <span className="hero-stat-label">Completados</span>
                    </div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.toread}</span>
                        <span className="hero-stat-label">Por Leer</span>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="library-main">
                {/* Library Content */}
                <div className="library-content">
                    {/* Navigation */}
                    <div className="library-nav">
                        <div className="nav-tabs">
                            {Object.entries(shelfData).map(([key, data]) => (
                                <button
                                    key={key}
                                    className={`nav-tab ${currentShelf === key ? 'active' : ''}`}
                                    onClick={() => switchShelf(key)}
                                >
                                    <span className="tab-icon">{data.icon}</span>
                                    <span className="tab-label">{data.title.replace(/[📚📖📋✅⭐]\s/, '')}</span>
                                    <span className="tab-count">
                                        {key === 'all' ? stats.total : stats[key] || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="library-controls">
                        <div className="controls-grid">
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Buscar libros por título, autor o género..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <span className="search-icon">🔍</span>
                            </div>

                            <select
                                className="sort-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recent">Agregados recientemente</option>
                                <option value="title">Por título A-Z</option>
                                <option value="author">Por autor A-Z</option>
                                <option value="progress">Por progreso</option>
                                <option value="rating">Por puntuación</option>
                            </select>

                            <div className="view-controls">
                                <button
                                    className={`view-btn ${currentView === 'grid' ? 'active' : ''}`}
                                    onClick={() => switchView('grid')}
                                    title="Vista en cuadrícula"
                                >
                                    ⊞
                                </button>
                                <button
                                    className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
                                    onClick={() => switchView('list')}
                                    title="Vista en lista"
                                >
                                    ☰
                                </button>
                                <button
                                    className={`view-btn ${currentView === 'horizontal' ? 'active' : ''}`}
                                    onClick={() => switchView('horizontal')}
                                    title="Vista horizontal"
                                >
                                    ↔
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bookshelf */}
                    <div className="bookshelf">
                        <div className="shelf-header">
                            <h3 className="shelf-title">
                                {shelfData[currentShelf].title}
                            </h3>
                            <span className="book-count">
                                {filteredBooks.length} libro{filteredBooks.length !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Books Grid */}
                        <div className={`books-grid ${currentView}`}>
                            {filteredBooks.length > 0
                                ? filteredBooks.map(renderBookCard).filter(card => card !== null)
                                : renderEmptyState()
                            }
                        </div>
                    </div>
                </div>

                {/* Statistics Sidebar */}
                <div className="stats-sidebar">
                    <h3 className="stats-title">📊 Estadísticas de Lectura</h3>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">{stats.totalPages.toLocaleString()}</span>
                                <span className="stat-label">Páginas totales</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">{Math.round(stats.totalPages / 60)}h</span>
                                <span className="stat-label">Tiempo estimado</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">{stats.avgRating}</span>
                                <span className="stat-label">Rating promedio</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">{stats.favorites}</span>
                                <span className="stat-label">Favoritos</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">7 días</span>
                                <span className="stat-label">Racha actual</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">{((stats.read / Math.max(stats.total, 1)) * 100).toFixed(0)}%</span>
                                <span className="stat-label">Completado</span>
                            </div>
                        </div>
                    </div>

                    <div className="reading-goal">
                        <h4 className="goal-title">🎯 Meta Anual 2024</h4>
                        <div className="goal-progress">
                            <div className="goal-bar">
                                <div
                                    className="goal-fill"
                                    style={{width: `${Math.min((stats.read / 15) * 100, 100)}%`}}
                                ></div>
                            </div>
                            <p className="goal-text">{stats.read} de 15 libros completados</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryContent;