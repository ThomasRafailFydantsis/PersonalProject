import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";
import Sidebar from "../components/Sidebar1";
import { useRef } from "react";
const GradeExamPage = () => {
    const { examSubmissionId } = useParams();
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [gradingData, setGradingData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, roles, AuthError, revalidateAuth } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
        
        // Create ref for the sidebar
        const sidebarRef = useRef(null);
        
    
        // Toggle the sidebar open and closed
        const toggleSidebar = () => {
            setIsSidebarOpen((prev) => !prev);
        };
    
        // Close the sidebar
        const closeSidebar = () => {
            setIsSidebarOpen(false);
        };
    
        // Handle click outside to close the sidebar
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                closeSidebar(); // Close sidebar when clicked outside
            }
        };
    
        // Add event listener on mount to detect clicks outside
        useEffect(() => {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }, []);

    // Revalidate authentication on page load
    useEffect(() => {
        revalidateAuth();
    }, []);

    useEffect(() => {
        const fetchSubmissionDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/submission/${examSubmissionId}`
                );

                const submission = response.data;

                setSubmissionDetails(submission);

                // Initialize grading data with current selectedAnswerId values
                const initialGradingData = submission.answers.reduce((acc, answer) => {
                    acc[answer.questionId] = answer.selectedAnswerId || null; 
                    return acc;
                }, {});
                setGradingData(initialGradingData);
            } catch (err) {
                setError("Failed to fetch submission details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (examSubmissionId) fetchSubmissionDetails();
    }, [examSubmissionId]);

    // Handle radio button state changes
    const handleRadioChange = (questionId, selectedAnswerId) => {
        setGradingData((prev) => ({
            ...prev,
            [questionId]: selectedAnswerId, // Update selectedAnswerId for the question
        }));
    };

    // Submit the finalized grading data
    const handleSubmitGrades = async () => {
        try {
            const payload = {
                examSubmissionId: parseInt(examSubmissionId, 10),
                gradingData, // Send gradingData 
            };

            const response = await axios.post(
                "https://localhost:7295/api/Exam/grade-submission",
                payload
            );

            const responseData = response.data;

            setSubmissionDetails((prev) => ({
                ...prev,
                score: responseData.score,
                isPassed: responseData.isPassed,
            }));

            alert(`Grading submitted successfully! Updated Score: ${responseData.score}`);
        } catch (err) {
            console.error(err);
            setError("Failed to submit grades.");
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    if (!roles.includes("Marker")) {
        return <div>You do not have permission to access this page.</div>;
    }

    if (AuthError) {
        return <div>{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    return (
        <div >
             <Header toggleSidebar={toggleSidebar} isOpen={isSidebarOpen}/>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} sidebarRef={sidebarRef} />
            <div style={{ marginTop: "40px", padding: "20px", textAlign: "center", color: "#607d8b", top: "100px" }}>

            <h1 >Grade Submission:</h1>
            <h2>Candidate: {submissionDetails?.candidateName}</h2>
            <p>
                <strong>Certificate:</strong> {submissionDetails?.certificateName}
            </p>
            <p>
                <strong>Submission Date:</strong>{" "}
                {new Date(submissionDetails?.submissionDate).toLocaleDateString()}
            </p>
            <p>
                <strong>Score:</strong> {submissionDetails?.score} /{" "}
                100
            </p>
            <p>
                <strong>Status:</strong>{" "}
                {submissionDetails?.isPassed ? "Passed" : "Failed"}
            </p>
           
            <h3>Answers</h3>
            </div>
            <table style={{ width: "90%", marginRight:"1.2rem" }}>
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Correct Answer</th>
                        <th>Options</th>
                    </tr>
                </thead>
                <tbody>
                    {submissionDetails?.answers.map((answer) => (
                        <tr key={answer.questionId}>
                            <td>{answer.questionText}</td>
                            <td>{answer.correctAnswer}</td>
                            <td>
                                <div style={{ display: "flex", flexDirection: "row", maxwidth: "500px" }}>
                                {answer.answerOptions.map((option) => (
                                    <label key={option.id} style={{  marginBottom: "5px" }}>
                                         {option.text} {option.isCorrect ? "(Correct)" : ""}
                                        <input
                                            style={{  }}
                                            type="radio"
                                            name={`question-${answer.questionId}`}
                                            value={option.id}
                                            checked={gradingData[answer.questionId] === option.id}
                                            onChange={() =>
                                                handleRadioChange(answer.questionId, option.id)
                                            
                                            }
                                        />
                                       
                                    </label>
                                ))}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button style={{ marginLeft:"300px",marginTop:"20px"}} className="btn btn-primary" onClick={handleSubmitGrades} disabled={loading}>
                Submit Grades
            </button>
        </div>
    );
};

export default GradeExamPage;