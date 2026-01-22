import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface Appointment {
  appointment_id: string;
  patient_id?: string;
  doctor_id: string;
  clinic_id: string;
  service_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  is_guest_booking: boolean;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  patient_name?: string;
  doctor_name?: string;
  service_name?: string;
  clinic_name?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  search?: string;
  patient_id?: string;
  doctor_id?: string;
  clinic_id?: string;
  appointment_date?: string;
  status?: string;
  is_guest_booking?: boolean;
  guest_phone?: string;
  guest_email?: string;
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

export const appointmentsApi = {
  /**
   * Get list of appointments with pagination and filters
   * GET /api/appointments
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  list: async (params?: AppointmentListParams): Promise<PaginatedResponse<Appointment>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Appointment>> | PaginatedResponse<Appointment>>(
      '/appointments',
      { params }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<Appointment>>).data;
    }
    return response.data as PaginatedResponse<Appointment>;
  },

  /**
   * Get appointment by ID
   * GET /api/appointments/:id
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get<ApiResponse<Appointment> | Appointment>(`/appointments/${id}`);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Appointment>).data;
    }
    return response.data as Appointment;
  },
};
