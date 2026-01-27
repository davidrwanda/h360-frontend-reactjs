import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface TimeObject {
  hours: number;
  minutes: number;
  time: number; // hours * 60 + minutes
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface ClinicTimetable {
  timetable_id: string;
  clinic_id: string;
  day_of_week: DayOfWeek;
  start_time: TimeObject;
  end_time: TimeObject;
  is_active: boolean;
  slot_order: number;
  notes?: string | null;
  formatted_time: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorTimetable {
  timetable_id: string;
  doctor_id: string;
  day_of_week: DayOfWeek;
  start_time: TimeObject;
  end_time: TimeObject;
  is_active: boolean;
  slot_order: number;
  notes?: string | null;
  formatted_time: string;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTimetableRequest {
  day_of_week: DayOfWeek;
  start_time: TimeObject;
  end_time: TimeObject;
  is_active?: boolean;
  slot_order?: number;
  notes?: string;
}

export interface CreateTimetableFromStringRequest {
  day_of_week: DayOfWeek;
  start_time: string; // "HH:mm" format
  end_time: string; // "HH:mm" format
  is_active?: boolean;
  slot_order?: number;
  notes?: string;
}

export interface UpdateTimetableRequest {
  start_time?: TimeObject;
  end_time?: TimeObject;
  is_active?: boolean;
  slot_order?: number;
  notes?: string;
}

export interface InitializeDoctorTimetableSchedule {
  day_of_week: DayOfWeek;
  time_slots: Array<{
    start_time: string; // "HH:mm"
    end_time: string; // "HH:mm"
    notes?: string;
  }>;
}

export interface InitializeDoctorTimetableRequest {
  schedule: InitializeDoctorTimetableSchedule[];
  is_active?: boolean;
  replace_existing?: boolean;
}

export interface InitializeDoctorTimetableResponse {
  created: number;
  skipped: number;
  timetables: DoctorTimetable[];
}

// Clinic Timetables API
export const clinicTimetablesApi = {
  /**
   * Create a clinic timetable entry
   * POST /api/clinics/:clinicId/timetables
   */
  create: async (clinicId: string, data: CreateTimetableRequest): Promise<ClinicTimetable> => {
    const response = await apiClient.post<ApiResponse<ClinicTimetable> | ClinicTimetable>(
      `/clinics/${clinicId}/timetables`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicTimetable>).data;
    }
    return response.data as ClinicTimetable;
  },

  /**
   * Create a clinic timetable entry from time strings
   * POST /api/clinics/:clinicId/timetables/from-string
   * Backend may expect clinic_id in body as well as in path.
   */
  createFromString: async (
    clinicId: string,
    data: CreateTimetableFromStringRequest
  ): Promise<ClinicTimetable> => {
    const body = { ...data, clinic_id: String(clinicId) };
    const response = await apiClient.post<ApiResponse<ClinicTimetable> | ClinicTimetable>(
      `/clinics/${clinicId}/timetables/from-string`,
      body
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicTimetable>).data;
    }
    return response.data as ClinicTimetable;
  },

  /**
   * Get all clinic timetables
   * GET /api/clinics/:clinicId/timetables
   */
  list: async (clinicId: string): Promise<ClinicTimetable[]> => {
    const response = await apiClient.get<ApiResponse<ClinicTimetable[]> | ClinicTimetable[]>(
      `/clinics/${clinicId}/timetables`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicTimetable[]>).data;
    }
    return response.data as ClinicTimetable[];
  },

  /**
   * Get clinic timetables for a specific day
   * GET /api/clinics/:clinicId/timetables/day/:dayOfWeek
   */
  getByDay: async (clinicId: string, dayOfWeek: DayOfWeek): Promise<ClinicTimetable[]> => {
    const response = await apiClient.get<ApiResponse<ClinicTimetable[]> | ClinicTimetable[]>(
      `/clinics/${clinicId}/timetables/day/${dayOfWeek}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicTimetable[]>).data;
    }
    return response.data as ClinicTimetable[];
  },

  /**
   * Get a single clinic timetable by ID
   * GET /api/clinics/:clinicId/timetables/:id
   */
  getById: async (clinicId: string, id: string): Promise<ClinicTimetable> => {
    const response = await apiClient.get<ApiResponse<ClinicTimetable> | ClinicTimetable>(
      `/clinics/${clinicId}/timetables/${id}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicTimetable>).data;
    }
    return response.data as ClinicTimetable;
  },

  /**
   * Update a clinic timetable
   * PATCH /api/clinics/:clinicId/timetables/:id
   */
  update: async (
    clinicId: string,
    id: string,
    data: UpdateTimetableRequest
  ): Promise<ClinicTimetable> => {
    const response = await apiClient.patch<ApiResponse<ClinicTimetable> | ClinicTimetable>(
      `/clinics/${clinicId}/timetables/${id}`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ClinicTimetable>).data;
    }
    return response.data as ClinicTimetable;
  },

  /**
   * Delete a clinic timetable
   * DELETE /api/clinics/:clinicId/timetables/:id
   */
  delete: async (clinicId: string, id: string): Promise<void> => {
    await apiClient.delete(`/clinics/${clinicId}/timetables/${id}`);
  },
};

