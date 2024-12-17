import Logout from "./Logout";
import { useNavigate } from "react-router-dom";
function Header() {
    const navigate = useNavigate();
    return (
        <header className="header">
        <>
        <a className="header-logo" href="/"><h1>Certflix</h1></a>
            </>
            <>
                <nav className="header-nav">
                       <button><a href="/home">Home</a></button>
                    <button><a href="/contact">Contact</a></button>
                    <button name="userProfile" onClick={() => navigate('/userCertificates')}>Cart</button>
                        <Logout />
                </nav>
        </>
        </header>
    )
}

export default Header