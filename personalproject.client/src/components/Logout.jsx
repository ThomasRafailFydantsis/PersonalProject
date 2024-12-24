import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider"; 

function Logout() {
    const { handleLogout } = useAuth(); 
    const navigate = useNavigate();

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
        <button onClick={handleUserLogout}>
            Logout
        </button>
    );
}

export default Logout;