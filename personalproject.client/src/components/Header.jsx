import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "./AuthProvider";
import { IoMdClose } from "react-icons/io";

function Header({ toggleSidebar, isOpen }) {
  const { userData, handleLogout } = useAuth();
  const [transparent, setTransparent] = useState(false);
  const [open, setOpen] = useState(false); // Tracks dropdown open state
  const dropdownRef = useRef(null); // Ref for the dropdown menu
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setTransparent(true);
      } else {
        setTransparent(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleToggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setOpen(false);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      closeDropdown();
    }
  };

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  const handleUserLogout = async () => {
    try {
        await handleLogout(); 
        navigate("/");
    } catch (error) {
        console.error("Error during logout:", error);
        alert("Failed to log out. Please try again.");
    }
};

  return (
    <header
    className={`header ${transparent ? "header-transparent" : "header-isNotTransparent"}`}
    style={{
      display: "flex",
      justifyContent: "space-between", // This ensures the elements are spread out
      alignItems: "center",
       // Add some padding for spacing
    }}
  >
    {/* Left Button */}
    <div className="header-logo" style={{ position: "absolute",left: "-15px"}}>
    <button
        onClick={toggleSidebar}
        style={{
         
          background: "none",
          border: "none",
          color: "white",
          fontSize: "20px",
          cursor: "pointer",
          zIndex: 10,
          transition: "all 1s ease in-out",
        }}
      >
        {isOpen ? (
          <IoMdClose size={21} />
        ) : (
          "☰"
        )}
      </button>
    </div>
    <div style={{ flex: 1, textAlign: "center" }}>
      <a href="/dashboard">
        <h1>Certflix</h1>
      </a>
    </div>
    <nav className="header-nav" style={{ position: "absolute", right: "10px" }}>
      <div className="user-dropdown">
        <button
          onClick={handleToggleDropdown}
          style={{
            borderRadius: "5px",
            paddingBottom: "2px",
            color: "aliceblue",
            marginRight: "-49px",
          }}
        >
          <FaUserCircle size={29} />
        </button>
        {open && (
          <ul
            ref={dropdownRef}
            style={{
              width: "200px",
              alignItems: "center",
              position: "absolute",
              top: "79px",
              right: "-50px",
              backgroundColor: "#607d8b",
              opacity: "0.8",
              borderRadius: "5px",
              listStyleType: "none",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.3)",
              padding: 0,
              margin: 0,
              paddingLeft: "8px",
            }}
          >
            <li
              className="user-profile-button"
              style={{
                marginBottom: "2px",
                textAlign: "center",
                borderBottom: "1px solid rgb(21, 54, 70)",
              }}
            >
              <button
                className="user-profile-button"
                onClick={() => navigate("/userprofile")}
                style={{
                  width: "100%",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                  textAlign: "center",
                  borderBottomRightRadius: "0px",
                  marginLeft: "-3px",
                }}
              >
                <span style={{ color: "white" }}>{userData.userName}</span>
              </button>
            </li>
            <li
              className="user-profile-button"
              style={{
                marginBottom: "0px",
                borderBottom: "1px solid rgb(21, 54, 70)",
                textAlign: "center",
                padding: "auto",
                borderRadius: "5px",
              }}
            >
              <button
                onClick={handleUserLogout}
                className="user-profile-button"
                style={{
                  width: "100%",
                  border: "none",
                  padding: "10px",
                  cursor: "pointer",
                  textAlign: "center",
                  marginTop: "-2px",
                  marginLeft: "-3px",
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        )}
      </div>
    </nav>
  </header>
  );
}

export default Header;