import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const fetchAuthStatus = async () => {
            try {
                const status = await AuthService.getAuthStatus(); 
                setIsAuthenticated(status);
            } catch (error) {
                setIsAuthenticated(false);
                console.error('Error fetching auth status:', error);
            }
        };
        fetchAuthStatus();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>; 
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children; 
};

export default ProtectedRoute;