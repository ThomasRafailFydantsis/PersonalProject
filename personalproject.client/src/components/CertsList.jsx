import { useState, useEffect } from 'react';
import DeleteButton from './DeleteButton';
import certsService from '/MVC/PersonalProject/personalproject.client/CertsService';
import EditButton from './EditButton';
import axios from 'axios';

function CertsList({ id: userId }) {
    const [certs, setCerts] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [addStatus, setAddStatus] = useState({}); 

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
    }, []);

    const handleDelete = (certId) => {
        setCerts(certs.filter((cert) => cert.certId !== certId));
    };

    const handleUpdate = (updatedCert) => {
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

    return (
        <div>
            <h1>Certificates</h1>
            <ul>
                {certs.map((cert) => (
                    <li key={cert.certId}>
                        {editingId === cert.certId ? (
                            <EditButton cert={cert} onUpdate={handleUpdate} />
                        ) : (
                            <>
                                <div>{cert.certName}, {cert.description}</div>
                                <DeleteButton certId={cert.certId} onDelete={handleDelete} />
                                <button
                                    onClick={() => addCertificateToUser(cert.certId)}
                                    disabled={addStatus[cert.certId]?.isLoading}
                                >
                                    {addStatus[cert.certId]?.isLoading ? 'Adding...' : 'Add Certificate'}
                                </button>
                                {addStatus[cert.certId]?.successMessage && (
                                    <div style={{ color: 'green' }}>{addStatus[cert.certId]?.successMessage}</div>
                                )}
                                {addStatus[cert.certId]?.errorMessage && (
                                    <div style={{ color: 'red' }}>{addStatus[cert.certId]?.errorMessage}</div>
                                )}
                                <button onClick={() => setEditingId(cert.certId)}>Edit</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CertsList;