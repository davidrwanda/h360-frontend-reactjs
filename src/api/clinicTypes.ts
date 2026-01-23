import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

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
  created_at: string;
  updated_at: string;
}

export interface ClinicTypeListParams {
  include_inactive?: boolean;
}

export const clinicTypesApi = {
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
  getById: async (id: string): Promise<ClinicType> => {
    const response = await apiClient.get<ApiResponse<ClinicType> | ClinicType>(`/clinic-types/${id}`);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicType>).data;
    }
    return response.data as ClinicType;
  },
};
