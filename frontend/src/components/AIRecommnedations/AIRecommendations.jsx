import React, { useState, useRef, useEffect } from 'react';
import BookCard from '../BookCard/BookCard';
import './AIRecommendations.css';

const AIRecommendations = ({ user, isAuthenticated, onShowAuth, genreOptions, genreTranslations, recommendations, handleAddToLibrary }) => {
    const scrollContainerRef = useRef(null);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [showLeftButton, setShowLeftButton] = useState(false);
    const [showRightButton, setShowRightButton] = useState(true);

    React.useEffect(() => {
        if (!isAuthenticated) {
            setShowAuthPrompt(true);
        } else {
            setShowAuthPrompt(false);
        }
    }, [isAuthenticated]);

    const updateButtonVisibility = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftButton(scrollLeft > 0);
            setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            updateButtonVisibility();
            container.addEventListener('scroll', updateButtonVisibility);
            window.addEventListener('resize', updateButtonVisibility);

            return () => {
                container.removeEventListener('scroll', updateButtonVisibility);
                window.removeEventListener('resize', updateButtonVisibility);
            };
        }
    }, []);

    const filteredBooks = recommendations;

    const handleShowAuthModal = () => {
        setShowAuthPrompt(false);
        onShowAuth();
    };

    const scrollLeftBtn = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        }
    };

    const scrollRightBtn = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        }
    };

    if (!isAuthenticated && (!recommendations || recommendations.length === 0)) {
        return (
            <section className="ai-section">
                <div className="ai-header">
                    <h2 className="ai-title">🤖 Recomendaciones Personalizadas</h2>
                </div>
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>📚 No se encontraron recomendaciones</p>
                </div>
                <div className="ai-blur-backdrop-permanent" />
                <div className="ai-auth-popup">
                    <div className="ai-auth-card">
                        <div className="ai-auth-content">
                            <div className="ai-auth-icon">🤖✨</div>
                            <h3 className="ai-auth-title">
                                ¡Desbloquea recomendaciones personalizadas!
                            </h3>
                            <p className="ai-auth-description">
                                Crea una cuenta para que nuestra IA aprenda tus gustos y te recomiende libros perfectos para ti.
                            </p>
                            <div className="ai-auth-features">
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">🎯</span>
                                    <span>Recomendaciones ultra-personalizadas</span>
                                </div>
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">📚</span>
                                    <span>Organiza tu librería personal</span>
                                </div>
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">⚡</span>
                                    <span>Sincronización automática</span>
                                </div>
                            </div>
                            <div className="ai-auth-actions">
                                <button
                                    className="ai-auth-btn primary"
                                    onClick={handleShowAuthModal}
                                >
                                    🚀 Crear cuenta gratis
                                </button>
                                <button
                                    className="ai-auth-btn secondary"
                                    onClick={handleShowAuthModal}
                                >
                                    🔑 Iniciar sesión
                                </button>
                            </div>
                            <p className="ai-auth-note">
                                ⏱️ Solo toma 30 segundos • 🔒 100% seguro
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="ai-section">
            <div className="ai-header">
                <h2 className="ai-title">🤖 Recomendaciones Personalizadas</h2>
                {isAuthenticated && (
                    <div className="ai-badges">
                        <span className="user-badge">
                            👤 Para {user?.username}
                        </span>
                    </div>
                )}
                <p className="ai-description">
                    {isAuthenticated
                        ? `Hola ${user?.username}! Estas son tus recomendaciones personalizadas basadas en tus preferencias`
                        : 'Descubre libros increíbles seleccionados especialmente para ti'
                    }
                </p>
            </div>

            {filteredBooks.length > 0 ? (
                <>
                    <div className="ai-results-info">
                        <p className="results-count">
                            🎯 {filteredBooks.length} recomendaciones {isAuthenticated ? 'personalizadas' : 'disponibles'}
                        </p>
                    </div>

                    <div className="scroll-navigation">
                        {showLeftButton && (
                            <button
                                className="scroll-btn prev"
                                onClick={scrollLeftBtn}
                                title="Ver anteriores"
                            >
                                ←
                            </button>
                        )}

                        <div
                            className={`cards-grid-horizontal ${isDragging ? 'dragging' : ''}`}
                            ref={scrollContainerRef}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                        >
                            {filteredBooks.map((book) => (
                                <div key={book.id} style={{ height: '100%' }}>
                                    <BookCard
                                        book={book}
                                        variant="vertical"
                                        showDate={true}
                                        onAddToLibrary={handleAddToLibrary}
                                        genreTranslations={genreTranslations}
                                    />
                                </div>
                            ))}
                        </div>

                        {showRightButton && (
                            <button
                                className="scroll-btn next"
                                onClick={scrollRightBtn}
                                title="Ver siguientes"
                            >
                                →
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <p>📚 No se encontraron recomendaciones.</p>
                </div>
            )}

            {!isAuthenticated && (
                <div className="ai-blur-backdrop-permanent" />
            )}

            {(showAuthPrompt && (!isAuthenticated || filteredBooks.length === 0)) && (
                <div className="ai-auth-popup">
                    <div className="ai-auth-card">
                        <div className="ai-auth-content">
                            <div className="ai-auth-icon">🤖✨</div>
                            <h3 className="ai-auth-title">
                                ¡Desbloquea recomendaciones personalizadas!
                            </h3>
                            <p className="ai-auth-description">
                                Crea una cuenta para que nuestra IA aprenda tus gustos y te recomiende libros perfectos para ti.
                            </p>
                            <div className="ai-auth-features">
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">🎯</span>
                                    <span>Recomendaciones ultra-personalizadas</span>
                                </div>
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">📚</span>
                                    <span>Organiza tu librería personal</span>
                                </div>
                                <div className="ai-auth-feature">
                                    <span className="feature-icon">⚡</span>
                                    <span>Sincronización automática</span>
                                </div>
                            </div>
                            <div className="ai-auth-actions">
                                <button
                                    className="ai-auth-btn primary"
                                    onClick={handleShowAuthModal}
                                >
                                    🚀 Crear cuenta gratis
                                </button>
                                <button
                                    className="ai-auth-btn secondary"
                                    onClick={handleShowAuthModal}
                                >
                                    🔑 Iniciar sesión
                                </button>
                            </div>
                            <p className="ai-auth-note">
                                ⏱️ Solo toma 30 segundos • 🔒 100% seguro
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default AIRecommendations;