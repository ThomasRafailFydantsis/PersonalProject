function OflineHeader() {
    return (

        <header className="header">
            <>
                <a className="header-logo" href="/"><h1>Certflix</h1></a>
            </>
            <>
                <nav className="header-nav">
                    <button><a href="/contact">Contact</a></button>
                    <button><a href="/about">About</a></button>
                </nav>
            </>
        </header>
    )
}

export default OflineHeader