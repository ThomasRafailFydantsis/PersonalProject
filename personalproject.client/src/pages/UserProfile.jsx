import { useEffect, useState } from 'react';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [error, setError] = useState(null);
    const [scores, setScores] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const status = await AuthService.getAuthStatus();
                setIsAuthenticated(status);

                if (status) {
                    const response = await fetch('https://localhost:7295/api/Account/me', {
                        method: 'GET',
                        credentials: 'include',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUserData(data);
                    } else {
                        throw new Error('Failed to fetch user data.');
                    }
                } else {
                    console.log('User not authenticated');
                }
            } catch (err) {
                console.error('Error checking authentication status or fetching user data:', err);
                setError('Failed to check authentication or fetch user data.');
            }
        };
        checkAuthStatus();
    }, []);

    const { userName, email, firstName, lastName, id } = userData || {};

    useEffect(() => {
        const fetchScores = async () => {
            if (!userData?.id) return;
            try {
                const response = await axios.get(`https://localhost:7295/api/Exam/results/${id}`);
                console.log('API Response:', response.data);

                const scoresArray = response.data;
                setScores(scoresArray);
            } catch (err) {
                console.error('Error fetching certificates:', err);
                setScores([]);
            }
        };
        fetchScores();
    }, [userData?.id]);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    return (
        <>
            <Header />
            <main>
                <div>
                    <h1>User Profile</h1>
                    <p style={{ fontSize: '30px' }}><strong>First Name:</strong> {firstName}</p>
                    <p style={{ fontSize: '30px' }}><strong>Last Name:</strong> {lastName}</p>
                    <p style={{ fontSize: '30px' }}><strong>Username:</strong> {userName}</p>
                    <p style={{ fontSize: '30px' }}><strong>Email:</strong> {email}</p>

                    <button className="green-button" onClick={() => navigate('/dashboard')}>Back</button>
                </div>

                <div>
                    <h1>Scores</h1>
                    <table border="1" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Certificate</th>
                                <th>Score</th>
                                <th>Date Taken</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((score, index) => (
                                <tr key={index}>
                                    <td>{score.certName || "N/A"}</td>
                                    <td>{score.score != null ? score.score : "N/A"}</td>
                                    <td>{score.dateTaken ? new Date(score.dateTaken).toLocaleString() : "N/A"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
};

export default UserProfile;