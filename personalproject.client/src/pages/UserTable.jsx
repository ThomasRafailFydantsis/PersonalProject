import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import Sidebar from "../components/SideBar";



const UserTable = () => {
    const { roles, isAuthenticated, AuthError, isAuthLoading,  } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterRole, setFilterRole] = useState("All");
  
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const isAdmin = roles.includes("Admin");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
   

    useEffect(() => {

        if (isAuthLoading) return;

        if (!isAuthenticated || !isAdmin) {
            console.warn("is admin and is auth:" + isAdmin + isAuthenticated);
            navigate("/login");
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
                } finally {
                    console.log("is admin and is auth:" + isAdmin + isAuthenticated);
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

    if (isAuthLoading ) return <div>Loading...</div>; 
    if (error) return <div>Error: {error}</div>;
    if (AuthError) return <div>{AuthError}</div>;

    return (
        <div>
            <Header toggleSidebar={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <h1 style={{ textAlign: "center",marginTop:"20px", color: "#607d8b" }}>User List</h1>
            <div style={{justifyContent:"center", display:"flex"}}>
                <label style={{marginTop:"15px", fontSize:"20px"}} htmlFor="roleFilter">Filter by Role:</label>
                <select
                    id="roleFilter"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    style={{borderRadius: "5px",height:"40px", marginTop:"10px", fontSize:"20px", marginLeft:"10px"}}
                >
                    <option value="All">All</option>
                    <option value="User">Users</option>
                    <option value="Admin">Admins</option>
                    <option value="Marker">Markers</option>
                </select>
            </div>
            <table style={{maxWidth:'1200px', margin:'0 auto' }} >
                <thead >
                    <tr>
                        <th style={{ width: "250px" }}>ID</th>
                        <th style={{ width: "300px" }}>Username</th>
                        <th style={{ width: "300px" }}>Name</th>
                        <th style={{ width: "300px" }}>Role</th>
                        <th style={{ width: "300px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody >
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.userName}</td>
                            <td>
                                <a
                                    href=""
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                >
                                    {user.firstName}, {user.lastName}
                                </a>
                            </td>
                            <td> <select
                                    onChange={(e) => handleAssignRole(user.id, e.target.value)}
                                    value={user.roles[0] || ""}
                                    style={{borderRadius: "5px", minHeight:"36px"}}
                                >
                                    <option value="" disabled>Assign Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="User">User</option>
                                    <option value="Marker">Marker</option>
                                </select></td>
                            <td>
                                <button className="btn btn-outline-danger" onClick={() => handleDelete(user.id)}>Delete</button>
                               
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;