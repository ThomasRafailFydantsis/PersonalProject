import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '/MVC/PersonalProject/personalproject.client/AuthService';
import OflineHeader from '../components/OflineHeader';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
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

    return (
        <div>
            <OflineHeader />
            <h2 style={{ textAlign: 'center' }}>Register</h2>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <form onSubmit={handleSubmit} style={{width: '380px', margin: '0 auto'}}>
                <div>
                    <label htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />
                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                </div>
                <div>
                    <label htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                </div>
                <div>
                    <label htmlFor="userName">UserName:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                </div>
                <div>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
                </div>
                <button className="green-button" type="submit">Register</button>
                <p>Already have an account? <a href="/login">Login</a></p>
            </form>
        </div>
    );
};

export default RegisterPage;