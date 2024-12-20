import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const GradeExamPage = () => {
    const { examSubmissionId } = useParams(); 
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

                
                const initialGradingData = response.data.answers.reduce((acc, answer) => {
                    acc[answer.questionId] = answer.isCorrect ? answer.selectedAnswerId : null;
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

    const handleCheckboxChange = (questionId, selectedAnswerId) => {
        setGradingData((prev) => {
            const updatedGradingData = { ...prev };
    
            if (selectedAnswerId === null || selectedAnswerId === undefined) {
                delete updatedGradingData[questionId];  
            } else {
                updatedGradingData[questionId] = selectedAnswerId; 
            }
    
            return updatedGradingData;
        });
    };

    const handleSubmitGrades = async () => {
        try {
            const payload = {
                examSubmissionId: parseInt(examSubmissionId), 
                gradingData: {},   
            };
    
           
            submissionDetails.answers.forEach((answer) => {
                const selectedAnswerId = gradingData[answer.questionId]; 
                if (selectedAnswerId !== undefined && selectedAnswerId !== null) {
                   // payload object inside an object
                    payload.gradingData[answer.questionId] = selectedAnswerId;
                } else {
                    console.warn(`No selected answer for question ${answer.questionId}`);
                }
            });
            
            // Check if gradingData is populated correctly
            if (Object.keys(payload.gradingData).length === 0) {
                setError("No grading data to submit.");
                return;
            }
    
            // Log the payload for debugging
            console.log("Payload before sending:", JSON.stringify(payload, null, 2));
    
            // Send the request with the correctly formatted data
            const response = await axios.post("https://localhost:7295/api/Exam/grade-submission", payload);
    
            // The response now includes gradingData, score, and isPassed
            const responseData = response.data;
            console.log("Response from server:", responseData);
    
            // You can now use the gradingData, score, and isPassed from the response
            setSubmissionDetails({
                ...submissionDetails,
                gradingData: responseData.gradingData,
                score: responseData.score,
                isPassed: responseData.isPassed,
            });
    
            alert("Grading submitted successfully!");
        } catch (err) {
            if (err.response) {
                console.error("Error response from server:", err.response.data);
            } else {
                console.error("Error message:", err.message);
            }
            setError("Failed to submit grades.");
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
                        <th>Candidades Answer</th>
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
                                        handleCheckboxChange(answer.questionId, e.target.checked ? answer.correctAnswerId : null)
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