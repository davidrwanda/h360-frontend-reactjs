import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface ServiceCategory {
  category_id: string;
  name: string;
  description?: string;
  clinic_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategoryListParams {
  clinic_id?: string;
  include_inactive?: boolean;
}

export const serviceCategoriesApi = {
  /**
   * Get list of service categories
   * GET /api/service-categories
   */
  list: async (params?: ServiceCategoryListParams): Promise<ServiceCategory[]> => {
    const response = await apiClient.get<ApiResponse<ServiceCategory[]> | ServiceCategory[]>(
      '/service-categories',
      { params }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ServiceCategory[]>).data;
    }
    return response.data as ServiceCategory[];
  },
};
