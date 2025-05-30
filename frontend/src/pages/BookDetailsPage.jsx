// frontend/src/pages/BookDetailsPage.jsx
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import BookDetails from '../components/BookDetails/BookDetails';
import './Pages.css';

const BookDetailsPage = ({ user, isAuthenticated, onShowAuth }) => {
    const { bookId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Obtener los datos del libro del state de la ubicación
    const book = location.state?.book;

    const handleGoBack = () => {
        // Si hay history, ir atrás
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            // Fallback al home
            navigate('/');
        }
    };

    // Si no hay datos del libro, mostrar mensaje de error
    if (!book) {
        return (
            <div className="page-container">
                <div className="not-found">
                    <div className="not-found-icon">📚</div>
                    <h1>Libro no encontrado</h1>
                    <p>No se encontraron los detalles del libro. Por favor, regresa y selecciona un libro de nuevo.</p>
                    <button
                        className="btn btn-primary"
                        onClick={handleGoBack}
                    >
                        🏠 Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <BookDetails
                book={book}
                user={user}
                isAuthenticated={isAuthenticated}
                onShowAuth={onShowAuth}
                onGoBack={handleGoBack}
            />
        </div>
    );
};

export default BookDetailsPage;