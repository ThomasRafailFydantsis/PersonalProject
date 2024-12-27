import React from "react";
import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { FaShoppingBag } from "react-icons/fa";
import { useState, useEffect } from "react";
function Header() {
    const { userData, roles } = useAuth();
    const [transparent, setTransparent] = useState(false); 
    const navigate = useNavigate();
   
       useEffect(() => {
           const handleScroll = () => {
               if (window.scrollY > 0) {
                   setTransparent(true);
               } else {
                   setTransparent(false);
               }
           };
           window.addEventListener('scroll', handleScroll);
           return () => {
               window.removeEventListener('scroll', handleScroll);
           };
       }, []);
    // Check if the user lacks permissions
    const { userName, id} = userData || {};

   
    return (
        <>
        {transparent === false ? (
            <header className="header header-isNotTransparent">
            <a className="header-logo" href="/dashboard">
                <h1>Certflix</h1>
            </a>
            <nav className="header-nav">
                {roles.includes("Admin") && <button onClick={() => navigate("/CreateCert")}>Create Certificate</button>}
                {roles.includes("Marker") && <button onClick={() => navigate("/CreateCert")}>Create Certificate</button>}
                {roles.includes("Admin") && <button onClick={() => navigate("/userTable")}>User Table</button>}
                {roles.includes("Admin") && <button onClick={() => navigate("/assignMarker")}>Assign Marker</button>}
                {roles.includes("Marker") && (
                    <button onClick={() => navigate(`/marker/assignments/${id}`)}>Your Assignments</button>
                )}
                <button onClick={() => navigate("/userCertificates")}><FaShoppingBag /></button>
                <button onClick={() => navigate("/userProfile")}>{userName}</button>
                <Logout />
            </nav>
        </header>
        ):(
            <header className="header header-transparent">
            <a className="header-logo" href="/dashboard">
                <h1>Certflix</h1>
            </a>
            <nav className="header-nav">
                {roles.includes("Admin") && <button onClick={() => navigate("/CreateCert")}>Create Certificate</button>}
                {roles.includes("Marker") && <button onClick={() => navigate("/CreateCert")}>Create  Certificate</button>}
                {roles.includes("Admin") && <button onClick={() => navigate("/userTable")}>User Table</button>}
                {roles.includes("Admin") && <button onClick={() => navigate("/assignMarker")}>Assign Marker</button>}
                {roles.includes("Marker") && (
                    <button onClick={() => navigate(`/marker/assignments/${userData?.id}`)}>Your Assignments</button>
                )}
                <button onClick={() => navigate("/userCertificates")}><FaShoppingBag /></button>
                <button onClick={() => navigate("/userProfile")}>{userName}</button>
                <Logout />
            </nav>
        </header>
        )}
      </>
    );
}

export default Header;
