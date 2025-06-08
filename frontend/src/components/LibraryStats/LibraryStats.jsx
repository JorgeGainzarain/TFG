// frontend/src/components/Library/LibraryStats.jsx
import React from 'react';
import './LibraryStats.css';

const LibraryStats = ({ libraryData }) => {
    const calculateStats = () => {
        const totalBooks = Object.values(libraryData).reduce((total, shelf) => total + shelf.length, 0);
        const readBooks = libraryData.read.length;
        const readingBooks = libraryData.reading.length;
        const toReadBooks = libraryData.toRead.length;
        const favoriteBooks = libraryData.favorites.length;

        // Calcular páginas totales leídas
        const totalPagesRead = libraryData.read.reduce((total, book) => {
            return total + (book.totalPages || 0);
        }, 0);

        // Calcular tiempo total de lectura
        const totalReadingTime = libraryData.read.reduce((total, book) => {
            return total + (book.readingTime || 0);
        }, 0);

        // Calcular progreso promedio de libros en lectura
        const averageProgress = readingBooks > 0
            ? libraryData.reading.reduce((total, book) => total + (book.progress || 0), 0) / readingBooks
            : 0;

        // Géneros más leídos
        const genreCounts = {};
        [...libraryData.read, ...libraryData.reading, ...libraryData.favorites].forEach(book => {
            book.genres.forEach(genre => {
                genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
        });

        const topGenre = Object.entries(genreCounts).sort(([,a], [,b]) => b - a)[0];

        // Libro más reciente
        const allBooks = Object.values(libraryData).flat();
        const mostRecentBook = allBooks.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))[0];

        return {
            totalBooks,
            readBooks,
            readingBooks,
            toReadBooks,
            favoriteBooks,
            totalPagesRead,
            totalReadingTime,
            averageProgress: Math.round(averageProgress),
            topGenre: topGenre ? topGenre[0] : null,
            mostRecentBook
        };
    };

    const stats = calculateStats();

    const formatReadingTime = (hours) => {
        if (hours < 24) {
            return `${hours}h`;
        }
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    };

    return (
        <div className="library-stats">
            <div className="stats-header">
                <h3 className="stats-title">📊 Estadísticas de Lectura</h3>
                <p className="stats-subtitle">Tu progreso y logros literarios</p>
            </div>

            <div className="stats-grid">
                {/* Resumen principal */}
                <div className="stat-card main-stat">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalBooks}</div>
                        <div className="stat-label">Libros en total</div>
                        <div className="stat-breakdown">
                            <span className="breakdown-item">
                                <span className="breakdown-icon">✅</span>
                                {stats.readBooks} leídos
                            </span>
                            <span className="breakdown-item">
                                <span className="breakdown-icon">📖</span>
                                {stats.readingBooks} leyendo
                            </span>
                        </div>
                    </div>
                </div>

                {/* Páginas leídas */}
                <div className="stat-card">
                    <div className="stat-icon">📄</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.totalPagesRead.toLocaleString()}</div>
                        <div className="stat-label">Páginas leídas</div>
                        <div className="stat-detail">
                            ≈ {Math.floor(stats.totalPagesRead / 300)} libros promedio
                        </div>
                    </div>
                </div>

                {/* Tiempo de lectura */}
                <div className="stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                        <div className="stat-number">{formatReadingTime(stats.totalReadingTime)}</div>
                        <div className="stat-label">Tiempo leyendo</div>
                        <div className="stat-detail">
                            {stats.readBooks > 0 && `~${Math.round(stats.totalReadingTime / stats.readBooks)}h por libro`}
                        </div>
                    </div>
                </div>

                {/* Progreso actual */}
                {stats.readingBooks > 0 && (
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.averageProgress}%</div>
                            <div className="stat-label">Progreso promedio</div>
                            <div className="stat-detail">
                                {stats.readingBooks} libro{stats.readingBooks !== 1 ? 's' : ''} en progreso
                            </div>
                        </div>
                    </div>
                )}

                {/* Género favorito */}
                {stats.topGenre && (
                    <div className="stat-card">
                        <div className="stat-icon">🎭</div>
                        <div className="stat-content">
                            <div className="stat-number">{stats.topGenre}</div>
                            <div className="stat-label">Género favorito</div>
                            <div className="stat-detail">
                                Tu categoría más leída
                            </div>
                        </div>
                    </div>
                )}

                {/* Meta de lectura */}
                <div className="stat-card goal-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                        <div className="stat-number">{stats.readBooks}/12</div>
                        <div className="stat-label">Meta 2024</div>
                        <div className="goal-progress">
                            <div className="goal-bar">
                                <div
                                    className="goal-fill"
                                    style={{ width: `${Math.min((stats.readBooks / 12) * 100, 100)}%` }}
                                ></div>
                            </div>
                            <div className="goal-text">
                                {stats.readBooks >= 12
                                    ? '🎉 ¡Meta cumplida!'
                                    : `${12 - stats.readBooks} libros restantes`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logros recientes */}
            <div className="recent-activity">
                <h4 className="activity-title">📈 Actividad Reciente</h4>
                <div className="activity-items">
                    {stats.mostRecentBook && (
                        <div className="activity-item">
                            <span className="activity-icon">➕</span>
                            <span className="activity-text">
                                Agregaste <strong>"{stats.mostRecentBook.title}"</strong>
                                <span className="activity-date">
                                    {new Date(stats.mostRecentBook.addedDate).toLocaleDateString()}
                                </span>
                            </span>
                        </div>
                    )}

                    {stats.readBooks > 0 && (
                        <div className="activity-item">
                            <span className="activity-icon">🏆</span>
                            <span className="activity-text">
                                Has completado <strong>{stats.readBooks}</strong> libro{stats.readBooks !== 1 ? 's' : ''} este año
                            </span>
                        </div>
                    )}

                    {stats.totalReadingTime > 0 && (
                        <div className="activity-item">
                            <span className="activity-icon">⏱️</span>
                            <span className="activity-text">
                                Llevas <strong>{formatReadingTime(stats.totalReadingTime)}</strong> de lectura acumulada
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryStats;