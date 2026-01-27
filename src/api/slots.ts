import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface TimeSlot {
  hours: number;
  minutes: number;
  time: number;
}

export interface AppointmentSlot {
  slot_id: string;
  doctor_id?: string | null;
  doctor_name?: string | null;
  clinic_id: string;
  clinic_name: string;
  service_id?: string | null;
  service_name?: string | null;
  slot_date: string;
  start_time: TimeSlot;
  end_time: TimeSlot;
  formatted_time_slot: string;
  status: 'available' | 'booked' | 'cancelled' | 'completed';
  max_concurrent_appointments: number;
  current_appointment_count: number;
  is_clinic_level: boolean;
  is_available: boolean;
  is_at_capacity: boolean;
  appointment_id?: string | null;
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  clinic_distance_km?: number;
}

export interface SlotListParams {
  // Location-based search
  latitude?: number;
  longitude?: number;
  radius_km?: number; // 1-1000, default: 50
  max_clinics?: number; // 1-50, default: 10

  // Filters
  clinic_id?: string;
  doctor_id?: string;
  service_id?: string;
  clinic_type_id?: string; // Filter by clinic type
  slot_date?: string; // YYYY-MM-DD
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  status?: 'available' | 'booked' | 'cancelled' | 'completed';
  is_clinic_level?: boolean;
  available_only?: boolean;

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginatedSlotResponse {
  data: AppointmentSlot[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  last_available_slot_date?: string; // YYYY-MM-DD - Last possible date for booking
}

export interface AvailableDoctor {
  doctor_id: string;
  doctor_name: string;
  first_name: string;
  last_name: string;
  specialty?: string;
  doctor_number: string;
  profile_image_url?: string | null;
  clinic_id: string;
  clinic_name: string;
  isAvailable: boolean;
  unavailability_reason?: string | null;
}

export interface AvailableDoctorsParams {
  clinic_id: string;
  slot_date: string; // YYYY-MM-DD
  start_time?: TimeSlot;
  end_time?: TimeSlot;
  service_id?: string;
}

export interface GenerateSlotsRequest {
  clinic_id: string;
  doctor_id?: string;
  service_id?: string;
  is_clinic_level?: boolean;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  slot_duration_minutes?: number;
  max_concurrent_appointments?: number;
  // Custom time range (if no timetable exists)
  days_of_week?: number[]; // 1-7 (Monday-Sunday)
  day_start_time?: string; // "HH:mm"
  day_end_time?: string; // "HH:mm"
}

export interface GenerateSlotsResponse {
  created: number;
  skipped: number;
  slots: AppointmentSlot[];
}

export interface RegenerateFutureSlotsRequest {
  clinic_id: string;
  doctor_id?: string;
  end_date?: string; // YYYY-MM-DD
}

export interface RegenerateFutureSlotsResponse {
  deleted: number;
  regenerated: number;
  skipped: number;
  slots: AppointmentSlot[];
}

export const slotsApi = {
  /**
   * Get list of available appointment slots
   * GET /api/slots
   * Access: Public (for booking) or Authenticated users
   * 
   * Supports location-based search (latitude/longitude) or clinic-based search
   */
  list: async (params?: SlotListParams): Promise<PaginatedSlotResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedSlotResponse> | PaginatedSlotResponse>(
      '/slots',
      { params }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedSlotResponse>).data;
    }
    return response.data as PaginatedSlotResponse;
  },

  /**
   * Get available doctors for a specific slot
   * GET /api/slots/doctors/available
   * Access: Public (for booking) or Authenticated users
   */
  getAvailableDoctors: async (params: AvailableDoctorsParams): Promise<AvailableDoctor[]> => {
    const response = await apiClient.get<ApiResponse<AvailableDoctor[]> | AvailableDoctor[]>(
      '/slots/doctors/available',
      { params }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<AvailableDoctor[]>).data;
    }
    return response.data as AvailableDoctor[];
  },

  /**
   * Generate slots manually
   * POST /api/slots/generate
   * Access: Public (no auth required in current implementation)
   */
  generate: async (data: GenerateSlotsRequest): Promise<GenerateSlotsResponse> => {
    const response = await apiClient.post<
      ApiResponse<GenerateSlotsResponse> | GenerateSlotsResponse
    >('/slots/generate', data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<GenerateSlotsResponse>).data;
    }
    return response.data as GenerateSlotsResponse;
  },

  /**
   * Regenerate future slots
   * POST /api/slots/regenerate-future
   * Access: Public (no auth required in current implementation)
   */
  regenerateFuture: async (
    data: RegenerateFutureSlotsRequest
  ): Promise<RegenerateFutureSlotsResponse> => {
    const response = await apiClient.post<
      ApiResponse<RegenerateFutureSlotsResponse> | RegenerateFutureSlotsResponse
    >('/slots/regenerate-future', data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<RegenerateFutureSlotsResponse>).data;
    }
    return response.data as RegenerateFutureSlotsResponse;
  },
};
