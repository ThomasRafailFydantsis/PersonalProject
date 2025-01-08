import { useState, useEffect, useRef } from "react";
import axios from "axios";  
import { useAuth } from "../components/AuthProvider";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar1";

const MyCertificate = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { isAuthenticated, userData, AuthError, revalidateAuth } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !userData?.id) return;

        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`https://localhost:7295/api/Exam/user-certificates/${userData.id}`);
                setCertificates(response.data);
            } catch (err) {
                console.error("Error fetching certificates:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [isAuthenticated, userData]);

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
    if (AuthError) return <div>{AuthError}</div>;
    if (!isAuthenticated) return <div>You are not logged in. Please log in.</div>;
console.log(certificates);
    return (
        <div style={{ marginLeft: isSidebarOpen ? "250px" : "0px", transition: "margin-left 0.3s ease-in-out" }}>
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <h2 style={{ textAlign: "center", marginTop: "60px", color: "#607d8b" }}>Results</h2>
            {error ? (
                <p style={{ color: "red", textAlign: "center" }}>No certificates available.</p>
            ) : (
                <table>
                    <thead>
                        <tr style={{ color: "#FF8000" }}>
                            <th>Certificate</th>
                            <th>Date Taken</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates.map((cert) => {
                            let status = "Pending";
                            let action = "-";
                            if (cert.isPassed && cert.isMarked) {
                                status = "Passed & Marked";
                                action = cert.certificateDownloadable ? (
                                    <button
                                        className="green-button"
                                        onClick={() => handleDownload(cert.id)}
                                    >
                                        Download
                                    </button>
                                ) : (
                                    <span>Not Available</span>
                                );
                            } else if (cert.isMarked && cert.isPassed === false) {
                                status = "Exam Failed";
                            }

                            return (
                                cert.score != null &&
                                cert.cost !== 0 && (
                                    <tr key={cert.id}>
                                        <td>{cert.certificateName}</td>
                                        <td>
                                            {cert.dateTaken
                                                ? new Date(cert.dateTaken).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td>{cert.score}%</td>
                                        <td>{status}</td>
                                        <td>{action}</td>
                                    </tr>
                                )
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default MyCertificate;