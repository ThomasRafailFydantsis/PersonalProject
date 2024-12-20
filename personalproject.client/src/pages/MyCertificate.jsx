import { useState, useEffect } from "react";
import AuthService from "/MVC/PersonalProject/personalproject.client/AuthService";
import axios from "axios";

const MyCertificate = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userData, setUserData] = useState(null);

    // Check authentication and fetch user data
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const status = await AuthService.getAuthStatus();
                setIsAuthenticated(status);

                if (status) {
                    const response = await fetch("https://localhost:7295/api/Account/me", {
                        method: "GET",
                        credentials: "include",
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                    } else {
                        throw new Error("Failed to fetch user data.");
                    }
                }
            } catch (err) {
                console.error("Error checking authentication status or fetching user data:", err);
                setError("Failed to check authentication or fetch user data.");
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, []);

    // Fetch certificates when user data is available
    useEffect(() => {
        if (!userData?.id) return;

        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`https://localhost:7295/api/Exam/user-certificates/${userData.id}`);
                setCertificates(response.data);
            } catch (err) {
                console.error("Error fetching certificates:", err);
                setError("Failed to fetch certificates.");
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [userData]);

    // Handle certificate download
    const handleDownload = async (certificateId) => {
        try {
            const response = await axios.get(`https://localhost:7295/api/Exam/certificate/${certificateId}`, {
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Certificate_${certificateId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download certificate:", err);
            setError("Error downloading the certificate. Please try again later.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
            <h1>User Certificates</h1>
            {certificates.length === 0 ? (
                <p>No certificates available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Certificate</th>
                            <th>Date Taken</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                      {certificates.map((cert) => (
                            <tr key={cert.id}>
                                <td>{cert.certificateName}</td>
                                <td>{cert.dateTaken}</td>
                                <td>{cert.score}</td>
                                <td>{cert.isPassed && cert.isMarked ? "Passed & Marked" : "Pending"}</td>
                                <td>
                                    {cert.certificateDownloadable ? (
                                        <button onClick={() => handleDownload(cert.id)}>Download</button>
                                    ) : (
                                        <span>Not Available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyCertificate;