import React from "react";
import { FaHome, FaRegUserCircle } from "react-icons/fa";
import { IoBagCheckSharp, IoCreateOutline } from "react-icons/io5";
import { FiLogOut } from "react-icons/fi";
import { PiCertificateDuotone } from "react-icons/pi";
import { useAuth } from "./AuthProvider";
import { FaUsersGear } from "react-icons/fa6";
import notUploaded from "../imgs/notUploaded.png";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuListTodo } from "react-icons/lu";
import { VscLibrary } from "react-icons/vsc";
import { MdOutlineLeaderboard } from "react-icons/md";


const Sidebar = ({ isOpen, toggleSidebar, sidebarRef}) => {
  const { isAuthenticated, userData, roles, handleLogout ,imagePath } = useAuth();
  const [admin, setAdmin] = useState(false);
  const [marker, setMarker] = useState(false);
  const navigate = useNavigate();

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
    <div
      className={`sidebar ${isOpen ? "open" : "collapsed"}`}
      ref={sidebarRef} // Attach ref here
    >
            <nav>
                <ul style={{ marginTop: "-18px",marginBottom: "28px" }}>
                    <li>
                        <Link  to="/dashboard" onClick={toggleSidebar}>
                            <VscLibrary size={20}/>
                            {isOpen && <span>Exams</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/userprofile" onClick={toggleSidebar}>
                            <FaRegUserCircle size={20}/>
                            {isOpen && <span>Profile</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/usercertificates" onClick={toggleSidebar}>
                            <IoBagCheckSharp size={20}/>
                            {isOpen && <span>Cart</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/MyCertificate" onClick={toggleSidebar}>
                            <PiCertificateDuotone size={20} />
                            {isOpen && <span>Results</span>}
                        </Link>
                    </li>
                    <li>
                        <Link to="/afterlogin" onClick={toggleSidebar}>
                        <MdOutlineLeaderboard size={20} />
                            {isOpen && <span>Leaderboards</span>}
                        </Link>
                    </li>
                    {admin && (
                        <li>
                            <Link to="/CreateCert" onClick={toggleSidebar}>
                                <IoCreateOutline size={20}/>
                                {isOpen && <span>Create</span>}
                            </Link>
                        </li>
                    )}
                    {marker && (
                        <li>
                            <Link to="/marker/assignments" onClick={toggleSidebar}>
                                <LuListTodo size={20}/>
                                {isOpen && <span>Assignments</span>}
                            </Link>
                        </li>
                    )}
                    {admin && (
                        <li>
                            <Link to="/usertable" onClick={toggleSidebar}>
                                <FaUsersGear size={20} />
                                {isOpen && <span>UserTable</span>}
                            </Link>
                        </li>
                    )}
                    {admin && (
                        <li>
                            <Link to="/assignMarker" onClick={toggleSidebar}>
                                <LuListTodo size={20} />
                                {isOpen && <span >Submissions</span>}
                            </Link>
                        </li>
                    )}
                    <li>
                        <button className="logout-btn" onClick={handleUserLogout} >
                            <FiLogOut size={20} />
                            {isOpen && <span>Logout</span>}
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="sidebar-footer" style={{ bottom: "0" }}>
                {isAuthenticated ? (
                    
                    <div className="user-info">
                        {!isOpen && (
                            <img
                            src={imagePath ? `https://localhost:7295${imagePath}` : notUploaded}
                                alt="User Profile"
                                className="profile-img"
                                style={{ width: "40px", height: "40px", marginLeft: "36px" ,position: "absolute", bottom: "100px" }}
                            />
                        )}
                        {isOpen && (
                            <div className="user-details" style={{bottom: "140px", position: "absolute"}}>
                                 <p className="user-name" style={{ fontSize: "16px", marginTop: "-30px" }}><span style={{ fontWeight: "bold",color: "#FF8C00" }}>{userData.userName}</span></p>
                                 <p className="user-email" style={{ fontSize: "14px" }}>{userData.email}</p>
                                <img
                                    src={imagePath ? `https://localhost:7295${imagePath}` : notUploaded}
                                    alt="User Profile"
                                    className="profile-img"
                                    style={{ width: "70px", height: "70px", marginBottom: "90px" }}
                                />
                               
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