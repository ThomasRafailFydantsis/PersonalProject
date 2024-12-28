import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaRegUserCircle } from "react-icons/fa";
import { IoBagCheckSharp, IoCreateOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { PiCertificateDuotone } from "react-icons/pi";
import { FcTodoList } from "react-icons/fc";
import { useAuth } from "./AuthProvider";
import axios from "axios";
import { FaUsersGear } from "react-icons/fa6";
const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { isAuthenticated, userData, roles, handleLogout } = useAuth();
    const [image, setImage] = useState(null);
    const [admin, setAdmin] = useState(false);
    const [marker, setMarker] = useState(false);
    const navigate = useNavigate();

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

    useEffect(() => {
        setAdmin(roles.includes("Admin"));
        setMarker(roles.includes("Marker"));
    }, [roles]);

    const handleUserLogout = async () => {
        try {
            await handleLogout();
            navigate("/");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <div className={`sidebar ${isOpen ? "open" : "collapsed"}`}>
            <nav>
                <ul>
                    <li>
                        <Link to="/dashboard" onClick={toggleSidebar}>
                            <FaHome />
                            {isOpen && <span>Home</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/userprofile" onClick={toggleSidebar}>
                            <FaRegUserCircle />
                            {isOpen && <span>Profile</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/usercertificates" onClick={toggleSidebar}>
                            <IoBagCheckSharp />
                            {isOpen && <span>Exams</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/MyCertificate" onClick={toggleSidebar}>
                            <PiCertificateDuotone />
                            {isOpen && <span>Passed</span>}
                        </Link>
                    </li>
                    {admin && (
                        <li>
                            <Link to="/CreateCert" onClick={toggleSidebar}>
                                <IoCreateOutline />
                                {isOpen && <span>Create</span>}
                            </Link>
                        </li>
                    )}
                    {marker && (
                        <li>
                            <Link to="/marker/assignments" onClick={toggleSidebar}>
                                <FcTodoList />
                                {isOpen && <span>Assignments</span>}
                            </Link>
                        </li>
                    )}
                    {admin && (
                        <li>
                            <Link to="/usertable" onClick={toggleSidebar}>
                            <FaUsersGear />
                                {isOpen && <span>UserTable</span>}
                            </Link>
                        </li>
                    )}
                    {admin && (
                        <li>
                            <Link to="/assignMarker" onClick={toggleSidebar}>
                                <FcTodoList />
                                {isOpen && <span>Submissions</span>}
                            </Link>
                        </li>
                    )}
                    <li>
                        <button className="logout-btn" onClick={handleUserLogout}>
                            <FiLogOut />
                            {isOpen && <span>Logout</span>}
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="sidebar-footer">
                {isAuthenticated ? (
                    <div className="user-info">
                        {!isOpen && (
                            <img
                                src={image ? `https://localhost:7295${image}` : "/default-profile.png"}
                                alt="User Profile"
                                className="profile-img"
                                style={{ width: "40px", height: "40px" }}
                            />
                        )}
                        {isOpen && (
                            <div className="user-details">
                                <img
                                    src={image ? `https://localhost:7295${image}` : "/default-profile.png"}
                                    alt="User Profile"
                                    className="profile-img"
                                    style={{ width: "70px", height: "70px", marginBottom: "90px" }}
                                />
                                <p className="user-role">{roles.join(", ")}</p>
                                <p className="user-name">{userData.userName}</p>
                                <p className="user-email">{userData.email}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="user-info">Not logged in</p>
                )}
            </div>
        </div>
    );
};

export default Sidebar;