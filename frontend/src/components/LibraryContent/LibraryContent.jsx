// ACTUALIZAR frontend/src/components/LibraryContent/LibraryContent.jsx
// Solo cambios en la parte superior del archivo:

import React, { useState, useEffect } from 'react';
import './LibraryContent.css';

// Añadir onRefresh como prop opcional
const LibraryContent = ({ userBooks = [], onBookSelect, onAddBook, user, onRefresh }) => {
    const [currentShelf, setCurrentShelf] = useState('all');
    const [currentView, setCurrentView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filteredBooks, setFilteredBooks] = useState([]);

    // Datos de estantes (añadir más estantes)
    const shelfData = {
        all: { title: "📚 Todos los libros", icon: "📚" },
        reading: { title: "📖 Leyendo", icon: "📖" },
        read: { title: "✅ Completados", icon: "✅" },
        toread: { title: "📋 Por leer", icon: "📋" },
        favorites: { title: "⭐ Favoritos", icon: "⭐" }
    };

    // Asegurar que userBooks es siempre un array
    const safeUserBooks = Array.isArray(userBooks) ? userBooks : [];

    // Calcular estadísticas con manejo de arrays vacíos
    const stats = {
        total: safeUserBooks.length,
        reading: safeUserBooks.filter(book => book && book.status === 'reading').length,
        read: safeUserBooks.filter(book => book && book.status === 'read').length,
        toread: safeUserBooks.filter(book => book && book.status === 'toread').length,
        favorites: safeUserBooks.filter(book => book && book.isFavorite === true).length,
        totalPages: safeUserBooks.reduce((acc, book) => acc + (book && book.pageCount ? book.pageCount : 0), 0),
        avgRating: safeUserBooks.length > 0 ?
            (safeUserBooks.reduce((acc, book) => acc + (book && book.rating ? book.rating : 0), 0) / safeUserBooks.length).toFixed(1) : 0
    };

    // Filtrar y ordenar libros
    useEffect(() => {
        let filtered = [...safeUserBooks]; // Create a copy to avoid mutation

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
    }, [currentShelf, searchTerm, sortBy, safeUserBooks.length]); // Use safeUserBooks

    // ... resto del código se mantiene igual hasta el return

    return (
        <div className="library-container">
            {/* Hero Header */}
            <div className="library-hero">
                <div className="hero-background"></div>
                <div className="hero-header">
                    <h1 className="library-title">Mi Librería Personal</h1>
                    {onRefresh && (
                        <button
                            className="refresh-btn"
                            onClick={onRefresh}
                            title="Actualizar biblioteca"
                        >
                            🔄
                        </button>
                    )}
                </div>
                <p className="library-subtitle">
                    ¡Hola {user?.username || user?.name || 'Usuario'}! Bienvenido a tu espacio de lectura personal.
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

            {/* Main Layout - resto del código igual... */}
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
                                    onClick={() => setCurrentShelf(key)}
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
                                    onClick={() => setCurrentView('grid')}
                                    title="Vista en cuadrícula"
                                >
                                    ⊞
                                </button>
                                <button
                                    className={`view-btn ${currentView === 'list' ? 'active' : ''}`}
                                    onClick={() => setCurrentView('list')}
                                    title="Vista en lista"
                                >
                                    ☰
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
                            {filteredBooks.length > 0 ? (
                                filteredBooks.map((book) => {
                                    // Safety check for book object
                                    if (!book) return null;

                                    return (
                                        <div
                                            key={book.id || book.bookId || Math.random()}
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
                                                        📖
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
                                                        <p className="progress-text">
                                                            {book.progress || 0}% • Página {book.currentPage || 0} de {book.pageCount || 0}
                                                        </p>
                                                    </div>
                                                )}

                                                {book.status === 'read' && book.rating && (
                                                    <div className="book-rating">
                                                        {[1,2,3,4,5].map(star => (
                                                            <span key={star} className={`star ${star <= (book.rating || 0) ? 'filled' : ''}`}>
                                                                {star <= (book.rating || 0) ? '★' : '☆'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {book.isFavorite && (
                                                    <div className="favorite-indicator">⭐</div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                }).filter(card => card !== null)
                            ) : (
                                // Estado vacío
                                <div className="empty-state">
                                    <div className="empty-icon">📚</div>
                                    <h3>
                                        {safeUserBooks.length === 0
                                            ? 'Tu biblioteca está vacía'
                                            : `No tienes libros en ${shelfData[currentShelf].title.replace(/[📚📖📋✅⭐]\s/, '').toLowerCase()}`
                                        }
                                    </h3>
                                    <p>
                                        {safeUserBooks.length === 0
                                            ? 'Agrega algunos libros para empezar tu biblioteca personal'
                                            : 'Agrega libros a este estante para verlos aquí'
                                        }
                                    </p>
                                    {onAddBook && (
                                        <button className="add-book-btn" onClick={onAddBook}>
                                            🔍 Buscar libros
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Sidebar - resto igual */}
                <div className="stats-sidebar">
                    <h3 className="stats-title">📊 Estadísticas de Lectura</h3>

                    {/* Stats cards - código original... */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-content">
                                <span className="stat-number">{stats.totalPages.toLocaleString()}</span>
                                <span className="stat-label">Páginas totales</span>
                            </div>
                        </div>
                        {/* Resto de stat-cards... */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryContent;