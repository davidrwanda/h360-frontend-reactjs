import apiClient from './client';
import type { ApiResponse } from '@/types/auth';
import type { UserRole } from '@/types/auth';

export interface Employee {
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  username: string;
  role: UserRole;
  phone?: string;
  clinic_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  employee_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  phone?: string;
  clinic_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  employee_number?: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  clinic_id?: string;
  is_active?: boolean;
  department?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const employeesApi = {
  /**
   * Create a new employee
   * POST /api/employees
   * Access: Admin, Manager
   */
  create: async (data: CreateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.post<ApiResponse<Employee> | Employee>('/employees', data);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Employee>).data;
    }
    return response.data as Employee;
  },

  /**
   * Get list of employees with pagination and filters
   * GET /api/employees
   * Access: Admin, Manager
   */
  list: async (params?: EmployeeListParams): Promise<PaginatedResponse<Employee>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Employee>> | PaginatedResponse<Employee>
    >('/employees', { params });
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<Employee>>).data;
    }
    return response.data as PaginatedResponse<Employee>;
  },

  /**
   * Get employee by ID
   * GET /api/employees/:id
   * Access: Admin, Manager
   */
  getById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get<ApiResponse<Employee> | Employee>(`/employees/${id}`);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Employee>).data;
    }
    return response.data as Employee;
  },

  /**
   * Update employee
   * PATCH /api/employees/:id
   * Access: Admin, Manager
   */
  update: async (id: string, data: UpdateEmployeeRequest): Promise<Employee> => {
    const response = await apiClient.patch<ApiResponse<Employee> | Employee>(
      `/employees/${id}`,
      data
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Employee>).data;
    }
    return response.data as Employee;
  },

  /**
   * Deactivate employee (soft delete)
   * DELETE /api/employees/:id
   * Access: Admin, Manager
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<
      ApiResponse<{ message: string }> | { message: string }
    >(`/employees/${id}`);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<{ message: string }>).data;
    }
    return response.data as { message: string };
  },
};
