import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import ExamHdr from "../components/ExamHdr";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";

const ExamPage = () => {
    const { certId } = useParams();
    const location = useLocation();
    const userId = location.state?.userId;

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const [examStarted, setExamStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // Timer starts as null
    const navigate = useNavigate();
    const { isAuthenticated, AuthError, revalidateAuth } = useAuth();

    useEffect(() => {
        revalidateAuth();
    }, [location]);

    useEffect(() => {
        if (!certId || !userId) {
            setError("Missing user ID or certificate ID.");
            setLoading(false);
            return;
        }

        const fetchExamById = async () => {
            try {
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/${certId}`
                );
                setExam(response.data);
                setLoading(false);
            } catch (error) {
                setError("Failed to fetch exam.");
                setLoading(false);
            }
        };

        fetchExamById();
    }, [certId, userId]);

    useEffect(() => {
        if (examStarted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);

            return () => clearInterval(timer); // Clear timer on component unmount
        }

        if (timeLeft === 0 && examStarted) {
            handleSubmit(); // Auto-submit when timer reaches 0
        }
    }, [timeLeft, examStarted]);

    const handleAnswerChange = (questionId, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const handleGoBack = () => {
        const confirmed = window.confirm(
            "Are you sure you want to go back? Unsaved changes will be lost."
        );
        if (confirmed) {
            navigate(-1); // Navigate back to the previous page
        }
    };

    const handleSubmit = async () => {
        const confirmed = timeLeft === 0 || window.confirm("Are you sure you want to submit the exam?");
        if (!confirmed) {
            return;
        }

        try {
            const answerIds = Object.values(selectedAnswers);
            if (exam?.Questions?.length === 0 || answerIds.length !== exam.Questions.length) {
                setSubmitError("Please answer all questions.");
                return;
            }

            const requestPayload = {
                userId,
                certId: parseInt(certId),
                answerIds: answerIds.map((id) => parseInt(id)),
            };

            console.log("Request Payload:", requestPayload);

            const response = await axios.post(
                "https://localhost:7295/api/Exam/submit",
                requestPayload
            );

            console.log("Submit Response:", response.data);
            setResult(response.data);
            setExamStarted(false); // Stop timer
            console.log("Result:", response.data);
        } catch (err) {
            console.error("Submit Error:", err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 409) {
                setSubmitError("Duplicate submission detected. Your exam has already been submitted.");
            } else {
                setSubmitError("Failed to submit exam. Please try again later.");
            }
        }
    };

    const handleStartExam = () => {
        setExamStarted(true);
        setTimeLeft(600); // Start timer at 10 minutes
    };

    if (!userId) return <p className="text-danger">Error: User ID not found.</p>;
    if (loading) return <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>;
    if (error) return <p className="text-danger">Error: {error}</p>;

    if (AuthError) {
        return <div className="alert alert-danger">{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div className="alert alert-warning">You are not logged in. Please log in.</div>;
    }

    const questions = exam?.Questions || [];

    return (
        <div className="container my-4">
            <ExamHdr timeLeft={examStarted ? timeLeft : null} />
            <div className="text-center mb-4">
                <h1 className="display-5">{exam.CertName}</h1>
            </div>

            {!examStarted ? (
                <div className="text-center">
                    <button
                        className="btn btn-primary"
                        onClick={handleStartExam}
                    >
                        Start Exam
                    </button>
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        {questions.map((question) => (
                            <div key={question.Id} className="mb-3">
                                <h3 className="h6">{question.Text}</h3>
                                <ul className="list-group">
                                    {question.AnswerOptions.map((option) => (
                                        <li key={option.Id} className="list-group-item">
                                            <label className="form-check-label">
                                                <input
                                                    type="radio"
                                                    name={`question-${question.Id}`}
                                                    value={option.Id}
                                                    className="form-check-input me-2"
                                                    onChange={() => handleAnswerChange(question.Id, option.Id)}
                                                />
                                                {option.Text}
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {submitError && <p className="text-danger">{submitError}</p>}

                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Submit Exam
                    </button>

                    <button className="btn btn-secondary ms-2" onClick={handleGoBack}>
                        Go Back
                    </button>
                </>
            )}

            {result && (
                <div className="alert alert-success mt-4">
                    <h2>Result</h2>
                    <p><strong>Certificate:</strong> {result.certName || "Certificate not found"}</p>
                    <p><strong>Score:</strong> {result.score }</p>
                    <p><strong>Passed:</strong> {result.passed ? "Yes" : "No"}</p>
                    <p><strong>Date Taken:</strong> {result.dateTaken || "Date not available"}</p>
                    <button className="btn btn-primary" onClick={()=> navigate(-1)}>Go Back</button>
                </div>
            )}
        </div>
    );
};

export default ExamPage;