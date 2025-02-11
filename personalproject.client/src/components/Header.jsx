import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { HiOutlineChevronDoubleLeft } from "react-icons/hi";
import { useAuth } from "./AuthProvider";

function Header({ toggleSidebar, isOpen }) {
  const { userData, handleLogout, coins } = useAuth();
  const [transparent, setTransparent] = useState(false);
  const [open, setOpen] = useState(false); 
  const dropdownRef = useRef(null); 
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

  useEffect(() => {
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
      className={`headerHome ${transparent ? "header-transparent" : "header-isNotTransparent"}`}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        maxWidth: "100%",
      }}
    >
      <div
        className="header-logo"
        style={{
          position: "absolute",
          left: "10px",
          zIndex: 10,
          
        }}
      >
        <button
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            toggleSidebar(); 
          }}
          style={{
            background: "none",
            border: "none",
            color: "#607d8b",
            fontSize: "20px",
            cursor: "pointer",
            zIndex: 10,
            transition: isOpen ? "all 1s ease-in-out" : "all 1s ease-in-out",
          }}
        >
          {isOpen ? <HiOutlineChevronDoubleLeft size={23} /> : "☰"}
        </button>
      </div>
      <div className="logo" style={{ flex: 1, textAlign: "center",  }}>
      <h1 >  <a style={{fontSize: "2.5rem", color:"linear-gradient(32deg, rgb(169, 106, 106) 45%, rgba(183,121,37,1) 100%)"}} href="/dashboard">
         Certflix
        </a></h1>
      </div>
      <nav className="header-nav" style={{ position: "absolute", right: "1px" }}>
        <div style={{ display: "flex", alignItems: "center" }} className="user-dropdown">
          <h4 style={{ cursor: "context-menu", color: "#607d8b", border:"1px solid #FF8C00", borderRadius:"9px",padding:"2px", marginTop:"12px", backgroundColor:"rgba(255, 140, 0, 0.1)" }}>
            <span style={{ color: "#FF8C00", }}>Coins</span>Earned : {coins}</h4>
          {/* <button
            onClick={handleToggleDropdown}
            style={{
              borderRadius: "5px",
              paddingBottom: "2px",
              border: "none",
              color: "#FF8C00",
              marginRight: "-22px",
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
                top: "55px",
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
                    fontSize: "15px",
                    marginTop: "5px",
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
                    marginLeft: "-3px",
                    fontSize: "15px",
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          )} */}
        </div>
      </nav>
    </header>
  );
}

export default Header;