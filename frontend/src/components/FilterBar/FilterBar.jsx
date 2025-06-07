import React from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange }) => {
    const handleSelectChange = (filterType, value) => {
        onFilterChange(filterType, value);
    };

    return (
        <div className="filters">
            <select
                className="filter-select"
                value={filters.genre || ''}
                onChange={(e) => handleSelectChange('genre', e.target.value)}
            >
                <option value="">Todos los géneros</option>
            </select>

            <select
                className="filter-select"
                value={filters.year || ''}
                onChange={(e) => handleSelectChange('year', e.target.value)}
            >
                <option value="">Cualquier década</option>
                <option value="2020-2029">2020 - 2029</option>
                <option value="2010-2019">2010 - 2019</option>
                <option value="2000-2009">2000 - 2009</option>
                <option value="1990-1999">1990 - 1999</option>
                <option value="1980-1989">1980 - 1989</option>
                <option value="clasicos">Clásicos</option>
            </select>

            <select
                className="filter-select"
                value={filters.sortBy || 'relevance'}
                onChange={(e) => handleSelectChange('sortBy', e.target.value)}
            >
                <option value="relevance">Ordenar por relevancia</option>
                <option value="rating">Mejor puntuados</option>
                <option value="recent">Más recientes</option>
                <option value="popular">Más populares</option>
                <option value="title">Por título</option>
                <option value="author">Por autor</option>
            </select>
        </div>
    );
};

// Set default props
FilterBar.defaultProps = {
    filters: {
        genre: '',
        year: '',
        sortBy: 'relevance',
    },
};

export default FilterBar;