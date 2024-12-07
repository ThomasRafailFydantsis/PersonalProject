import { useState, useEffect } from 'react';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

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
            if (!isAuthenticated || !userData?.id) {
                console.warn('Cannot fetch certificates: User not authenticated or user data is missing.');
                return;
            }

            try {
                const response = await axios.get(`https://localhost:7295/api/Certs/${userData.id}/certificates`);
                setCertificates(response.data);
            } catch (error) {
                console.error('Error fetching certificates:', error);
                setError(error.response?.data?.message || 'An unexpected error occurred.');
            }
        };

        if (userData?.id) {
            fetchCertificates();
        }
    }, [isAuthenticated, userData]);

    if (isAuthenticated === null) {
        return (
            <div>
                <Header />
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Header />
                <p>{typeof error === 'string' ? error : error.message || 'An unknown error occurred.'}</p>
                <button className="green-button" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                <Header />
                <div>You are not logged in. Please log in.</div>
                <div>
                    <button className="green-button" onClick={() => navigate('/login')}>Login</button>
                </div>
            </div>
        );
    }

    const handleDelete = async (certId) => {
        try {
            const response = await axios.delete('https://localhost:7295/api/certificates/remove', {
                data: {
                    UserId: userData.id,
                    CertId: certId,
                },
            });

            alert(response.data);
            setCertificates(certificates.filter((cert) => cert.certId !== certId));
        } catch (error) {
            console.error('Error removing certificate:', error);
            alert('Failed to remove certificate.');
        }
    };

    return (
        <div>
            <Header />
            <h2>User Certificates</h2>
            {certificates.length === 0 ? (
                <div>
                    <p>No certificates found for the user.</p>
                </div>
            ) : (
                <ul>
                    {certificates.map((certificate) => (
                        <li style={{ fontSize: '25px' }} className="certList" key={certificate.certId}>
                            <h3>{certificate.certName}</h3>
                            <p>{certificate.description}</p>
                            <button onClick={() => handleDelete(certificate.certId)}>Remove Certificate</button>
                        </li>
                    ))}
                </ul>
            )}
            <button className="green-button" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
            </button>
        </div>
    );
}

export default UserCertificates;