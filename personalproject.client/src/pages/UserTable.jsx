import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

const UserTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
           
                const authResponse = await axios.get("https://localhost:7295/api/Account/auth-status", {
                    withCredentials: true,
                });

                if (authResponse.data.isAuthenticated) {
                    setIsAuthenticated(true);

                    
                    const userResponse = await axios.get("https://localhost:7295/api/Account/me", {
                        withCredentials: true,
                    });

                    const userData = userResponse.data;
                    setUserData(userData);

                    
                    if (userData.roles && userData.roles.includes("Admin")) {
                        setIsAdmin(true);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.error("Error fetching user data or authentication status:", err);
                setError("Failed to fetch user data or check authentication.");
            }
        };

        fetchUserDetails();
    }, []);

    useEffect(() => {
        if (isAdmin) {
          
            axios
                .get("https://localhost:7295/api/Account", { withCredentials: true })
                .then((response) => {
                    setUsers(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching users:", error);
                    setError("Failed to fetch users.");
                    setLoading(false);
                });
        }
    }, [isAdmin]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!isAuthenticated) {
        navigate("/login"); 
        return <div>You are not logged in. Redirecting to login...</div>;
    }

    if (!isAdmin) {
        return <div>You do not have permission to view this page.</div>;
    }
    console.log(userData)

    return (
        <div>
        <Header />
            <h1>User List</h1>
            <table border="1" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.userName}</td>
                            <td>{user.email}</td>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button className="green-button" onClick={() => navigate("/dashboard")}>Back</button>
        </div>
    );
};

export default UserTable;