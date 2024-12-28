import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import { RxCheck } from "react-icons/rx";
import Sidebar from "../components/SideBar";

const AssignMarkerPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [selectedMarkers, setSelectedMarkers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const { isAuthenticated, roles, AuthError, revalidateAuth } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
            revalidateAuth();
        }, [location]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

               
                const submissionsResponse = await axios.get(
                    "https://localhost:7295/api/Exam/attempts"
                );

               
                const usersResponse = await axios.get("https://localhost:7295/api/Account");
                const markers = usersResponse.data.filter((user) =>
                    user.roles.includes("Marker")
                );

                setSubmissions(submissionsResponse.data);
                setMarkers(markers);
            } catch (err) {
                setError("Failed to fetch data. Please try again later.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleMarkerChange = (submissionId, markerId) => {
        setSelectedMarkers((prev) => ({
            ...prev,
            [submissionId]: markerId, 
        }));
    };

    const handleAssignMarker = async (submissionId) => {
        const markerId = selectedMarkers[submissionId];
        if (!markerId) {
            setError("Please select a marker before assigning.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccessMessage("");

            const payload = {
                examSubmissionId: submissionId,
                markerId,
            };

            await axios.post("https://localhost:7295/api/Exam/assign-marker", payload);

            // Update the specific submission's state to marked
            setSubmissions((prevSubmissions) =>
                prevSubmissions.map((submission) =>
                    submission.id === submissionId
                        ? { ...submission }
                        : submission
                )
            );

            setSuccessMessage(`Marker assigned successfully for submission #${submissionId}`);
        } catch (err) {
            console.error("Error details:", err.response?.data || err.message);
            setError("Failed to assign marker. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    
    
    if (!roles.includes("Admin")) {
        
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
            <h2 style={{ textAlign: "center" }}>Assign Marker</h2>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            <table border="1" style={{ width: "1150px", marginBottom: "20px", textAlign: "center" }}>
                <thead>
                    <tr>
                        <th>Submission</th>
                        <th>Marker</th>
                        <th >Action</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((submission) => {
                        const isAssigned = submission.isMarked; // Assume `isMarked` is included in the API response
                        return (
                            <tr key={submission.id}>
                                <td>
                                    {`Submission #${submission.id} - ${submission.certName}`}
                                </td>
                                <td style={{maxWidth:'80px'}}>
                                    <select
                                        value={selectedMarkers[submission.id] || ""}
                                        onChange={(e) => handleMarkerChange(submission.id, e.target.value)}
                                        disabled={isAssigned} // Disable the dropdown if already assigned
                                    >
                                        <option value="" disabled>
                                            Select a Marker
                                        </option>
                                        {markers.map((marker) => (
                                            <option key={marker.id} value={marker.id}>
                                                {marker.userName} ({marker.email})
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{maxWidth:'80px'}}>
                                    {isAssigned ? (
                                        <h6>Assigned <RxCheck /></h6> // Display 'Assigned' if marked
                                    ) : (
                                        <button
                                            onClick={() => handleAssignMarker(submission.id)}
                                            disabled={!selectedMarkers[submission.id]}
                                        >
                                                Assign Marker 
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AssignMarkerPage;