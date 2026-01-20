import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export interface PatientClinic {
  clinic_id: string;
  clinic_name: string;
  subscription_status: 'pending' | 'active' | 'inactive';
  registration_type: 'manual' | 'self';
  subscribed_at?: string;
  activated_at?: string;
  notes?: string;
}

export interface Patient {
  patient_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  patient_number?: string;
  national_id?: string;
  insurance_number?: string;
  insurance_provider?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  has_account: boolean;
  username?: string;
  account_created_at?: string;
  last_login?: string;
  registration_type: 'manual' | 'self';
  clinics?: PatientClinic[];
  clinic_id?: string; // Legacy field for single clinic
  subscription_status?: 'pending' | 'active' | 'inactive'; // Legacy field
  notes?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientRequest {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  patient_number?: string;
  national_id?: string;
  insurance_number?: string;
  insurance_provider?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  clinic_id?: string;
  create_account?: boolean;
  notes?: string;
}

export interface PatientSelfRegistrationRequest {
  clinic_id: string;
  patient_id?: string; // To link existing patient
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
  date_of_birth?: string;
}

export interface CreateAccountRequest {
  clinic_id: string;
  send_email?: boolean;
}

export interface CreateAccountResponse {
  patient: Patient;
  password: string;
}

export interface SubscribePatientRequest {
  clinic_id: string;
  notes?: string;
}

export interface UpdatePatientRequest {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  patient_number?: string;
  national_id?: string;
  insurance_number?: string;
  insurance_provider?: string;
  medical_history?: string;
  allergies?: string;
  current_medications?: string;
  blood_type?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  notes?: string;
}

export interface PatientListParams {
  page?: number;
  limit?: number;
  search?: string;
  clinic_id?: string;
  gender?: 'M' | 'F' | 'Other';
  subscription_status?: 'pending' | 'active' | 'inactive';
  has_account?: boolean;
  registration_type?: 'manual' | 'self';
  is_active?: boolean; // Filter by active/inactive status
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
  sortBy?: string; // Legacy support
  sortOrder?: 'ASC' | 'DESC'; // Legacy support
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const patientsApi = {
  /**
   * Get list of patients with pagination and filters
   * GET /api/patients
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  list: async (params?: PatientListParams): Promise<PaginatedResponse<Patient>> => {
    // Normalize sort_by/sort_order for API compatibility
    const apiParams = params ? {
      ...params,
      sort_by: params.sort_by || params.sortBy,
      sort_order: params.sort_order || params.sortOrder,
      // Remove legacy fields to avoid confusion
      sortBy: undefined,
      sortOrder: undefined,
    } : undefined;
    
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<Patient>> | PaginatedResponse<Patient>
    >('/patients', { params: apiParams });
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<Patient>>).data;
    }
    return response.data as PaginatedResponse<Patient>;
  },

  /**
   * Get patient by ID
   * GET /api/patients/:id
   * Access: Admin, Manager, Receptionist, Doctor, Nurse
   */
  getById: async (id: string): Promise<Patient> => {
    const response = await apiClient.get<ApiResponse<Patient> | Patient>(`/patients/${id}`);
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Create patient manually
   * POST /api/patients
   * Access: Admin, Manager, Receptionist
   */
  create: async (data: CreatePatientRequest): Promise<Patient> => {
    const response = await apiClient.post<ApiResponse<Patient> | Patient>('/patients', data);
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Update patient
   * PATCH /api/patients/:id
   * Access: Admin, Manager, Receptionist
   */
  update: async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
    const response = await apiClient.patch<ApiResponse<Patient> | Patient>(
      `/patients/${id}`,
      data
    );
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Deactivate patient (soft delete) - Global deactivation
   * DELETE /api/patients/:id
   * Access: Admin, Manager only
   * Scope: Global - affects all clinics, sets is_active = false system-wide
   */
  deactivate: async (id: string): Promise<Patient> => {
    const response = await apiClient.delete<ApiResponse<Patient> | Patient>(`/patients/${id}`);
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Activate patient - Global activation
   * PATCH /api/patients/:id/activate
   * Access: Admin, Manager only
   * Scope: Global - affects all clinics, sets is_active = true system-wide
   */
  activate: async (id: string): Promise<Patient> => {
    const response = await apiClient.patch<ApiResponse<Patient> | Patient>(
      `/patients/${id}/activate`
    );
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Remove patient from clinic (clinic-specific removal)
   * DELETE /api/patients/:id/clinics/:clinicId
   * Access: Admin, Manager, Receptionist
   * Scope: Clinic-specific - only removes PatientClinic relationship
   * Result: Patient remains active in other clinics and globally
   */
  removeFromClinic: async (id: string, clinicId: string): Promise<Patient> => {
    const response = await apiClient.delete<ApiResponse<Patient> | Patient>(
      `/patients/${id}/clinics/${clinicId}`
    );
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Patient self-registration (public endpoint)
   * POST /api/patients/register
   * Access: Public (No authentication)
   */
  register: async (data: PatientSelfRegistrationRequest): Promise<Patient> => {
    const response = await apiClient.post<ApiResponse<Patient> | Patient>(
      '/patients/register',
      data
    );
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },

  /**
   * Create account for existing patient
   * POST /api/patients/:id/create-account
   * Access: Admin, Manager, Receptionist
   */
  createAccount: async (id: string, data: CreateAccountRequest): Promise<CreateAccountResponse> => {
    const response = await apiClient.post<
      ApiResponse<CreateAccountResponse> | CreateAccountResponse
    >(`/patients/${id}/create-account`, data);
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<CreateAccountResponse>).data;
    }
    return response.data as CreateAccountResponse;
  },

  /**
   * Subscribe patient to clinic
   * POST /api/patients/:id/subscribe
   * Access: Admin, Manager, Receptionist
   */
  subscribe: async (id: string, data: SubscribePatientRequest): Promise<Patient> => {
    const response = await apiClient.post<ApiResponse<Patient> | Patient>(
      `/patients/${id}/subscribe`,
      data
    );
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<Patient>).data;
    }
    return response.data as Patient;
  },
};
