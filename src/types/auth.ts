export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'DOCTOR' | 'NURSE';
export type UserType = 'EMPLOYEE' | 'SYSTEM';
export type Permissions = 'ALL' | string;

export interface User {
  employee_id?: string;
  email: string;
  username?: string;
  role?: UserRole;
  user_type: UserType;
  permissions?: Permissions;
  clinic_id?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  path?: string;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
  user: User;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
  user: User;
}

export type LoginResponse = ApiResponse<LoginResponseData>;

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
