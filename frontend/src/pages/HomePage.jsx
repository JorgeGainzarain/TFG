import React from 'react';
import Hero from '../components/WelcomeMessage/WelcomeMessage';
import AIRecommendations from '../components/AIRecommnedations/AIRecommendations';
import TrendingBooks from '../components/TrendingBooks/TrendingBooks'

const HomePage = ({ user, isAuthenticated, onShowAuth, handleAddToLibrary, libraryOptions, genreOptions, genreTranslations, recommendations }) => {
    return (
        <>
            <Hero />
            <AIRecommendations
                user={user}
                isAuthenticated={isAuthenticated}
                onShowAuth={onShowAuth}
                genreOptions={genreOptions}
                genreTranslations={genreTranslations}
                recommendations={recommendations}
                handleAddToLibrary={handleAddToLibrary}
            />
            <div className="section-spacing"></div>
            <TrendingBooks
                handleAddToLibrary={handleAddToLibrary}
                libraryOptions={libraryOptions}
                genreTranslations={genreTranslations}
            />
        </>
    );
};

export default HomePage;