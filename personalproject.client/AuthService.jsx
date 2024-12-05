import axios from './AxiosConf';

const AuthService = {
    register: async (username, email, password) => {
        try {
            const response = await axios.post('/Account/register', {
                username,
                email,
                password,
            });
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    },
    login: async (username, password) => {
        try {

            const response = await axios.post(`/Account/login`, { username, password }, { withCredentials: true });
            if (response.data.message) {
                console.log('Login successful');
                return { success: true };
            } else {
                console.warn('Login failed');
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Unable to log in');
        }
    },

    logout: async () => {
        try {
         
            await axios.post('/Account/logout', {}, { withCredentials: true });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    },

    getAuthStatus: async () => {
        try {
            const response = await axios.get(`/Account/auth-status`, { withCredentials: true });
            return response.data.isAuthenticated;
        } catch (err) {
            console.error('Error fetching auth status:', err.response?.data || err.message);
            return false;
        }
    },

    getCurrentUserData: async () => {
        try {
            const response = await axios.get('/Account/me', { withCredentials: true });
            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw new Error('Unable to fetch user data');
        }
    }
};


axios.interceptors.request.use((config) => {

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default AuthService;