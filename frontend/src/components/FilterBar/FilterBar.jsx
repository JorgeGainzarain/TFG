import React from 'react';
import './FilterBar.css';

const FilterBar = ({
                       filters = {
                           genre: '',
                           sortBy: 'relevance',
                       },
                       onFilterChange,
                       genreOptions = [],
                       genreTranslations = {}
                   }) => {
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
                {genreOptions.map(genre => (
                    <option key={genre} value={genre}>
                        {genreTranslations[genre] || genre}
                    </option>
                ))}
            </select>

            <select
                className="filter-select"
                value={filters.sortBy || 'relevance'}
                onChange={(e) => handleSelectChange('sortBy', e.target.value)}
            >
                <option value="relevance">Más relevantes</option>
                <option value="newest">Más recientes</option>
            </select>
        </div>
    );
};

export default FilterBar;
