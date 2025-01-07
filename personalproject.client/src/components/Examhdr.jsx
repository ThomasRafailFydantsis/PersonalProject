
function ExamHdr({ timeLeft }) {
    const formattedTime = timeLeft !== null
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
        : null;

    return (
        <header className="headerHome  ">
            <h1 style={{fontSize:"40px"}}>Certflix</h1>
            {formattedTime && (
                <div style={{textAlign:"center"}} >
                    <h2 className="h5" style={{marginLeft:"-120px"}} >Time Left: {formattedTime}</h2>
                </div>
            )}
        </header>
    );
}

export default ExamHdr;