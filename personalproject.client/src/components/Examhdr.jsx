
function ExamHdr({ timeLeft }) {
    const formattedTime = timeLeft !== null
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
        : null;

    return (
        <header className="headerHome  ">
            <h1>Certflix</h1>
            {formattedTime && (
                <div  className="header-timer">
                    <h2 className="h5 exmhdr" style={{textAlign:"center", marginLeft:"-150pxpx"}}>Time Left: {formattedTime}</h2>
                </div>
            )}
        </header>
    );
}

export default ExamHdr;