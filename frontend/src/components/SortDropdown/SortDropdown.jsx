import React from 'react';
import './SortDropdown.css';

const SortDropdown = ({ sortBy, onSortChange }) => {
    const sortOptions = [
        { value: 'relevance', label: 'Más relevantes' },
        { value: 'rating', label: 'Mejor puntuados' },
        { value: 'recent', label: 'Más recientes' },
        { value: 'popular', label: 'Más populares' },
        { value: 'title', label: 'Por título (A-Z)' },
        { value: 'author', label: 'Por autor (A-Z)' }
    ];

    return (
        <div className="sort-dropdown-container">
            <label className="sort-label">Ordenar por:</label>
            <select
                className="sort-dropdown"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SortDropdown;