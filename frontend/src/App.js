import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import AIRecommendations from './components/AIRecommnedations/AIRecommendations';
import TrendingBooks from './components/TrendingBooks/TrendingBooks';
import ReviewsSection from './components/ReviewsSection/ReviewsSection';
import MobileNavigation from './components/MobileNavigation/MobileNavigation';
import './App.css';

const App = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);
        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    return (
        <div className="app">
            <Navbar />

            <main className="main-content">
                <Hero />
                <AIRecommendations />
                <TrendingBooks />
                <ReviewsSection />
            </main>

            {isMobile && <MobileNavigation />}
        </div>
    );
};

export default App;