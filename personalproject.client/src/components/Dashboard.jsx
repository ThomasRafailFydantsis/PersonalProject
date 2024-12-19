import { useState, useEffect } from 'react';
import CertsList from './CertsList';
//import CertForm from './CertForm';
//import Logout from './Logout';
//import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
//import ProtectedComponent from './ProtectedComponent';

function Dashboard() {
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [error, setError] = useState(null);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
    const checkAuthStatus = async () => {
        try {
            const statusResponse = await fetch('https://localhost:7295/api/Account/auth-status', {
                method: 'GET',
                credentials: 'include', 
            });

            if (statusResponse.ok) {
                const status = await statusResponse.json();
                setIsAuthenticated(status.isAuthenticated);

                if (status.isAuthenticated) {
                    const response = await fetch('https://localhost:7295/api/Account/me', {
                        method: 'GET',
                        credentials: 'include', 
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                        setRoles(data.roles);
                    } else {
                        setError('Failed to fetch user data');
                    }
                } else {
                    console.log('User not authenticated');
                }
            } else {
                setError('Failed to check authentication status');
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
    const { userName} = userData || {};
    const { id } = userData || {};
    return (
        <div>
            <Header />
            <div className='wrapper'>
            <h2 style={{ fontSize: '40px' }} className='welcome'>Welcome Back, {userName}!</h2>
            {roles.includes("Admin") && <p>You have Admin access.</p>}
                {roles.includes("User") && <p>You have User access.</p>}
                {roles.includes("Marker") && <p>You have Marker access.</p>}
            <div className='dashboard-certificates'>
            <CertsList id={id} />
            </div>
            <button name="userProfile" onClick={() => navigate('/userProfile')}>User Profile</button>
            <button name="userProfile" onClick={() => navigate('/userCertificates')}>Your Certificates</button>
                {roles.includes("Admin") && <button name="certForm" onClick={() => navigate('/CreateCert')}>Add Certificate</button>}
                {roles.includes("Marker") && <button name="certForm" onClick={() => navigate('/CreateCert')}>Add Certificate</button>}
            {roles.includes("Admin") && <button name="userTable" onClick={() => navigate('/userTable')}>User Table</button>}
            </div>
        </div>
    );
}

export default Dashboard;