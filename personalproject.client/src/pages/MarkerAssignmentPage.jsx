import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const MarkerAssignmentsPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, roles, AuthError, revalidateAuth, userData } = useAuth();
   
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Revalidate authentication on mount
    useEffect(() => {
        revalidateAuth();
    }, []); // Only run once on component mount

    // Fetch assignments when `id` changes
    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/marker-assignments/${userData.id}`
                );
                setAssignments(response.data);
            } catch (err) {
                setError("Failed to fetch assignments.");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userData) fetchAssignments(); // Ensure `id` is defined before making the request
    }, [userData]);

    // Conditional rendering
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

    return (
        <div>
             <Header toggleSidebar={toggleSidebar} />
             <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <h2 style={{ textAlign: "center" }}>{userData.userName}'s Assignments</h2>
            <table border="1" style={{ width: "1170px", textAlign: "center" }}>
                <thead>
                    <tr>
                        <th>Submission ID</th>
                        <th>Candidate Name</th>
                        <th>Exam Title</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {assignments.map((assignment) => (
                        <tr key={assignment.examSubmissionId}>
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
    );
};

export default MarkerAssignmentsPage;