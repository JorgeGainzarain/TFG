import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookAPI, handleApiError } from '../../services/api';
import { logout } from '../../services/authService';
import './Navbar.css';

const Navbar = forwardRef(({ onSearchResults, onSearchLoading, onSearchError, user, isAuthenticated, onShowAuth }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();

    // Exponer función para limpiar input
    useImperativeHandle(ref, () => ({
        clearInput: () => setSearchQuery('')
    }));

    // Datos placeholder para búsquedas vacías (futuras recomendaciones de IA)
    const getPlaceholderBooks = () => [
        {
            id: 'placeholder-1',
            title: 'El Nombre del Viento',
            author: 'Patrick Rothfuss',
            genres: ['Fantasía', 'Aventura'],
            categories: ['Fantasía', 'Aventura'],
            rating: 5,
            averageRating: 5,
            reviewCount: 28470,
            ratingsCount: 28470,
            coverEmoji: '🌪️',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '2007',
            description: 'Una historia épica sobre un joven héroe y su búsqueda de la verdad.',
            pageCount: 662,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-2',
            title: 'Cien años de soledad',
            author: 'Gabriel García Márquez',
            genres: ['Realismo Mágico', 'Literatura'],
            categories: ['Realismo Mágico', 'Literatura'],
            rating: 5,
            averageRating: 5,
            reviewCount: 45230,
            ratingsCount: 45230,
            coverEmoji: '📖',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '1967',
            description: 'Una obra maestra del realismo mágico latinoamericano.',
            pageCount: 417,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-3',
            title: 'Sapiens',
            author: 'Yuval Noah Harari',
            genres: ['Historia', 'Antropología'],
            categories: ['Historia', 'Antropología'],
            rating: 5,
            averageRating: 5,
            reviewCount: 67890,
            ratingsCount: 67890,
            coverEmoji: '🧠',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '2014',
            description: 'Una mirada fascinante a la historia de la humanidad.',
            pageCount: 443,
            language: 'es',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-4',
            title: 'The Hobbit',
            author: 'J.R.R. Tolkien',
            genres: ['Fantasía', 'Aventura'],
            categories: ['Fantasía', 'Aventura'],
            rating: 5,
            averageRating: 5,
            reviewCount: 123450,
            ratingsCount: 123450,
            coverEmoji: '🏔️',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '1937',
            description: 'La aventura que cambió la literatura fantástica para siempre.',
            pageCount: 310,
            language: 'en',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-5',
            title: 'Atomic Habits',
            author: 'James Clear',
            genres: ['Autoayuda', 'Productividad'],
            categories: ['Autoayuda', 'Productividad'],
            rating: 4,
            averageRating: 4,
            reviewCount: 89340,
            ratingsCount: 89340,
            coverEmoji: '⚡',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '2018',
            description: 'La guía definitiva para formar buenos hábitos y romper los malos.',
            pageCount: 320,
            language: 'en',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-6',
            title: 'Dune',
            author: 'Frank Herbert',
            genres: ['Ciencia Ficción', 'Épico'],
            categories: ['Ciencia Ficción', 'Épico'],
            rating: 4,
            averageRating: 4,
            reviewCount: 98760,
            ratingsCount: 98760,
            coverEmoji: '🏜️',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '1965',
            description: 'La obra maestra de la ciencia ficción que definió un género.',
            pageCount: 688,
            language: 'en',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-7',
            title: 'The Midnight Library',
            author: 'Matt Haig',
            genres: ['Ficción', 'Filosofía'],
            categories: ['Ficción', 'Filosofía'],
            rating: 4,
            averageRating: 4,
            reviewCount: 54320,
            ratingsCount: 54320,
            coverEmoji: '🌙',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '2020',
            description: 'Una reflexión profunda sobre las decisiones de la vida y las posibilidades infinitas.',
            pageCount: 288,
            language: 'en',
            previewLink: '',
            infoLink: ''
        },
        {
            id: 'placeholder-8',
            title: 'Educated',
            author: 'Tara Westover',
            genres: ['Biografía', 'Memoir'],
            categories: ['Biografía', 'Memoir'],
            rating: 4,
            averageRating: 4,
            reviewCount: 43210,
            ratingsCount: 43210,
            coverEmoji: '📚',
            thumbnail: '',
            isPlaceholder: true,
            publishedDate: '2018',
            description: 'Una poderosa historia sobre educación y superación personal.',
            pageCount: 334,
            language: 'en',
            previewLink: '',
            infoLink: ''
        }
    ];

    const handleSearch = async (e) => {
        e.preventDefault();
        performSearch();
    };

    const performSearch = async () => {
        setIsSearching(true);
        onSearchLoading && onSearchLoading(true);

        try {
            let results;
            let query = searchQuery.trim();

            // Si la búsqueda está vacía, mostrar placeholders
            if (!query) {
                console.log('Empty search - showing AI placeholder recommendations');
                results = getPlaceholderBooks();
                query = ''; // Mantener query vacío para las recomendaciones

                // Simular delay para hacer más realista
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.log('Searching for:', query);
                const response = await bookAPI.searchBooks(query, {
                    maxResults: 12,
                    orderBy: 'relevance'
                });
                results = response.books;
            }

            console.log('Search results:', results);
            onSearchResults && onSearchResults(results, query);
            onSearchError && onSearchError(null);

            // Navegar a la página de búsqueda
            if (query) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
            } else {
                navigate('/search?recommendations=true');
            }

        } catch (error) {
            console.error('Search error:', error);
            const errorMessage = handleApiError(error);
            onSearchError && onSearchError(errorMessage);
            onSearchResults && onSearchResults([], searchQuery || '');
            // Aún así navegar a la página de búsqueda para mostrar el error
            if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            } else {
                navigate('/search?recommendations=true');
            }
        } finally {
            setIsSearching(false);
            onSearchLoading && onSearchLoading(false);
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    };

    const handleSearchButtonClick = () => {
        performSearch();
    };

    const handleLogout = async () => {
        try {
            await logout();
            setShowUserMenu(false);
            alert('¡Hasta luego! Has cerrado sesión exitosamente.');
            navigate('/'); // Navegar al home después del logout
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        // Limpiar resultados y ir a home
        onSearchResults && onSearchResults([], '');
        onSearchError && onSearchError(null);
        navigate('/');
    };

    // Close user menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo">
                    📚 BookHub
                </Link>

                <form className="search-container" onSubmit={handleSearch}>
                    <div className="search-icon">
                        {isSearching ? '⏳' : '🔍'}
                    </div>
                    <input
                        type="text"
                        className="search-input"
                        placeholder={isSearching ? "Buscando..." : "Busca libros o deja vacío para recomendaciones..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleInputKeyPress}
                        disabled={isSearching}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={handleClearSearch}
                            title="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                    <button
                        type="submit"
                        className="search-button"
                        disabled={isSearching}
                        title={searchQuery.trim() ? "Buscar libros" : "Ver recomendaciones"}
                    >
                        {isSearching ? (
                            <span className="search-loading">⏳</span>
                        ) : (
                            <span className="search-btn-text">
                                {searchQuery.trim() ? '🔍' : '✨'}
                            </span>
                        )}
                    </button>
                </form>

                <div className="nav-actions">
                    <Link to="/library" className="btn btn-ghost">Librería</Link>
                    {isAuthenticated && user ? (
                        <div className="user-menu-container">
                            <button
                                className="user-menu-trigger"
                                onClick={toggleUserMenu}
                            >
                                <div className="user-avatar">
                                    {getInitials(user.name)}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.name}</span>
                                    <span className="user-status">✨ Premium</span>
                                </div>
                                <span className="menu-arrow">
                                    {showUserMenu ? '▲' : '▼'}
                                </span>
                            </button>

                            {showUserMenu && (
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <div className="user-avatar large">
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-email">{user.email}</span>
                                        </div>
                                    </div>

                                    <div className="user-dropdown-menu">
                                        <Link to="/library" className="menu-item">
                                            <span className="menu-icon">📚</span>
                                            Mi Librería
                                        </Link>
                                        <Link to="/favorites" className="menu-item">
                                            <span className="menu-icon">⭐</span>
                                            Favoritos
                                        </Link>
                                        <Link to="/stats" className="menu-item">
                                            <span className="menu-icon">📊</span>
                                            Estadísticas
                                        </Link>
                                        <Link to="/settings" className="menu-item">
                                            <span className="menu-icon">⚙️</span>
                                            Configuración
                                        </Link>

                                        <div className="menu-divider"></div>

                                        <button
                                            className="menu-item logout"
                                            onClick={handleLogout}
                                        >
                                            <span className="menu-icon">🚪</span>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={onShowAuth}
                        >
                            🔑 Iniciar Sesión
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
});

Navbar.displayName = 'Navbar';

export default Navbar;