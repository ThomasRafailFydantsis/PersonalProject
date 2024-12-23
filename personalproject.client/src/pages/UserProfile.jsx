import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import UserProfileImageUpload from "../components/UserProfileImageUpload";

const UserProfile = () => {
    const { isAuthenticated, userData, AuthError } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("https://localhost:7295/api/Account/me", {
                    withCredentials: true,
                });
                setUpdatedData(response.data);
            } catch (err) {
                console.error("Error fetching user data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUserData();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            if (!userData || !userData.id) {
                alert("User data is not loaded. Cannot save changes.");
                return;
            }
            await axios.put(`https://localhost:7295/api/Account/${userData.id}`, updatedData, {
                withCredentials: true,
            });
            alert("Profile updated successfully!");
            setIsEditing(false);
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    useEffect(() => {
        const fetchImagePath = async () => {
            if (!userData || !userData.id) return; // Null-check userData and userData.id
            try {
                const response = await axios.get(`https://localhost:7295/api/ImageUpload/get-user-profile-image/${userData.id}`);
                setImage(response.data);
                console.log("Image Path:", response.data);
            } catch (err) {
                console.error("Error fetching image path:", err);
            }
        };

        fetchImagePath();
    }, [userData]);

    if (isLoading) return <div>Loading...</div>;
    if (AuthError) return <div>{AuthError}</div>;
    if (!isAuthenticated) return <div>You are not logged in. Please log in.</div>;

    if (!userData) {
        return <div>Loading user data...</div>;
    }

    return (
        <div>
            <Header />
            <button className="green-button" onClick={() => navigate('/dashboard')}>Back</button>
            <button className="green-button" onClick={() => navigate('/MyCertificate')}>My Certificates</button>
            <h1>User Profile</h1>
            <UserProfileImageUpload userId={userData.id} />
            {isEditing ? (
                <form>
                    <label>
                        First Name:
                        <input
                            type="text"
                            name="firstName"
                            value={updatedData.firstName || ""}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Last Name:
                        <input
                            type="text"
                            name="lastName"
                            value={updatedData.lastName || ""}
                            onChange={handleInputChange}
                        />
                    </label>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={updatedData.email || ""}
                            onChange={handleInputChange}
                        />
                    </label>
                    <button type="button" onClick={handleSaveChanges}>
                        Save Changes
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                </form>
            ) : (
                <div>
                    {image ? (
                        <img
                            src={`https://localhost:7295${image}`}
                            alt="User Profile"
                            style={{ width: "100px", height: "100px" }}
                        />
                    ) : (
                        <p>Profile image not available</p>
                    )}
                    <p>First Name: {userData.firstName || "N/A"}</p>
                    <p>Last Name: {userData.lastName || "N/A"}</p>
                    <p>Email: {userData.email || "N/A"}</p>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;