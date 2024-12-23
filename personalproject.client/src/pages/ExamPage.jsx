import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ExamHdr from '../components/ExamHdr';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';


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
    const { isAuthenticated, AuthError, revalidateAuth } = useAuth();

    useEffect(() => {
            revalidateAuth();
        }, [location]);

    useEffect(() => {
        if (!certId || !userId) {
            setError('Missing user ID or certificate ID.');
            setLoading(false);
            return;
        }

        const fetchExamById = async () => {
            try {
                const response = await axios.get(`https://localhost:7295/api/Exam/${certId}`);
                setExam(response.data);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch exam.');
                setLoading(false);
            }
        };

        fetchExamById();
    }, [certId, userId]);

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

    if (AuthError) {
        return <div>{AuthError}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }


    const questions = exam?.Questions || [];

    return (
        <div>
            <ExamHdr />
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
                    <p>Certificate: {result.certName || "Certificate not found"}</p>
                    <p>Score: {result.score !== undefined ? result.Score : "Score not available"}</p>
                    <p>Passed: {result.passed ? "Yes" : "No"}</p>
                    <p>Date Taken: {result.dateTaken || "Date not available"}</p>
                    <button className="green-button" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            )}
        </div>
    );
};

export default ExamPage;