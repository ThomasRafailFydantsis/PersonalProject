import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import ExamImageUpload from "./ExamImageUpload";
import ExamService from "../servicesE/ExamService";
import Sidebar from "./Sidebar1";
import Header from "./Header";

const CertForm = () => {
    const { certId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, roles, error: AuthError, isAuthLoading } = useAuth();

    const [certName, setCertName] = useState("");
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const sidebarRef = useRef(null);

    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
            setError(error.message || "Failed to fetch exam data.");
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
            alert(error.message || "Submission failed.");
        }
    };

    if (isAuthLoading || loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (AuthError) return <div>{AuthError}</div>;

    return (
        <div
            style={{
                margin: "0 auto",
                marginLeft: isSidebarOpen ? "250px" : "0px",
                transition: "margin-left 0.3s ease-in-out",
            }}
        >
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <form
                onSubmit={handleSubmit}
                className="exam-form"
                style={{
                    paddingTop: "50px",
                    maxWidth: "800px",
                    margin: "0 auto",
                    padding: "20px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "margin-left 0.3s ease-in-out",
                    marginTop: "100px",
                }}
            >
                <div className="form-group">
                    <label>Exam Title:</label>
                    <input
                        type="text"
                        value={certName}
                        onChange={(e) => setCertName(e.target.value)}
                        required
                        className="form-control"
                    />
                    <ExamImageUpload certId={certId} />
                </div>
                {questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="question-section">
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
                            className="form-control"
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
                            className="form-control"
                            required
                        />
                        <h5>Answer Options</h5>
                        {question.answerOptions.map((option, optionIndex) => (
                            <div key={optionIndex} className="answer-option">
                                <label>Text:</label>
                                <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => {
                                        const updatedQuestions = [...questions];
                                        updatedQuestions[questionIndex].answerOptions[optionIndex].text =
                                            e.target.value;
                                        setQuestions(updatedQuestions);
                                    }}
                                    className="form-control"
                                    required
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
                                    />
                                    Is Correct
                                </label>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-secondary mt-2"
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
                    className="btn btn-secondary mt-3"
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
                <button type="submit" className="btn btn-primary mt-3">
                    Submit
                </button>
                <button type="button" className="btn btn-danger mt-3 ms-2" onClick={() => navigate(-1)}>
                    Back
                </button>
            </form>
        </div>
    );
};

export default CertForm;