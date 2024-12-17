import { useState, useEffect } from 'react';
import DeleteButton from './DeleteButton';
import certsService from '/MVC/PersonalProject/personalproject.client/CertsService';
import axios from 'axios';
import EditButton from './EditButton';

function CertsList({ id: userId }) {
    const [certs, setCerts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [addStatus, setAddStatus] = useState({}); 
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
               
                const authResponse = await axios.get("https://localhost:7295/api/Account/auth-status", {
                    withCredentials: true,
                });

                if (authResponse.data.isAuthenticated) {
                    setIsAuthenticated(true);

                    
                    const userResponse = await axios.get("https://localhost:7295/api/Account/me", {
                        withCredentials: true,
                    });

                    const userData = userResponse.data;
                    setUserData(userData);

                  
                    if (userData.roles && userData.roles.includes("Admin")) {
                        setIsAdmin(true);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Error fetching user data or authentication status:", err);
                setError("Failed to fetch user data or check authentication.");
            }
        };

        fetchUserDetails();
    }, []);


    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const data = await certsService.getCerts();
                setCerts(data);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };
        fetchCerts();
    }, [ ]);

    const handleDelete = (certId) => {
        setCerts(certs.filter((cert) => cert.certId !== certId));
    };

    const handleUpdate = (updatedCert) => {
        if (!updatedCert || !updatedCert.certId) {
            console.error("Invalid certificate object:", updatedCert);
            return;
        }
        setCerts((prevCerts) =>
            prevCerts.map((cert) => (cert.certId === updatedCert.certId ? updatedCert : cert))
        );
        setEditingId(null);
    };

    const addCertificateToUser = async (certId) => {
        setAddStatus((prev) => ({
            ...prev,
            [certId]: { isLoading: true, successMessage: '', errorMessage: '' },
        }));

        try {
            const response = await axios.post(
                'https://localhost:7295/api/Certificates/add',
                { userId, certId },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                }
            );

            setAddStatus((prev) => ({
                ...prev,
                [certId]: { isLoading: false, successMessage: response.data, errorMessage: '' },
            }));
        } catch (error) {
            const errorMessage = error.response?.data || 'An error occurred.';
            setAddStatus((prev) => ({
                ...prev,
                [certId]: { isLoading: false, successMessage: '', errorMessage },
            }));
        }
    };
    if (!userData) {
        console.log("User data not available. Redirecting to login page...");
    }
    if (isAdmin) {
        console.log("User is an admin. Redirecting to admin dashboard...");
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!isAuthenticated) {

        console.log("User is not authenticated. Redirecting to login page...");
    }

    return (
        <div>
            <h1>Certificates</h1>
            <ul>
                {certs.map((cert) => (
                    <li key={cert.certId} className="certList">
                        {editingId === cert.certId ? (
                            <EditButton
                                cert={cert}
                                onUpdate={handleUpdate}
                            />
                        ) : (
                            <>
                                <div>{cert.certName}, {cert.description}</div>
                                    {isAdmin && <DeleteButton certId={cert.certId} onDelete={handleDelete} />}
                                    <button 
                                    onClick={() => addCertificateToUser(cert.certId)}
                                    disabled={addStatus[cert.certId]?.isLoading}
                                >
                                    {addStatus[cert.certId]?.isLoading ? 'Adding...' : 'Add Certificate'}
                                </button>
                                    {isAdmin && <button onClick={() => setEditingId(cert.certId)}>Edit</button>}
                            </>
                        )}
                        {addStatus[cert.certId]?.successMessage && (
                            <div style={{ color: 'green' }}>{addStatus[cert.certId]?.successMessage}</div>
                        )}
                        {addStatus[cert.certId]?.errorMessage && (
                            <div style={{ color: 'red' }}>{addStatus[cert.certId]?.errorMessage}</div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CertsList;