import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import certsService from "../servicesE/CertsService";
import AddCertificateButton from "./AddCertificateButton";
import DeleteButton from "./DeleteButton";
import { Form } from "react-bootstrap";
import axios from "axios";

function CertsList({ id: userId }) {
    const { isAuthenticated, userData, roles, AuthError } = useAuth();
    const [certs, setCerts] = useState([]);
    const [filterExams, setFilterExams] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all"); // "all" represents no filtering by category
    const navigate = useNavigate();

    const isAdmin = roles.includes("Admin");
    const isMarker = roles.includes("Marker");

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const data = await certsService.getCerts();
                setCerts(data);
                setFilterExams(data);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };
        fetchCerts();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://localhost:7295/api/ExamCategories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !userData) {
            console.log("User is not authenticated. Redirecting to login page...");
            navigate("/login");
        }
    }, [isAuthenticated, userData, navigate]);

    const handleDelete = async (certId) => {
        try {
            await certsService.deleteCert(certId);
            setCerts(certs.filter((cert) => cert.certId !== certId));
        } catch (error) {
            console.error("Error deleting certificate:", error);
        }
    };

    const handleUpdateExam = (certId) => {
        navigate(`/certForm/${certId}`);
    };
    
    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        if (categoryId === "all") {  
            setFilterExams(certs);
        } else {
            const filtered = certs.filter((cert) => cert.category=== parseInt(categoryId));
            setFilterExams(filtered);
        }
    };
    

    const toggleExam = () => {
        if (filterExams.length === certs.length) {
            setFilterExams(certs.filter((cert) => cert.cost >0));
        } else {
            setFilterExams(certs);
        }
    };

    if (AuthError) {
        return <div>Error: {AuthError}</div>;
    }

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", color: "#607d8b" }}>Shop</h1>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <Form.Group style={{ display: "flex", alignItems: "center" }}>
                    <Form.Label style={{ fontWeight: "bold", marginRight: "10px", color: "#607d8b" }}>Filter by Category</Form.Label>
                    <Form.Select  onChange={handleCategoryChange} value={selectedCategory}>
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group style={{ display: "flex", alignItems: "center" }}>
                    <Form.Label style={{ fontWeight: "bold", marginRight: "10px",marginTop: "10px", color: "#607d8b", fontSize: "21px" }}>Premium</Form.Label>
                    <Form.Check style={{ width: "30px", height: "30px", marginTop: "10px"}} type="switch" id="custom-switch" defaultChecked={false} onChange={toggleExam} />
                </Form.Group>
            </div>
            <ul>
                {filterExams.length === 0 ? (
                    <p style={{ textAlign: "center", color: "red" }}>No exams found in this category.</p>
                ) : (
                    filterExams.map((cert) => (
                        <li key={cert.certId} className="certList">
                        
                            <div style={{ marginRight: "8rem" }}>
                             {cert.imagePath ? (
                                
                                <img
                                    src={`https://localhost:7295${cert.imagePath}`}
                                    alt={cert.certName}
                                    className="cert-image"
                                    style={{ width: "130px", height: "130px" }}
                                />
                            ) : (
                                <div>No image available</div>
                            )}
                            </div>
                            <div onClick={() => navigate(`/certs/${cert.certId}`)} style={{ cursor: "pointer", textAlign: "center"}} >
                             <p style={{ cursor: "pointer", textAlign: "center"}}>{cert.certName}</p>   
                            </div>
                            <div>
                           
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}> 
                            <AddCertificateButton certId={cert.certId} />
                            {isAdmin && <DeleteButton certId={cert.certId} onDelete={handleDelete} />}
                            {isAdmin && <button className="green-button" onClick={() => handleUpdateExam(cert.certId)}>Edit</button>}
                            {isMarker && <button  className="green-button" onClick={() => handleUpdateExam(cert.certId)}>Edit</button>}
                            </div>
                            
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default CertsList;