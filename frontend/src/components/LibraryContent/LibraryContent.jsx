import React, { useState, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import './LibraryContent.css';

const LibraryContent = ({ userBooks = [], handleAddToLibrary, libraryOptions, onBookSelect, onAddBook, user }) => {
    const [currentShelf, setCurrentShelf] = useState('all');
    const [currentView, setCurrentView] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [flatBooks, setFlatBooks] = useState([]);

    const fullLibraryOptions = [{ id: 'all', title: 'Todos' }, ...libraryOptions];
    const shelfMap = fullLibraryOptions.reduce((acc, shelf) => {
        acc[shelf.id] = shelf;
        acc[shelf.title] = shelf; // para buscar por nombre también
        return acc;
    }, {});

    const flattenBooks = (userBooks) => {
        return userBooks.flatMap(shelf =>
            Array.isArray(shelf.books)
                ? shelf.books.map(book => ({
                    ...book,
                    status: shelf.title,
                }))
                : []
        );
    };

    const getStats = (books) => {
        return {
            Todos: books.length,
            Leyendo: books.filter(book => book.status === 'Leyendo').length,
            Completados: books.filter(book => book.status === 'Completados').length,
            "Por Leer": books.filter(book => book.status === 'Por Leer').length,
            Favoritos: books.filter(book => book.status === "Favoritos").length,
            totalPages: books.reduce((acc, book) => acc + (book.pageCount || 0), 0),
            avgRating: books.length > 0
                ? (books.reduce((acc, book) => acc + (book.rating || 0), 0) / books.length).toFixed(1)
                : 0
        };
    };

    const [stats, setStats] = useState(getStats([]));

    useEffect(() => {
        const flattened = flattenBooks(userBooks);

        // Eliminar duplicados por ID
        const uniqueBooks = flattened.filter(
            (book, index, self) =>
                book && book.id &&
                index === self.findIndex(b => b.id === book.id)
        );

        setFlatBooks(uniqueBooks);
        setStats(getStats(uniqueBooks));
    }, [userBooks]);

    useEffect(() => {
        let books = [...flatBooks];

        if (currentShelf !== 'all') {
            books = books.filter(book => book.status === shelfMap[currentShelf]?.title);
        }

        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            books = books.filter(book =>
                (book.title && book.title.toLowerCase().includes(search)) ||
                (book.authors && book.authors.some(author => author.toLowerCase().includes(search))) ||
                (book.genre && book.genre.toLowerCase().includes(search))
            );
        }

        books.sort((a, b) => {
            if (!a || !b) return 0;
            switch (sortBy) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'author':
                    return (a.authors?.[0] || '').localeCompare(b.authors?.[0] || '');
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'recent':
                default:
                    return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
            }
        });

        setFilteredBooks(books);
    }, [flatBooks, currentShelf, searchTerm, sortBy]);

    const handleBookSelect = (book) => {
        if (onBookSelect) onBookSelect(book);
    };

    return (
        <div className="library-content">
            <div className="library-main">
                <div className="library-controls">
                    <div className="shelf-nav">
                        {fullLibraryOptions.map(shelf => (
                            <button
                                key={shelf.id}
                                className={`shelf-btn ${currentShelf === shelf.title || currentShelf === shelf.id ? 'active' : ''}`}
                                onClick={() => setCurrentShelf(shelf.id)}
                            >
                                <span className="shelf-label">{shelf.title}</span>
                                <span className="shelf-count">
                                    {shelf.id === 'all' ? stats.Todos : stats[shelf.title] || 0}
                                </span>
                            </button>
                        ))}
                    </div>

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
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bookshelf">
                    <div className="shelf-header">
                        <h3 className="shelf-title">
                            {currentShelf === 'all'
                                ? 'Todos los libros'
                                : shelfMap[currentShelf]?.title || ''}
                        </h3>
                        <span className="book-count">
                            {filteredBooks.length} libro{filteredBooks.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    <div className={`books-grid ${currentView}`}>
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                                <BookCard
                                    key={book.id || book.bookId}
                                    book={book}
                                    onBookSelect={handleBookSelect}
                                    libraryOptions={libraryOptions}
                                    handleAddToLibrary={handleAddToLibrary}
                                    variant={currentView === 'list' ? 'horizontal' : 'vertical'}
                                    showDescription={false}
                                    showDate={currentView !== 'grid'}
                                    maxGenres={2}
                                    isInLibrary={true}
                                />
                            ))
                        ) : (
                            <div className="empty-state">
                                <div className="empty-content">
                                    <div className="empty-icon">📚</div>
                                    <h3 className="empty-title">
                                        {flatBooks.length === 0
                                            ? 'Tu biblioteca está vacía'
                                            : `No tienes libros en ${shelfMap[currentShelf]?.title || ''}`}
                                    </h3>
                                    <p>
                                        {flatBooks.length === 0
                                            ? 'Agrega algunos libros para empezar tu biblioteca personal'
                                            : 'Agrega libros a este estante para verlos aquí'}
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
                            <span className="stat-number">{stats.Todos}</span>
                            <span className="stat-label">Total libros</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-number">{stats.Completados}</span>
                            <span className="stat-label">Completados</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-content">
                            <span className="stat-number">{stats.Leyendo}</span>
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
                            <span className="stat-number">{stats.Favoritos}</span>
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
