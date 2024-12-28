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


    useEffect(() => {
        revalidateAuth();
    }, []); 

    // Fetch submission details
    useEffect(() => {
        const fetchSubmissionDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/submission/${examSubmissionId}`
                );
                setSubmissionDetails(response.data);

                // Initialize grading data based on the answers
                const initialGradingData = response.data.answers.reduce((acc, answer) => {
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

        if (examSubmissionId) fetchSubmissionDetails(); // Ensure `examSubmissionId` exists
    }, [examSubmissionId]);

    // Handle checkbox changes for grading
    const handleCheckboxChange = (questionId, selectedAnswerId) => {
        setGradingData((prev) => ({
            ...prev,
            [questionId]: selectedAnswerId,
        }));
    };

    // Submit grades
    const handleSubmitGrades = async () => {
        try {
            const payload = {
                examSubmissionId: parseInt(examSubmissionId, 10),
                gradingData: gradingData,
            };

            // Validate grading data
            if (!Object.keys(payload.gradingData).length) {
                setError("No grading data to submit.");
                return;
            }

            const response = await axios.post(
                "https://localhost:7295/api/Exam/grade-submission",
                payload
            );

            const responseData = response.data;

            // Update the state with the server response
            setSubmissionDetails((prev) => ({
                ...prev,
                score: responseData.score,
                isPassed: responseData.isPassed,
            }));

            alert("Grading submitted successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to submit grades.");
        }
    };

    // Conditional rendering
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
        <div>
            <Header />
            <button onClick={() => navigate(-1)}>Back</button>
            <h1>Grade Submission</h1>
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
            <table>
                <thead>
                    <tr>
                        <th>Question</th>
                        <th>Candidate's Answer</th>
                        <th>Correct Answer</th>
                        <th>Mark Correct?</th>
                    </tr>
                </thead>
                <tbody>
                    {submissionDetails?.answers.map((answer) => (
                        <tr key={answer.questionId}>
                            <td>{answer.questionText}</td>
                            <td>{answer.answerText}</td>
                            <td>{answer.correctAnswer}</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={gradingData[answer.questionId] === answer.correctAnswerId}
                                    onChange={(e) =>
                                        handleCheckboxChange(
                                            answer.questionId,
                                            e.target.checked ? answer.correctAnswerId : null
                                        )
                                    }
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={handleSubmitGrades} disabled={loading}>
                Submit Grades
            </button>
        </div>
    );
};

export default GradeExamPage;