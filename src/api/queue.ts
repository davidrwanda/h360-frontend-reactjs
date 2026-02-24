import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface QueueItem {
  queue_id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id?: string;
  clinic_id: string;
  position: number;
  status: string;
  check_in_time: string;
  appointment_time: string;
  appointment_date: string;
  patient_name?: string;
  guest_name?: string;
  doctor_name?: string;
  service_name?: string;
  clinic_name?: string;
  is_guest_booking?: boolean;
  guest_phone?: string;
  guest_email?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QueuePosition {
  appointment_id: string;
  position: number;
  status: string;
  estimated_wait_minutes?: number;
}

export interface QueueStats {
  total_in_queue: number;
  checked_in: number;
  in_progress: number;
  completed_today: number;
  avg_wait_time_minutes: number;
}

export interface DoctorQueueResponse {
  doctor_id: string;
  doctor_name?: string;
  queue: QueueItem[];
}

export interface CheckInOptions {
  doctor_id?: string;
  notes?: string;
}

export const queueApi = {
  /**
   * Check in an appointment (optionally reassign doctor)
   * POST /api/queue/check-in/:appointmentId
   */
  checkIn: async (appointmentId: string, options?: CheckInOptions): Promise<QueueItem> => {
    const response = await apiClient.post<ApiResponse<QueueItem> | QueueItem>(
      `/queue/check-in/${appointmentId}`,
      options || {}
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<QueueItem>).data;
    }
    return response.data as QueueItem;
  },

  /**
   * Get queue position for a specific appointment
   * GET /api/queue/appointment/:appointmentId
   */
  getPosition: async (appointmentId: string): Promise<QueuePosition> => {
    const response = await apiClient.get<ApiResponse<QueuePosition> | QueuePosition>(
      `/queue/appointment/${appointmentId}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<QueuePosition>).data;
    }
    return response.data as QueuePosition;
  },

  /**
   * Get a doctor's current queue
   * GET /api/queue/doctor/:doctorId?date=YYYY-MM-DD
   */
  getDoctorQueue: async (doctorId: string, date?: string): Promise<DoctorQueueResponse> => {
    const response = await apiClient.get<ApiResponse<DoctorQueueResponse> | DoctorQueueResponse>(
      `/queue/doctor/${doctorId}`,
      { params: { date } }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorQueueResponse>).data;
    }
    return response.data as DoctorQueueResponse;
  },

  /**
   * Update the current position for a doctor's queue
   * PATCH /api/queue/current-position/:doctorId
   */
  updateCurrentPosition: async (doctorId: string, date: string, currentPosition: number): Promise<QueueItem> => {
    const response = await apiClient.patch<ApiResponse<QueueItem> | QueueItem>(
      `/queue/current-position/${doctorId}`,
      { date, current_position: currentPosition }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<QueueItem>).data;
    }
    return response.data as QueueItem;
  },

  /**
   * Get queue statistics for a doctor
   * GET /api/queue/stats/:doctorId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   */
  getStats: async (doctorId: string, startDate: string, endDate: string): Promise<QueueStats> => {
    const response = await apiClient.get<ApiResponse<QueueStats> | QueueStats>(
      `/queue/stats/${doctorId}`,
      { params: { startDate, endDate } }
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<QueueStats>).data;
    }
    return response.data as QueueStats;
  },
};
