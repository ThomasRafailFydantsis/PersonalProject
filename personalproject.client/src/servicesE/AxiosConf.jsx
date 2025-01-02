import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
    baseURL: 'https://localhost:7295/api',
    withCredentials: true,
});

// Add request interceptors
axiosInstance.interceptors.request.use(
    (config) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug("Request Config:", config);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (process.env.NODE_ENV === 'development') {
            console.error("Response Error:", error.response || error.message);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;