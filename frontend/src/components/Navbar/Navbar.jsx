import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookAPI, handleApiError } from '../../services/api';
import { logout } from '../../services/authService';
import './Navbar.css';

const Navbar = ({ onSearchResults, onSearchLoading, onSearchError, user, isAuthenticated, onShowAuth }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchQuery.trim()) {
            onSearchError && onSearchError('Por favor ingresa un término de búsqueda');
            return;
        }

        setIsSearching(true);
        onSearchLoading && onSearchLoading(true);

        try {
            console.log('Searching for:', searchQuery);
            const response = await bookAPI.searchBooks(searchQuery, {
                maxResults: 12,
                orderBy: 'relevance'
            });

            console.log('Search results:', response);
            onSearchResults && onSearchResults(response.books, searchQuery);
            onSearchError && onSearchError(null);

            // Navegar a la página de búsqueda con el query como parámetro
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);

        } catch (error) {
            console.error('Search error:', error);
            const errorMessage = handleApiError(error);
            onSearchError && onSearchError(errorMessage);
            onSearchResults && onSearchResults([], searchQuery);
            // Aún así navegar a la página de búsqueda para mostrar el error
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        } finally {
            setIsSearching(false);
            onSearchLoading && onSearchLoading(false);
        }
    };

    const handleInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
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
        onSearchResults && onSearchResults([], '');
        onSearchError && onSearchError(null);
        navigate('/'); // Navegar al home
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
                        placeholder={isSearching ? "Buscando..." : "Busca tu próximo libro favorito..."}
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
};

export default Navbar;