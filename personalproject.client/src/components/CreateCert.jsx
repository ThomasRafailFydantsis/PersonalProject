
import CertForm from './CertForm';

const CreateCertPage = () => {
    const handleSuccess = () => {
        console.log('Certificate created successfully!');
        // Optionally navigate or refresh data
    };

    return (
        <div>
            <h1>Create Certificate</h1>
            <CertForm onSuccess={handleSuccess} />
        </div>
    );
};

export default CreateCertPage;