import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface ClinicAdmin {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone?: string;
  role: 'Admin';
  clinic_id: string;
  department?: string;
  position?: string;
  is_active: boolean;
  hire_date?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClinicAdminRequest {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  role?: 'Admin'; // Optional, defaults to Admin
  department?: string;
  position?: string;
  date_of_birth?: string;
  gender?: string;
  hire_date?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface UpdateClinicAdminRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  date_of_birth?: string;
  gender?: string;
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

export interface ClinicAdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const clinicAdminsApi = {
  /**
   * List all clinic admins for a specific clinic
   * GET /clinics/:clinicId/admins
   * Access: System User
   */
  list: async (
    clinicId: string,
    params?: ClinicAdminListParams
  ): Promise<PaginatedResponse<ClinicAdmin>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ClinicAdmin>> | PaginatedResponse<ClinicAdmin>
    >(`/clinics/${clinicId}/admins`, { params });
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<ClinicAdmin>>).data;
    }
    return response.data as PaginatedResponse<ClinicAdmin>;
  },

  /**
   * Create a new clinic admin
   * POST /clinics/:clinicId/admins
   * Access: System User
   */
  create: async (
    clinicId: string,
    data: CreateClinicAdminRequest
  ): Promise<ClinicAdmin> => {
    const response = await apiClient.post<ApiResponse<ClinicAdmin> | ClinicAdmin>(
      `/clinics/${clinicId}/admins`,
      data
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicAdmin>).data;
    }
    return response.data as ClinicAdmin;
  },

  /**
   * Get clinic admin by ID
   * GET /clinics/:clinicId/admins/:id
   * Access: System User
   */
  getById: async (clinicId: string, id: string): Promise<ClinicAdmin> => {
    const response = await apiClient.get<ApiResponse<ClinicAdmin> | ClinicAdmin>(
      `/clinics/${clinicId}/admins/${id}`
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicAdmin>).data;
    }
    return response.data as ClinicAdmin;
  },

  /**
   * Update clinic admin
   * PATCH /clinics/:clinicId/admins/:id
   * Access: System User
   */
  update: async (
    clinicId: string,
    id: string,
    data: UpdateClinicAdminRequest
  ): Promise<ClinicAdmin> => {
    const response = await apiClient.patch<ApiResponse<ClinicAdmin> | ClinicAdmin>(
      `/clinics/${clinicId}/admins/${id}`,
      data
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicAdmin>).data;
    }
    return response.data as ClinicAdmin;
  },

  /**
   * Deactivate clinic admin (soft delete)
   * DELETE /clinics/:clinicId/admins/:id
   * Access: System User
   */
  delete: async (clinicId: string, id: string): Promise<ClinicAdmin> => {
    const response = await apiClient.delete<ApiResponse<ClinicAdmin> | ClinicAdmin>(
      `/clinics/${clinicId}/admins/${id}`
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicAdmin>).data;
    }
    return response.data as ClinicAdmin;
  },
};
