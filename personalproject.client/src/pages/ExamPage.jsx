import  { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ExamService from "../servicesE/ExamService";
import { useAuth } from "../components/AuthProvider";
import ExamHdr from "../components/ExamHdr"; 

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
    const [timeLeft, setTimeLeft] = useState(null);

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
                const examData = await ExamService.fetchExam(certId);
                setExam(examData);
            } catch (err) {
                setError(err.message || "Failed to fetch exam.");
            } finally {
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

            return () => clearInterval(timer);
        }

        if (timeLeft === 0 && examStarted) {
            handleSubmit();
        }
    }, [timeLeft, examStarted]);

    const handleAnswerChange = (questionId, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const handleSubmit = async () => {
        const confirmed = timeLeft === 0 || window.confirm("Are you sure you want to submit the exam?");
        if (!confirmed) return;

        try {
            const answerIds = Object.values(selectedAnswers);
            if (exam?.questions?.length === 0 || answerIds.length !== exam.questions.length) {
                setSubmitError("Please answer all questions.");
                return;
            }

            const resultData = await ExamService.submitExamAnswers(userId, certId, answerIds);
            setResult(resultData);
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setExamStarted(false);
        }
    };

    const handleStartExam = () => {
        setExamStarted(true);
        setTimeLeft(600);
    };

    if (!userId) return <p className="text-danger">Error: User ID not found.</p>;
    if (loading) return <div className="spinner-border text-center" role="status"><span className="visually-hidden">Loading...</span></div>;
    if (error) return <p className="text-danger">{error}</p>;

    if (AuthError) {
        return <div className="alert alert-danger">{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div className="alert alert-warning">You are not logged in. Please log in.</div>;
    }

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
                        <div key={question.id} className="mb-3">
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
                    ))}

                    {submitError && <p className="text-danger">{submitError}</p>}

                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Submit Exam
                    </button>
                    <button className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                </>
            )}

            {result && (
                <div className="alert alert-success mt-4">
                    <h2>Result</h2>
                    <p><strong>Certificate:</strong> {result.certName || "Certificate not found"}</p>
                    <p><strong>Score:</strong> {result.score}</p>
                    <p><strong>Passed:</strong> {result.passed ? "Yes" : "No"}</p>
                    <p><strong>Date Taken:</strong> {result.dateTaken ? new Date(result.dateTaken).toLocaleDateString() : "-"}</p>
                    <p><strong>Coins Awarded :</strong>+{result.reward}</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            )}
        </div>
    );
};

export default ExamPage;