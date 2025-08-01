import React from 'react';
import Hero from '../components/WelcomeMessage/WelcomeMessage';
import AIRecommendations from '../components/AIRecommnedations/AIRecommendations';
import TrendingBooks from '../components/TrendingBooks/TrendingBooks';
import ReviewsSection from '../components/ReviewsSection/ReviewsSection';

const HomePage = ({ user, isAuthenticated, onShowAuth }) => {
    return (
        <>
            <Hero />
            <AIRecommendations
                user={user}
                isAuthenticated={isAuthenticated}
                onShowAuth={onShowAuth}
            />
            <div className="section-spacing"></div>
            <TrendingBooks />
        </>
    );
};

export default HomePage;