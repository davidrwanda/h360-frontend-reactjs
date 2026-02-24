import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface Appointment {
  appointment_id: string;
  patient_id?: string;
  doctor_id?: string;
  clinic_id: string;
  service_id?: string;
  is_doctor_auto_assigned?: boolean;
  appointment_date: string;
  // Time can come as a string (HH:mm) from some endpoints or as objects from others
  appointment_time?: string;
  start_time?: TimeSlot;
  end_time?: TimeSlot;
  formatted_time_slot?: string;
  status: 'booked' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  queue_number?: number;
  reason?: string;
  notes?: string;
  is_guest_booking: boolean;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  patient_name?: string;
  doctor_name?: string;
  service_name?: string;
  clinic_name?: string;
  booked_by?: string;
  checked_in_by?: string;
  checked_in_at?: string;
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

  // For guest bookings — backend expects guest info nested in additional_data
  additional_data?: {
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
  };

  // Booking fields — doctor_id optional depending on clinic booking_mode
  doctor_id?: string;
  clinic_id: string;
  service_id?: string;
  auto_assign_doctor?: boolean;
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

  /**
   * Get appointments for a specific patient
   * GET /api/appointments/patient/:patientId
   * Access: Authenticated patient (own appointments)
   * Note: This endpoint returns a flat array, not a paginated response
   */
  getByPatientId: async (patientId: string, params?: AppointmentListParams): Promise<PaginatedResponse<Appointment>> => {
    const response = await apiClient.get<ApiResponse<Appointment[] | PaginatedResponse<Appointment>> | Appointment[] | PaginatedResponse<Appointment>>(
      `/appointments/patient/${patientId}`,
      { params }
    );
    let result: Appointment[] | PaginatedResponse<Appointment>;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      result = (response.data as ApiResponse<Appointment[] | PaginatedResponse<Appointment>>).data;
    } else {
      result = response.data as Appointment[] | PaginatedResponse<Appointment>;
    }
    // Handle flat array response — wrap into PaginatedResponse
    if (Array.isArray(result)) {
      return { data: result, total: result.length, page: 1, limit: result.length };
    }
    return result;
  },
};
