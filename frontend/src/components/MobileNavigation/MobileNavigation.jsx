import React, { useState } from 'react';
import './MobileNavigation.css';

const MobileNavigation = () => {
    const [activeItem, setActiveItem] = useState('home');

    const handleItemClick = (item) => {
        setActiveItem(item);
        // Aquí puedes añadir lógica de navegación
        console.log('Navegando a:', item);
    };

    const navigationItems = [
        { id: 'home', icon: '🏠', label: 'Inicio' },
        { id: 'search', icon: '🔍', label: 'Buscar' },
        { id: 'library', icon: '📚', label: 'Librería' },
        { id: 'ai', icon: '🤖', label: 'IA' },
        { id: 'profile', icon: '👤', label: 'Perfil' }
    ];

    return (
        <nav className="mobile-nav">
            <div className="mobile-nav-items">
                {navigationItems.map((item) => (
                    <button
                        key={item.id}
                        className={`mobile-nav-item ${activeItem === item.id ? 'active' : ''}`}
                        onClick={() => handleItemClick(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default MobileNavigation;