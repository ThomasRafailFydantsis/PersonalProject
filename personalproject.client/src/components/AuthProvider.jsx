import { createContext, useState, useEffect, useContext } from "react";
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userData, setUserData] = useState(null);
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
   


    const revalidateAuth = async () => {
        setLoading(true);
        try {
            const isAuthenticated = await AuthService.getAuthStatus();
            setIsAuthenticated(isAuthenticated);

            if (isAuthenticated) {
                const user = await AuthService.getCurrentUserData();
                setUserData(user);
                setRoles(user.roles || []);
            } else {
                setUserData(null);
                setRoles([]);
            }
        } catch (error) {
            setError(error.message || 'Failed to revalidate authentication');
        } finally {
            setLoading(false);
            setIsAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AuthService.logout(); 
            setIsAuthenticated(false);
            setUserData(null);
            setRoles([]);
            setError(null);
        } catch (error) {
            console.error("Logout error:", error);
            setError("Failed to log out. Please try again.");
        }
    };

    useEffect(() => {
        revalidateAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, userData, roles, error, loading, revalidateAuth, handleLogout, isAuthLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);