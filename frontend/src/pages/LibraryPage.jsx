// REEMPLAZAR frontend/src/pages/LibraryPage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getLibrariesFromUser } from '../services/api';
import LibraryContent from '../components/LibraryContent/LibraryContent';
import './Pages.css';

const LibraryPage = () => {
    const { user, isAuthenticated, loading, initialized, error } = useAuth();
    const [userBooks, setUserBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(false);
    const [booksError, setBooksError] = useState(null);

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
            const libraries = await getLibrariesFromUser(user.id);
            console.log('Libraries received:', libraries);

            const userBooks = [];

            // Procesar las bibliotecas y extraer los libros
            if (Array.isArray(libraries)) {
                for (const library of libraries) {
                    // Manejar diferentes estructuras posibles para los libros
                    if (library.books && Array.isArray(library.books)) {
                        userBooks.push(...library.books);
                    } else if (library.bookIds && Array.isArray(library.bookIds)) {
                        // Si solo tienes IDs, aquí podrías hacer otra llamada para obtener los detalles
                        // Por ahora asumimos que tienes los objetos completos
                        console.warn('Library has bookIds but no book objects:', library);
                    }
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

    // Función para seleccionar libro (navegar a detalles)
    const handleBookSelect = (book) => {
        window.location.href = `/book/${book.bookId || book.id}`;
    };

    // Función para refrescar la biblioteca
    const handleRefreshLibrary = () => {
        getUserBooks();
    };

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
                    <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
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
                    <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
                        🔑 Iniciar Sesión
                    </button>
                </div>
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
                onAddBook={handleAddBook}
                user={user}
                onRefresh={handleRefreshLibrary}
            />
        </div>
    );
};

export default LibraryPage;