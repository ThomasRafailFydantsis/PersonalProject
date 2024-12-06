import { useState } from 'react';
import axios from 'axios';

const AddCertificateButton = ({ id, certId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const addCertificateToUser = async () => {
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.post(
                'https://localhost:7295/api/Certificates/add',
                {
                    userId: id,     
                    certId: certId, 
                },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true, 
                }
            );

            if (response.status === 200) {
                setSuccessMessage('Certificate added successfully!');
            }
        } catch (error) {
            console.error('Error adding certificate:', error);
            setErrorMessage(error.response?.data || 'Failed to add certificate');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div>
            <button onClick={addCertificateToUser} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Certificate'}
            </button>
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </div>
    );
};

export default AddCertificateButton;