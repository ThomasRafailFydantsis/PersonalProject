import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import { useAuth } from '../components/AuthProvider';

function UserCertificates() {
    const [certificates, setCertificates] = useState([]);
    const [error, setError] = useState(null);
    const { isAuthenticated, userData, AuthError, revalidateAuth,roles } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        revalidateAuth(); // Validate authentication state
    }, [location]);

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

    const handleDelete = async (certId) => {
        try {
            await axios.delete('https://localhost:7295/api/certificates/remove', {
                data: { UserId: userData.id, CertId: certId },
            });

            setCertificates(certificates.filter((cert) => cert.certId !== certId));
        } catch (error) {
            console.error('Error removing certificate:', error);
        }
    };

    const handleTakeExam = (certId) => {
        navigate(`/take-exam/${certId}`, { state: { userId: userData.id } });
    };

    // Handle different states
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
                <h1>User Certificates</h1>
                <p>{typeof error === 'string' ? error : error.message || 'An unknown error occurred.'}</p>
                <button className="green-button" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div>
                <Header />
                <div>You are not logged in. Please log in.</div>
                <button className="green-button" onClick={() => navigate('/login')}>Login</button>
            </div>
        );
    }

    if (AuthError) {
        return <div>{AuthError}</div>;
    }

    // Add permission check based on roles
   

    return (
        <div>
            <Header />
            <h2>User Certificates</h2>
            {certificates.length === 0 ? (
                <div>No certificates found for the user.</div>
            ) : (
                <div className="dashboard-certificates" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <ul>
                        {certificates.map((certificate) => (
                            <li key={certificate.certId} className="certList" style={{ maxWidth: '600px', marginTop: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', maxHeight: '200px', fontSize: '25px' }}>
                                <div>
                                    <div style={{ fontSize: '25px' }}>{certificate.certName}</div>
                                    <button className="green-button" onClick={() => handleTakeExam(certificate.certId)}>Take Exam</button>
                                  {roles.includes("Admin") && <button className="red-button" onClick={() => handleDelete(certificate.certId)}>Remove Certificate</button>}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
           
        </div>
    );
}

export default UserCertificates;