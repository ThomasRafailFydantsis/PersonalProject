import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar1";
import AddCertificateButton from "../components/AddCertificateButton";
import { GrAchievement } from "react-icons/gr";

function ProductPage() {
    const { id } = useParams();
    const [cert, setCert] = useState(null);
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
        const fetchCertDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7295/api/Certs/${id}/description`);
                setCert(response.data); // Ensure you use response.data to access the certificate details
            } catch (error) {
                console.error("Error fetching certificate details:", error);
            }
        };
        fetchCertDetails();
    }, [id]);

    if (!cert) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <>
             <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen}/>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <div className="cert-details-container" style={{marginTop: '100px'}}>
                <div className="cert-header">
                    <img
                        src={`https://localhost:7295${cert.imagePath}`}
                        alt={cert.certName}
                        className="cert-header-image"
                    />
                    <div className="cert-header-info">
                        <h1>{cert.certName}</h1>
                        <p>{cert.mainDescription || "Coming Soon"}</p>
                    </div>
                    <AddCertificateButton certId={cert.certId} />
                </div>

                <div className="cert-descriptions">
                    <h2>Additional Descriptions</h2>
                    {cert.descriptions && cert.descriptions.length > 0 ? (
                        cert.descriptions.map((desc, index) => (
                            <div
                                className="accordion accordion-flush"
                                id={`accordionFlushExample-${index}`}
                                key={desc.descriptionId}
                            >
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id={`flush-headingOne-${index}`}>
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#flush-collapseOne-${index}`}
                                            aria-expanded="false"
                                            aria-controls={`flush-collapseOne-${index}`}
                                        >
                                            Info
                                        </button>
                                    </h2>
                                    <div
                                        id={`flush-collapseOne-${index}`}
                                        className="accordion-collapse collapse"
                                        data-bs-parent={`#accordionFlushExample-${index}`}
                                    >
                                        <div className="accordion-body">{desc.text1 || "Coming Soon"}</div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id={`flush-headingTwo-${index}`}>
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#flush-collapseTwo-${index}`}
                                            aria-expanded="false"
                                            aria-controls={`flush-collapseTwo-${index}`}
                                        >
                                            Time
                                        </button>
                                    </h2>
                                    <div
                                        id={`flush-collapseTwo-${index}`}
                                        className="accordion-collapse collapse"
                                        data-bs-parent={`#accordionFlushExample-${index}`}
                                    >
                                        <div className="accordion-body">{desc.text2 || "Coming Soon"}</div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id={`flush-headingThree-${index}`}>
                                        <button
                                            className="accordion-button collapsed"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#flush-collapseThree-${index}`}
                                            aria-expanded="false"
                                            aria-controls={`flush-collapseThree-${index}`}
                                        >
                                            After Submission
                                        </button>
                                    </h2>
                                    <div
                                        id={`flush-collapseThree-${index}`}
                                        className="accordion-collapse collapse"
                                        data-bs-parent={`#accordionFlushExample-${index}`}
                                    >
                                        <div className="accordion-body">{desc.text3 || "Coming Soon"}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No additional descriptions available.</p>
                    )}
                </div>
            </div>
            <div className="card-container">
                {cert.achievements.map((achievement) => (
                    <div className="card" style={{width: '30rem', display: 'flex', flexDirection: 'row', backgroundColor: 'rgba(132, 231, 170, 0.1)', padding: '10px'}} key={achievement.achievementId}>
                    
                        <div style={{padding: '10px', color:' #FF8C00'}}>  <GrAchievement size={50}  /></div>
                    
                   
                        <div className="card-content">
                            <h3>{achievement.title}</h3>
                            <p>{achievement.achievementDescription}</p>
                        </div>
                    </div>
                    
                ))}
                
            </div>
        </>
    );
}

export default ProductPage;