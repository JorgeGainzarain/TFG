// frontend/src/components/LibraryContent/LibraryContent.jsx
import React, { useState, useEffect } from 'react';
import './LibraryContent.css';

const LibraryContent = ({ userBooks = [], onBookSelect, onAddBook, user }) => {
    const [currentShelf, setCurrentShelf] = useState('all');
    const [currentView, setCurrentView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filteredBooks, setFilteredBooks] = useState([]);

    // Datos de estantes
    const shelfData = {
        all: { title: "📚 Todos los libros", icon: "📚" },
        reading: { title: "📖 Leyendo actualmente", icon: "📖" },
        toread: { title: "📋 Por leer", icon: "📋" },
        read: { title: "✅ Libros leídos", icon: "✅" },
        favorites: { title: "⭐ Mis favoritos", icon: "⭐" }
    };

    // Calcular estadísticas
    const stats = {
        total: userBooks.length,
        reading: userBooks.filter(book => book.status === 'reading').length,
        read: userBooks.filter(book => book.status === 'read').length,
        toread: userBooks.filter(book => book.status === 'toread').length,
        favorites: userBooks.filter(book => book.isFavorite).length,
        totalPages: userBooks.reduce((acc, book) => acc + (book.pageCount || 0), 0),
        avgRating: userBooks.length > 0 ?
            (userBooks.reduce((acc, book) => acc + (book.rating || 0), 0) / userBooks.length).toFixed(1) : 0
    };

    // Filtrar y ordenar libros
    useEffect(() => {
        let filtered = userBooks;

        // Filtrar por estante
        if (currentShelf !== 'all') {
            if (currentShelf === 'favorites') {
                filtered = filtered.filter(book => book.isFavorite);
            } else {
                filtered = filtered.filter(book => book.status === currentShelf);
            }
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(book =>
                book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.authors?.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                book.categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Ordenar libros
        switch (sortBy) {
            case 'title':
                filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
                break;
            case 'author':
                filtered.sort((a, b) => {
                    const authorA = a.authors?.[0] || '';
                    const authorB = b.authors?.[0] || '';
                    return authorA.localeCompare(authorB);
                });
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'progress':
                filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
                break;
            default:
                // Mantener orden original para 'recent'
                break;
        }

        setFilteredBooks(filtered);
    }, [userBooks, currentShelf, searchTerm, sortBy]);

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
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>
                    {i <= rating ? '★' : '☆'}
                </span>
            );
        }
        return stars;
    };

    // Renderizar tarjeta de libro
    const renderBookCard = (book) => {
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
            if (book.categories && book.categories.length > 0) {
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
                key={book.id}
                className="book-card"
                onClick={() => onBookSelect && onBookSelect(book)}
            >
                <div className="book-content">
                    <div className="book-cover">
                        {book.thumbnail ? (
                            <img
                                src={book.thumbnail}
                                alt={book.title}
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
                    <h4 className="book-title">{book.title}</h4>
                    <p className="book-author">{book.authors?.join(', ') || 'Autor desconocido'}</p>

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

    // Estado vacío
    const renderEmptyState = () => (
        <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>
                {searchTerm ? 'No se encontraron libros' : `No tienes libros en ${shelfData[currentShelf].title.toLowerCase()}`}
            </h3>
            <p>
                {searchTerm
                    ? `No hay resultados para "${searchTerm}"`
                    : 'Agrega algunos libros para empezar tu biblioteca'
                }
            </p>
            {searchTerm && (
                <button
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                >
                    Limpiar búsqueda
                </button>
            )}
            {!searchTerm && onAddBook && (
                <button
                    className="add-book-btn"
                    onClick={onAddBook}
                >
                    Buscar libros
                </button>
            )}
        </div>
    );

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
                                        {key === 'all' ? stats.total :
                                            key === 'favorites' ? stats.favorites :
                                                stats[key] || 0}
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
                                ? filteredBooks.map(renderBookCard)
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