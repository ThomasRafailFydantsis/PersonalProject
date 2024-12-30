import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/SideBar";

const UserProfileAdmin = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState([]);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(
                    `https://localhost:7295/api/Account/get-user-profile/${userId}`,
                    { withCredentials: true }
                );
                setUser(response.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load user profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/user-certificates/${userId}`
                );
                setCertificates(response.data || []); // Ensure an empty array if the response is null/undefined
            } catch (err) {
                console.error("Error fetching certificates:", err);
                setError("Failed to fetch certificates.");
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ textAlign: "center" }}>
            <Header toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <h1 style={{ marginTop: "20px", color: "#607d8b" }}>User Profile</h1>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div>
                    {user && user.profileImagePath ? (
                        <img
                            src={`https://localhost:7295${user.profileImagePath}`}
                            alt="Profile"
                            style={{ width: "150px", height: "150px" }}
                        />
                    ) : (
                        <div>No profile image available</div>
                    )}
                </div>
                {user && (
                    <div style={{ marginLeft: "-420px" }}>
                        <p><strong>First Name:</strong> {user.firstName}</p>
                        <p><strong>Last Name:</strong> {user.lastName}</p>
                        <p><strong>Username:</strong> {user.userName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Roles:</strong> {user.roles.join(", ")}</p>
                    </div>
                )}
            </div>
            <h1>User Certificates</h1>
            {certificates.length === 0 ? (
                <p>No certificates available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Certificate</th>
                            <th>Date Taken</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificates
                            .filter((cert) => cert.score != null)
                            .map((cert) => (
                                <tr key={cert.id}>
                                    <td>{cert.certificateName}</td>
                                    <td>{cert.dateTaken}</td>
                                    <td>{cert.score}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            )}
            <button
                className="btn btn-success"
                onClick={() => navigate("/usertable")}
            >
                Back
            </button>
        </div>
    );
};

export default UserProfileAdmin;