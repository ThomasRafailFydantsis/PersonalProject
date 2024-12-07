import Logout from "./Logout";
function Header() {
    return (
        <header className="header">
        <>
        <a className="header-logo" href="/"><h1>Certflix</h1></a>
            </>
            <>
                <nav className="header-nav">
                       <button><a href="/home">Home</a></button>
                       <button><a href="/contact">Contact</a></button>
                       <button><a href="/about">About</a></button>
                        <Logout />
                </nav>
        </>
        </header>
    )
}

export default Header