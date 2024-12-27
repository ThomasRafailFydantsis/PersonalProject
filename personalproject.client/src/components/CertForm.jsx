import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import ExamImageUpload from "./ExamImageUpload";
import ExamService from '../servicesE/ExamService';


const CertForm = () => {
    const { certId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, roles, error: AuthError, isAuthLoading } = useAuth();

    const [certName, setCertName] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    const isAdminOrMarker = roles.includes("Admin") || roles.includes("Marker");

    useEffect(() => {
        if (!isAuthLoading) {
            if (!isAuthenticated || !isAdminOrMarker) {
                navigate("/login");
            } else if (certId) {
                fetchExam(certId);
            } else {
                setLoading(false);
            }
        }
    }, [certId, isAuthenticated, isAdminOrMarker, isAuthLoading, navigate]);

    const fetchExam = async (certId) => {
        try {
            setLoading(true);
            const examData = await ExamService.fetchExam(certId);
            setCertName(examData.certName);
            setQuestions(examData.questions);
          
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ExamService.submitExam(certId, certName, questions);
            alert(certId ? "Exam updated successfully!" : "Exam created successfully!");
            navigate(-1);
        } catch (error) {
            alert(error);
        }
    };

    if (isAuthLoading || loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (AuthError) return <div>{AuthError}</div>;

    return (
        <form onSubmit={handleSubmit} className="exam-form">
            <div>
                <label>Exam Title:</label>
                <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    required
                    style={{ width: "100%" }}
                />
                <ExamImageUpload certId={certId} />
            </div>
            {questions.map((question, questionIndex) => (
                <div key={questionIndex}>
                    <h4>Question {questionIndex + 1}</h4>
                    <label>Text:</label>
                    <input
                        type="text"
                        value={question.text}
                        onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questionIndex].text = e.target.value;
                            setQuestions(updatedQuestions);
                        }}
                        style={{ width: "100%" }}
                        required
                    />
                    <label>Correct Answer:</label>
                    <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questionIndex].correctAnswer = e.target.value;
                            setQuestions(updatedQuestions);
                        }}
                        required
                        style={{ width: "100%" }}
                    />
                    <h5>Answer Options</h5>
                    {question.answerOptions.map((option, optionIndex) => (
                        <div key={optionIndex}>
                            <label>Text:</label>
                            <input
                                type="text"
                                value={option.text}
                                onChange={(e) => {
                                    const updatedQuestions = [...questions];
                                    updatedQuestions[questionIndex].answerOptions[optionIndex].text = e.target.value;
                                    setQuestions(updatedQuestions);
                                }}
                                required
                                style={{ width: "100%" }}
                            />
                            <label>
                                <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) => {
                                        const updatedQuestions = [...questions];
                                        updatedQuestions[questionIndex].answerOptions[optionIndex].isCorrect =
                                            e.target.checked;
                                        setQuestions(updatedQuestions);
                                    }}
                                    style={{ width: "100%" }}
                                />
                                Is Correct
                            </label>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            const updatedQuestions = [...questions];
                            updatedQuestions[questionIndex].answerOptions.push({
                                id: null,
                                text: "",
                                isCorrect: false,
                            });
                            setQuestions(updatedQuestions);
                        }}
                    >
                        Add Answer Option
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() =>
                    setQuestions([
                        ...questions,
                        { id: null, text: "", correctAnswer: "", answerOptions: [] },
                    ])
                }
            >
                Add Question
            </button>
            <br />
            <button type="submit">Submit</button>
            <button type="button" onClick={() => navigate(-1)}>
                Back
            </button>
        </form>
    );
};

export default CertForm;
