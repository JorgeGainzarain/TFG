import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { bookAPI, handleApiError, getRecommendations } from '../../services/api';
import { useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = forwardRef((
    {
        showUserMenu,
        setShowUserMenu,
        handleLogout,
        onSearchResults,
        onSearchLoading,
        onSearchError,
        user,
        isAuthenticated,
        onShowAuth,
        searchQuery,
        setSearchQuery
    },
    ref
) => {
    const [isSearching, setIsSearching] = useState(false);
    const [localQuery, setLocalQuery] = useState(searchQuery || '');
    const navigate = useNavigate();

    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/search' && !searchQuery) {
            const params = new URLSearchParams(location.search);
            const urlQuery = params.get('q') || '';
            setLocalQuery(urlQuery);
        }
    });


    useImperativeHandle(ref, () => ({
        clearInput: () => setLocalQuery('')
    }));

    const handleInputChange = (e) => {
        setLocalQuery(e.target.value);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        console.log("Handling search with query:", localQuery);
        setSearchQuery(localQuery);
        await performSearch(localQuery);
    };

    const performSearch = async (query) => {
        setIsSearching(true);
        onSearchLoading && onSearchLoading(true);

        try {
            let results;
            let trimmedQuery = query.trim();

            if (!trimmedQuery) {
                results = getRecommendations();
                trimmedQuery = '';
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                results = await bookAPI.searchBooks(trimmedQuery);
            }

            onSearchResults && onSearchResults(results, trimmedQuery);
            onSearchError && onSearchError(null);

            if (trimmedQuery) {
                navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
            } else {
                navigate('/search?recommendations=true');
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            onSearchError && onSearchError(errorMessage);
            onSearchResults && onSearchResults([], query || '');
            if (query.trim()) {
                navigate(`/search?q=${encodeURIComponent(query)}`);
            } else {
                navigate('/search?recommendations=true');
            }
        } finally {
            setIsSearching(false);
            onSearchLoading && onSearchLoading(false);
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
        setLocalQuery('');
        setSearchQuery('');
        onSearchResults && onSearchResults([], '');
        onSearchError && onSearchError(null);
        navigate('/');
    };

    useEffect(() => {
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
                    <input
                        type="text"
                        className="search-input"
                        placeholder={isSearching ? "Buscando..." : "Busca libros o deja vacío para recomendaciones..."}
                        value={localQuery}
                        onChange={handleInputChange}
                        disabled={isSearching}
                    />
                    {localQuery && (
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
                        title={localQuery.trim() ? "Buscar libros" : "Ver recomendaciones"}
                    >
                        {isSearching ? (
                            <span className="search-loading">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                     className="bi bi-hourglass-split" viewBox="0 0 16 16">
                                  <path
                                      d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
                                </svg>
                            </span>
                        ) : (
                            <span className="search-btn-text">
                                {localQuery.trim() ?
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                         className="bi bi-search" viewBox="0 0 16 16">
                                        <path
                                            d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                                    </svg>
                                    :
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="orange"
                                         className="bi bi-stars" viewBox="0 0 16 16">
                                        <path
                                            d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
                                    </svg>}
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