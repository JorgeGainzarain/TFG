import React, {useState, useEffect, useRef, useMemo} from 'react';
import {BrowserRouter as Router, Routes, Route, useLocation, useNavigate} from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import MobileNavbar from './components/MobileNavbar/MobileNavbar';
import AuthOverlay from './components/AuthOverlay/AuthOverlay';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import BookDetailsPage from './pages/BookDetailsPage';
import LibraryPage from './pages/LibraryPage';
import { AIRecommendationsPage, ProfilePage, NotFoundPage } from './pages/AdditionalPages';
import { useAuth } from './hooks/useAuth';
import { healthCheck, getRecommendations } from './services/api';
import {addBookToLibrary, getUserLibraries} from './services/libraryService';
import './App.css';
import {initializeAuth, getDefaultLibraries, logout} from "./services/authService";

// Componente interno que tiene acceso a useLocation
const AppContent = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [apiStatus, setApiStatus] = useState('checking');
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [libraryOptions, setLibraryOptions] = useState([]);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Ref para la navbar
    const navbarRef = useRef();

    const navigate = useNavigate();

    // Hook de autenticación
    const { user, isAuthenticated, initialized } = useAuth();
    const location = useLocation();

    // Unique genres list
    const uniqueGenres = useMemo(() => [
        'ANTIQUES & COLLECTIBLES',
        'LITERARY COLLECTIONS',
        'ARCHITECTURE',
        'LITERARY CRITICISM',
        'ART',
        'MATHEMATICS',
        'BIBLES',
        'MEDICAL',
        'BIOGRAPHY & AUTOBIOGRAPHY',
        'MUSIC',
        'BODY, MIND & SPIRIT',
        'NATURE',
        'BUSINESS & ECONOMICS',
        'PERFORMING ARTS',
        'COMICS & GRAPHIC NOVELS',
        'PETS',
        'COMPUTERS',
        'PHILOSOPHY',
        'COOKING',
        'PHOTOGRAPHY',
        'CRAFTS & HOBBIES',
        'POETRY',
        'DESIGN',
        'POLITICAL SCIENCE',
        'DRAMA',
        'PSYCHOLOGY',
        'EDUCATION',
        'REFERENCE',
        'FAMILY & RELATIONSHIPS',
        'RELIGION',
        'FICTION',
        'SCIENCE',
        'GAMES & ACTIVITIES',
        'SELF-HELP',
        'GARDENING',
        'SOCIAL SCIENCE',
        'HEALTH & FITNESS',
        'SPORTS & RECREATION',
        'HISTORY',
        'STUDY AIDS',
        'HOUSE & HOME',
        'TECHNOLOGY & ENGINEERING',
        'HUMOR',
        'TRANSPORTATION',
        'JUVENILE FICTION',
        'TRAVEL',
        'JUVENILE NONFICTION',
        'TRUE CRIME',
        'LANGUAGE ARTS & DISCIPLINES',
        'YOUNG ADULT FICTION',
        'LANGUAGE STUDY',
        'YOUNG ADULT NONFICTION',
        'LAW'
    ], []);

    const genreTranslations = {
        'ANTIQUES & COLLECTIBLES': 'Antigüedades y Coleccionables',
        'LITERARY COLLECTIONS': 'Colecciones Literarias',
        'ARCHITECTURE': 'Arquitectura',
        'LITERARY CRITICISM': 'Crítica Literaria',
        'ART': 'Arte',
        'MATHEMATICS': 'Matemáticas',
        'BIBLES': 'Biblias',
        'MEDICAL': 'Medicina',
        'BIOGRAPHY & AUTOBIOGRAPHY': 'Biografía y Autobiografía',
        'MUSIC': 'Música',
        'BODY, MIND & SPIRIT': 'Cuerpo, Mente y Espíritu',
        'NATURE': 'Naturaleza',
        'BUSINESS & ECONOMICS': 'Negocios y Economía',
        'PERFORMING ARTS': 'Artes Escénicas',
        'COMICS & GRAPHIC NOVELS': 'Cómics y Novelas Gráficas',
        'PETS': 'Mascotas',
        'COMPUTERS': 'Informática',
        'PHILOSOPHY': 'Filosofía',
        'COOKING': 'Cocina',
        'PHOTOGRAPHY': 'Fotografía',
        'CRAFTS & HOBBIES': 'Manualidades y Pasatiempos',
        'POETRY': 'Poesía',
        'DESIGN': 'Diseño',
        'POLITICAL SCIENCE': 'Ciencias Políticas',
        'DRAMA': 'Drama',
        'PSYCHOLOGY': 'Psicología',
        'EDUCATION': 'Educación',
        'REFERENCE': 'Referencia',
        'FAMILY & RELATIONSHIPS': 'Familia y Relaciones',
        'RELIGION': 'Religión',
        'FICTION': 'Ficción',
        'SCIENCE': 'Ciencia',
        'GAMES & ACTIVITIES': 'Juegos y Actividades',
        'SELF-HELP': 'Autoayuda',
        'GARDENING': 'Jardinería',
        'SOCIAL SCIENCE': 'Ciencias Sociales',
        'HEALTH & FITNESS': 'Salud y Bienestar',
        'SPORTS & RECREATION': 'Deportes y Recreación',
        'HISTORY': 'Historia',
        'STUDY AIDS': 'Material de Estudio',
        'HOUSE & HOME': 'Hogar',
        'TECHNOLOGY & ENGINEERING': 'Tecnología e Ingeniería',
        'HUMOR': 'Humor',
        'TRANSPORTATION': 'Transporte',
        'JUVENILE FICTION': 'Ficción Juvenil',
        'TRAVEL': 'Viajes',
        'JUVENILE NONFICTION': 'No Ficción Juvenil',
        'TRUE CRIME': 'Crimen Real',
        'LANGUAGE ARTS & DISCIPLINES': 'Artes y Disciplinas del Lenguaje',
        'YOUNG ADULT FICTION': 'Ficción para Jóvenes Adultos',
        'LANGUAGE STUDY': 'Estudio de Idiomas',
        'YOUNG ADULT NONFICTION': 'No Ficción para Jóvenes Adultos',
        'LAW': 'Derecho'
    };

    useEffect(() => {
        const fetchLibraryOptions = async () => {
            try {
                const response = await getUserLibraries(user?.id || 1);
                console.log("Response from getUserLibraries:", response);
                const mappedLibraries = Array.isArray(response)
                    ? response.map(lib => ({
                        id: lib.id,
                        title: lib.title
                    }))
                    : [];
                console.log("Mapped library options:", mappedLibraries);
                setLibraryOptions(mappedLibraries);
            } catch (error) {
                console.error('Error fetching default libraries:', error);
            }
        };

        fetchLibraryOptions();
    }, []);


    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        // Check on mount and on resize
        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    useEffect(() => {
        const performHealthCheck = async () => {
            setApiStatus('checking');

            try {
                await healthCheck();
                setApiStatus('connected');
            } catch (error) {
                console.error('❌ Health check failed:', error);
                setApiStatus('error');
            }
        };

        performHealthCheck();
    }, []); // Solo ejecutar una vez al montar

    useEffect(() => {
        initializeAuth().then(() => {
            setApiStatus('connected');
        });
    }, []);

    // Limpiar estado
    useEffect(() => {
        if (location.pathname !== '/search') {
            setSearchResults([]);
            setSearchQuery('');
            setSearchError(null);
            setIsSearching(false);
        }
    }, [location.pathname]);

    const checkApiHealth = async () => {
        try {
            await healthCheck();
            setApiStatus('connected');
        } catch (error) {
            setApiStatus('error');
            console.error('❌ Failed to connect to BookHub API:', error);
        }
    };

    const handleLogout = async () => {
        try {
            console.log("Logging out user:", user);
            await logout();
            setShowUserMenu(false);
            alert('¡Hasta luego! Has cerrado sesión exitosamente.');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleSearchResults = (books, query) => {
        console.log("Search results received:", books, "for query:", query);
        setSearchResults(books);
        setSearchQuery(query);
        setSearchError(null);
    };

    const handleSearchLoading = (loading) => {
        setIsSearching(loading);
    };

    const handleSearchError = (error) => {
        setSearchError(error);
        if (error) {
            setSearchResults([]);
        }
    };

    const clearSearch = () => {
        const recommendations = getRecommendations();
        setSearchResults(recommendations);
        setSearchQuery('');
        setSearchError(null);
        setIsSearching(false);

        navigate('/search?recommendations=true');
    };

    const handleAuthSuccess = (userData) => {
        setShowAuthPrompt(false);
    };

    const handleShowAuth = () => {
        setShowAuthOverlay(true);
        setShowAuthPrompt(false);
    };

    const handleCloseAuth = () => {
        setShowAuthOverlay(false);
    };

    const handleCloseAuthPrompt = () => {
        setShowAuthPrompt(false);
    };

    const handleAddToLibrary = async (book, libraryId) => {
        console.log("Adding book to library:", book, "in library:", libraryId);
        await addBookToLibrary(user.id, book, libraryId);
        alert('Libro añadido a tu librería');
    }

    // Mostrar loading mientras se inicializa la auth
    if (!initialized) {
        return (
            <div className="app">
                <div className="app-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando BookHub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <Navbar
                ref={navbarRef}
                setShowUserMenu={setShowUserMenu}
                showUserMenu={showUserMenu}
                handleLogout={handleLogout}
                onSearchResults={handleSearchResults}
                onSearchLoading={handleSearchLoading}
                onSearchError={handleSearchError}
                user={user}
                isAuthenticated={isAuthenticated}
                onShowAuth={handleShowAuth}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="main-content">
                {/* API Status Banner */}
                {apiStatus === 'error' && (
                    <div className="api-status-banner error">
                        ⚠️ No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.
                        <button onClick={checkApiHealth} className="retry-connection">
                            🔄 Reintentar
                        </button>
                    </div>
                )}

                {apiStatus === 'checking' && (
                    <div className="api-status-banner checking">
                        🔄 Conectando con el servidor...
                    </div>
                )}

                {/* Rutas principales */}
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                                handleAddToLibrary={handleAddToLibrary}
                                libraryOptions={libraryOptions}
                                genreOptions={uniqueGenres}
                                genreTranslations={genreTranslations}
                            />
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <SearchPage
                                searchResults={searchResults}
                                searchQuery={searchQuery}
                                isSearching={isSearching}
                                searchError={searchError}
                                libraryOptions={libraryOptions}
                                onClearSearch={clearSearch}
                                onSearchResults={handleSearchResults}
                                onSearchLoading={handleSearchLoading}
                                onSearchError={handleSearchError}
                                user={user}
                                isAuthenticated={isAuthenticated}
                                handleAddToLibrary={handleAddToLibrary}
                                genreOptions={uniqueGenres}
                                genreTranslations={genreTranslations}
                            />
                        }
                    />
                    <Route
                        path="/book/:bookId"
                        element={
                            <BookDetailsPage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                                handleAddToLibrary={handleAddToLibrary}
                                libraryOptions={libraryOptions}
                                genreTranslations={genreTranslations}
                            />
                        }
                    />
                    <Route
                        path="/library"
                        element={<LibraryPage
                            handleAddToLibrary={handleAddToLibrary}
                            libraryOptions={libraryOptions}
                            genreTranslations={genreTranslations}
                        />
                    }
                    />
                    <Route
                        path="/ai-recommendations"
                        element={
                            <AIRecommendationsPage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                            />
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProfilePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                                handleLogout={handleLogout}
                            />
                        }
                    />
                    <Route
                        path="/favorites"
                        element={<LibraryPage
                            handleAddToLibrary={handleAddToLibrary}
                            libraryOptions={libraryOptions}
                            genreTranslations={genreTranslations}
                        />}
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProfilePage
                                user={user}
                                isAuthenticated={isAuthenticated}
                                onShowAuth={handleShowAuth}
                                handleLogout={handleLogout}
                            />
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </main>

            {isMobile && <MobileNavbar
                isAuthenticated={isAuthenticated}
                onShowAuth={handleShowAuth}
            />}

            {/* Auth Modal */}
            <AuthOverlay
                isVisible={showAuthOverlay}
                onClose={handleCloseAuth}
                onAuthSuccess={handleAuthSuccess}
            />

            {/* Auth Prompt - Solo en home */}
            {showAuthPrompt && !isAuthenticated && location.pathname === '/' && (
                <div className="auth-prompt-overlay">
                    <div className="auth-prompt-backdrop" onClick={handleCloseAuthPrompt}></div>
                    <div className="auth-prompt-card">
                        <button className="auth-prompt-close" onClick={handleCloseAuthPrompt}>
                            ✕
                        </button>
                        <div className="auth-prompt-content">
                            <div className="auth-prompt-icon">📚✨</div>
                            <h3 className="auth-prompt-title">
                                ¡Descubre tu próxima lectura favorita!
                            </h3>
                            <p className="auth-prompt-description">
                                Únete a BookHub y accede a recomendaciones personalizadas, tu librería personal y mucho más.
                            </p>

                            <div className="auth-prompt-features">
                                <div className="feature">
                                    <span className="feature-icon">🤖</span>
                                    <span>Recomendaciones con IA</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">📚</span>
                                    <span>Librería personal</span>
                                </div>
                                <div className="feature">
                                    <span className="feature-icon">⭐</span>
                                    <span>Sistema de favoritos</span>
                                </div>
                            </div>

                            <div className="auth-prompt-actions">
                                <button
                                    className="auth-prompt-btn primary"
                                    onClick={handleShowAuth}
                                >
                                    🚀 Crear cuenta gratis
                                </button>
                                <button
                                    className="auth-prompt-btn secondary"
                                    onClick={handleShowAuth}
                                >
                                    🔑 Iniciar sesión
                                </button>
                            </div>

                            <p className="auth-prompt-note">
                                ⏱️ Solo toma 30 segundos • 🔒 100% seguro
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Componente principal que envuelve todo con Router
const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;