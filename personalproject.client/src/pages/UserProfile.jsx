import { useEffect, useState } from 'react';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';


const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const status = await AuthService.getAuthStatus();
                setIsAuthenticated(status);

                if (status) {
                    const response = await fetch('https://localhost:7295/api/Account/me', {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                    }
                } else {
                    console.log('User not authenticated');
                }
            } catch (error) {
                console.error('Error checking authentication status or fetching user data:', error);
                setError('Failed to check authentication or fetch user data.');
            }
        };
        checkAuthStatus();
    }, []);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!isAuthenticated) {

        return <div>You are not logged in. Please log in.</div>;
    }
    const { userName } = userData || {};
    const { email } = userData || {};

    return (
        <>
            <Header />
            <main>
                <div>
                    <h1>User Profile</h1>
                    <p style={{ fontSize: '30px' }}><strong>Username:</strong> {userName}</p>
                    <p style={{ fontSize: '30px' }}><strong>Email:</strong> {email}</p>
                    <button className='green-button' onClick={() => navigate('/dashboard')}>Back</button>
                </div>
            </main>
        </>
    );
};

export default UserProfile;