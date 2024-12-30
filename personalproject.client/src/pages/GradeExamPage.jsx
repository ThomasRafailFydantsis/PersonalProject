import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../components/AuthProvider";

const GradeExamPage = () => {
    const { examSubmissionId } = useParams();
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [gradingData, setGradingData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, roles, AuthError, revalidateAuth } = useAuth();
    const navigate = useNavigate();

    // Revalidate authentication on page load
    useEffect(() => {
        revalidateAuth();
    }, []);

    // Fetch submission details and initialize grading data
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
                    acc[answer.questionId] = answer.selectedAnswerId || null; // Pre-fill with existing data
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
                gradingData, // Send gradingData in expected format
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
            <Header />
            <div style={{ padding: "20px", textAlign: "center", color: "#607d8b", top: "100px" }}>

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
                {submissionDetails?.answers.length}
            </p>
            <p>
                <strong>Status:</strong>{" "}
                {submissionDetails?.isPassed ? "Passed" : "Failed"}
            </p>
           
            <h3>Answers</h3>
            </div>
            <table>
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
                                {answer.answerOptions.map((option) => (
                                    <label key={option.id} style={{ display: "flex", marginBottom: "5px" }}>
                                        <input
                                            type="radio"
                                            name={`question-${answer.questionId}`}
                                            value={option.id}
                                            checked={gradingData[answer.questionId] === option.id}
                                            onChange={() =>
                                                handleRadioChange(answer.questionId, option.id)
                                            }
                                        />
                                        {option.text} {option.isCorrect ? "(Correct)" : ""}
                                    </label>
                                ))}
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