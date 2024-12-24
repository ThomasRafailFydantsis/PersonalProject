
function ExamHdr({ timeLeft }) {
    const formattedTime = timeLeft !== null
        ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
        : null;

    return (
        <header className="header d-flex justify-content-between align-items-center p-3 bg-primary text-white">
            <h1>Certflix</h1>
            {formattedTime && (
                <div>
                    <h2 className="h5 m-0">Time Left: {formattedTime}</h2>
                </div>
            )}
        </header>
    );
}

export default ExamHdr;