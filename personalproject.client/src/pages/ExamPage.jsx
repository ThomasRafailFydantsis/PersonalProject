import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ExamHdr from '../components/ExamHdr';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const ExamPage = () => {
    const { certId } = useParams();
    const location = useLocation();
    const userId = location.state?.userId;

    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExamById = async (certId) => {
            try {
                const response = await axios.get(`https://localhost:7295/api/Exam/${certId}`);
                console.log('Fetched Exam:', response.data);
                setExam(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch exam.');
                setLoading(false);
            }
        };

        if (certId) fetchExamById(certId);
    }, [certId]);

    const handleAnswerChange = (questionId, answerId) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
    };

    const handleSubmit = async () => {
        try {
            const answerIds = Object.values(selectedAnswers);
            if (exam?.Questions?.length === 0 || answerIds.length !== exam.Questions.length) {
                setSubmitError('Please answer all questions.');
                return;
            }

            const requestPayload = {
                userId,
                certId: parseInt(certId),
                answerIds: answerIds.map(id => parseInt(id)),
            };

            console.log('Request Payload:', requestPayload);

            const response = await axios.post('https://localhost:7295/api/Exam/submit', requestPayload);

            console.log('Submit Response:', response.data);
            setResult(response.data);
        } catch (err) {
            console.error('Submit Error:', err.response ? err.response.data : err.message);
            if (err.response && err.response.status === 409) {
                setSubmitError('Duplicate submission detected. Your exam has already been submitted.');
            } else {
                setSubmitError('Failed to submit exam. Please try again later.');
            }
        }
    };

    if (!userId) return <p>Error: User ID not found.</p>;
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const questions = exam?.Questions || [];

    return (
        <div>
        <ExamHdr/>  
            <h1>Exam Page</h1>
            <h2>{exam.CertName}</h2>
            {questions.length > 0 ? (
                <ul>
                    {questions.map((question) => (
                        <div key={question.Id}>
                            <h3>{question.Text}</h3>
                            <ul>
                                {question.AnswerOptions.map((option) => (
                                    <li key={option.Id}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`question-${question.Id}`}
                                                value={option.Id}
                                                onChange={() => handleAnswerChange(question.Id, option.Id)}
                                            />
                                            {option.Text}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </ul>
            ) : (
                <p>No questions available for this exam. Please check the exam setup.</p>
            )}
            {submitError && <p style={{ color: 'red' }}>{submitError}</p>}
            <button onClick={handleSubmit}>Submit Exam</button>
            {result && (
                <div>
                    <h2>Result</h2>
                    <p>Certificate: {result.CertName || "Certificate not found"}</p>
                    <p>Score: {result.Score != null ? result.Score : "Score not available"}</p>
                    <p>Date Taken: {result.DateTaken ? result.DateTaken : "Date not available"}</p>
                    <button className="green-button" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            )}
        </div>
    );
};

export default ExamPage;