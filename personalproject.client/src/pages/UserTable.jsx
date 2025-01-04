import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import Sidebar from "../components/Sidebar1";
import { useRef } from "react";

const UserTable = () => {
  const { isAuthenticated, userData, roles, AuthError, loading, revalidateAuth } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterRole, setFilterRole] = useState("All");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const isAdmin = roles.includes("Admin");
  const [isSorted, setIsSorted] = useState(false); 
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


    if (!isAuthenticated || !isAdmin) {
      console.warn("is admin and is auth:" + isAdmin + isAuthenticated);
    
    } else {
      const fetchUsers = async () => {
        try {
          const response = await axios.get("https://localhost:7295/api/Account", {
            withCredentials: true,
          });
          setUsers(response.data);
          setFilteredUsers(response.data);
        } catch (err) {
          console.error(err);
          setError("Failed to fetch user data.");
        }
      };

      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (filterRole === "All") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.roles.includes(filterRole)));
    }
  }, [filterRole, users]);
  

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`https://localhost:7295/api/Account/${userId}`, { withCredentials: true });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  const handleAssignRole = async (userId, role) => {
    try {
      await axios.put(
        "https://localhost:7295/api/Account/update-role",
        { userId, role },
        { withCredentials: true }
      );
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, roles: [role] } : user
      );
      setUsers(updatedUsers);
      alert(`User role updated to "${role}".`);
    } catch (err) {
      console.error("Error updating role:", err);
      setError("Failed to update role.");
    }
  };

  // Sorting function
  const handleSort = () => {
    setIsSorted(!isSorted); // Toggle sorting direction
  };

  const sortedUsers = isSorted
    ? [...filteredUsers].sort((a, b) => a.userName.localeCompare(b.userName)) // Ascending
    : [...filteredUsers].sort((a, b) => b.userName.localeCompare(a.userName)); // Descending

    useEffect(() => {
      if (!loading && isAuthenticated === false) {
          navigate("/");
      }
  }, [loading, isAuthenticated, navigate]);



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

  const hasNoPermission = !isAuthenticated || !isAdmin;

  if (hasNoPermission) {
      return <div>Access denied</div>;
  }
  

  return (
    <div style={{paddingTop: "40px"}}>
     <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen}/>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
      
      <div style={{marginTop: "20px", justifyContent: "center", display: "flex" }}>
        <label style={{ marginTop: "15px", fontSize: "20px" }} htmlFor="roleFilter">
          Filter by Role:
        </label>
        <select
          id="roleFilter"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{ borderRadius: "5px", height: "40px", marginTop: "10px", fontSize: "16px", marginLeft: "10px" }}
        >
          <option value="All">All</option>
          <option value="User">Users</option>
          <option value="Admin">Admins</option>
          <option value="Marker">Markers</option>
        </select>
      </div>
      <div style={{margin:"0 auto", height: "38rem", overflow: "scroll",border: "none", marginTop: "20px",marginLeft: isSidebarOpen ? "300px" : "0px", transition: "margin-left 0.3s ease-in-out" }}>
      <table style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <thead style={{position: "sticky", top: "0"}}>
          <tr>
            <th style={{ width: "250px" }}>ID</th>
            <th style={{ width: "10rem" }}>
              Username<button
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
                onClick={handleSort}
              >
                {isSorted ? "🔽" : "🔼"}
              </button>
            </th>
            <th style={{ width: "300px" }}>Name</th>
            <th style={{ width: "300px" }}>HighScore</th>
            <th style={{ width: "300px" }}>LowestScore</th>
            <th style={{ width: "300px" }}>Role</th>
            <th style={{ width: "300px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.userName}</td>
              <td>
                <a href="#" onClick={() => navigate(`/profile/${user.id}`)}>
                  {user.firstName}, {user.lastName}
                </a>
              </td>
              <td>{user.highestScore || "-"}%</td>
              <td>{user.lowestScore}%</td>
              <td>
                <select
                  onChange={(e) => handleAssignRole(user.id, e.target.value)}
                  value={user.roles[0] || ""}
                  style={{ borderRadius: "5px", minHeight: "36px" }}
                >
                  <option value="" disabled>
                    Assign Role
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Marker">Marker</option>
                </select>
              </td>
              <td>
                <button className="btn btn-outline-danger" onClick={() => handleDelete(user.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        
      </table>
      </div>
    </div>
  );
};

export default UserTable;