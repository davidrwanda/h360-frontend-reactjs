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

// Track if we're currently refreshing to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string }>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, clear everything and reject
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        processQueue(new Error('No refresh token available'), null);
        isRefreshing = false;
        
        // Extract error message for better error handling
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'An error occurred';
        
        const customError = new Error(errorMessage);
        return Promise.reject(customError);
      }

      try {
        // Attempt to refresh the token
        const response = await axios.post<{
          success?: boolean;
          data?: {
            access_token: string;
            refresh_token: string;
          };
          access_token?: string;
          refresh_token?: string;
        }>(
          `${API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Handle both wrapped and direct response formats
        const newAccessToken =
          response.data.success && response.data.data
            ? response.data.data.access_token
            : response.data.access_token || '';
        const newRefreshToken =
          response.data.success && response.data.data
            ? response.data.data.refresh_token
            : response.data.refresh_token || '';

        if (newAccessToken && newRefreshToken) {
          // Update stored tokens
          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          // Update the original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          // Process queued requests
          processQueue(null, newAccessToken);
          isRefreshing = false;

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and reject all queued requests
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        // Extract error message
        const refreshAxiosError = refreshError as AxiosError<{ message?: string; error?: string }>;
        const errorMessage =
          refreshAxiosError?.response?.data?.message ||
          refreshAxiosError?.response?.data?.error ||
          (refreshError as Error)?.message ||
          'Token refresh failed';
        
        const customError = new Error(errorMessage);
        return Promise.reject(customError);
      }
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
