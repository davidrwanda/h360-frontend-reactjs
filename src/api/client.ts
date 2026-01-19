import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      // Don't redirect here, let the component handle it
      // This prevents redirect loops
    }
    
    // Extract error message for better error handling
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An error occurred';
    
    // Create a new error with the message
    const customError = new Error(errorMessage);
    return Promise.reject(customError);
  }
);

export default apiClient;
