import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
function OflineHeader() {
    const navigate = useNavigate();
    return (

        <header className="header">
            <>
                <a className="header-logo" href="/"><h1>Certflix</h1></a>
            </>
            <>
                <nav className="header-nav">
                    <button className="green-button" onClick={() => navigate('/login')}><FiUser /></button>
                   
                </nav>
            </>
        </header>
    )
}

export default OflineHeader