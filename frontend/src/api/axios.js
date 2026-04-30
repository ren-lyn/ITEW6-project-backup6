import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
console.log('API Base URL:', BASE_URL);
export const STORAGE_URL = `${BASE_URL}/storage`;

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
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
