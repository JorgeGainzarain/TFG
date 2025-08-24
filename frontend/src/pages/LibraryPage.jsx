// REEMPLAZAR frontend/src/pages/LibraryPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getUserLibraries, createLibrary, addBookToLibrary, removeBookFromLibrary } from '../services/libraryService';
import AuthOverlay from '../components/AuthOverlay/AuthOverlay';
import LibraryContent from '../components/LibraryContent/LibraryContent';
import './Pages.css';

const LibraryPage = ({handleAddToLibrary, libraryOptions, genreTranslations}) => {
    const { user, isAuthenticated, loading, initialized, error } = useAuth();
    const [userBooks, setUserBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksError, setBooksError] = useState(null);

    // Estado para controlar la visibilidad del AuthOverlay
    const [showAuthOverlay, setShowAuthOverlay] = useState(false);

    // Función para obtener libros del usuario
    const getUserBooks = async () => {
        try {
            setBooksLoading(true);
            setBooksError(null);

            if (!user || !user.id) {
                setUserBooks([]);
                return;
            }

            console.log('Fetching libraries for user:', user.id);
            const libraries = await getUserLibraries(user.id);
            console.log('Libraries received:', libraries);

            const userBooks = [];

            // Procesar las bibliotecas y extraer los libros
            if (Array.isArray(libraries)) {
                for (const library of libraries) {
                    // Manejar diferentes estructuras posibles para los libros
                    userBooks.push({
                        title: library.title,
                        books: library.books || [],
                    });
                }
            }

            console.log('User books processed:', userBooks);
            setUserBooks(userBooks);

        } catch (error) {
            console.error('Error getting user books:', error);
            setBooksError('Error al cargar los libros');
            setUserBooks([]);
        } finally {
            setBooksLoading(false);
        }
    };

    // Cargar libros cuando el usuario esté disponible
    useEffect(() => {
        if (isAuthenticated && user && user.id) {
            getUserBooks();
        } else {
            setUserBooks([]);
        }
    }, [isAuthenticated, user?.id]);

    // Función para agregar libro (navegar a búsqueda)
    const handleAddBook = () => {
        window.location.href = '/search';
    };

    // Manejar el éxito de autenticación
    const handleAuthSuccess = (authenticatedUser) => {
        console.log('Authentication successful:', authenticatedUser);
        setShowAuthOverlay(false);
        // Los libros se cargarán automáticamente cuando isAuthenticated cambie
    };

    // Función para seleccionar libro (navegar a detalles)
    const handleBookSelect = (book) => {
        window.location.href = `/book/${book.bookId || book.id}`;
    };

    // Función para refrescar la biblioteca
    const handleRefreshLibrary = () => {
        getUserBooks();
    };

    const handleRemoveFromLibrary = async (bookId) => {
        try {
            await removeBookFromLibrary(bookId);
            // Refrescar la biblioteca después de eliminar el libro
            getUserBooks();
        } catch (error) {
            console.error('Error removing book from library:', error);
            setBooksError('Error al eliminar el libro de la biblioteca');
        }
    }

    // Mostrar loading durante inicialización
    if (!initialized || loading) {
        return (
            <div className="page-container">
                <div className="app-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando tu librería...</p>
                </div>
            </div>
        );
    }

    // Mostrar error de autenticación si existe
    if (error) {
        return (
            <div className="page-container">
                <div className="auth-required">
                    <div className="auth-required-icon">⚠️</div>
                    <h2>Error de autenticación</h2>
                    <p>{error}</p>
                    <button className="btn btn-primary" onClick={() => setShowAuthOverlay(true)}>
                        🔑 Ir al inicio
                    </button>
                </div>
            </div>
        );
    }

    // Mostrar página de login si no está autenticado
    if (!isAuthenticated) {
        return (
            <div className="page-container">
                <div className="auth-required">
                    <div className="auth-required-icon">📚</div>
                    <h2>Inicia sesión para ver tu librería</h2>
                    <p>Guarda y organiza tus libros favoritos creando una cuenta.</p>
                    <button className="btn btn-primary" onClick={() => setShowAuthOverlay(true)}>
                        🔑 Iniciar Sesión
                    </button>
                </div>

                <AuthOverlay
                    isVisible={showAuthOverlay}
                    onClose={() => setShowAuthOverlay(false)}
                    onAuthSuccess={handleAuthSuccess}
                />
            </div>
        );
    }

    // Mostrar error de carga de libros
    if (booksError) {
        return (
            <div className="page-container">
                <div className="auth-required">
                    <div className="auth-required-icon">📚</div>
                    <h2>Error al cargar la librería</h2>
                    <p>{booksError}</p>
                    <button className="btn btn-primary" onClick={handleRefreshLibrary}>
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // Mostrar loading de libros
    if (booksLoading) {
        return (
            <div className="page-container">
                <div className="app-loading">
                    <div className="loading-spinner"></div>
                    <p>Cargando tus libros...</p>
                </div>
            </div>
        );
    }

    // Renderizar contenido de la librería
    return (
        <div className="page-container">
            <LibraryContent
                userBooks={userBooks}
                onBookSelect={handleBookSelect}
                libraryOptions={libraryOptions}
                onAddBook={handleAddBook}
                handleAddToLibrary={handleAddToLibrary}
                user={user}
                onRefresh={handleRefreshLibrary}
                handleRemoveFromLibrary={handleRemoveFromLibrary}
                genreTranslations={genreTranslations}
            />
        </div>
    );
};

export default LibraryPage;