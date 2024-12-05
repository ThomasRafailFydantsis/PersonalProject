import { useState, useEffect } from 'react';
import DeleteButton from './DeleteButton';
import certsService from '/MVC/PersonalProject/personalproject.client/CertsService';
import EditButton from './EditButton';

function CertsList() {
    const [certs, setCerts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    
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

    const handleDelete = (id) => {
        setCerts(certs.filter((cert) => cert.certId !== id));
    };

    const handleUpdate = (updatedCert) => {
            setCerts((prevCerts) =>
                prevCerts.map((cert) => (cert.certId === updatedCert.certId ? updatedCert : cert))
            );
            setEditingId(null); 
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
                                {cert.certName}, {cert.key}
                                <DeleteButton certId={cert.certId} onDelete={handleDelete} />
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