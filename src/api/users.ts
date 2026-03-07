import apiClient from './client';
import type { UserRole } from '@/types/auth';
import { extractResponseData, wrapRequest } from '@/types/api';
import type { PaginationMeta } from '@/types/api';

// ─── Types ──────────────────────────────────────────────────────────────────

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
  password: string;
  notes?: string;
  profile_image_url?: string;
  license_number?: string;
  license_expiry_date?: string;
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

// ─── Role Transformation Helpers ────────────────────────────────────────────

/**
 * Convert UPPER_SNAKE_CASE role → PascalCase for API requests.
 * e.g. "ORG_OWNER" → "OrgOwner", "LAB_TECHNICIAN" → "LabTechnician"
 */
const transformRoleToApi = (role: UserRole | string | undefined): string | undefined => {
  if (!role) return undefined;
  // UPPER_SNAKE_CASE → PascalCase: split on _, capitalize each segment, join
  return role
    .split('_')
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).toLowerCase())
    .join('');
};

/**
 * Convert PascalCase role from API → UPPER_SNAKE_CASE for frontend.
 * e.g. "OrgOwner" → "ORG_OWNER", "NurseAssistant" → "NURSE_ASSISTANT"
 */
const transformRoleFromApi = (role: string): UserRole => {
  return role.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase() as UserRole;
};

// ─── Helper to extract paginated response (supports both ISD and legacy) ────

function extractPaginatedUsers(responseData: unknown): PaginatedResponse<User> {
  // ISD envelope: { data: [...], meta: { pagination: {...} } }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'meta' in responseData
  ) {
    const envelope = responseData as {
      data: User[];
      meta: { pagination?: PaginationMeta };
    };
    const pagination = envelope.meta?.pagination;
    if (pagination) {
      return {
        data: envelope.data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    }
    // ISD envelope without pagination (shouldn't happen for list, but handle gracefully)
    return {
      data: Array.isArray(envelope.data) ? envelope.data : [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }

  // Legacy envelope: { success: true, data: { data: [...], total, page, limit, totalPages } }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    (responseData as { success: boolean }).success &&
    'data' in responseData
  ) {
    return (responseData as { data: PaginatedResponse<User> }).data;
  }

  // Direct response
  return responseData as PaginatedResponse<User>;
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const usersApi = {
  /**
   * Create a new user
   * POST /api/users
   * Auth: SYSTEM, ADMIN, MANAGER
   */
  create: async (data: CreateUserRequest): Promise<User> => {
    const apiData = {
      ...data,
      role: transformRoleToApi(data.role) || data.role,
    };

    const response = await apiClient.post('/users', wrapRequest(apiData));
    const user = extractResponseData<User>(response.data);
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Get list of users with pagination and filters
   * GET /api/users
   * Auth: Any authenticated user
   */
  list: async (params?: UserListParams): Promise<PaginatedResponse<User>> => {
    const apiParams = params ? {
      ...params,
      role: params.role ? transformRoleToApi(params.role) : undefined,
      sort_by: params.sort_by || params.sortBy,
      sort_order: params.sort_order || params.sortOrder,
    } : undefined;

    if (apiParams) {
      delete apiParams.sortBy;
      delete apiParams.sortOrder;
    }

    const response = await apiClient.get('/users', { params: apiParams });
    const result = extractPaginatedUsers(response.data);

    result.data = result.data.map(user => ({
      ...user,
      role: transformRoleFromApi(user.role as string),
    }));

    return result;
  },

  /**
   * Get user by ID
   * GET /api/users/:id
   * Auth: Any authenticated user
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    const user = extractResponseData<User>(response.data);
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Update user
   * PATCH /api/users/:id
   * Auth: SYSTEM, ADMIN, MANAGER (Activity Log: Yes)
   */
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const apiData = {
      ...data,
      role: data.role ? transformRoleToApi(data.role) : undefined,
    };

    const response = await apiClient.patch(`/users/${id}`, wrapRequest(apiData));
    const user = extractResponseData<User>(response.data);
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Deactivate user
   * PATCH /api/users/:id/deactivate
   * Auth: SYSTEM, ADMIN (Activity Log: Yes)
   */
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/deactivate`);
    const user = extractResponseData<User>(response.data);
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Activate user
   * PATCH /api/users/:id/activate
   * Auth: SYSTEM, ADMIN (Activity Log: Yes)
   */
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/users/${id}/activate`);
    const user = extractResponseData<User>(response.data);
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Terminate user
   * PATCH /api/users/:id/terminate
   * Auth: SYSTEM, ADMIN (Activity Log: Yes)
   */
  terminate: async (id: string, terminationDate?: string): Promise<User> => {
    const url = terminationDate
      ? `/users/${id}/terminate?termination_date=${terminationDate}`
      : `/users/${id}/terminate`;
    const response = await apiClient.patch(url);
    const user = extractResponseData<User>(response.data);
    return { ...user, role: transformRoleFromApi(user.role as string) };
  },

  /**
   * Get current user's preferences
   * GET /api/users/me/preferences
   * Auth: Any authenticated user
   */
  getMyPreferences: async (): Promise<UserPreferences> => {
    const response = await apiClient.get('/users/me/preferences');
    return extractResponseData<UserPreferences>(response.data);
  },

  /**
   * Update current user's preferences
   * PUT /api/users/me/preferences
   * Auth: Any authenticated user
   */
  updateMyPreferences: async (data: UpdatePreferencesRequest): Promise<UserPreferences> => {
    const response = await apiClient.put('/users/me/preferences', wrapRequest(data));
    return extractResponseData<UserPreferences>(response.data);
  },

  /**
   * Get any user's preferences (Admin/System only)
   * GET /api/users/:id/preferences
   * Auth: SYSTEM, ADMIN
   */
  getUserPreferences: async (userId: string): Promise<UserPreferences> => {
    const response = await apiClient.get(`/users/${userId}/preferences`);
    return extractResponseData<UserPreferences>(response.data);
  },

  /**
   * Update any user's preferences (Admin/System only)
   * PUT /api/users/:id/preferences
   * Auth: SYSTEM, ADMIN
   */
  updateUserPreferences: async (
    userId: string,
    data: UpdatePreferencesRequest
  ): Promise<UserPreferences> => {
    const response = await apiClient.put(`/users/${userId}/preferences`, wrapRequest(data));
    return extractResponseData<UserPreferences>(response.data);
  },
};
