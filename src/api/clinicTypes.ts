import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface ClinicTypeTranslation {
  name?: string;
  description?: string;
}

export interface ClinicType {
  clinic_type_id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order: number;
  is_active: boolean;
  is_system: boolean;
  translations?: Record<string, ClinicTypeTranslation>;
  created_at: string;
  updated_at: string;
}

export interface ClinicTypeListParams {
  include_inactive?: boolean;
  lang?: string;
}

export interface CreateClinicTypeRequest {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  translations?: Record<string, ClinicTypeTranslation>;
}

export interface UpdateClinicTypeRequest {
  name?: string;
  code?: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  translations?: Record<string, ClinicTypeTranslation>;
}

export const clinicTypesApi = {
  /**
   * Create a new clinic type
   * POST /api/clinic-types
   * Access: Admin
   */
  create: async (data: CreateClinicTypeRequest): Promise<ClinicType> => {
    const response = await apiClient.post<ApiResponse<ClinicType> | ClinicType>(
      '/clinic-types',
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicType>).data;
    }
    return response.data as ClinicType;
  },

  /**
   * Get list of clinic types
   * GET /api/clinic-types
   * Access: Public (no authentication required)
   */
  list: async (params?: ClinicTypeListParams): Promise<ClinicType[]> => {
    const response = await apiClient.get<ApiResponse<ClinicType[]> | ClinicType[]>(
      '/clinic-types',
      { params }
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicType[]>).data;
    }
    return response.data as ClinicType[];
  },

  /**
   * Get clinic type by ID
   * GET /api/clinic-types/:id
   * Access: Public (no authentication required)
   */
  getById: async (id: string, lang?: string): Promise<ClinicType> => {
    const response = await apiClient.get<ApiResponse<ClinicType> | ClinicType>(
      `/clinic-types/${id}`,
      { params: lang ? { lang } : undefined }
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicType>).data;
    }
    return response.data as ClinicType;
  },

  /**
   * Update clinic type
   * PATCH /api/clinic-types/:id
   * Access: Admin
   */
  update: async (id: string, data: UpdateClinicTypeRequest): Promise<ClinicType> => {
    const response = await apiClient.patch<ApiResponse<ClinicType> | ClinicType>(
      `/clinic-types/${id}`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicType>).data;
    }
    return response.data as ClinicType;
  },

  /**
   * Deactivate (soft delete) clinic type
   * DELETE /api/clinic-types/:id
   * Access: Admin
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }> | { message: string }>(
      `/clinic-types/${id}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<{ message: string }>).data;
    }
    return response.data as { message: string };
  },
};
