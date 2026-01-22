import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface DoctorSpecialty {
  specialty_id: string;
  name: string;
  description?: string;
  clinic_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DoctorSpecialtyListParams {
  clinic_id?: string;
  include_inactive?: boolean;
}

export const doctorSpecialtiesApi = {
  /**
   * Get list of doctor specialties
   * GET /api/doctor-specialties
   */
  list: async (params?: DoctorSpecialtyListParams): Promise<DoctorSpecialty[]> => {
    const response = await apiClient.get<ApiResponse<DoctorSpecialty[]> | DoctorSpecialty[]>(
      '/doctor-specialties',
      { params }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorSpecialty[]>).data;
    }
    return response.data as DoctorSpecialty[];
  },
};
