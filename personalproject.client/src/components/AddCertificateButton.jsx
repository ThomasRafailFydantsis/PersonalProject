import { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";

const AddCertificateButton = ({  certId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { userData } = useAuth();

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
            <button onClick={addCertificateToUser} disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Certificate"}
            </button>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </>
    );
};

export default AddCertificateButton;