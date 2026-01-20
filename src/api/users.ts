import apiClient from './client';
import type { ApiResponse } from '@/types/auth';
import type { UserRole } from '@/types/auth';

export interface User {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  username: string;
  role: UserRole | string;
  phone?: string;
  clinic_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  employee_number?: string;
  termination_date?: string;
  is_active: boolean;
  is_terminated?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole | string;
  phone?: string;
  clinic_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  is_active?: boolean;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  username?: string;
  phone?: string;
  role?: UserRole | string;
  clinic_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
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
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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
    } : undefined;
    
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
    const params = terminationDate ? { termination_date: terminationDate } : undefined;
    const response = await apiClient.patch<ApiResponse<User> | User>(
      `/users/${id}/terminate`,
      undefined,
      { params }
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
};
