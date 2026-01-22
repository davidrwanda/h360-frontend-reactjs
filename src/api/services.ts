import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface Service {
  service_id: string;
  name: string;
  service_code: string;
  description?: string;
  category?: string;
  clinic_id: string;
  clinic_name?: string;
  price: string;
  duration_minutes: number;
  requires_appointment: boolean;
  is_walk_in_allowed: boolean;
  max_daily_capacity?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  name: string;
  service_code: string;
  description?: string;
  category?: string;
  clinic_id: string;
  price: string;
  duration_minutes: number;
  requires_appointment: boolean;
  is_walk_in_allowed: boolean;
  max_daily_capacity?: number;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {
  is_active?: boolean;
}

export interface DoctorServiceAssignment {
  doctor_service_id: string;
  doctor_id: string;
  doctor_name: string;
  service_id: string;
  service_name: string;
  is_active: boolean;
  custom_price?: string;
  custom_duration_minutes?: number;
  notes?: string;
  created_by?: string;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignDoctorToServiceRequest {
  doctor_id: string;
  custom_price?: string;
  custom_duration_minutes?: number;
  notes?: string;
}

export interface ServiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  clinic_id?: string;
  category?: string;
  requires_appointment?: boolean;
  is_walk_in_allowed?: boolean;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export const servicesApi = {
  /**
   * Create a new service
   * POST /api/services
   * Access: Admin, Manager
   */
  create: async (data: CreateServiceRequest): Promise<Service> => {
    const response = await apiClient.post<ApiResponse<Service> | Service>('/services', data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Service>).data;
    }
    return response.data as Service;
  },

  /**
   * Get list of services with pagination and filters
   * GET /api/services
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  list: async (params?: ServiceListParams): Promise<PaginatedResponse<Service>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Service>> | PaginatedResponse<Service>>(
      '/services',
      { params }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<Service>>).data;
    }
    return response.data as PaginatedResponse<Service>;
  },

  /**
   * Get service by ID
   * GET /api/services/:id
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get<ApiResponse<Service> | Service>(`/services/${id}`);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Service>).data;
    }
    return response.data as Service;
  },

  /**
   * Update service
   * PATCH /api/services/:id
   * Access: Admin, Manager
   */
  update: async (id: string, data: UpdateServiceRequest): Promise<Service> => {
    const response = await apiClient.patch<ApiResponse<Service> | Service>(`/services/${id}`, data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Service>).data;
    }
    return response.data as Service;
  },

  /**
   * Deactivate service
   * PATCH /api/services/:id/deactivate
   * Access: Admin, Manager
   */
  deactivate: async (id: string): Promise<Service> => {
    const response = await apiClient.patch<ApiResponse<Service> | Service>(`/services/${id}/deactivate`);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Service>).data;
    }
    return response.data as Service;
  },

  /**
   * Activate service
   * PATCH /api/services/:id/activate
   * Access: Admin, Manager
   */
  activate: async (id: string): Promise<Service> => {
    const response = await apiClient.patch<ApiResponse<Service> | Service>(`/services/${id}/activate`);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Service>).data;
    }
    return response.data as Service;
  },

  /**
   * Assign doctor to service
   * POST /api/services/:serviceId/doctors
   * Access: Admin, Manager
   */
  assignDoctor: async (
    serviceId: string,
    data: AssignDoctorToServiceRequest
  ): Promise<DoctorServiceAssignment> => {
    const response = await apiClient.post<ApiResponse<DoctorServiceAssignment> | DoctorServiceAssignment>(
      `/services/${serviceId}/doctors`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorServiceAssignment>).data;
    }
    return response.data as DoctorServiceAssignment;
  },

  /**
   * Remove doctor from service
   * DELETE /api/services/:serviceId/doctors/:doctorId
   * Access: Admin, Manager
   */
  removeDoctor: async (serviceId: string, doctorId: string): Promise<void> => {
    await apiClient.delete(`/services/${serviceId}/doctors/${doctorId}`);
  },

  /**
   * Get doctors for a service
   * GET /api/services/:id/doctors
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  getServiceDoctors: async (serviceId: string): Promise<DoctorServiceAssignment[]> => {
    const response = await apiClient.get<ApiResponse<DoctorServiceAssignment[]> | DoctorServiceAssignment[]>(
      `/services/${serviceId}/doctors`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorServiceAssignment[]>).data;
    }
    return response.data as DoctorServiceAssignment[];
  },

  /**
   * Get services for a doctor
   * GET /api/services/doctors/:doctorId
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  getDoctorServices: async (doctorId: string): Promise<Service[]> => {
    const response = await apiClient.get<ApiResponse<Service[]> | Service[]>(
      `/services/doctors/${doctorId}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Service[]>).data;
    }
    return response.data as Service[];
  },
};
