import { useEffect, useState } from 'react';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import axios from 'axios';

const UserProfile = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [scores, setScores] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const [userData, setUserData] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
   

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
                        setUpdatedData({
                            firstName: data.firstName,
                            lastName: data.lastName,
                            email: data.email,
                            username: data.userName,
                        });
                    } else {
                        throw new Error('Failed to fetch user data.');
                    }
                }
            } catch (err) {
                console.error('Error checking authentication status or fetching user data:', err);
                setError('Failed to check authentication or fetch user data.');
            }
        };
        checkAuthStatus();
    }, []);

    const fetchScores = async () => {
        if (!userData?.id) return;
        try {
            const response = await axios.get(`https://localhost:7295/api/Exam/results/${userData.id}`);
            setScores(response.data);
        } catch (err) {
            console.error('Error fetching scores:', err);
            setScores([]);
        }
    };

    useEffect(() => {
        if (userData) fetchScores();
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedData({ ...updatedData, [name]: value });
    };

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(`https://localhost:7295/api/Account/${userData.id}`, updatedData, {
                withCredentials: true,
            });

            if (response.status === 200) {
                
                setUserData({ ...userData, ...updatedData });
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            
        }
    };

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!isAuthenticated) {
        return <div>You are not logged in. Please log in.</div>;
    }

    if (!userData) {
        return <div>Loading user data...</div>;
    }
    

    return (
        <>
        <div>
            <Header />
            <button className="green-button" onClick={() => navigate('/dashboard')}>Back</button>
            <button className="green-button" onClick={() => navigate('/MyCertificate')}>My Certificates</button>
            <main>
                <div style={{ margin: '20px auto', maxWidth: '800px' }}>
                    <h1>User Profile</h1>
                    {isEditing ? (
                        <div>
                            <label>
                                First Name:
                                <input
                                    type="text"
                                    name="firstName"
                                    value={updatedData.firstName || ''}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <br />
                            <label>
                                Last Name:
                                <input
                                    type="text"
                                    name="lastName"
                                    value={updatedData.lastName || ''}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <br />
                            <label>
                                Email:
                                <input
                                    type="email"
                                    name="email"
                                    value={updatedData.email || ''}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <br />
                            <label>
                                Username:
                                <input
                                    type="text"
                                    name="username"
                                    value={updatedData.username || ''}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <br />
                            <button onClick={handleSaveChanges}>Save Changes</button>
                            <button onClick={() => setIsEditing(false)}>Cancel</button>
                        </div>
                    ) : (
                        <div>
                            <p><strong>First Name:</strong> {userData.firstName}</p>
                            <p><strong>Last Name:</strong> {userData.lastName}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Username:</strong> {userData.userName}</p>
                            <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                        </div>
                    )}
                    
                </div>

               
            </main>
            </div>
        </>
    );
};

export default UserProfile;
