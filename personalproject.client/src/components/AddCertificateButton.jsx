import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { FaCheck } from "react-icons/fa";
import { ImCoinDollar } from "react-icons/im";
import { useNavigate } from "react-router-dom";
const AddCertificateButton = ({ certId }) => {
    const { userData, coins } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [loadingOwnership, setLoadingOwnership] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isOwned, setIsOwned] = useState(false);
    const [cost, setCost] = useState(0);
    const [userCoins, setUserCoins] = useState(coins);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch the exam details (cost)
                const examData = await axios.get(`https://localhost:7295/api/Exam/${certId}`);
                setCost(examData.data.Cost);

                const ownedCertsResponse = await axios.get(
                    `https://localhost:7295/api/Certs/${userData.id}/owned`
                );
                const ownedCerts = ownedCertsResponse.data;

                setIsOwned(ownedCerts.some((cert) => cert.certId === certId));
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoadingOwnership(false); // Ownership check is complete
            }
        };

        if (userData) {
            fetchDetails();
        }
    }, [userData, certId]);

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
                setUserCoins(response.data.UpdatedBalance); 
                setIsOwned(true); 

            }
        } catch (error) {
            console.error( error);
            setErrorMessage(
                error.response?.data || "Failed to add certificate. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const buttonText = useMemo(() => {
        if (isLoading) return "Processing...";
        if (cost > 0) return ` ${cost}`;
        // if (userData.isAuth === false) return "Authenticate";
        return "Free";
    }, [cost, isLoading]);

    if (loadingOwnership) {
        return <span>Loading...</span>; 
    }

    return (
        <>
            {isOwned ? (
                <p>
                    Owned <FaCheck />
                </p>
            ) : (
                <>
               {userData.isAuth === false ? (<button className="green-button"  onClick={()=> navigate("/userprofile")}>Authenticate</button>) :(<button onClick={addCertificateToUser} className="green-button" > <ImCoinDollar />{buttonText}</button>) }
               
                
               </>
            )}
            {errorMessage && <p style={{color: "black", fontSize: "12px"}} >{errorMessage}</p>}
        </>

    );
};

export default AddCertificateButton;