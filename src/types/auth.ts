export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'DOCTOR' | 'NURSE' | 'PATIENT';
export type UserType = 'EMPLOYEE' | 'SYSTEM' | 'PATIENT';
export type Permissions = 'ALL' | string;

export interface EmployeeProfile {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  employee_number?: string;
  role: UserRole | string;
  department?: string;
  position?: string;
  clinic_id?: string;
  clinic_name?: string;
  hire_date?: string;
  termination_date?: string | null;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string | null;
  profile_image_url?: string | null;
  license_number?: string | null;
  license_expiry_date?: string | null;
  is_terminated: boolean;
  is_license_expired: boolean;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

// Employee object from /api/auth/me (different from employee_profile)
export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  employee_number?: string;
  role: UserRole | string;
  department?: string;
  position?: string;
  clinic_id?: string;
  hire_date?: string;
  termination_date?: string | null;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  profile_image_url?: string | null;
  license_number?: string | null;
  license_expiry_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PatientProfile {
  patient_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth?: string;
  phone?: string;
  patient_number?: string;
  has_account: boolean;
  account_created_at?: string;
  age?: number;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  clinics?: Array<{
    clinic_id: string;
    clinic_name: string;
    subscription_status: string;
    registration_type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  email: string;
  username?: string;
  user_type: UserType;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  role?: UserRole | string;
  clinic_id?: string | null;
  permissions?: Permissions;
  // Direct fields from API (for employees, legacy support)
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  // Employee object (nested object from /auth/me, if user_type is EMPLOYEE)
  employee?: Employee;
  // Employee profile (legacy/nested object, if available)
  employee_profile?: EmployeeProfile;
  // Patient profile (nested object from /auth/me, if user_type is PATIENT)
  patient?: PatientProfile;
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
