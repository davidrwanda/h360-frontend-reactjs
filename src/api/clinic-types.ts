import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClinicTypeName {
  en: string;
  fr?: string;
  rw?: string;
}

export interface ClinicType {
  clinic_type_id: string;
  code: string;
  name: ClinicTypeName | string;
  description?: ClinicTypeName | string;
  icon?: string;
  color?: string;
  display_order: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicTypeListParams {
  include_inactive?: boolean;
  lang?: 'en' | 'fr' | 'rw';
}

export interface CreateClinicTypeRequest {
  code: string;
  name: ClinicTypeName;
  description?: ClinicTypeName;
  icon?: string;
  color?: string;
  display_order?: number;
}

export interface UpdateClinicTypeRequest extends Partial<CreateClinicTypeRequest> {
  is_active?: boolean;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const clinicTypesApi = {
  /** GET /api/clinic-types — Public, no auth needed */
  list: async (params?: ClinicTypeListParams): Promise<ClinicType[]> => {
    const response = await apiClient.get('/clinic-types', { params });
    return extractResponseData<ClinicType[]>(response.data);
  },

  /** GET /api/clinic-types/:id — Public */
  getById: async (id: string): Promise<ClinicType> => {
    const response = await apiClient.get(`/clinic-types/${id}`);
    return extractResponseData<ClinicType>(response.data);
  },

  /** POST /api/clinic-types — Roles: ADMIN */
  create: async (data: CreateClinicTypeRequest): Promise<ClinicType> => {
    const response = await apiClient.post('/clinic-types', wrapRequest(data));
    return extractResponseData<ClinicType>(response.data);
  },

  /** PATCH /api/clinic-types/:id — Roles: ADMIN */
  update: async (id: string, data: UpdateClinicTypeRequest): Promise<ClinicType> => {
    const response = await apiClient.patch(`/clinic-types/${id}`, wrapRequest(data));
    return extractResponseData<ClinicType>(response.data);
  },

  /** DELETE /api/clinic-types/:id — Deactivate. Roles: ADMIN (system types protected) */
  deactivate: async (id: string): Promise<void> => {
    await apiClient.delete(`/clinic-types/${id}`);
  },
};
