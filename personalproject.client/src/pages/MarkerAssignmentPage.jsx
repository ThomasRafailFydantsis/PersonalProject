import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

const MarkerAssignmentsPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isAuthenticated, roles, AuthError, revalidateAuth } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        revalidateAuth();
    }, [location]);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/marker-assignments/${id}`
                );
                setAssignments(response.data);
            } catch (err) {
                setError("Failed to fetch assignments.");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, [id]);

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
            <Header />
            <button onClick={() => navigate("/dashboard")}>Back</button>
            <h1>Marker Assignments</h1>
            <table border="1" style={{ width: "100%", textAlign: "center" }}>
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
                        <tr key={`${assignment.examSubmissionId}-${assignment.candidateName}`}>
                            <td>{assignment.examSubmissionId}</td>
                            <td>{assignment.candidateName}</td>
                            <td>{assignment.certificateName}</td>
                            <td>{assignment.isPassed ? "Passed" : "Failed"}</td>
                            <td>
                                <Link to={`/exam/submission/${assignment.examSubmissionId}`}>
                                    View Submission
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MarkerAssignmentsPage;