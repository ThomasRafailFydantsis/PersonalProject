import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { FaCheck  } from "react-icons/fa";

const AddCertificateButton = ({ certId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isOwned, setIsOwned] = useState(false); // State to track if the certificate is owned

    const { userData } = useAuth();

    // Fetch owned certificates to check if the certificate is already owned
    useEffect(() => {
        const fetchOwnedCerts = async () => {
            try {
                const response = await axios.get(`https://localhost:7295/api/Certs/${userData.id}/owned`);
                const ownedCerts = response.data;
                // Check if the user owns the certificate
                const certificateOwned = ownedCerts.some(cert => cert.certId === certId);
                setIsOwned(certificateOwned);
            } catch (error) {
                console.error("Error fetching owned certificates:", error);
            }
        };

        if (userData) {
            fetchOwnedCerts();
        }
    }, [userData, certId]);

    // Add certificate to the user's account
    const addCertificateToUser = async () => {
        setIsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const response = await axios.post(
                "https://localhost:7295/api/Certificates/add",
                {
                    userId: userData.id,
                    certId: certId,
                },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setSuccessMessage("Certificate added successfully!");
                setIsOwned(true); // Update state to reflect that the certificate is now owned
            }
        } catch (error) {
            console.error("Error adding certificate:", error);
            setErrorMessage(
                error.response?.data || "Failed to add certificate. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isOwned ? (
                <button className="btn btn-success" disabled>
                    Owned   <FaCheck />
                </button>
            ) : (
                <button onClick={addCertificateToUser} disabled={isLoading}>
                    {isLoading ? "Adding..." : "Add Certificate"}
                </button>
            )}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </>
    );
};

export default AddCertificateButton;