import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterRole, setFilterRole] = useState("All"); // State for role filter
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const authResponse = await axios.get("https://localhost:7295/api/Account/auth-status", { withCredentials: true });
                if (authResponse.data.isAuthenticated) {
                    const userResponse = await axios.get("https://localhost:7295/api/Account/me", { withCredentials: true });
                    const userData = userResponse.data;
                    if (userData.roles && userData.roles.includes("Admin")) {
                        setIsAdmin(true);
                        const usersResponse = await axios.get("https://localhost:7295/api/Account", { withCredentials: true });
                        setUsers(usersResponse.data);
                        setFilteredUsers(usersResponse.data); // Initialize filtered users
                    }
                } else {
                    navigate("/login");
                }
            } catch (err) {
                setError("Failed to fetch data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Filter users when `filterRole` changes
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
        } catch (error) {
            console.error("Error deleting user:", error);
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
            alert(`User role updated to "${role}".`);
            const updatedUsers = users.map((user) =>
                user.id === userId ? { ...user, roles: [role] } : user
            );
            setUsers(updatedUsers); // Update the UI without a full page reload
        } catch (error) {
            console.error("Error updating role:", error);
            setError("Failed to update role.");
        }
    };

    const handleFilterChange = (e) => {
        setFilterRole(e.target.value);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!isAdmin) return <div>You do not have permission to view this page.</div>;

    return (
        <div>
            <Header />
            <h1>User List</h1>

          
            <div style={{ marginBottom: "10px" }}>
                <label htmlFor="roleFilter">Filter by Role:</label>
                <select
                    id="roleFilter"
                    value={filterRole}
                    onChange={handleFilterChange}
                    style={{ marginLeft: "10px", padding: "5px", fontSize: "14px" }}
                >
                    <option value="All">All</option>
                    <option value="User">Users</option>
                    <option value="Admin">Admins</option>
                    <option value="Marker">Markers</option>
                </select>
            </div>

            <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Role</th>
                        <th>Assign Role</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.userName}</td>
                            <td>{user.email}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.roles.join(", ")}</td>
                            <td>
                                <select
                                    style={{ margin: "5px", color: "black", backgroundColor: "white", border: "1px solid black" }}
                                    onChange={(e) => handleAssignRole(user.id, e.target.value)}
                                    value={user.roles[0] || "Assign Role"}
                                >
                                    <option disabled>Assign Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="User">User</option>
                                    <option value="Marker">Marker</option>
                                </select>
                            </td>
                            <td>
                                <button className="red-button" onClick={() => handleDelete(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="green-button" onClick={() => navigate("/dashboard")}>Back</button>
        </div>
    );
};

export default UserTable;

