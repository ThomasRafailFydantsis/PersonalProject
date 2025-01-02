import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { FaCheck } from "react-icons/fa";

const AddCertificateButton = ({ certId }) => {
    const { userData, coins } = useAuth(); // Ensure `coins` is properly passed from AuthProvider
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isOwned, setIsOwned] = useState(false);
    const [cost, setCost] = useState(0);
    const [userCoins, setUserCoins] = useState(coins); // Use coins from userData or props

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch the exam details
                const examData = await axios.get(`https://localhost:7295/api/Exam/${certId}`);
                setCost(examData.data.Cost);

                // Fetch owned certificates for the user
                const ownedCertsResponse = await axios.get(
                    `https://localhost:7295/api/Certs/${userData.id}/owned`
                );
                const ownedCerts = ownedCertsResponse.data;

                // Check if the user already owns the certificate
                setIsOwned(ownedCerts.some((cert) => cert.certId === certId));
            } catch (error) {
                console.error("Error fetching details:", error);
            }
        };

        if (userData) {
            fetchDetails();
        }
    }, [userData, certId]);

    // Add certificate to user
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
                setUserCoins(response.data.UpdatedBalance); // Update the displayed coins
                setIsOwned(true); // Mark the certificate as owned
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
        <div>
            {isOwned ? (
                <button className="btn btn-success" disabled>
                    Owned <FaCheck />
                </button>
            ) : (
                <button
                    onClick={addCertificateToUser}
                    className="btn btn-success"
                    disabled={isLoading || cost > userCoins} // Check against userCoins
                >
                    {isLoading
                        ? "Processing..."
                        : cost > 0
                        ? `Buy for ${cost}`
                        : "Add for Free"}
                </button>
            )}
            
         
        </div>
    );
};

export default AddCertificateButton;