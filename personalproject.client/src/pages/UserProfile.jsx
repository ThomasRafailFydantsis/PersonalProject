import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import UserProfileImageUpload from "../components/UserProfileImageUpload";
import Sidebar from "../components/Sidebar1";
import notUploaded from "../imgs/notUploaded.png";

const UserProfile = () => {
    const { isAuthenticated, userData, AuthError } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [image, setImage] = useState(null);
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
            if (!userData || !userData.id) return;
            try {
                const response = await axios.get(
                    `https://localhost:7295/api/ImageUpload/get-user-profile-image/${userData.id}`
                );
                setImage(response.data);
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

    const labelStyle = {
        display: "block",
        fontSize: "16px",
        fontWeight: "600",
    };
      
    const inputStyle = {
        width: "100%",
        padding: "10px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        marginTop: "5px",
        fontSize: "16px",
    };
      
    const buttonStyle = (bgColor) => ({
        padding: "10px 20px",
        backgroundColor: bgColor,
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background-color 0.3s",
    });

    return (
        <div style={{ marginLeft: isSidebarOpen ? "260px" : "0px", transition: "margin-left 0.3s ease-in-out" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex" }}>
                <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
                <div style={{ flex: 1, padding: "20px", marginTop: "60px", }}>
                    <div
                        style={{
                            padding: "20px",
                             backgroundColor: isEditing ? "rgba(201, 240, 214, 0.8)" : "aliceblue",
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <img
                            src={image ? `https://localhost:7295${image}` : notUploaded}
                            alt="User Profile"
                            style={{
                                width: "100px",
                                height: "100px",
                                borderRadius: "50%",
                                marginRight: "20px",
                            }}
                        />
                        <h2 style={{ marginLeft: "30px" }}>Hello, {userData.userName}!</h2>
                        {isEditing ? <UserProfileImageUpload userId={userData.id} /> : null}
                    </div>

                    {isEditing ? (
                        <form
                            style={{
                                display: "grid",
                                gap: "20px",
                                marginBottom: "20px",
                                backgroundColor: "rgba(201, 240, 214, 0.8)",
                                padding: "20px",
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                                maxWidth: "100%",
                                width: "1200px",
                                margin: "0 auto",
                            }}
                        >
                            <label style={labelStyle}>
                                First Name:
                                <input
                                    type="text"
                                    name="firstName"
                                    value={updatedData.firstName || ""}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                />
                            </label>
                            <label style={labelStyle}>
                                Last Name:
                                <input
                                    type="text"
                                    name="lastName"
                                    value={updatedData.lastName || ""}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                />
                            </label>
                            <label style={labelStyle}>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={updatedData.email || ""}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                />
                            </label>
                            <label style={labelStyle}>
                                Address:
                                <input
                                    type="text"
                                    name="address1"
                                    value={updatedData.address1 || ""}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                />
                            </label>
                            <label style={labelStyle}>
                                Phone Number:
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={updatedData.phoneNumber || ""}
                                    onChange={handleInputChange}
                                    style={inputStyle}
                                />
                            </label>

                            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                <button type="button" onClick={handleSaveChanges} style={buttonStyle("#4CAF50")}>
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    style={buttonStyle("#f44336")}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div
                            style={{
                                padding: "20px",
                                backgroundColor: "rgba(160, 158, 157, 0.1)",
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                                maxWidth: "1200px",
                                margin: "0 auto",
                            }}
                        >
                            <p>First Name: {userData.firstName || "N/A"}</p>
                            <p>Last Name: {userData.lastName || "N/A"}</p>
                            <p>Email: {userData.email || "N/A"}</p>
                            <p>Address: {userData.address1 || "N/A"}</p>
                            <p>Phone Number: {userData.phoneNumber || "N/A"}</p>
                            <button onClick={() => setIsEditing(true)} style={buttonStyle("#086d6d")}>
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;