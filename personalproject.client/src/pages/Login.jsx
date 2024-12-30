import { useState } from 'react';
import AuthService from '../servicesE/AuthService';
import { useNavigate } from 'react-router-dom';
import OflineHeader from '../components/OflineHeader';
import { useAuth } from "../components/AuthProvider";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const { revalidateAuth } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setErrorMessage("Both username and password are required.");
            return;
        }

        try {
            const token = await AuthService.login(username, password);
            await revalidateAuth();
            navigate("/dashboard");
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div>
            <OflineHeader />
            <h2 style={{ textAlign: 'center', color: '#607d8b' }}>Login</h2>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            <form onSubmit={handleSubmit} style={{width: '380px', margin: '0 auto', borderRadius: '8px', padding: '20px', background: 'linear-gradient(32deg, rgba(54,95,114,1) 45%, rgba(183,121,37,1) 100%)', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.4)'}}>
                <div >
                    <label style={{color: 'aliceblue'}} htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={{color: 'aliceblue'}} htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button className='green-button' type="submit">Login</button>
                <button className='green-button' onClick={() => navigate("/register")}>Register</button>
                {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            </form>
        </div>
    );
};

export default LoginPage;