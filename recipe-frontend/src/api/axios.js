// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://django-drf-ai-powered-recipe-cooking.onrender.com/api/auth', // matches your backend
  // optional: timeout: 10000,
});

// attach JWT access token automatically (stored as 'access' in localStorage)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// global response handler: on 401, clear tokens and redirect to login
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      // send user back to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
