import { useState, useEffect, useRef } from "react";
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

    const scrollContainerRef = useRef(null);

    const scrollLeft = () => {
        console.log("Scroll Left Triggered");
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: -200,
                behavior: "smooth",
            });
        }
    };

    const scrollRight = () => {
        console.log("Scroll Right Triggered");
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 200,
                behavior: "smooth",
            });
        }
    };

    return (
        <div style={{ maxWidth: "1100px", margin: "0 auto", overflow: "hidden" }}>
            <h1 style={{ textAlign: "center", color: "#607d8b", marginBottom: "20px" }}>
                Our <span style={{ color: "#FF8C00" }}>Products</span>
            </h1>
            <h5 style={{ textAlign: "center", color: "#607d8b" }}>
                These helped thousands of students land their dream job
            </h5>
            <h6 style={{ textAlign: "center", color: "#607d8b" }}>Start your journey NOW</h6>

            <div style={{ position: "relative", marginTop: "72px" }}>
                {/* Left Navigation Button */}
                <button
                    onClick={scrollLeft}
                    style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        background: "#FF8C00",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",

                    }}
                    className="homeListButton"
                >
                    {"<"}
                </button>

                {/* Scrollable Certificate Cards */}
                <div
                    ref={scrollContainerRef}
                    style={{
                        display: "flex",
                        overflowX: "auto",
                        padding: "10px 0",
                        scrollbarWidth: "0px",
                        scrollbarColor: "aliceblue aliceblue",
                    }}
                >
                    {certs.map((cert) => (
                        <div
                            className="cert-card"
                            key={cert.certId}
                            style={{
                                flex: "0 0 auto",
                                width: "170px",
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

                {/* Right Navigation Button */}
                <button
                    onClick={scrollRight}
                    style={{
                        position: "absolute",
                        right: "0",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 10,
                        background: "#FF8C00",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "40px",
                        height: "40px",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                       className="homeListButton"
                >
                    {">"}
                </button>
            </div>
        </div>
    );
}

export default HomeCerts;