import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import { RxCheck } from "react-icons/rx";
import Sidebar from "../components/Sidebar1";
import { HiArrowNarrowUp, HiArrowNarrowDown } from "react-icons/hi";

const AssignMarkerPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [selectedMarkers, setSelectedMarkers] = useState({});
    const [filterAssignments, setFilterAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const { isAuthenticated, roles, AuthError, revalidateAuth } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSorted, setIsSorted] = useState(false);

    const sidebarRef = useRef(null);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

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
                setFilterAssignments(submissionsResponse.data); // Initialize with all submissions
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

            // Update submission state
            setSubmissions((prevSubmissions) =>
                prevSubmissions.map((submission) =>
                    submission.id === submissionId
                        ? { ...submission, isMarked: true }
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

    const handleSort = () => {
        setIsSorted(!isSorted);
        const sorted = [...filterAssignments].sort((a, b) =>
            isSorted ? a.id - b.id : b.id - a.id
        );
        setFilterAssignments(sorted);
    };

    const toggleAssignment = () => {
        if (filterAssignments.length === submissions.length) {
            // Show only unassigned submissions
            setFilterAssignments(submissions.filter((sub) => !sub.isMarked));
        } else {
            // Show all submissions
            setFilterAssignments(submissions);
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
        <div
            style={{
                marginLeft: isSidebarOpen ? "250px" : "0px",
                transition: "margin-left 0.3s ease-in-out",
                paddingBottom: "5px",
            }}
        >
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <h2
                style={{
                    textAlign: "center",
                    marginTop: "20px",
                    color: "#607d8b",
                    paddingTop: "40px",
                }}
            >
                Assign Marker
            </h2>
            
            <div style={{ textAlign: "center" }}>
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
                <button onClick={toggleAssignment} className="btn btn-outline-success">
                    {filterAssignments.length === submissions.length ? "Show Unassigned" : "Show All"}
                </button>
            </div>
            <div style={{ overflow: "scroll", height: "600px" }}>
                <table
                    border="1"
                    style={{
                        width: "1150px",
                        
                        textAlign: "center",
                    }}
                >
                    <thead style={{ position: "sticky", top: "0" }}>
                        <tr>
                            <th>
                                Submission
                                <button
                                    style={{ background: "none", border: "none", cursor: "pointer" }}
                                    onClick={handleSort}
                                >
                                    {isSorted ? (
                                        <HiArrowNarrowUp style={{ color: "aliceblue" }} />
                                    ) : (
                                        <HiArrowNarrowDown style={{ color: "aliceblue" }} />
                                    )}
                                </button>
                            </th>
                            <th>Marker</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterAssignments.map((submission) => {
                            const isAssigned = submission.isMarked;
                            return (
                                <tr key={submission.id}>
                                    <td>{`Submission #${submission.id} - ${submission.certName}`}</td>
                                    <td>
                                        <select
                                            value={selectedMarkers[submission.id] || ""}
                                            onChange={(e) =>
                                                handleMarkerChange(submission.id, e.target.value)
                                            }
                                            disabled={isAssigned}
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
                                        {isAssigned ? (
                                            <h6>
                                                Assigned and Marked <RxCheck />
                                            </h6>
                                        ) : (
                                            <button
                                                onClick={() => handleAssignMarker(submission.id)}
                                                disabled={!selectedMarkers[submission.id]}
                                                className="btn btn-outline-primary"
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
        </div>
    );
};

export default AssignMarkerPage;