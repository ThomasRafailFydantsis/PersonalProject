import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const AssignMarkerPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [selectedMarkers, setSelectedMarkers] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const navigate = useNavigate();

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
    
        console.log("Assigning marker with ID:", markerId);  
    
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage("");
    
            const payload = {
                examSubmissionId: submissionId,
                markerId,  
            };
    
           
            await axios.post("https://localhost:7295/api/Exam/assign-marker", payload);
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

    return (
        <div>
            <Header />
            <button className="green-button"  onClick={() => navigate(-1)}>Back</button>
            <h1>Assign Marker</h1>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            <table border="1" style={{ width: "100%", marginBottom: "20px", textAlign: "center" }}>
                <thead>
                    <tr>
                        <th>Submission</th>
                        <th>Marker</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {submissions.map((submission) => (
                        <tr key={submission.id}>
                            <td>
                                {`Submission #${submission.id} - ${submission.certName} by User ${submission.userId}`}
                            </td>
                            <td>
                                <select
                                    value={selectedMarkers[submission.id] || ""} 
                                    onChange={(e) => handleMarkerChange(submission.id, e.target.value)}
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
                            <td>
                                <button
                                    onClick={() => handleAssignMarker(submission.id)}
                                    disabled={!selectedMarkers[submission.id]}
                                >
                                    Assign Marker
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssignMarkerPage;