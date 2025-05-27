import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MobileNavigation.css';

    const MobileNavbar = ({ onNavigate }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determinar la página actual basada en la ruta
    const getCurrentView = () => {
        if (location.pathname === '/') return 'home';
        if (location.pathname.startsWith('/search')) return 'search';
        if (location.pathname.startsWith('/library')) return 'library';
        if (location.pathname.startsWith('/ai')) return 'ai';
        if (location.pathname.startsWith('/profile')) return 'profile';
        return 'home';
    };

    const activeItem = getCurrentView();

    const handleItemClick = (item) => {
        // Llamar callback si existe
        if (onNavigate) {
            onNavigate(item);
        }

        // Navegar usando React Router
        switch (item) {
            case 'home':
                navigate('/');
                break;
            case 'search':
                navigate('/search');
                break;
            case 'library':
                navigate('/library');
                break;
            case 'ai':
                navigate('/ai-recommendations');
                break;
            case 'profile':
                navigate('/profile');
                break;
            default:
                navigate('/');
        }

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

export default MobileNavbar;