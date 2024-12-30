import axios from './AxiosConf';

const AuthService = {
    register: async (username, email, password, FirstName, LastName) => {
        try {
            const response = await axios.post('/Account/register', {
                username,
                email,
                password,
                FirstName,
                LastName,
            });
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    },

    login: async (username, password) => {
        try {
            const response = await axios.post('/Account/login',
                { username, password },
                { withCredentials: true }
            );

            if (response.status === 200 && response.data) {
                console.log('Login successful');
                return response.data; // Return user data or token as provided by the API
            } else {
                console.warn('Login failed');
                throw new Error(response.data?.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Unable to log in');
        }
    },

    logout: async () => {
        try {
            await axios.post('/Account/logout', {}, { withCredentials: true });
            console.log('Logout successful');
        } catch (error) {
            console.error('Error during logout:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Logout failed');
        }
    },

    getAuthStatus: async () => {
        try {
            const response = await axios.get('/Account/auth-status', { withCredentials: true });
            return response.data?.isAuthenticated || false;
        } catch (error) {
            console.error('Error fetching auth status:', error.response?.data || error.message);
            return false; // Return false if any error occurs
        }
    },

    getCurrentUserData: async () => {
        try {
            const response = await axios.get('/Account/me', { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Unable to fetch user data');
        }
    },
};

// Axios interceptors for consistent error handling or additional configurations
axios.interceptors.request.use(
    (config) => {
        // Add any common headers or configurations
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default AuthService;