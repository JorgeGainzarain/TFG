import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
    const categories = [
        { id: '', label: 'Todas las categorías', icon: '📚' },
        { id: 'fiction', label: 'Ficción', icon: '📖' },
        { id: 'non-fiction', label: 'No ficción', icon: '📰' },
        { id: 'mystery', label: 'Misterio', icon: '🔍' },
        { id: 'romance', label: 'Romance', icon: '💕' },
        { id: 'fantasy', label: 'Fantasía', icon: '🐉' },
        { id: 'sci-fi', label: 'Ciencia Ficción', icon: '🚀' },
        { id: 'biography', label: 'Biografía', icon: '👤' }
    ];

    return (
        <div className="category-filter">
            <h3 className="category-title">Categorías</h3>
            <div className="category-buttons">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => onCategoryChange(category.id)}
                    >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-label">{category.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;