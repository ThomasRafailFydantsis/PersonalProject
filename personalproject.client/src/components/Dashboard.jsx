import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import CertsList from "./CertsList";
import { useAuth } from "./AuthProvider";


function Dashboard() {
    const { isAuthenticated, userData, roles, AuthError, loading, revalidateAuth } = useAuth();
    const navigate = useNavigate();

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

    const hasNoPermission = !roles.includes("Admin") && !roles.includes("Marker") && !roles.includes("User");

    if (hasNoPermission) {
        return navigate ("/");
    }

    return (
        <div>
            <Header />
           
            <div className="wrapper">
                {/* <h2 className="welcome">Welcome Back, {userData?.userName || "User"}!</h2> */}
                <div className="dashboard-certificates" style={{marginTop: "-100px"}}>
                    <CertsList id={userData?.id} />
                </div>
                {/* <button onClick={() => navigate("/userProfile")}>User Profile</button>
                <button onClick={() => navigate("/userCertificates")}>Your Certificates</button>
                {roles.includes("Admin") && <button onClick={() => navigate("/CreateCert")}>Add Certificate</button>}
                {roles.includes("Marker") && <button onClick={() => navigate("/CreateCert")}>Add Certificate</button>}
                {roles.includes("Admin") && <button onClick={() => navigate("/userTable")}>User Table</button>}
                {roles.includes("Admin") && <button onClick={() => navigate("/assignMarker")}>Assign Marker</button>}
                {roles.includes("Marker") && (
                    <button onClick={() => navigate(`/marker/assignments/${userData?.id}`)}>Your Assignments</button>
                )} */}
            </div>
        </div>
    );
}

export default Dashboard;