import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar1";
import { Form } from "react-bootstrap";
import { Col } from "react-bootstrap";

const MarkerAssignmentsPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [filterAssignments, setFilterAssignments] = useState([]); // Filtered assignments
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, roles, AuthError, revalidateAuth, userData } = useAuth();
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
        revalidateAuth();
    }, []);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/marker-assignments/${userData.id}`
                );
                setAssignments(response.data);
                setFilterAssignments(response.data); // Initialize with all assignments
            } catch (err) {
                setError("Failed to fetch assignments.");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userData) fetchAssignments();
    }, [userData]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    if (!roles.includes("Marker")) {
        return <div>You do not have permission to access this page.</div>;
    }

    if (AuthError) {
        return <div>{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    
    const toggleAssignment = () => {
        if (filterAssignments.length === assignments.length) {
           
            setFilterAssignments(assignments.filter((ass) => !ass.isMarked));
        } else {
            
            setFilterAssignments(assignments);
        }
    };

    return (
        <div style={{ marginTop: "70px", marginLeft: isSidebarOpen ? "250px" : "0px", transition: "margin-left 0.3s ease-in-out" }}>
        <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
        <h2 style={{ textAlign: "center", color: "#607d8b" }}>
            {userData.userName}'s Assignments
        </h2>
        <div
    style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        marginRight: "10px",
        marginBottom: "5px",
    }}
>
    <Form.Group style={{ display: "flex", alignItems: "center" }}>
        <Form.Label style={{ fontWeight: "bold", textAlign: "right", marginTop: "5px",marginRight:"10px" , color: "#607d8b"}}>Unmarked</Form.Label>
        <Form.Check
            type="switch"
            id="custom-switch"
            label=""
            defaultChecked={false}
            onChange={toggleAssignment}
        />
    </Form.Group>
</div>
<div style={{ overflow: "scroll", height: "550px" }}>
    <table border="1" style={{ width: "1170px", textAlign: "center" }}>
        <thead
            style={{
                position: "sticky",
                top: "0",
                backgroundColor: "#607d8b",
                color: "white",
            }}
        >
            <tr>
                <th>Submission ID</th>
                <th>Candidate Name</th>
                <th>Exam Title</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {filterAssignments.map((assignment, index) => (
               <tr key={`${assignment.examSubmissionId}-${index}`}>
                    <td>{assignment.examSubmissionId}</td>
                    <td>{assignment.candidateName}</td>
                    <td>{assignment.certificateName}</td>
                    <td>{assignment.isPassed ? "Passed" : "Failed"}</td>
                    <td>
                        {assignment.isMarked ? (
                            <button disabled style={{ color: "gray" }}>
                                Already Marked
                            </button>
                        ) : (
                            <Link to={`/exam/submission/${assignment.examSubmissionId}`}>
                                View Submission
                            </Link>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
    </div>
    );
};

export default MarkerAssignmentsPage;