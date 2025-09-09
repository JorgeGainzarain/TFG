

import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const AuthWrapper = ({ children }) => {
    const { isAuthenticated, user, initialized } = useAuthContext();
    const [key, setKey] = useState(0);
    const location = useLocation();

    
    useEffect(() => {
        const handleAuthChange = () => {
            setKey(prev => prev + 1);
        };

        
        window.addEventListener('auth-changed', handleAuthChange);

        return () => {
            window.removeEventListener('auth-changed', handleAuthChange);
        };
    }, []);

    
    useEffect(() => {
        setKey(prev => prev + 1);
    }, [isAuthenticated, user, initialized]);

    return (
        <div key={`auth-wrapper-${key}`}>
            {children}
        </div>
    );
};

export default AuthWrapper;