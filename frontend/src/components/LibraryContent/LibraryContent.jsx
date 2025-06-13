import React, { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import './LibraryContent.css';

const LibraryContent = ({ userBooks = [], onBookSelect, onAddBook, user, onRefresh }) => {
    const [currentShelf, setCurrentShelf] = useState('all');
    const [currentView, setCurrentView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filteredBooks, setFilteredBooks] = useState([]);

    // Datos de estantes
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
            (safeUserBooks.reduce((acc, book) => acc + (book && book.rating ? book.rating : 0), 0) / safeUserBooks.length).toFixed(1)
            : 0
    };

    // Filtrar libros según estante seleccionado
    useEffect(() => {
        let filtered = [...safeUserBooks];

        // Filtrar por estante
        if (currentShelf !== 'all') {
            if (currentShelf === 'favorites') {
                filtered = filtered.filter(book => book && book.isFavorite === true);
            } else {
                filtered = filtered.filter(book => book && book.status === currentShelf);
            }
        }

        // Filtrar por término de búsqueda
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(book =>
                    book && (
                        (book.title && book.title.toLowerCase().includes(searchLower)) ||
                        (book.authors && book.authors.some(author => author.toLowerCase().includes(searchLower))) ||
                        (book.genre && book.genre.toLowerCase().includes(searchLower))
                    )
            );
        }

        // Ordenar libros
        filtered.sort((a, b) => {
            if (!a || !b) return 0;

            switch (sortBy) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'author':
                    const aAuthor = (a.authors && a.authors[0]) || '';
                    const bAuthor = (b.authors && b.authors[0]) || '';
                    return aAuthor.localeCompare(bAuthor);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'recent':
                default:
                    const aDate = a.addedAt ? new Date(a.addedAt) : new Date(0);
                    const bDate = b.addedAt ? new Date(b.addedAt) : new Date(0);
                    return bDate - aDate;
            }
        });

        setFilteredBooks(filtered);
    }, [safeUserBooks, currentShelf, searchTerm, sortBy]);

    const handleBookSelect = (book) => {
        if (onBookSelect) {
            onBookSelect(book);
        }
    };

    const handleAddToLibrary = (book) => {
        // Esta función se maneja en el BookCard
        console.log('Agregar a biblioteca:', book);
    };

    return (
        <div className="library-content">
            <div className="library-main">
                <div className="library-controls">
                    {/* Shelf Navigation */}
                    <div className="shelf-nav">
                        {Object.entries(shelfData).map(([key, shelf]) => (
                            <button
                                key={key}
                                className={`shelf-btn ${currentShelf === key ? 'active' : ''}`}
                                onClick={() => setCurrentShelf(key)}
                            >
                                <span className="shelf-icon">{shelf.icon}</span>
                                <span className="shelf-label">{shelf.title.replace(/[📚📖📋✅⭐]\s/, '')}</span>
                                <span className="shelf-count">
                                    {key === 'all' ? stats.total : stats[key] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Search and Controls */}
                    <div className="controls-row">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Buscar libros..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="controls-group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="sort-select"
                            >
                                <option value="recent">Agregados recientemente</option>
                                <option value="title">Por título</option>
                                <option value="author">Por autor</option>
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
                                <button
                                    className={`view-btn ${currentView === 'horizontal' ? 'active' : ''}`}
                                    onClick={() => setCurrentView('horizontal')}
                                    title="Vista horizontal"
                                >
                                    ⚏
                                </button>
                            </div>
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
                            currentView === 'horizontal' ? (
                                <div className="cards-grid-horizontal">
                                    {filteredBooks.map((book) => {
                                        if (!book) return null;
                                        return (
                                            <div key={book.id || book.bookId || Math.random()}>
                                                <BookCard
                                                    book={book}
                                                    onBookSelect={handleBookSelect}
                                                    onAddToLibrary={handleAddToLibrary}
                                                    variant="horizontal"
                                                    showDescription={true}
                                                    showDate={true}
                                                    maxGenres={2}
                                                    isInLibrary={true}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : currentView === 'list' ? (
                                filteredBooks.map((book) => {
                                    if (!book) return null;
                                    return (
                                        <BookCard
                                            key={book.id || book.bookId || Math.random()}
                                            book={book}
                                            onBookSelect={handleBookSelect}
                                            onAddToLibrary={handleAddToLibrary}
                                            variant="horizontal"
                                            showDescription={true}
                                            showDate={true}
                                            maxGenres={3}
                                            isInLibrary={true}
                                        />
                                    );
                                })
                            ) : (
                                filteredBooks.map((book) => {
                                    if (!book) return null;
                                    return (
                                        <BookCard
                                            key={book.id || book.bookId || Math.random()}
                                            book={book}
                                            onBookSelect={handleBookSelect}
                                            onAddToLibrary={handleAddToLibrary}
                                            variant="vertical"
                                            showDescription={false}
                                            showDate={false}
                                            maxGenres={2}
                                            isInLibrary={true}
                                        />
                                    );
                                })
                            )
                        ) : (
                            <div className="empty-state">
                                <div className="empty-content">
                                    <div className="empty-icon">📚</div>
                                    <h3 className="empty-title">
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
                            </div>
                        )}
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
                            <span className="stat-number">{stats.total}</span>
                            <span className="stat-label">Total libros</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-number">{stats.read}</span>
                            <span className="stat-label">Completados</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-number">{stats.reading}</span>
                            <span className="stat-label">Leyendo</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-number">{stats.avgRating}</span>
                            <span className="stat-label">Puntuación media</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-number">{stats.favorites}</span>
                            <span className="stat-label">Favoritos</span>
                        </div>
                    </div>
                </div>

                {user && (
                    <div className="user-profile">
                        <h4>👤 Perfil</h4>
                        <div className="profile-info">
                            <p><strong>Nombre:</strong> {user.name || user.email}</p>
                            <p><strong>Miembro desde:</strong> {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryContent;