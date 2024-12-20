import { useEffect, useState } from "react";
import axios from "axios";

const GradeExamPage = ({ examSubmissionId }) => {
    const [submissionDetails, setSubmissionDetails] = useState(null);
    const [gradingData, setGradingData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubmissionDetails = async () => {
            try {
                const response = await axios.get(
                    `https://localhost:7295/api/Exam/submission/${examSubmissionId}`
                );
                setSubmissionDetails(response.data);

                // Initialize grading data with current correctness
                const initialGradingData = response.data.answers.reduce((acc, answer) => {
                    acc[answer.questionId] = answer.isCorrect;
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

        fetchSubmissionDetails();
    }, [examSubmissionId]);

    const handleCheckboxChange = (questionId, value) => {
        setGradingData((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const handleSubmitGrades = async () => {
        try {
            const payload = {
                examSubmissionId,
                gradingData,
            };

            await axios.post("https://localhost:7295/api/Exam/grade-submission", payload);
            alert("Grading submitted successfully!");
        } catch (err) {
            setError("Failed to submit grades.");
            console.error(err);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div>
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
                        <th>Your Answer</th>
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
                                    checked={gradingData[answer.questionId] || false}
                                    onChange={(e) =>
                                        handleCheckboxChange(answer.questionId, e.target.checked)
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