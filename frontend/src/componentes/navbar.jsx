import React from "react";
import "./navbar.css"; // Create a separate CSS file for the navbar styles

const Navbar = () => (
    <header className="navbar">
        <div className="navbar-logo"><a href="#">App</a></div>
        <div className="navbar-search">
            <input type="text" placeholder="Buscar"/>
            <button aria-label="Buscar">🔍</button>
        </div>
        <nav className="navbar-links">
            <a href="#">Librería</a>
            <a href="#">Login</a>
        </nav>
    </header>
);

export default Navbar;