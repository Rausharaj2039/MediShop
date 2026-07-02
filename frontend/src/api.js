import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? `http://${window.location.hostname}:5001/api` : 'http://localhost:5001/api'),
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medishop_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medishop_admin_token');
    }
    return Promise.reject(error);
  }
);

export default api;