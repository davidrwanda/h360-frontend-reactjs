import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  ChangePasswordRequest,
  User,
  ApiResponse,
} from '@/types/auth';

export const authApi = {
  /**
   * Login with username/email and password
   */
  login: async (credentials: LoginRequest): Promise<LoginResponseData> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    // Handle wrapped response: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    // Fallback for direct response (backward compatibility)
    return response.data as unknown as LoginResponseData;
  },

  /**
   * Get current user information
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User> | User>('/auth/me');
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<User>).data;
    }
    // Fallback for direct response
    return response.data as User;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/change-password',
      data
    );
    return response.data;
  },

  /**
   * Logout
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
  },
};
