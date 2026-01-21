import apiClient from './client';
import type { ApiResponse } from '@/types/auth';
import type { UserRole } from '@/types/auth';

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  username: string;
  role: UserRole | string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  employee_number?: string;
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
  is_active: boolean;
  is_terminated?: boolean;
  last_login?: string | null;
  password_changed_at?: string;
  notes?: string | null;
  profile_image_url?: string | null;
  license_number?: string | null;
  license_expiry_date?: string | null;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  is_license_expired?: boolean;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  role: UserRole | string;
  employee_number?: string;
  department?: string;
  position?: string;
  clinic_id?: string;
  hire_date?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  role?: UserRole | string;
  employee_number?: string;
  department?: string;
  position?: string;
  clinic_id?: string;
  hire_date?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole | string;
  clinic_id?: string;
  is_active?: boolean;
  department?: string;
  hire_date_from?: string;
  hire_date_to?: string;
  include_terminated?: boolean;
  // Support both camelCase and snake_case for sorting
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface UserPreferences {
  preference_id: string;
  user_id: string;
  theme?: string;
  language?: string;
  date_format?: string;
  time_format?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  in_app_notifications?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesRequest {
  theme?: string;
  language?: string;
  date_format?: string;
  time_format?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
  in_app_notifications?: boolean;
}

// Helper to transform role from frontend format to API format
const transformRoleToApi = (role: UserRole | string | undefined): string | undefined => {
  if (!role) return undefined;
  const roleMap: Record<string, string> = {
    'ADMIN': 'Admin',
    'MANAGER': 'Manager',
    'RECEPTIONIST': 'Receptionist',
    'DOCTOR': 'Doctor',
    'NURSE': 'Nurse',
    'PATIENT': 'Patient',
  };
  return roleMap[role] || role;
};

// Helper to transform role from API format to frontend format
const transformRoleFromApi = (role: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'Admin': 'ADMIN',
    'Manager': 'MANAGER',
    'Receptionist': 'RECEPTIONIST',
    'Doctor': 'DOCTOR',
    'Nurse': 'NURSE',
    'Patient': 'PATIENT',
  };
  return roleMap[role] || (role as UserRole);
};

export const usersApi = {
  /**
   * Create a new user
   * POST /api/users
   * Access: Admin role required
   */
  create: async (data: CreateUserRequest): Promise<User> => {
    const apiData = {
      ...data,
      role: transformRoleToApi(data.role) || data.role,
    };
    
    const response = await apiClient.post<ApiResponse<User> | User>('/users', apiData);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      const user = (response.data as ApiResponse<User>).data;
      return { ...user, role: transformRoleFromApi(user.role as string) };
    }
    const user = response.data as User;
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Get list of users with pagination and filters
   * GET /api/users
   * Access: Any authenticated user
   */
  list: async (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const apiParams = params ? {
      ...params,
      role: params.role ? transformRoleToApi(params.role) : undefined,
      // Normalize sorting parameters - prefer snake_case, fallback to camelCase
      sort_by: params.sort_by || params.sortBy,
      sort_order: params.sort_order || params.sortOrder,
    } : undefined;
    
    // Remove camelCase sorting params to avoid confusion
    if (apiParams) {
      delete apiParams.sortBy;
      delete apiParams.sortOrder;
    }
    
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<User>> | PaginatedResponse<User>
    >('/users', { params: apiParams });
    
    // Handle wrapped response
    let result: PaginatedResponse<User>;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      result = (response.data as ApiResponse<PaginatedResponse<User>>).data;
    } else {
      result = response.data as PaginatedResponse<User>;
    }
    
    // Transform roles in response
    result.data = result.data.map(user => ({
      ...user,
      role: transformRoleFromApi(user.role as string),
    }));
    
    return result;
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   * Access: Any authenticated user
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User> | User>(`/users/${id}`);
    // Handle wrapped response
    let user: User;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      user = (response.data as ApiResponse<User>).data;
    } else {
      user = response.data as User;
    }
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Update user
   * PATCH /api/users/:id
   * Access: Admin role required
   */
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const apiData = {
      ...data,
      role: data.role ? transformRoleToApi(data.role) : undefined,
    };
    
    const response = await apiClient.patch<ApiResponse<User> | User>(
      `/users/${id}`,
      apiData
    );
    // Handle wrapped response
    let user: User;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      user = (response.data as ApiResponse<User>).data;
    } else {
      user = response.data as User;
    }
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Deactivate user
   * PATCH /api/users/:id/deactivate
   * Access: Admin role required
   */
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User> | User>(
      `/users/${id}/deactivate`
    );
    // Handle wrapped response
    let user: User;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      user = (response.data as ApiResponse<User>).data;
    } else {
      user = response.data as User;
    }
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Activate user
   * PATCH /api/users/:id/activate
   * Access: Admin role required
   */
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.patch<ApiResponse<User> | User>(
      `/users/${id}/activate`
    );
    // Handle wrapped response
    let user: User;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      user = (response.data as ApiResponse<User>).data;
    } else {
      user = response.data as User;
    }
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Terminate user
   * PATCH /api/users/:id/terminate
   * Access: Admin role required
   */
  terminate: async (id: string, terminationDate?: string): Promise<User> => {
    const url = terminationDate 
      ? `/users/${id}/terminate?termination_date=${terminationDate}`
      : `/users/${id}/terminate`;
    const response = await apiClient.patch<ApiResponse<User> | User>(url);
    // Handle wrapped response
    let user: User;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      user = (response.data as ApiResponse<User>).data;
    } else {
      user = response.data as User;
    }
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Get current user's preferences
   * GET /api/users/me/preferences
   * Access: Any authenticated user
   */
  getMyPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<ApiResponse<UserPreferences> | UserPreferences>(
      '/users/me/preferences'
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<UserPreferences>).data;
    }
    return response.data as UserPreferences;
  },

  /**
   * Update current user's preferences
   * PUT /api/users/me/preferences
   * Access: Any authenticated user
   */
  updateMyPreferences: async (data: UpdatePreferencesRequest): Promise<UserPreferences> => {
    const response = await apiClient.put<ApiResponse<UserPreferences> | UserPreferences>(
      '/users/me/preferences',
      data
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<UserPreferences>).data;
    }
    return response.data as UserPreferences;
  },

  /**
   * Get any user's preferences (Admin/System only)
   * GET /api/users/:id/preferences
   * Access: Admin/System role required
   */
  getUserPreferences: async (userId: string): Promise<UserPreferences> => {
    const response = await apiClient.get<ApiResponse<UserPreferences> | UserPreferences>(
      `/users/${userId}/preferences`
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<UserPreferences>).data;
    }
    return response.data as UserPreferences;
  },

  /**
   * Update any user's preferences (Admin/System only)
   * PUT /api/users/:id/preferences
   * Access: Admin/System role required
   */
  updateUserPreferences: async (
    userId: string,
    data: UpdatePreferencesRequest
  ): Promise<UserPreferences> => {
    const response = await apiClient.put<ApiResponse<UserPreferences> | UserPreferences>(
      `/users/${userId}/preferences`,
      data
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<UserPreferences>).data;
    }
    return response.data as UserPreferences;
  },
};
