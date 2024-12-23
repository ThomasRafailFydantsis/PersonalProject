import React from "react";
import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

function Header() {
    const { userData } = useAuth();
    const navigate = useNavigate();

    // Check if the user lacks permissions
    const { userName} = userData || {};

   
    return (
        <header className="header">
            <a className="header-logo" href="/dashboard">
                <h1>Certflix</h1>
            </a>
            <nav className="header-nav">
                <button onClick={() => navigate("/userCertificates")}>Your Certificates</button>
                <button onClick={() => navigate("/userProfile")}>{userName}</button>
                <Logout />
            </nav>
        </header>
    );
}

export default Header;
