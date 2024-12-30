import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from "../servicesE/AuthService";
import OflineHeader from '../components/OflineHeader';
import { useAuth } from '../components/AuthProvider';

const AuthPage = () => {
    const [activeTab, setActiveTab] = useState('signup'); // 'signup' or 'signin'
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { revalidateAuth } = useAuth();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!username || !email || !password || !firstName || !lastName) {
            setErrorMessage("All fields are required.");
            return;
        }
        if (password.length < 6) {
            setErrorMessage("Password must be at least 6 characters long.");
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrorMessage("Please enter a valid email.");
            return;
        }
        try {
            const response = await AuthService.register(username, email, password, firstName, lastName);
            if (response) {
                navigate('/login');
            }
        } catch (error) {
            setErrorMessage(error.response?.data || 'Registration failed');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setErrorMessage("Both username and password are required.");
            return;
        }
        try {
            const token = await AuthService.login(username, password);
            await revalidateAuth();
            navigate('/dashboard');
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px',height: '500px'}}>
            <OflineHeader />
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'signup' ? '#4caf50' : '#ccc',
                        color: activeTab === 'signup' ? 'white' : 'black',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => setActiveTab('signup')}
                >
                    Sign Up
                </button>
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'signin' ? '#4caf50' : '#ccc',
                        color: activeTab === 'signin' ? 'white' : 'black',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                    onClick={() => setActiveTab('signin')}
                >
                    Sign In
                </button>
            </div>
            {errorMessage && <div style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</div>}
            {activeTab === 'signup' ? (
                <form onSubmit={handleRegister}>
                    <h2 style={{ textAlign: 'center' , marginBottom: '-30px'}}>Register</h2>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="firstName">First Name:</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="lastName">Last Name:</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className='green-button' style={{ marginTop: '50px' }} type="submit">Register</button>
                </form>
            ) : (
                <form onSubmit={handleLogin}>
                    <h2 style={{ textAlign: 'center', marginBottom: '-30px' }}>Login</h2>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '-50px' }}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button className='green-button' style={{ marginTop: '50px' }}  type="submit">Login</button>
                </form>
            )}
        </div>
    );
};

export default AuthPage;