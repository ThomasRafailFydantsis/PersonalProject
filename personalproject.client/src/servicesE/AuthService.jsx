import axiosInstance from './AxiosConf';

const AuthService = {
    register: async (username, email, password, FirstName, LastName) => {
        try {
            const response = await axiosInstance.post('/Account/register', {
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
            const response = await axiosInstance.post('/Account/login', { username, password });
            return response.data;
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Unable to log in');
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/Account/logout');
        } catch (error) {
            console.error('Logout error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Logout failed');
        }
    },

    getAuthStatus: async () => {
        try {
            const response = await axiosInstance.get('/Account/auth-status');
            return response.data?.isAuthenticated || false;
        } catch (error) {
            console.error('Error fetching auth status:', error.response?.data || error.message);
            return false;
        }
    },

    getCurrentUserData: async () => {
        try {
            const response = await axiosInstance.get('/Account/me');
            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Unable to fetch user data');
        }
    },
};

export default AuthService;