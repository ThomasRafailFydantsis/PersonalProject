import axios from 'axios';

// Ensure cookies are sent with requests (for HTTP-only cookie support)
axios.defaults.withCredentials = true; // This will automatically send cookies with each request

// Set the base URL for API requests
axios.defaults.baseURL = 'https://localhost:7295/api'; // Your API base URL

// Optional: Interceptor to log or modify requests before they are sent
axios.interceptors.request.use(
    (config) => {
        console.log("Request Config:", config); // For debugging purposes
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;