import  { useState } from 'react';
import certsService from '/MVC/PersonalProject/personalproject.client/CertsService';

const CertForm = () => {
    const [cert, setCert] = useState({
        CertName: '',
        Key: '',});
    

    const handleChange = (e) => {
        e.target.value;
        setCert({ ...cert, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            //if (certToEdit) {
            //    // Update the certificate
            //    await certsService.updateCert(certToEdit.certId, cert);
            //    console.log('Certificate updated successfully');
            //} else {
                // Create a new certificate
                await certsService.createCert(cert);
                console.log('Certificate created successfully');
            //}

            //if (onSuccess) onSuccess(); // Callback for parent to refresh data or show a message
        } catch (error) {
            console.error('Error submitting certificate:', error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
            <h1>Create Certificate</h1>
                <label>
                    Name:
                    <input
                        type="text"
                        name="CertName"
                        value={cert.CertName}
                        onChange={handleChange}
                        required
                    />
                </label>
            </div>
            <div>
                <label>
                    Issued To:
                    <input
                        type="text"
                        name="Description"
                        value={cert.Description}
                        onChange={handleChange}
                        required
                    />
                </label>
            </div>
            <button type="submit">Submit</button>
            {/*<button type="submit">*/}
            {/*    {certToEdit ? 'Update Certificate' : 'Create Certificate'}*/}
            {/*</button>*/}
        </form>
    );
};

export default CertForm;