// import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
function OflineHeader( ) {
    const [transparent, setTransparent] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setTransparent(true);
            } else {
                setTransparent(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
  
    return (
        <>
      {transparent === false ? (
        <header className="header">
            <>
                <a className="header-notTransparent" href="/"><h1>Certflix</h1></a>
            </>
        </header>
      ):( 
      <header  className="header header-transparent">
        
            <a   href="/"><h1>Certflix</h1></a>
        
    </header>
        )}
       </>
        
    )
}

export default OflineHeader