import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar1";

const CreateCert = () => {
    const { certId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, roles, AuthError, revalidateAuth } = useAuth();
    const [certName, setCertName] = useState("");
    const [passingScore, setPassingScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [reward, setReward] = useState(0);
    const [cost, setCost] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [categoryId, setCategoryId] = useState(0);
    const [categories , setCategories] = useState([]);

    const sidebarRef = useRef(null);

    // Handle opening and closing of the sidebar
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);
    const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
            closeSidebar();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        revalidateAuth();
    }, [location]);

    const isLoading = isAuthenticated === null;
    const hasNoPermission = !roles.includes("Admin") && !roles.includes("Marker");

    const handleCertNameChange = (e) => setCertName(e.target.value);
    const handlePassingScoreChange = (e) => setPassingScore(Number(e.target.value));
    const handleRewardChange = (e) => setReward(Number(e.target.value));
    const handleCategoryChange = (e) => setCategoryId(Number(e.target.value));
    const handleCostChange = (e) => setCost(Number(e.target.value));

    const handleQuestionChange = (index, key, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][key] = value;
        setQuestions(updatedQuestions);
    };

    const handleAnswerChange = (questionIndex, answerIndex, key, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].answerOptions[answerIndex][key] = value;
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { id: null, text: "", correctAnswer: "", answerOptions: [{ id: null, text: "", isCorrect: false }] },
        ]);
    };

    const addAnswerOption = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].answerOptions.push({ id: null, text: "", isCorrect: false });
        setQuestions(updatedQuestions);
    };
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://localhost:7295/api/ExamCategories");
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
    
        fetchCategories();
    }, []);
    

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if ( certName.trim() === "" || questions.length === 0) {
            alert("Please complete all fields correctly.");
            return;
        }
    
        const payload = {
            certName,
            passingScore,
            questions: questions.map((q) => ({
                id: q.id || 0,
                text: q.text,
                correctAnswer: q.correctAnswer,
                answerOptions: q.answerOptions.map((a) => ({
                    id: a.id || 0,
                    text: a.text,
                    isCorrect: a.isCorrect,
                })),
            })),
            reward,
            cost,
            categoryId
        };
    
        try {
            const response = await axios.post("https://localhost:7295/api/Exam/create", payload);
            console.log("Response:", response.data);
            alert(certId ? "Exam updated successfully!" : "Exam created successfully!");
            navigate(-1);
        } catch (err) {
            if (err.response) {
                console.error("Backend error:", err.response.data);
                alert(`Error: ${err.response.data}`);
            } else {
                console.error("Error submitting exam:", err.message);
                alert("Failed to submit the exam.");
            }
        }
    };

    if (!roles.includes("Admin") && !roles.includes("Marker")) {
        return <div>You do not have permission to access this page.</div>;
    }

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (AuthError) {
        return <div>{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    if (hasNoPermission) {
        return <div>You do not have permission to access this page.</div>;
    }

    return (
        <div
            style={{
                justifyContent: "center",
                paddingTop: "50px",
                marginLeft: isSidebarOpen ? "250px" : "0",
                transition: "margin-left 0.3s ease",
            }}
        >
            <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen} />
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <form onSubmit={handleSubmit} className="exam-form" style={{ alignContent: "center" }}>
                <div style={{ textAlign: "center" }}>
                    <label>Exam Title:</label>
                    <input type="text" value={certName} onChange={handleCertNameChange} required style={{ width: "100%" }} />
                    <label>Category:</label>
                    <select type="number" value={categoryId} onChange={handleCategoryChange} required style={{ width: "100%", height: "2.5rem" }}>
                        <option  value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <label>Passing Score:</label>
                    <input type="number" value={passingScore} onChange={handlePassingScoreChange} required style={{ width: "100%" }} />
                    <label>Reward:</label>
                    <input type="number" value={reward} onChange={handleRewardChange} required style={{ width: "100%" }} />
                    <label>Cost:</label>
                    <input type="number" value={cost} onChange={handleCostChange} required style={{ width: "100%" }} />
                </div>
                {questions.map((question, questionIndex) => (
                    <div key={questionIndex}>
                        <h4>Question {questionIndex + 1}</h4>
                        <label>Text:</label>
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => handleQuestionChange(questionIndex, "text", e.target.value)}
                            required
                            style={{ width: "100%" }}
                        />

                        <label>Correct Answer:</label>
                        <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => handleQuestionChange(questionIndex, "correctAnswer", e.target.value)}
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
                                    style={{ width: "100%" }}
                                    onChange={(e) =>
                                        handleAnswerChange(questionIndex, optionIndex, "text", e.target.value)
                                    }
                                    required
                                />

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={(e) =>
                                            handleAnswerChange(questionIndex, optionIndex, "isCorrect", e.target.checked)
                                        }
                                    />
                                    Is Correct
                                </label>
                            </div>
                        ))}

                        <button type="button" onClick={() => addAnswerOption(questionIndex)}>
                            Add Answer Option
                        </button>
                    </div>
                ))}

                <button type="button" onClick={addQuestion}>
                    Add Question
                </button>

                <br />
                <button type="submit">Submit</button>
                <button type="button" onClick={() => navigate(-1)}>
                    Back
                </button>
            </form>
        </div>
    );
};

export default CreateCert;
