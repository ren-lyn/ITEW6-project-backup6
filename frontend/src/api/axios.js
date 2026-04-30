import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') 
    || (window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://itew6-project-backup6.onrender.com');

console.log('API Base URL Detected:', BASE_URL);

export const STORAGE_URL = `${BASE_URL}/storage`;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || `${BASE_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
