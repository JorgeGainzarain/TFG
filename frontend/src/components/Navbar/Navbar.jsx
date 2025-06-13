import React, {forwardRef, useImperativeHandle, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {bookAPI, handleApiError, getRecommendations} from '../../services/api';
import {logout} from '../../services/authService';
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
                results = getRecommendations();
                query = '';
                // Simular delay para hacer más realista
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                results = await bookAPI.searchBooks(query);
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
                                    {getInitials(user.username)}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.username}</span>
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
                                            {getInitials(user.username)}
                                        </div>
                                        <div className="user-details">
                                            <span className="user-name">{user.username}</span>
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