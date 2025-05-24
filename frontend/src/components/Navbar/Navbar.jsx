import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        // Lógica de búsqueda aquí
        console.log('Buscando:', searchQuery);
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#" className="logo">📚 BookHub</a>

                <form className="search-container" onSubmit={handleSearch}>
                    <div className="search-icon">🔍</div>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Busca tu próximo libro favorito..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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