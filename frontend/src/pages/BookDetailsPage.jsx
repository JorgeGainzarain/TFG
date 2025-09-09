
import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import BookDetails from '../components/BookDetails/BookDetails';
import './Pages.css';
import ReviewsSection from "../components/ReviewsSection/ReviewsSection";

const BookDetailsPage = ({ user, isAuthenticated, onShowAuth, handleAddToLibrary, libraryOptions, genreTranslations }) => {
    const location = useLocation();
    const navigate = useNavigate();

    
    const book = location.state?.book;

    const handleGoBack = () => {
        
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            
            navigate('/');
        }
    };

    
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
                handleAddToLibrary={handleAddToLibrary}
                libraryOptions={libraryOptions}
                genreTranslations={genreTranslations}
            />
            <ReviewsSection
                book={book}
                isAuthenticated={isAuthenticated}
                onShowAuth={onShowAuth}
            />
        </div>
    );
};

export default BookDetailsPage;