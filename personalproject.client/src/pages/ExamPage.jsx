import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ExamService from "../servicesE/ExamService";
import { useAuth } from "../components/AuthProvider";
import ExamHdr from "../components/ExamHdr";

const ExamPage = () => {
    const { certId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, AuthError, revalidateAuth, userData} = useAuth();
    

    // State Variables
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const userId = userData ? userData.id : null;
    // Effects
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

    // Event Handlers
    const handleStartExam = () => {
        setExamStarted(true);
        setTimeLeft(600); // Set timer to 10 minutes
    };

    const handleAnswerChange = (questionId, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const handleSubmit = async () => {
        if (timeLeft > 0 && !window.confirm("Are you sure you want to submit the exam?")) return;

        try {
            const answerIds = Object.values(selectedAnswers);
            if (!exam?.questions || answerIds.length !== exam.questions.length) {
                setSubmitError("Please answer all questions.");
                return;
            }

            const resultData = await ExamService.submitExamAnswers(userId, certId, answerIds);
            setResult(resultData); // Includes achievements from the API response
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setExamStarted(false);
        }
    };

    // Render Logic
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
                        Start Exam
                    </button>
                </div>
            )}

            {examStarted && !result && (
                <>
                    {exam.questions.map((question) => (
                        <QuestionBlock
                            key={question.id}
                            question={question}
                            handleAnswerChange={handleAnswerChange}
                        />
                    ))}
                    {submitError && <ErrorMessage message={submitError} />}
                    <div className="mt-4">
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            Submit Exam
                        </button>
                        <button className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                    </div>
                </>
            )}

            {result && <ResultBlock question={exam.questions} result={result} navigate={navigate} />}
        </div>
    );
};

// Reusable Components
const ErrorMessage = ({ message }) => <p className="text-danger">{message}</p>;

const WarningMessage = ({ message }) => <div className="alert alert-warning">{message}</div>;

const LoadingSpinner = () => (
    <div className="spinner-border text-center" role="status">
        <span className="visually-hidden">Loading...</span>
    </div>
);

const QuestionBlock = ({ question, handleAnswerChange }) => (
    <div className="mb-3">
        <h3 className="h6">{question.text}</h3>
        <ul className="list-group">
            {question.answerOptions.map((option) => (
                <li key={option.id} className="list-group-item">
                    <label className="form-check-label">
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.id}
                            className="form-check-input me-2"
                            onChange={() => handleAnswerChange(question.id, option.id)}
                        />
                        {option.text}
                    </label>
                </li>
            ))}
        </ul>
    </div>
);

const ResultBlock = ({ result, navigate, question }) => (
    <div className="alert alert-success mt-4">
        <h2>Result</h2>
        <p>
            <strong>Certificate:</strong> {result.certName || "Certificate not found"}
        </p>
        <p>
            <strong>Score:</strong> {Math.round((result.score / question.length) * 100)}% 
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