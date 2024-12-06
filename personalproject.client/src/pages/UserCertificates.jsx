import { useState, useEffect } from 'react';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function UserCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
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
                    } else {
                        setError('Failed to fetch user data.');
                    }
                } else {
                    console.log('User not authenticated');
                }
            } catch (error) {
                console.error('Error checking authentication status:', error);
                setError('An unexpected error occurred.');
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchCertificates = async () => {
            if (!isAuthenticated || !userData?.id) return;  

            try {
                const response = await axios.get(`https://localhost:7295/api/Certs/${userData.id}/certificates`);
                setCertificates(response.data);
            } catch (error) {
                console.error('Error fetching certificates:', error);
                setError(error.response?.data || 'An unexpected error occurred.');
            }
        };

        fetchCertificates();
    }, [isAuthenticated, userData]);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (error) {
        return (
            <div>
                <p>{error}</p>
                <button onClick={() => navigate('/login')}>Go to Login</button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    const handleDelete = async (certId) => {
       
     
            const response = await axios.delete('https://localhost:7295/api/certificates/remove', {
                data: {
                    UserId: userData.id,
                    CertId: certId
                }
            });

            alert(response.data);
            setCertificates(certificates.filter(cert => cert.certId !== certId));
        
    };

    return (
        <div>
            <h2>User Certificates</h2>
            {certificates.length === 0 ? (
                <p>No certificates found for the user.</p>
            ) : (
                <ul>
                    {certificates.map((certificate) => {
                        return (
                            <li key={certificate.certId}>
                                <h3>{certificate.certName}</h3>
                                <p>{certificate.description}</p>
                                <button onClick={() => handleDelete(certificate.certId)}>
                                    Remove Certificate
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default UserCertificates;