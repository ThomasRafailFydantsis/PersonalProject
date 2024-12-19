import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const CreateCert = () => {
    const { certId } = useParams();
    const navigate = useNavigate();

    const [certName, setCertName] = useState("");
    const [questions, setQuestions] = useState([]);
   

  
    

    const handleCertNameChange = (e) => {
        setCertName(e.target.value);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            certName,
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
        };
        try {     
            const response = await axios.post("https://localhost:7295/api/Exam/create", payload);
            console.log("Response:", response.data); // Log success response
            alert(certId ? "Exam updated successfully!" : "Exam created successfully!");
            navigate(-1);
        } catch (err) {
            if (err.response) {
                console.error("Backend error:", err.response.data); // Log backend error details
                alert(`Error: ${err.response.data}`);
            } else {
                console.error("Error submitting exam:", err.message);
                alert("Failed to submit the exam.");
            }
        }
    };

    

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Exam Title:</label>
                <input type="text" value={certName} onChange={handleCertNameChange} required />
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
                    />
                    <br />
                    <label>Correct Answer:</label>
                    <input
                        type="text"
                        value={question.correctAnswer}
                        onChange={(e) => handleQuestionChange(questionIndex, "correctAnswer", e.target.value)}
                        required
                    />
                    <h5>Answer Options</h5>
                    {question.answerOptions.map((option, optionIndex) => (
                        <div key={optionIndex}>
                            <label>Text:</label>
                            <input
                                type="text"
                                value={option.text}
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
            <button type="button" onClick={() => navigate(-1)}>Back</button>
        </form>
    );
};

export default CreateCert;