import { useNavigate } from 'react-router-dom';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';


function Logout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await AuthService.logout(); 
        navigate('/login'); 
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default Logout;