// Doctor Timetables API
export const doctorTimetablesApi = {
  /**
   * Create a doctor timetable entry
   * POST /api/doctors/:doctorId/timetables
   */
  create: async (doctorId: string, data: CreateTimetableRequest): Promise<DoctorTimetable> => {
    const response = await apiClient.post<ApiResponse<DoctorTimetable> | DoctorTimetable>(
      `/doctors/${doctorId}/timetables`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorTimetable>).data;
    }
    return response.data as DoctorTimetable;
  },

  /**
   * Create a doctor timetable entry from time strings
   * POST /api/doctors/:doctorId/timetables/from-string
   */
  createFromString: async (
    doctorId: string,
    data: CreateTimetableFromStringRequest
  ): Promise<DoctorTimetable> => {
    const response = await apiClient.post<ApiResponse<DoctorTimetable> | DoctorTimetable>(
      `/doctors/${doctorId}/timetables/from-string`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorTimetable>).data;
    }
    return response.data as DoctorTimetable;
  },

  /**
   * Initialize doctor timetable (bulk setup)
   * POST /api/doctors/:doctorId/timetables/initialize
   */
  initialize: async (
    doctorId: string,
    data: InitializeDoctorTimetableRequest
  ): Promise<InitializeDoctorTimetableResponse> => {
    const response = await apiClient.post<
      ApiResponse<InitializeDoctorTimetableResponse> | InitializeDoctorTimetableResponse
    >(`/doctors/${doctorId}/timetables/initialize`, data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<InitializeDoctorTimetableResponse>).data;
    }
    return response.data as InitializeDoctorTimetableResponse;
  },

  /**
   * Get all doctor timetables
   * GET /api/doctors/:doctorId/timetables
   */
  list: async (doctorId: string): Promise<DoctorTimetable[]> => {
    const response = await apiClient.get<ApiResponse<DoctorTimetable[]> | DoctorTimetable[]>(
      `/doctors/${doctorId}/timetables`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorTimetable[]>).data;
    }
    return response.data as DoctorTimetable[];
  },

  /**
   * Get doctor timetables for a specific day
   * GET /api/doctors/:doctorId/timetables/day/:dayOfWeek
   */
  getByDay: async (doctorId: string, dayOfWeek: DayOfWeek): Promise<DoctorTimetable[]> => {
    const response = await apiClient.get<ApiResponse<DoctorTimetable[]> | DoctorTimetable[]>(
      `/doctors/${doctorId}/timetables/day/${dayOfWeek}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorTimetable[]>).data;
    }
    return response.data as DoctorTimetable[];
  },

  /**
   * Get a single doctor timetable by ID
   * GET /api/doctors/:doctorId/timetables/:id
   */
  getById: async (doctorId: string, id: string): Promise<DoctorTimetable> => {
    const response = await apiClient.get<ApiResponse<DoctorTimetable> | DoctorTimetable>(
      `/doctors/${doctorId}/timetables/${id}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorTimetable>).data;
    }
    return response.data as DoctorTimetable;
  },

  /**
   * Update a doctor timetable
   * PATCH /api/doctors/:doctorId/timetables/:id
   */
  update: async (
    doctorId: string,
    id: string,
    data: UpdateTimetableRequest
  ): Promise<DoctorTimetable> => {
    const response = await apiClient.patch<ApiResponse<DoctorTimetable> | DoctorTimetable>(
      `/doctors/${doctorId}/timetables/${id}`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorTimetable>).data;
    }
    return response.data as DoctorTimetable;
  },

  /**
   * Delete a doctor timetable
   * DELETE /api/doctors/:doctorId/timetables/:id
   */
  delete: async (doctorId: string, id: string): Promise<void> => {
    await apiClient.delete(`/doctors/${doctorId}/timetables/${id}`);
  },
};
