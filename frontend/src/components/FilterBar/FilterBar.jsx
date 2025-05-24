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
                <option value="ficcion">Ficción</option>
                <option value="no-ficcion">No ficción</option>
                <option value="fantasia">Fantasía</option>
                <option value="romance">Romance</option>
                <option value="misterio">Misterio</option>
                <option value="ciencia-ficcion">Ciencia Ficción</option>
                <option value="autoayuda">Autoayuda</option>
                <option value="drama">Drama</option>
                <option value="historico">Histórico</option>
            </select>

            <select
                className="filter-select"
                value={filters.year || ''}
                onChange={(e) => handleSelectChange('year', e.target.value)}
            >
                <option value="">Cualquier año</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
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