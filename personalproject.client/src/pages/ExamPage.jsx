import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ExamService from "../servicesE/ExamService";
import { useAuth } from "../components/AuthProvider";
import ExamHdr from "../components/ExamHdr";

const ExamPage = () => {
    const { certId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, AuthError, revalidateAuth, userData} = useAuth();
    

    
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const userId = userData ? userData.id : null;
  
    useEffect(() => {
        revalidateAuth();
    }, [location]);

    useEffect(() => {
        if (!certId || !userId) {
            setError("Missing user ID or certificate ID.");
            setLoading(false);
            return;
        }

        const fetchExam = async () => {
            try {
                const examData = await ExamService.fetchExam(certId);
                setExam(examData);
            } catch (err) {
                setError(err.message || "Failed to fetch exam.");
            } finally {
                setLoading(false);
            }
        };

        fetchExam();
    }, [certId, userId]);

    useEffect(() => {
        if (examStarted && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timer);
        }

        if (timeLeft === 0 && examStarted) handleSubmit();
    }, [timeLeft, examStarted]);

    
    const handleStartExam = () => {
        setExamStarted(true);
        setTimeLeft(600); 
    };

    const handleAnswerChange = (questionId, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const handleSubmit = async () => {
        const totalQuestions = exam?.questions?.length || 0;
        const answeredQuestions = Object.keys(selectedAnswers).length;
    
        if (answeredQuestions !== totalQuestions) {
            setSubmitError(`Please answer all ${totalQuestions} questions before submitting.`);
            return;
        }
    
        if (timeLeft > 0 && !window.confirm("Are you sure you want to submit the exam?")) return;
    
        try {
            const answerIds = Object.values(selectedAnswers);
    
            const resultData = await ExamService.submitExamAnswers(userId, certId, answerIds);
            setResult(resultData); 
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setExamStarted(false);
        }
    };

    if (!userId) return <ErrorMessage message="Error: User ID not found." />;
    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (AuthError) return <ErrorMessage message={AuthError} />;
    if (!isAuthenticated) return <WarningMessage message="You are not logged in. Please log in." />;

    return (
        <div className="container my-4" style={{ paddingTop: "100px" }}>
            <ExamHdr timeLeft={examStarted ? timeLeft : null} />
            <div className="text-center mb-4">
                <h1 className="display-5">{exam?.certName || "Exam"}</h1>
            </div>

            {!examStarted && !result && (
                <div className="text-center">
                    <button className="btn btn-primary" onClick={handleStartExam}>
                     {exam.cost ==0 ? 'start Quiz' : "Start Exam" }   
                    </button>
                </div>
            )}

       {examStarted && !result && (
          <>
        {exam.questions.map((question, index) => (
            <QuestionBlock
                key={question.id}
                question={question}
                handleAnswerChange={handleAnswerChange}
                index={index}
            />
        ))}
        {submitError && <ErrorMessage message={submitError} />}
        <div className="mt-4 d-flex justify-content-center">
    <button
        className="green-button"
        onClick={handleSubmit}
        disabled={Object.keys(selectedAnswers).length !== exam?.questions?.length}
    >
       {exam.cost ==0 ? 'Submit Quiz' : "Submit Exam" } 
    </button>
    <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Go Back
    </button>
</div>
        </>
        )}
            {result && <ResultBlock result={result} navigate={navigate} />}
        </div>
    );
};
// Reusable Components
const ErrorMessage = ({ message }) => (
    <p className="text-danger text-center">{message}</p>
);

const WarningMessage = ({ message }) => (
    <div className="alert alert-warning text-center">{message}</div>
);

const LoadingSpinner = () => (
    <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);

const QuestionBlock = ({ question, handleAnswerChange, index }) => (
    <div className="mb-4 p-3 border rounded" style={{ background: "#f9f9f9" }}>
        <h3 className="h6">
            <span className="fw-bold">{index + 1}. </span>
            {question.text}
        </h3>
        <ul className="list-group mt-2">
            {question.answerOptions.map((option, optionIndex) => (
                <li
                    key={option.id}
                    className="list-group-item d-flex align-items-center"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        background: "#fff",
                        marginBottom: "5px",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <label
                        className="form-check-label d-flex align-items-center"
                        style={{ cursor: "pointer", marginBottom: "0" }}
                    >
                        <span
                            className="fw-bold me-2"
                            style={{
                              color: "#FF8C00",
                                padding: "5px 10px",
                                borderRadius: "50%",
                                minWidth: "24px",
                                textAlign: "center",

                            }}
                        >
                            {String.fromCharCode(97 + optionIndex)} )
                        </span>
                        {option.text}
                    </label>
                    <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        className="form-check-input"
                        onChange={() => handleAnswerChange(question.id, option.id)}
                        style={{
                            width: "20px",
                            height: "20px",
                            boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)",
                        }}
                    />
                </li>
            ))}
        </ul>
    </div>
);


const ResultBlock = ({ result, navigate }) => (
    <div className="alert alert-success mt-4">
        <h2>Result</h2>
        <p>
            <strong>Certificate:</strong> {result.certName || "Certificate not found"}
        </p>
        <p>
            <strong>Score:</strong> {result.score}% 
        </p>
        <p>
            <strong>Passed:</strong> {result.passed ? "Yes" : "No"}
        </p>
        <p>
            <strong>Date Taken:</strong> {result.dateTaken ? new Date(result.dateTaken).toLocaleDateString() : "-"}
        </p>
        <p>
            <strong>Coins Awarded:</strong> +{result.reward}
        </p>
        {result.passed && result.achievements && (
            <div className="mt-3">
                <h3>Achievements Earned</h3>
                <ul className="list-group">
                    {result.achievements.map((achievement, index) => (
                        <li key={index} className="list-group-item">
                            <strong>{achievement.title}</strong>: {achievement.description}
                        </li>
                    ))}
                </ul>
            </div>
        )}
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
            Go Back
        </button>
    </div>
);

export default ExamPage;