import { useState, useEffect } from "react";
import certsService from "../servicesE/CertsService";
import { Button } from "react-bootstrap";

function HomeCerts({ onAuthRedirect }) {
    const [certs, setCerts] = useState([]);

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

    const handleViewClick = (certId) => {
        if (onAuthRedirect) {
            onAuthRedirect(`/certs/${certId}`);
        }
    };

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", overflow: "hidden" }}>
            <h1 style={{ textAlign: "center", color: "#607d8b" }}>
                Our <span style={{ color: "#FF8C00" }}>Products</span>
            </h1>
            <h3 style={{ textAlign: "center", color: "#607d8b" }}>These helped thousend of students land their dream job </h3>
            <h4 style={{ textAlign: "center", color: "#607d8b" }}>Start your jurney NOW</h4>
            <div
                style={{
                    display: "flex",
                    overflowX: "auto",
                    padding: "10px 0",
                    scrollbarWidth: "thin",
                    marginTop: "72px",
                }}
            >
                {certs.map((cert) => (
                    <div
                        className="cert-card"
                        key={cert.certId}
                        style={{
                            flex: "0 0 auto",
                            width: "200px",
                            margin: "0 10px",
                            textAlign: "center",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "10px",
                            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                            <span style={{ color: "#607d8b" }}>{cert.certName}</span>
                        </div>
                        <img
                            src={
                                cert.imagePath
                                    ? `https://localhost:7295${cert.imagePath}`
                                    : "https://via.placeholder.com/150"
                            }
                            alt={cert.certName}
                            style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                marginBottom: "8px",
                            }}
                        />
                        <Button
                            
                            onClick={() => handleViewClick(cert.certId)}
                          className="btn btn-success"
                        >
                            View
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomeCerts;