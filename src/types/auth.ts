// Re-export ISD API types
export type { ApiErrorResponse, FieldError, PaginationMeta } from './api';
export type { ApiResponse as IsdApiResponse } from './api';

// Legacy API Response wrapper (used by existing API modules)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp?: string;
  path?: string;
}

// ─── ISD Roles ──────────────────────────────────────────────────────────────
// UserType: SYSTEM (platform admin), EMPLOYEE (staff/clinic), PATIENT
export type UserType = 'EMPLOYEE' | 'SYSTEM' | 'PATIENT';

// OrgMemberRole: see src/types/organization.ts (ORG_OWNER, ADMIN, MANAGER, STAFF, DOCTOR)

// UserRole: all 22 employee roles + SYSTEM + PATIENT
// API returns PascalCase (e.g. "OrgOwner", "NurseAssistant") — normalize with normalizeRole()
export type UserRole =
  | 'SYSTEM'
  | 'PATIENT'
  // Organization
  | 'ORG_OWNER'
  // Administrative
  | 'ADMIN' | 'MANAGER' | 'SUPERVISOR'
  // Medical
  | 'DOCTOR' | 'NURSE' | 'NURSE_ASSISTANT' | 'PHARMACIST' | 'PHARMACY_TECHNICIAN'
  // Support Staff
  | 'RECEPTIONIST' | 'OPERATOR' | 'MEDICAL_ASSISTANT' | 'LAB_TECHNICIAN'
  | 'RADIOLOGIST' | 'RADIOLOGY_TECHNICIAN' | 'PHYSIOTHERAPIST'
  // Admin Support
  | 'HR' | 'ACCOUNTANT' | 'ACCOUNTING_ASSISTANT' | 'STOCK_MANAGER' | 'STOCK_ASSISTANT' | 'IT_SUPPORT'
  // General Support
  | 'SECURITY' | 'CLEANER' | 'MAINTENANCE' | 'DRIVER'
  // Catch-all for unknown roles
  | 'STAFF';
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
  organization_id?: string;
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
  organization_id?: string | null;
  permissions?: Permissions;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  employee?: Employee;
  employee_profile?: EmployeeProfile;
  patient?: PatientProfile;
  preferred_lang?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
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

// LoginResponse - supports both ISD and legacy formats
export type LoginResponse = ApiResponse<LoginResponseData>;

// ─── Memberships ────────────────────────────────────────────────────────────

/** One per-clinic role entry inside an organization */
export interface ClinicMembership {
  membership_id?: string;
  clinic_id: string;
  clinic_name?: string;
  role: string;
  status: 'active' | 'pending' | 'suspended';
  joined_at?: string;
}

/** Top-level entry returned by GET /api/auth/me/memberships */
export interface UserMembership {
  organization_id: string;
  organization_name: string;
  memberships: ClinicMembership[];
}
