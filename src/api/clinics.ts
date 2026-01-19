import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface OperatingHours {
  monday?: { open?: string; close?: string; closed?: boolean };
  tuesday?: { open?: string; close?: string; closed?: boolean };
  wednesday?: { open?: string; close?: string; closed?: boolean };
  thursday?: { open?: string; close?: string; closed?: boolean };
  friday?: { open?: string; close?: string; closed?: boolean };
  saturday?: { open?: string; close?: string; closed?: boolean };
  sunday?: { open?: string; close?: string; closed?: boolean };
}

export interface Clinic {
  clinic_id: string;
  name: string;
  clinic_code?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  operating_hours?: OperatingHours;
  appointment_slot_duration?: number;
  max_daily_appointments?: number;
  allow_online_booking?: boolean;
  send_sms_reminders?: boolean;
  send_email_reminders?: boolean;
  reminder_hours_before?: number;
  is_active: boolean;
  established_date?: string;
  license_number?: string;
  license_expiry_date?: string;
  notes?: string;
  logo_url?: string;
  image_url?: string;
  tax_id?: string;
  registration_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClinicRequest {
  name: string;
  clinic_code?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  operating_hours?: OperatingHours;
  appointment_slot_duration?: number;
  max_daily_appointments?: number;
  allow_online_booking?: boolean;
  send_sms_reminders?: boolean;
  send_email_reminders?: boolean;
  reminder_hours_before?: number;
  is_active?: boolean;
  established_date?: string;
  license_number?: string;
  license_expiry_date?: string;
  notes?: string;
  logo_url?: string;
  image_url?: string;
  tax_id?: string;
  registration_number?: string;
}

export interface UpdateClinicRequest extends Partial<CreateClinicRequest> {
  is_active?: boolean;
}

export interface TimeSlot {
  start_time: { hour: number; minute: number };
  end_time: { hour: number; minute: number };
  slot_order: number;
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time_slots: TimeSlot[];
}

export interface InitializeTimetableRequest {
  schedules: DaySchedule[];
  replace_existing?: boolean;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ClinicListParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const clinicsApi = {
  /**
   * Create a new clinic
   * POST /api/clinics
   * Access: Admin, Manager
   */
  create: async (data: CreateClinicRequest): Promise<Clinic> => {
    const response = await apiClient.post<ApiResponse<Clinic> | Clinic>('/clinics', data);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Clinic>).data;
    }
    return response.data as Clinic;
  },

  /**
   * Get list of clinics with pagination and filters
   * GET /api/clinics
   * Access: Admin, Manager, Receptionist
   */
  list: async (params?: ClinicListParams): Promise<PaginatedResponse<Clinic>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Clinic>> | PaginatedResponse<Clinic>>(
      '/clinics',
      { params }
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<Clinic>>).data;
    }
    return response.data as PaginatedResponse<Clinic>;
  },

  /**
   * Get clinic by ID
   * GET /api/clinics/:id
   * Access: Admin, Manager, Receptionist
   */
  getById: async (id: string): Promise<Clinic> => {
    const response = await apiClient.get<ApiResponse<Clinic> | Clinic>(`/clinics/${id}`);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Clinic>).data;
    }
    return response.data as Clinic;
  },

  /**
   * Update clinic
   * PATCH /api/clinics/:id
   * Access: Admin, Manager
   */
  update: async (id: string, data: UpdateClinicRequest): Promise<Clinic> => {
    const response = await apiClient.patch<ApiResponse<Clinic> | Clinic>(`/clinics/${id}`, data);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Clinic>).data;
    }
    return response.data as Clinic;
  },

  /**
   * Deactivate clinic (soft delete)
   * DELETE /api/clinics/:id or PATCH /api/clinics/:id with {is_active: false}
   * Access: Admin, Manager
   */
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }> | { message: string }>(
      `/clinics/${id}`
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<{ message: string }>).data;
    }
    return response.data as { message: string };
  },

  /**
   * Deactivate clinic (set is_active to false)
   * PATCH /api/clinics/:id
   * Access: Admin, Manager
   */
  deactivate: async (id: string): Promise<Clinic> => {
    const response = await apiClient.patch<ApiResponse<Clinic> | Clinic>(`/clinics/${id}`, {
      is_active: false,
    });
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Clinic>).data;
    }
    return response.data as Clinic;
  },

  /**
   * Activate clinic (set is_active to true)
   * PATCH /api/clinics/:id
   * Access: Admin, Manager
   */
  activate: async (id: string): Promise<Clinic> => {
    const response = await apiClient.patch<ApiResponse<Clinic> | Clinic>(`/clinics/${id}`, {
      is_active: true,
    });
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Clinic>).data;
    }
    return response.data as Clinic;
  },

  /**
   * Get list of deactivated clinics
   * GET /api/clinics/deleted
   * Access: Admin role only
   */
  listDeleted: async (params?: ClinicListParams): Promise<PaginatedResponse<Clinic>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Clinic>> | PaginatedResponse<Clinic>>(
      '/clinics/deleted',
      { params }
    );
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<Clinic>>).data;
    }
    return response.data as PaginatedResponse<Clinic>;
  },

  /**
   * Initialize clinic timetable (bulk create schedules)
   * POST /api/clinics/:clinicId/timetables/initialize
   * Access: Admin, Manager
   */
  initializeTimetable: async (
    clinicId: string,
    data: InitializeTimetableRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<
      ApiResponse<{ message: string }> | { message: string }
    >(`/clinics/${clinicId}/timetables/initialize`, data);
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<{ message: string }>).data;
    }
    return response.data as { message: string };
  },
};
