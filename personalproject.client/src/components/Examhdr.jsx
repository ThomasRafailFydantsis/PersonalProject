
function ExamHdr({ timeLeft }) {
    const formattedTime = timeLeft !== null
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
        : null;

    return (
        <header className="header  " style={{backgroundColor: '#007bff'}}>
            <h1>Certflix</h1>
            {formattedTime && (
                <div  className="header-timer">
                    <h2 className="h5 m-0">Time Left: {formattedTime}</h2>
                </div>
            )}
        </header>
    );
}

export default ExamHdr;