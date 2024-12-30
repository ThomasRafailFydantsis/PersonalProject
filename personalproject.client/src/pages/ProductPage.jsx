import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";
import AddCertificateButton from "../components/AddCertificateButton";
import Accordion from 'react-bootstrap/Accordion';

function ProductPage() {
    const { id } = useParams();
    const [cert, setCert] = useState(null);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="cert-details-container">
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
                    cert.descriptions.map((desc) => (
                       
            <Accordion defaultActiveKey="0"  key={desc.descriptionId}>
      <Accordion.Item eventKey="0">
        <Accordion.Header>Info</Accordion.Header>
        <Accordion.Body>
        {desc.text3 || "Coming Soon"}
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="1">
        <Accordion.Header>Time</Accordion.Header>
        <Accordion.Body>
        {desc.text2 || "Coming Soon"}
        </Accordion.Body>
      </Accordion.Item>
      <Accordion.Item eventKey="2">
        <Accordion.Header>After Submission</Accordion.Header>
        <Accordion.Body>
        {desc.text3 || "Coming Soon"}
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
                /* <h2>Additional Descriptions</h2>
                {cert.descriptions && cert.descriptions.length > 0 ? (
                    cert.descriptions.map((desc) => (
                        <div key={desc.descriptionId} className="description-card">
                            <p><strong>Text 1:</strong> {desc.text1 || "Coming Soon"}</p>
                            <p><strong>Text 2:</strong> {desc.text2 || "Coming Soon"}</p>
                            <p><strong>Text 3:</strong> {desc.text3 || "Coming Soon"}</p> */
                       
                    ))
                ) : (
                    <p>No additional descriptions available.</p>
                )}
            </div>
        </div>
        </>
    );
}

export default ProductPage;