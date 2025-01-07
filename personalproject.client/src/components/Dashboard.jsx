import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import CertsList from "./CertsList";
import { useAuth } from "./AuthProvider";
import Sidebar from './Sidebar1'; // Import Sidebar correctly


function Dashboard() {
    const { isAuthenticated, userData, roles, AuthError, loading, revalidateAuth } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Create ref for the sidebar
    const sidebarRef = useRef(null);
    

    // Toggle the sidebar open and closed
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    // Close the sidebar
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Handle click outside to close the sidebar
    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar(); // Close sidebar when clicked outside
        }
    };

    // Add event listener on mount to detect clicks outside
    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    useEffect(() => {
        if (!loading && isAuthenticated && !userData) {
            revalidateAuth();
        }
    }, [loading, isAuthenticated, userData, revalidateAuth]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (AuthError && isAuthenticated === false) {
        return (
            <div>
                <h3>Error</h3>
                <p>{AuthError}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (isAuthenticated === null) {
        return <div>Authenticating...</div>;
    }
console.log(userData)
    // Check if user has the required role
    const hasNoPermission = !roles.includes("Admin") && !roles.includes("Marker") && !roles.includes("User");

    if (hasNoPermission) {
        return navigate("/"); // Redirect to the homepage if no permission
    }

    return (
        <div style={{paddingBottom: "100px"}}>
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen}/>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <div className="wrapper" style={{ marginLeft: isSidebarOpen ? "300px" : "0px",transition: "margin-left 0.3s ease-in-out" }}>
                <div className="dashboard-certificates" style={{ marginTop: "80px"}}>
                    <CertsList id={userData?.id} />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;