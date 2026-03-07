import apiClient from './client';
import type {
  LoginRequest,
  LoginResponseData,
  ChangePasswordRequest,
  User,
  RefreshTokenResponse,
} from '@/types/auth';
import { extractResponseData, wrapRequest } from '@/types/api';

export const authApi = {
  /**
   * Login with username/email and password
   * POST /api/auth/login (@Public)
   */
  login: async (credentials: LoginRequest): Promise<LoginResponseData> => {
    const response = await apiClient.post('/auth/login', wrapRequest(credentials));
    return extractResponseData<LoginResponseData>(response.data);
  },

  /**
   * Get current user information
   * GET /api/auth/me
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    const user = extractResponseData<User>(response.data);
    return {
      ...user,
      username: user.username || user.email,
    };
  },

  /**
   * Change password
   * POST /api/auth/change-password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/change-password', wrapRequest(data));
    // Response meta.message contains the success message
    const responseData = response.data;
    if (responseData?.meta?.message) {
      return { message: responseData.meta.message };
    }
    return extractResponseData<{ message: string }>(response.data);
  },

  /**
   * Refresh access token using refresh token
   * POST /api/auth/refresh
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post(
      '/auth/refresh',
      wrapRequest({ refresh_token: refreshToken })
    );
    return extractResponseData<RefreshTokenResponse>(response.data);
  },

  /**
   * Logout - revoke refresh tokens
   * POST /api/auth/logout
   */
  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const payload = refreshToken ? { refresh_token: refreshToken } : {};
    const response = await apiClient.post('/auth/logout', wrapRequest(payload));
    const responseData = response.data;
    if (responseData?.meta?.message) {
      return { message: responseData.meta.message };
    }
    return extractResponseData<{ message: string }>(response.data);
  },

  /**
   * Request password reset OTP
   * POST /api/auth/forgot-password (@Public)
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/forgot-password', wrapRequest({ email }));
    const responseData = response.data;
    if (responseData?.meta?.message) {
      return { message: responseData.meta.message };
    }
    return extractResponseData<{ message: string }>(response.data);
  },

  /**
   * Reset password with OTP
   * POST /api/auth/reset-password (@Public)
   */
  resetPassword: async (data: {
    email: string;
    otp_code: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.post('/auth/reset-password', wrapRequest(data));
    const responseData = response.data;
    if (responseData?.meta?.message) {
      return { message: responseData.meta.message };
    }
    return extractResponseData<{ message: string }>(response.data);
  },

  /**
   * Accept organization invitation — returns JWT so user is immediately logged in
   * POST /api/invitations/accept (@Public)
   */
  acceptInvitation: async (data: {
    token: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    phone?: string;
  }): Promise<{
    access_token: string;
    user: { id: string; email: string; first_name: string; last_name: string };
    organization: { id: string; name: string };
  }> => {
    const response = await apiClient.post('/invitations/accept', wrapRequest(data));
    return extractResponseData(response.data);
  },
};
