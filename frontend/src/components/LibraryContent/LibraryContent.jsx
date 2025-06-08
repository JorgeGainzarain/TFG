// frontend/src/components/Library/LibraryContent.jsx
import React, { useState, useRef, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import LibraryStats from '../LibraryStats/LibraryStats';
import './LibraryContent.css';

const LibraryContent = ({ user, isAuthenticated }) => {
    const [activeShelf, setActiveShelf] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [viewMode, setViewMode] = useState('grid');
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Datos placeholder para la librería del usuario
    const [libraryData] = useState({
        reading: [
            {
                id: 'reading-1',
                title: 'El Nombre del Viento',
                authors: ['Patrick Rothfuss'],
                genres: ['Fantasía', 'Aventura'],
                rating: 5,
                reviewCount: 28470,
                coverEmoji: '🌪️',
                publishedDate: '2007-03-27',
                addedDate: '2024-12-01',
                progress: 65,
                currentPage: 430,
                totalPages: 662,
                thumbnail: '',
                description: 'Una historia épica sobre un joven héroe y su búsqueda de la verdad.',
                notes: 'Increíble worldbuilding, me encanta el sistema de magia.'
            },
            {
                id: 'reading-2',
                title: 'Atomic Habits',
                authors: ['James Clear'],
                genres: ['Autoayuda', 'Productividad'],
                rating: 4,
                reviewCount: 89430,
                coverEmoji: '⚡',
                publishedDate: '2018-10-16',
                addedDate: '2024-11-28',
                progress: 35,
                currentPage: 112,
                totalPages: 320,
                thumbnail: '',
                description: 'La guía definitiva para formar buenos hábitos y romper los malos.',
                notes: 'Métodos muy prácticos, ya estoy implementando varios consejos.'
            }
        ],
        toRead: [
            {
                id: 'toread-1',
                title: 'Dune',
                authors: ['Frank Herbert'],
                genres: ['Ciencia Ficción', 'Épico'],
                rating: 4,
                reviewCount: 198760,
                coverEmoji: '🏜️',
                publishedDate: '1965-08-01',
                addedDate: '2024-11-25',
                thumbnail: '',
                description: 'La obra maestra de la ciencia ficción que definió un género.',
                priority: 'high'
            },
            {
                id: 'toread-2',
                title: 'The Midnight Library',
                authors: ['Matt Haig'],
                genres: ['Ficción', 'Filosofía'],
                rating: 4,
                reviewCount: 54320,
                coverEmoji: '🌙',
                publishedDate: '2020-08-13',
                addedDate: '2024-11-20',
                thumbnail: '',
                description: 'Una reflexión profunda sobre las decisiones de la vida.',
                priority: 'medium'
            }
        ],
        read: [
            {
                id: 'read-1',
                title: 'Sapiens',
                authors: ['Yuval Noah Harari'],
                genres: ['Historia', 'Antropología'],
                rating: 5,
                reviewCount: 156780,
                coverEmoji: '🧠',
                publishedDate: '2014-09-04',
                addedDate: '2024-10-15',
                completedDate: '2024-11-15',
                thumbnail: '',
                description: 'Una mirada fascinante a la historia de la humanidad.',
                userRating: 5,
                userReview: 'Cambió completamente mi perspectiva sobre la historia humana. Fascinante.',
                readingTime: 12
            },
            {
                id: 'read-2',
                title: 'The Hobbit',
                authors: ['J.R.R. Tolkien'],
                genres: ['Fantasía', 'Aventura'],
                rating: 5,
                reviewCount: 234560,
                coverEmoji: '🏔️',
                publishedDate: '1937-09-21',
                addedDate: '2024-09-10',
                completedDate: '2024-10-05',
                thumbnail: '',
                description: 'La aventura que cambió la literatura fantástica para siempre.',
                userRating: 5,
                userReview: 'Un clásico que nunca pasa de moda. Tolkien es un genio.',
                readingTime: 8
            }
        ],
        favorites: [
            {
                id: 'fav-1',
                title: 'Cien años de soledad',
                authors: ['Gabriel García Márquez'],
                genres: ['Realismo Mágico', 'Literatura'],
                rating: 5,
                reviewCount: 245230,
                coverEmoji: '📖',
                publishedDate: '1967-05-30',
                addedDate: '2024-08-15',
                thumbnail: '',
                description: 'Una obra maestra del realismo mágico latinoamericano.',
                userRating: 5,
                userReview: 'Mi libro favorito de todos los tiempos. Una obra de arte literaria.',
                tags: ['Clásico', 'Obra maestra']
            }
        ]
    });

    const shelves = [
        { id: 'all', name: 'Todos los libros', icon: '📚', count: getTotalBooks() },
        { id: 'reading', name: 'Leyendo', icon: '📖', count: libraryData.reading.length },
        { id: 'toRead', name: 'Por leer', icon: '📋', count: libraryData.toRead.length },
        { id: 'read', name: 'Leídos', icon: '✅', count: libraryData.read.length },
        { id: 'favorites', name: 'Favoritos', icon: '⭐', count: libraryData.favorites.length }
    ];

    function getTotalBooks() {
        return Object.values(libraryData).reduce((total, shelf) => total + shelf.length, 0);
    }

    const getFilteredBooks = () => {
        let books = [];

        if (activeShelf === 'all') {
            books = [
                ...libraryData.reading.map(book => ({ ...book, shelf: 'reading' })),
                ...libraryData.toRead.map(book => ({ ...book, shelf: 'toRead' })),
                ...libraryData.read.map(book => ({ ...book, shelf: 'read' })),
                ...libraryData.favorites.map(book => ({ ...book, shelf: 'favorites' }))
            ];
        } else {
            books = libraryData[activeShelf]?.map(book => ({ ...book, shelf: activeShelf })) || [];
        }

        // Filtrar por término de búsqueda
        if (searchTerm) {
            books = books.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.genres.some(genre => genre.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Ordenar
        switch (sortBy) {
            case 'recent':
                books.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
                break;
            case 'title':
                books.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'author':
                books.sort((a, b) => a.author.localeCompare(b.author));
                break;
            case 'rating':
                books.sort((a, b) => (b.userRating || b.rating) - (a.userRating || a.rating));
                break;
            case 'progress':
                books.sort((a, b) => (b.progress || 0) - (a.progress || 0));
                break;
            default:
                break;
        }

        return books;
    };

    const filteredBooks = getFilteredBooks();

    const handleAddToLibrary = (book) => {
        console.log('Actualizando libro en librería:', book);
        alert(`Funcionalidad de gestión de librería próximamente`);
    };

    // Drag scroll functionality para vista horizontal
    const handleMouseDown = (e) => {
        if (viewMode !== 'horizontal') return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || viewMode !== 'horizontal') return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="library-content">
            {/* Header de la librería */}
            <div className="library-header">
                <div className="library-title-section">
                    <h1 className="library-title">📚 Mi Librería Personal</h1>
                    <p className="library-subtitle">
                        ¡Hola {user?.username}! Aquí tienes tu colección personalizada de libros
                    </p>
                </div>
            </div>

            {/* Estadísticas */}
            <LibraryStats libraryData={libraryData} />

            {/* Controles */}
            <div className="library-controls">
                <div className="library-shelves">
                    {shelves.map((shelf) => (
                        <button
                            key={shelf.id}
                            className={`shelf-btn ${activeShelf === shelf.id ? 'active' : ''}`}
                            onClick={() => setActiveShelf(shelf.id)}
                        >
                            <span className="shelf-icon">{shelf.icon}</span>
                            <span className="shelf-name">{shelf.name}</span>
                            <span className="shelf-count">{shelf.count}</span>
                        </button>
                    ))}
                </div>

                <div className="library-search-controls">
                    <div className="search-input-container">
                        <input
                            type="text"
                            className="library-search"
                            placeholder="Buscar en tu librería..."
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
                        <option value="title">Por título</option>
                        <option value="author">Por autor</option>
                        <option value="rating">Por puntuación</option>
                        {activeShelf === 'reading' && <option value="progress">Por progreso</option>}
                    </select>

                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Vista en cuadrícula"
                        >
                            ⊞
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Vista en lista"
                        >
                            ☰
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'horizontal' ? 'active' : ''}`}
                            onClick={() => setViewMode('horizontal')}
                            title="Vista horizontal"
                        >
                            ↔
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido de la librería */}
            <div className="library-books-section">
                {filteredBooks.length === 0 ? (
                    <div className="empty-library">
                        <div className="empty-icon">📚</div>
                        <h3>
                            {searchTerm
                                ? `No se encontraron libros para "${searchTerm}"`
                                : activeShelf === 'all'
                                    ? 'Tu librería está vacía'
                                    : `No tienes libros en "${shelves.find(s => s.id === activeShelf)?.name}"`
                            }
                        </h3>
                        <p>
                            {searchTerm
                                ? 'Intenta con otros términos de búsqueda'
                                : '¡Empieza a agregar libros a tu colección personal!'
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
                    </div>
                ) : (
                    <div
                        className={`books-container ${viewMode}`}
                        ref={scrollContainerRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseUp}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    >
                        {filteredBooks.map((book) => (
                            <div
                                key={`${book.shelf}-${book.id}`}
                                className="book-container"
                                onClick={(e) => isDragging && e.preventDefault()}
                            >
                                <BookCard
                                    book={book}
                                    variant={viewMode === 'list' ? 'horizontal' : 'vertical'}
                                    showDescription={viewMode === 'list'}
                                    showDate={true}
                                    onAddToLibrary={handleAddToLibrary}
                                    libraryMode={true}
                                    shelfInfo={book.shelf}
                                />

                                {/* Información adicional de la librería */}
                                <div className="library-book-info">
                                    {book.shelf === 'reading' && book.progress && (
                                        <div className="reading-progress">
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{ width: `${book.progress}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-text">
                                                {book.progress}% • Página {book.currentPage} de {book.totalPages}
                                            </span>
                                        </div>
                                    )}

                                    {book.shelf === 'toRead' && book.priority && (
                                        <div className={`priority-badge ${book.priority}`}>
                                            {book.priority === 'high' ? '🔥' : book.priority === 'medium' ? '📌' : '⏳'}
                                            {book.priority === 'high' ? 'Alta prioridad' : book.priority === 'medium' ? 'Media' : 'Baja'}
                                        </div>
                                    )}

                                    {book.shelf === 'read' && book.userRating && (
                                        <div className="user-rating">
                                            <span className="rating-label">Tu puntuación:</span>
                                            <div className="stars">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} className={`star ${star <= book.userRating ? 'filled' : ''}`}>
                                                        ★
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {book.shelf && (
                                        <div className="shelf-badge">
                                            <span className="shelf-icon">
                                                {shelves.find(s => s.id === book.shelf)?.icon}
                                            </span>
                                            <span className="shelf-label">
                                                {shelves.find(s => s.id === book.shelf)?.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryContent;