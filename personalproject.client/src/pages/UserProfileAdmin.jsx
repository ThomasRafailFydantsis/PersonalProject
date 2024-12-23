import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

const UserProfileAdmin = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState([]);
    const navigate = useNavigate();

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
                const response = await axios.get(`https://localhost:7295/api/Exam/user-certificates/${userId}`);
                setCertificates(response.data);
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
        <div>
            <Header />
            <h1>User Profile</h1>
            {user && user.profileImagePath ? (
                <img
                    src={`https://localhost:7295${user.profileImagePath}`}
                    alt="Profile"
                    style={{ width: "100px", height: "100px" }}
                />
            ) : (
                <div>No profile image available</div>
            )}
            {user && (
                <>
                    <p><strong>First Name:</strong> {user.firstName}</p>
                    <p><strong>Last Name:</strong> {user.lastName}</p>
                    <p><strong>Username:</strong> {user.userName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Roles:</strong> {user.roles.join(", ")}</p>
                </>
            )}
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
                        {certificates.map((cert) => (
                            <tr key={cert.id}>
                                <td>{cert.certificateName}</td>
                                <td>{cert.dateTaken}</td>
                                <td>{cert.score}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <button onClick={() => navigate("/usertable")}>Back</button>
        </div>
    );
};

export default UserProfileAdmin;