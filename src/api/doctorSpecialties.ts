import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface DoctorSpecialty {
  specialty_id: string;
  name: string;
  code?: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active: boolean;
  is_system?: boolean;
  clinic_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorSpecialtyListParams {
  clinic_id?: string;
  include_inactive?: boolean;
}

export const doctorSpecialtiesApi = {
  /**
   * List all doctor specialties (public, no auth required)
   * GET /api/doctor-specialties
   */
  list: async (params?: DoctorSpecialtyListParams): Promise<DoctorSpecialty[]> => {
    const response = await apiClient.get<ApiResponse<DoctorSpecialty[]> | DoctorSpecialty[]>(
      '/doctor-specialties',
      { params: params ?? {} }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorSpecialty[]>).data;
    }
    return response.data as DoctorSpecialty[];
  },

  /**
   * Get specialty by ID (public)
   * GET /api/doctor-specialties/:id
   */
  getById: async (id: string): Promise<DoctorSpecialty> => {
    const response = await apiClient.get<ApiResponse<DoctorSpecialty> | DoctorSpecialty>(
      `/doctor-specialties/${id}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorSpecialty>).data;
    }
    return response.data as DoctorSpecialty;
  },
};
