import { useState, useEffect } from "react";
import axios from "axios";  
import { useAuth } from "../components/AuthProvider";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar1";
import { useRef } from "react";

const MyCertificate = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, userData, AuthError, revalidateAuth } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
        
        // Create ref for the sidebar
        const sidebarRef = useRef(null);
        
    
        // Toggle the sidebar open and closed
        const toggleSidebar = () => {
            setIsSidebarOpen((prev) => !prev);
        };
    
        // Close the sidebar
        const closeSidebar = () => {
            setIsSidebarOpen(false);
        };
    
        // Handle click outside to close the sidebar
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                closeSidebar(); // Close sidebar when clicked outside
            }
        };
    
        // Add event listener on mount to detect clicks outside
        useEffect(() => {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

    useEffect(() => {
        revalidateAuth();
    }, [location]);

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

  
    const handleDownload = async (certificateId) => {
        try {
            const response = await axios.get(`https://localhost:7295/api/Exam/certificate/${certificateId}`, {
                responseType: "blob",
            });
console.log(certificateId);
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

    if (AuthError) {
        return <div>{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    
console.log(certificates);
    return (
        <div style={{marginLeft:isSidebarOpen ? "250px" : "0px", transition: "margin-left 0.3s ease-in-out"}}>
              <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen}/>
             <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <h2 style={{ textAlign: "center", marginTop: "20px", color: "#607d8b" }}>User Certificates</h2>
            {certificates.length === 0 ? (
                <p>No certificates available.</p>
            ) : (
                <table>
                    <thead>
                        <tr style={{color:"FF8000"}}>
                            <th>Certificate</th>
                            <th>Date Taken</th>
                            <th>Score</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                        <tbody>
                            {certificates.map((cert) => (cert.score != null &&
                            <tr key={cert.id}>
                                <td>{cert.certificateName}</td>
                                <td>{cert.dateTaken ? new Date(cert.dateTaken).toLocaleDateString() : "-"}</td>
                                <td>{cert.score}</td>
                                <td>{cert.isPassed && cert.isMarked ? "Passed & Marked" : "Pending"}</td>
                                <td>
                                    {cert.certificateDownloadable ? (
                                        <button className="green-button" onClick={() => handleDownload(cert.id)}>Download</button>
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