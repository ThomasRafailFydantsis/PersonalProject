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
  const { isAuthenticated, userData, roles, AuthError, loading, revalidateAuth } = useAuth();

    const [certName, setCertName] = useState("");
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [category, setCategory] = useState("");
    const [cost, setCost] = useState(0);
    const [reward, setReward] = useState(0);
    const [achievements, setAchievements] = useState([]);

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
                fetchData(certId);
            } else {
                setLoading(false);
            }
        }
    }, [certId, isAuthenticated, isAdminOrMarker, isAuthLoading, navigate]);

   
        const fetchData = async () => {
            if (certId) {
                try {
                    setLoading(true);
                    const examData = await ExamService.fetchExam(certId);
                    setCertName(examData.certName);
                    setCategory(examData.category);
                    setCost(examData.cost);
                    setReward(examData.reward);
                    setAchievements(examData.achievements);
                    setQuestions(examData.questions);
                } catch (error) {
                    setError(error.message || "Failed to fetch exam data.");
                } finally {
                    setLoading(false);
                }
            }
        };
      

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ExamService.submitExam(certId, certName, category, cost, reward, achievements, questions);
            alert(certId ? "Exam updated successfully!" : "Exam created successfully!");
            navigate(-1);
        } catch (error) {
            alert(error || "Submission failed.");
        }
    };

     useEffect(() => {
           if (!loading && isAuthenticated && !userData) {
               revalidateAuth();
           }
       }, [loading, isAuthenticated, userData, revalidateAuth]);
   
       if (loading) {
           return <div>Loading...</div>;
       }
   
       if (AuthError && isAuthenticated === false) {
           return (
               <div>
                   <h3>Error</h3>
                   <p>{AuthError}</p>
                   <button onClick={() => window.location.reload()}>Retry</button>
               </div>
           );
       }
   
       if (isAuthenticated === null) {
           return <div>Authenticating...</div>;
       }
   
       // Check if user has the required role
       const hasNoPermission = !roles.includes("Admin") && !roles.includes("Marker") && !roles.includes("User");
   
       if (hasNoPermission) {
           return navigate("/"); // Redirect to the homepage if no permission
       }

    return (
        <div
            style={{
                marginLeft: isSidebarOpen ? "250px" : "0px",
                transition: "margin-left 0.3s ease-in-out",
            }}
        >
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <form style={{ marginTop: "60px" }} onSubmit={handleSubmit} className="exam-form">
                <div className="form-group">
                    <label>Exam Title:</label>
                    <input
                        type="text"
                        value={certName}
                        onChange={(e) => setCertName(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <ExamImageUpload certId={certId} />
                <div className="form-group">
                    <label>Category ID:</label>
                    <input
                        type="number"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Cost:</label>
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(parseInt(e.target.value, 10))}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Reward:</label>
                    <input
                        type="number"
                        value={reward}
                        onChange={(e) => setReward(parseInt(e.target.value, 10))}
                        required
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <label>Achievements (Comma-separated IDs):</label>
                    <input
                        type="text"
                        value={achievements.map((a) => a.id).join(",")}
                        onChange={(e) =>
                            setAchievements(
                                e.target.value
                                    .split(",")
                                    .map((id) => ({ id: parseInt(id.trim(), 10) }))
                            )
                        }
                        placeholder="1, 2, 3"
                        required
                        className="form-control"
                    />
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
                                updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    text: e.target.value,
                                };
                                setQuestions(updatedQuestions);
                            }}
                            required
                            className="form-control"
                        />
                        <label>Correct Answer:</label>
                        <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => {
                                const updatedQuestions = [...questions];
                                updatedQuestions[questionIndex] = {
                                    ...updatedQuestions[questionIndex],
                                    correctAnswer: e.target.value,
                                };
                                setQuestions(updatedQuestions);
                            }}
                            required
                            className="form-control"
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
                                        updatedQuestions[questionIndex].answerOptions[optionIndex] = {
                                            ...updatedQuestions[questionIndex].answerOptions[optionIndex],
                                            text: e.target.value,
                                        };
                                        setQuestions(updatedQuestions);
                                    }}
                                    required
                                    className="form-control"
                                />
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) => {
                                            const updatedQuestions = [...questions];
                                            updatedQuestions[questionIndex].answerOptions[optionIndex] = {
                                                ...updatedQuestions[questionIndex].answerOptions[optionIndex],
                                                isCorrect: e.target.checked,
                                            };
                                            setQuestions(updatedQuestions);
                                        }}
                                    />
                                    Is Correct
                                </label>
                            </div>
                        ))}
                    </div>
                ))}
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