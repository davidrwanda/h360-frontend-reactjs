import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '@/types/api';
import { isApiError, handleApiError } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
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

// Request interceptor - Add auth token, tracing headers, and Accept-Language
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Accept-Language from persisted i18n store
    try {
      const i18nStorage = localStorage.getItem('h360-i18n-storage');
      if (i18nStorage) {
        const lang = JSON.parse(i18nStorage)?.state?.lang;
        if (lang && config.headers) {
          config.headers['Accept-Language'] = lang;
        }
      }
    } catch {
      // Fallback silently if parsing fails
    }

    // Add ISD tracing headers for GET requests (no body)
    if (config.method === 'get' && config.headers) {
      const messageId = `msg_${crypto.randomUUID()}`;
      config.headers['X-Message-ID'] = messageId;
      config.headers['X-Correlation-ID'] = messageId;
      config.headers['X-Source-System'] = 'h360-web';
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
  async (error: AxiosError) => {
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
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        processQueue(new Error('No refresh token available'), null);
        isRefreshing = false;

        return Promise.reject(createApiError(error));
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { data: { refresh_token: refreshToken }, meta: { message_id: `msg_${crypto.randomUUID()}`, source_system: 'h360-web' }, extras: {} },
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Handle both ISD envelope and legacy response
        const responseData = response.data;
        let newAccessToken: string;
        let newRefreshToken: string;

        if (responseData?.data?.access_token) {
          // ISD envelope
          newAccessToken = responseData.data.access_token;
          newRefreshToken = responseData.data.refresh_token;
        } else if (responseData?.success && responseData?.data) {
          // Legacy envelope
          newAccessToken = responseData.data.access_token;
          newRefreshToken = responseData.data.refresh_token;
        } else {
          // Direct response
          newAccessToken = responseData.access_token || '';
          newRefreshToken = responseData.refresh_token || '';
        }

        if (newAccessToken && newRefreshToken) {
          localStorage.setItem('access_token', newAccessToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          throw new Error('Invalid refresh token response');
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        processQueue(refreshError as Error, null);
        isRefreshing = false;

        return Promise.reject(createApiError(refreshError as AxiosError));
      }
    }

    return Promise.reject(createApiError(error));
  }
);

/**
 * Create a structured error from an Axios error, handling both ISD and legacy formats.
 */
function createApiError(error: AxiosError | Error): Error {
  if (!('response' in error) || !(error as AxiosError).response) {
    return error instanceof Error ? error : new Error('An error occurred');
  }

  const axiosError = error as AxiosError;
  const responseData = axiosError.response?.data;

  // Handle ISD error envelope
  if (isApiError(responseData)) {
    const parsed = handleApiError(responseData as ApiErrorResponse);
    const apiError = new Error(parsed.message);
    Object.assign(apiError, {
      statusCode: parsed.statusCode,
      errorCode: parsed.errorCode,
      fieldErrors: parsed.fieldErrors,
      context: parsed.context,
      response: responseData,
    });
    return apiError;
  }

  // Handle legacy error format
  const legacyData = responseData as { message?: string; error?: string; meta?: { message?: string } } | undefined;
  const errorMessage =
    legacyData?.meta?.message ||
    legacyData?.message ||
    legacyData?.error ||
    axiosError.message ||
    'An error occurred';

  return new Error(errorMessage);
}

export default apiClient;
