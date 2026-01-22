import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface DoctorClinicRelationship {
  doctor_clinic_id: string;
  doctor_id: string;
  clinic_id: string;
  clinic_name: string;
  employment_status: string;
  hire_date?: string;
  termination_date?: string | null;
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubscribeDoctorRequest {
  clinic_id: string;
  employment_status?: 'active' | 'inactive' | 'on_leave';
  hire_date?: string;
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
}

export interface UpdateDoctorClinicRequest {
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
}

export interface DoctorClinicResponse {
  doctor_clinic_id: string;
  doctor_id: string;
  clinic_id: string;
  clinic_name: string;
  employment_status: string;
  hire_date?: string;
  termination_date?: string | null;
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  doctor_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone: string;
  alternate_phone?: string | null;
  specialty?: string;
  sub_specialty?: string;
  clinic_id?: string | null; // Primary clinic (nullable for multi-clinic doctors)
  clinic_name?: string;
  clinic_relationships?: DoctorClinicRelationship[]; // Legacy: kept for backward compatibility
  clinicData?: DoctorClinicRelationship[]; // New: clinic relationships array
  license_number?: string;
  license_expiry_date?: string;
  is_license_expired?: boolean;
  medical_school?: string;
  years_of_experience?: number;
  qualifications?: string;
  doctor_number?: string; // Auto-generated format: H260D-001
  bio?: string;
  profile_image_url?: string;
  // Clinic-specific fields (from first active clinic relationship, nullable)
  appointment_duration_minutes?: number | null;
  max_daily_patients?: number | null;
  accepts_new_patients?: boolean | null;
  consultation_fee?: string | null;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicData {
  clinic_id: string; // Required: Primary clinic
  clinic_ids?: string[]; // Optional: Associate with multiple clinics
  employment_status?: 'active' | 'inactive' | 'on_leave';
  hire_date?: string;
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
}

export interface CreateDoctorRequest {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone: string;
  alternate_phone?: string;
  specialty?: string; // Auto-creates specialty if doesn't exist
  sub_specialty?: string;
  license_number?: string;
  license_expiry_date?: string;
  medical_school?: string;
  years_of_experience?: number;
  qualifications?: string;
  bio?: string;
  user_id?: string; // Optional: Link to existing user
  doctor_number?: string; // Optional: Auto-generated if not provided (format: H260D-001)
  profile_image_url?: string;
  clinicData: ClinicData; // Required: Clinic data object
}

export interface UpdateDoctorRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone?: string;
  alternate_phone?: string;
  specialty?: string;
  sub_specialty?: string;
  license_number?: string;
  license_expiry_date?: string;
  medical_school?: string;
  years_of_experience?: number;
  qualifications?: string;
  bio?: string;
  doctor_number?: string;
  profile_image_url?: string;
  clinic_id?: string | null;
  clinic_ids?: string[]; // Update multiple clinic associations
  clinicData?: ClinicData; // Optional: For updating clinic-specific fields
  is_active?: boolean;
}

export interface DoctorListParams {
  page?: number;
  limit?: number;
  search?: string;
  clinic_id?: string;
  specialty?: string;
  accepts_new_patients?: boolean;
  user_id?: string;
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

export const doctorsApi = {
  /**
   * Create a new doctor
   * POST /api/doctors
   * Access: Admin, Manager, Receptionist
   * Automatically creates User account if email is provided
   */
  create: async (data: CreateDoctorRequest): Promise<Doctor> => {
    const response = await apiClient.post<ApiResponse<Doctor> | Doctor>('/doctors', data);
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Doctor>).data;
    }
    return response.data as Doctor;
  },

  /**
   * Get list of doctors with pagination and filters
   * GET /api/doctors
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  list: async (params?: DoctorListParams): Promise<PaginatedResponse<Doctor>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Doctor>> | PaginatedResponse<Doctor>>(
      '/doctors',
      { params }
    );
    let result: PaginatedResponse<Doctor>;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      result = (response.data as ApiResponse<PaginatedResponse<Doctor>>).data;
    } else {
      result = response.data as PaginatedResponse<Doctor>;
    }
    // Normalize clinicData to clinic_relationships for backward compatibility
    if (result.data) {
      result.data = result.data.map((doctor) => ({
        ...doctor,
        clinic_relationships: doctor.clinicData || doctor.clinic_relationships,
      }));
    }
    return result;
  },

  /**
   * Get doctor by ID
   * GET /api/doctors/:id
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  getById: async (id: string): Promise<Doctor> => {
    const response = await apiClient.get<ApiResponse<Doctor> | Doctor>(`/doctors/${id}`);
    let doctor: Doctor;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      doctor = (response.data as ApiResponse<Doctor>).data;
    } else {
      doctor = response.data as Doctor;
    }
    // Normalize clinicData to clinic_relationships for backward compatibility
    return {
      ...doctor,
      clinic_relationships: doctor.clinicData || doctor.clinic_relationships,
    };
  },

  /**
   * Update doctor
   * PATCH /api/doctors/:id
   * Access: Admin, Manager, Receptionist, or Doctor updating their own profile
   */
  update: async (id: string, data: UpdateDoctorRequest): Promise<Doctor> => {
    const response = await apiClient.patch<ApiResponse<Doctor> | Doctor>(`/doctors/${id}`, data);
    let doctor: Doctor;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      doctor = (response.data as ApiResponse<Doctor>).data;
    } else {
      doctor = response.data as Doctor;
    }
    // Normalize clinicData to clinic_relationships for backward compatibility
    return {
      ...doctor,
      clinic_relationships: doctor.clinicData || doctor.clinic_relationships,
    };
  },

  /**
   * Deactivate doctor-clinic relationship
   * DELETE /api/doctors/:doctorId/clinics/:clinicId
   * Access: Admin, Manager only
   * Deactivates only the doctor-clinic relationship, not the doctor globally
   */
  deactivate: async (doctorId: string, clinicId: string): Promise<DoctorClinicResponse> => {
    const response = await apiClient.delete<ApiResponse<DoctorClinicResponse> | DoctorClinicResponse>(
      `/doctors/${doctorId}/clinics/${clinicId}`
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorClinicResponse>).data;
    }
    return response.data as DoctorClinicResponse;
  },

  /**
   * Activate doctor
   * PATCH /api/doctors/:id/activate
   * Access: Admin, Manager only
   */
  activate: async (id: string): Promise<Doctor> => {
    const response = await apiClient.patch<ApiResponse<Doctor> | Doctor>(`/doctors/${id}/activate`);
    let doctor: Doctor;
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      doctor = (response.data as ApiResponse<Doctor>).data;
    } else {
      doctor = response.data as Doctor;
    }
    // Normalize clinicData to clinic_relationships for backward compatibility
    return {
      ...doctor,
      clinic_relationships: doctor.clinicData || doctor.clinic_relationships,
    };
  },

  /**
   * Subscribe doctor to clinic using doctor code
   * POST /api/doctors/:doctorCode/subscribe
   * Access: Admin, Manager, Receptionist
   */
  subscribe: async (doctorCode: string, data: SubscribeDoctorRequest): Promise<DoctorClinicResponse> => {
    const response = await apiClient.post<ApiResponse<DoctorClinicResponse> | DoctorClinicResponse>(
      `/doctors/${doctorCode}/subscribe`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorClinicResponse>).data;
    }
    return response.data as DoctorClinicResponse;
  },

  /**
   * Update doctor-clinic relationship
   * PATCH /api/doctors/:doctorId/clinics/:clinicId
   * Access: Admin, Manager, Receptionist
   */
  updateClinicRelationship: async (
    doctorId: string,
    clinicId: string,
    data: UpdateDoctorClinicRequest
  ): Promise<DoctorClinicResponse> => {
    const response = await apiClient.patch<ApiResponse<DoctorClinicResponse> | DoctorClinicResponse>(
      `/doctors/${doctorId}/clinics/${clinicId}`,
      data
    );
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<DoctorClinicResponse>).data;
    }
    return response.data as DoctorClinicResponse;
  },
};
