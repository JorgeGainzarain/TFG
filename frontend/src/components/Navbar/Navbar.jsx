import React, { useState } from 'react';
import { bookAPI, handleApiError } from '../../services/api';
import './Navbar.css';

const Navbar = ({ onSearchResults, onSearchLoading, onSearchError }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

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
            onSearchError && onSearchError(null); // Clear any previous errors

        } catch (error) {
            console.error('Search error:', error);
            const errorMessage = handleApiError(error);
            onSearchError && onSearchError(errorMessage);
            onSearchResults && onSearchResults([], searchQuery);
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

    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#" className="logo" onClick={() => window.location.reload()}>
                    📚 BookHub
                </a>

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
                            onClick={() => {
                                setSearchQuery('');
                                onSearchResults && onSearchResults([], '');
                                onSearchError && onSearchError(null);
                            }}
                            title="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                </form>

                <div className="nav-actions">
                    <a href="#" className="btn btn-ghost">Librería</a>
                    <a href="#" className="btn btn-primary">Iniciar Sesión</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;