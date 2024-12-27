import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import certsService from "/MVC/PersonalProject/personalproject.client/CertsService";
import AddCertificateButton from "./AddCertificateButton";
import DeleteButton from "./DeleteButton";

function CertsList({ id: userId }) {
    const { isAuthenticated, userData, roles, AuthError } = useAuth();
    const [certs, setCerts] = useState([]);
    const navigate = useNavigate();

    const isAdmin = roles.includes("Admin");
    const isMarker = roles.includes("Marker");

    // Fetch certificates
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

    // Redirect if unauthenticated
    useEffect(() => {
        if (!isAuthenticated || !userData) {
            console.log("User is not authenticated. Redirecting to login page...");
            navigate("/login");
        }
    }, [isAuthenticated, userData, navigate]);

    // Handle delete
    const handleDelete = async (certId) => {
        try {
            await certsService.deleteCert(certId); // Implement this method in your service
            setCerts(certs.filter((cert) => cert.certId !== certId));
        } catch (error) {
            console.error("Error deleting certificate:", error);
        }
    };


    // Navigate to update exam
    const handleUpdateExam = (certId) => {
        navigate(`/certForm/${certId}`);
    };
 
    // Render error
    if (AuthError) {
        return <div>Error: {AuthError}</div>;
    }

    return (
        <div style={{maxWidth: "800px", margin: "0 auto"}}>
            <h1>Certificates</h1>
            <ul>
                {certs.map((cert) => (
                    <li key={cert.certId} className="certList">
                        <>
                            <div>{cert.certName}</div>
                            {cert.imagePath ? (
                                <img
                                    src={`https://localhost:7295${cert.imagePath}`} // Use full path
                                    alt={cert.certName}
                                    className="cert-image"
                                    style={{ width: "130px", height: "130px" ,justifySelf:"center"}}
                                />
                            ) : (
                                <div>No image available</div>
                            )}
                            {isAdmin && <DeleteButton certId={cert.certId} onDelete={handleDelete} />}
                            {isAdmin && <button onClick={() => handleUpdateExam(cert.certId)}>Edit</button>}
                            {isMarker && <button onClick={() => handleUpdateExam(cert.certId)}>Edit</button>}
                            <AddCertificateButton certId={cert.certId} />
                        </>
                       
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CertsList;