import apiClient from './client';
import type {
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  ChangePasswordRequest,
  User,
  ApiResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
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
   * Returns user with nested employee_profile if user_type is EMPLOYEE
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User> | User>('/auth/me');
    // Handle wrapped response
    let user: User;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      user = (response.data as ApiResponse<User>).data;
    } else {
      user = response.data as User;
    }
    // Ensure username exists (use email if username not available)
    return {
      ...user,
      username: user.username || user.email,
    };
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
   * Refresh access token using refresh token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse> | RefreshTokenResponse>(
      '/auth/refresh',
      { refresh_token: refreshToken } as RefreshTokenRequest
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<RefreshTokenResponse>).data;
    }
    // Fallback for direct response
    return response.data as RefreshTokenResponse;
  },

  /**
   * Logout - revoke refresh tokens
   */
  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      '/auth/logout',
      refreshToken ? { refresh_token: refreshToken } : undefined
    );
    return response.data;
  },
};
