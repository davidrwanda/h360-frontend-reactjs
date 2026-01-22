import { apiClient } from './client';

export interface Department {
  department_id: string;
  name: string;
  description?: string;
  clinic_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListResponse {
  data: Department[];
  total: number;
  page: number;
  limit: number;
}

export const departmentsApi = {
  list: async (params?: {
    clinic_id?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<DepartmentListResponse> => {
    const response = await apiClient.get('/departments', { params });
    return response.data;
  },
};