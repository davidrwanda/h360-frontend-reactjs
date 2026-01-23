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

export interface TimeSlot {
  hours: number;
  minutes: number;
  time: number;
}

export interface CreateAppointmentRequest {
  // For registered patients
  patient_id?: string;
  
  // For guest bookings
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  
  // Required fields
  doctor_id: string;
  clinic_id: string;
  service_id?: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: TimeSlot;
  end_time: TimeSlot;
  reason?: string;
  notes?: string;
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
   * Create a new appointment
   * POST /api/appointments
   * Access: Public (for booking) or Authenticated users
   */
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await apiClient.post<ApiResponse<Appointment> | Appointment>('/appointments', data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Appointment>).data;
    }
    return response.data as Appointment;
  },

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
