import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type { TenantInfo, UpdateTenantSettingsRequest } from '@/types/organization';

// ─── Enums ───────────────────────────────────────────────────────────────────

export type BookingMode =
  | 'both_required'
  | 'doctor_required'
  | 'service_required'
  | 'flexible'
  | 'time_slot_only';

export type ClinicVisibility = 'public' | 'unlisted' | 'private';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// ─── Operating Hours ─────────────────────────────────────────────────────────

export interface DayHours {
  open?: string;
  close?: string;
  closed?: boolean;
}

export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

// ─── Timetable ───────────────────────────────────────────────────────────────

export interface TimetableTime {
  hours: number;
  minutes: number;
  time: number; // hours * 60 + minutes
}

export interface TimetableSlot {
  timetable_id: string;
  clinic_id: string;
  day_of_week: DayOfWeek;
  start_time: TimetableTime;
  end_time: TimetableTime;
  notes?: string;
  is_active: boolean;
  slot_order?: number;
  formatted_time?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TimetableSlotInput {
  day_of_week: DayOfWeek;
  start_time: TimetableTime;
  end_time: TimetableTime;
  notes?: string;
}

// ISD §3 — POST /api/clinics/:id/timetables/initialize
export interface TimetableInitTimeSlot {
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export interface TimetableScheduleDay {
  day_of_week: DayOfWeek;
  time_slots: TimetableInitTimeSlot[];
}

export interface InitializeTimetableRequest {
  schedule: TimetableScheduleDay[];
  replace_existing?: boolean;
  is_active?: boolean;
}

// ─── Clinic Types (embedded) ─────────────────────────────────────────────────

export interface ClinicTypeRef {
  clinic_type_id: string;
  name: string | { en: string; fr?: string; rw?: string };
  code: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active?: boolean;
  is_system?: boolean;
}

// ─── FHIR ────────────────────────────────────────────────────────────────────

export interface ClinicFhirStatus {
  fhir_validated: boolean;
  fhir_last_validated_at: string | null;
  errors: string[];
  warnings: string[];
}

// ─── Clinic ──────────────────────────────────────────────────────────────────

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
  booking_mode?: BookingMode;
  auto_assign_doctor?: boolean;
  auto_check_in?: boolean;
  send_sms_reminders?: boolean;
  send_email_reminders?: boolean;
  reminder_hours_before?: number;
  is_active: boolean;
  is_license_expired?: boolean;
  established_date?: string;
  license_number?: string;
  license_expiry_date?: string;
  notes?: string;
  logo_url?: string;
  image_url?: string;
  tax_id?: string;
  registration_number?: string;
  organization_id?: string;
  parent_clinic_id?: string;
  type_ids?: string[];
  types?: ClinicTypeRef[];
  clinic_types?: ClinicTypeRef[];
  // Directory / SEO
  claim_status?: string;
  seo_slug?: string;
  seo_title?: string;
  seo_description?: string;
  visibility?: ClinicVisibility;
  profile_completeness?: number;
  // FHIR
  fhir_identifiers?: unknown;
  fhir_organization_type?: string;
  fhir_service_categories?: unknown;
  fhir_validated?: boolean;
  fhir_last_validated_at?: string | null;
  // Subscription / feature flags
  subscription_plan?: string;
  feature_flags?: string[];
  // Audit
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// ─── Requests ────────────────────────────────────────────────────────────────

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
  booking_mode?: BookingMode;
  auto_assign_doctor?: boolean;
  auto_check_in?: boolean;
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
  organization_id?: string;
  parent_clinic_id?: string;
  type_ids?: string[];
  fhir_identifiers?: unknown;
  fhir_organization_type?: string;
  fhir_service_categories?: unknown;
  // Auto-creates admin user when provided
  admin_email?: string;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_phone?: string;
}

export interface UpdateClinicRequest
  extends Partial<
    Omit<
      CreateClinicRequest,
      'admin_email' | 'admin_first_name' | 'admin_last_name' | 'admin_phone'
    >
  > {
  seo_slug?: string;
  seo_title?: string;
  seo_description?: string;
  visibility?: ClinicVisibility;
}

// ─── Params ──────────────────────────────────────────────────────────────────

export interface ClinicListParams {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  is_active?: boolean;
  organization_id?: string;
  booking_mode?: BookingMode;
  allow_online_booking?: boolean;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

/** Params for GET /api/organizations/:id/clinics (ISD §3) */
export interface OrgClinicListParams {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'city' | 'profile_completeness';
  sort_order?: 'ASC' | 'DESC';
}

export interface NearestClinicsParams {
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
}

// ─── Paginated Response ───────────────────────────────────────────────────────

export interface PaginatedClinics {
  data: Clinic[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function extractPaginatedClinics(raw: unknown): PaginatedClinics {
  if (raw && typeof raw === 'object' && 'meta' in raw) {
    const envelope = raw as {
      data: Clinic[];
      meta: { total?: number; page?: number; limit?: number; totalPages?: number; pagination?: { total: number; page: number; limit: number; total_pages: number } };
    };
    const p = envelope.meta?.pagination;
    if (p) {
      return { data: envelope.data, total: p.total, page: p.page, limit: p.limit, totalPages: p.total_pages };
    }
    return {
      data: Array.isArray(envelope.data) ? envelope.data : [],
      total: envelope.meta?.total ?? 0,
      page: envelope.meta?.page ?? 1,
      limit: envelope.meta?.limit ?? 20,
      totalPages: envelope.meta?.totalPages ?? 0,
    };
  }
  // Legacy flat format: { data: [...], total, page, limit, totalPages }
  if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as PaginatedClinics).data)) {
    return raw as PaginatedClinics;
  }
  return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const clinicsApi = {
  // ── Clinic CRUD ──────────────────────────────────────────────────────────

  /** POST /api/clinics — Create clinic (auto-creates admin if admin_* provided). Roles: ADMIN, MANAGER */
  create: async (data: CreateClinicRequest): Promise<Clinic> => {
    const response = await apiClient.post('/clinics', wrapRequest(data));
    return extractResponseData<Clinic>(response.data);
  },

  /** GET /api/clinics — List clinics. Public (reduced) or auth (full) */
  list: async (params?: ClinicListParams): Promise<PaginatedClinics> => {
    const response = await apiClient.get('/clinics', { params });
    return extractPaginatedClinics(response.data);
  },

  /** GET /api/organizations/:id/clinics — ORG_OWNER scoped clinic list (ISD §3) */
  listByOrganization: async (orgId: string, params?: OrgClinicListParams): Promise<PaginatedClinics> => {
    const response = await apiClient.get(`/organizations/${orgId}/clinics`, { params });
    return extractPaginatedClinics(response.data);
  },

  /** GET /api/clinics/:id — Single clinic */
  getById: async (id: string): Promise<Clinic> => {
    const response = await apiClient.get(`/clinics/${id}`);
    return extractResponseData<Clinic>(response.data);
  },

  /** PATCH /api/clinics/:id — Update clinic. Roles: ADMIN, MANAGER */
  update: async (id: string, data: UpdateClinicRequest): Promise<Clinic> => {
    const response = await apiClient.patch(`/clinics/${id}`, wrapRequest(data));
    return extractResponseData<Clinic>(response.data);
  },

  /** DELETE /api/clinics/:id — Soft delete. Roles: ADMIN */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clinics/${id}`);
  },

  /** GET /api/clinics/deleted — Soft-deleted clinics. Roles: ADMIN */
  listDeleted: async (params?: ClinicListParams): Promise<PaginatedClinics> => {
    const response = await apiClient.get('/clinics/deleted', { params });
    return extractPaginatedClinics(response.data);
  },

  /** GET /api/clinics/nearest — Geo search. Public */
  nearest: async (params: NearestClinicsParams): Promise<Clinic[]> => {
    const response = await apiClient.get('/clinics/nearest', { params });
    return extractResponseData<Clinic[]>(response.data);
  },

  // ── Tenant ───────────────────────────────────────────────────────────────

  /** GET /api/clinics/:id/tenant-info — Tenant record counts + sharing settings. Roles: SYSTEM, ADMIN */
  getTenantInfo: async (id: string): Promise<TenantInfo> => {
    const response = await apiClient.get(`/clinics/${id}/tenant-info`);
    return extractResponseData<TenantInfo>(response.data);
  },

  /** PATCH /api/clinics/:id/tenant-settings — Update sharing settings. Roles: SYSTEM, ADMIN */
  updateTenantSettings: async (id: string, data: UpdateTenantSettingsRequest): Promise<TenantInfo> => {
    const response = await apiClient.patch(`/clinics/${id}/tenant-settings`, wrapRequest(data));
    return extractResponseData<TenantInfo>(response.data);
  },

  // ── Timetable ────────────────────────────────────────────────────────────

  /**
   * POST /api/clinics/:id/timetables/initialize — Bulk setup (onboarding).
   * Replaces existing slots. Roles: ADMIN, MANAGER
   */
  initializeTimetable: async (clinicId: string, data: InitializeTimetableRequest): Promise<void> => {
    await apiClient.post(`/clinics/${clinicId}/timetables/initialize`, wrapRequest(data));
  },

  /** GET /api/clinics/:id/timetables — All slots. Auth required */
  listTimetableSlots: async (clinicId: string): Promise<TimetableSlot[]> => {
    const response = await apiClient.get(`/clinics/${clinicId}/timetables`);
    return extractResponseData<TimetableSlot[]>(response.data);
  },

  /** GET /api/clinics/:id/timetables/day/:dayOfWeek — Slots for one day */
  getTimetableByDay: async (clinicId: string, day: DayOfWeek): Promise<TimetableSlot[]> => {
    const response = await apiClient.get(`/clinics/${clinicId}/timetables/day/${day}`);
    return extractResponseData<TimetableSlot[]>(response.data);
  },

  /** GET /api/clinics/:id/timetables/:slotId — Single slot */
  getTimetableSlot: async (clinicId: string, slotId: string): Promise<TimetableSlot> => {
    const response = await apiClient.get(`/clinics/${clinicId}/timetables/${slotId}`);
    return extractResponseData<TimetableSlot>(response.data);
  },

  /** POST /api/clinics/:id/timetables — Add single slot. Roles: ADMIN, MANAGER */
  addTimetableSlot: async (clinicId: string, data: TimetableSlotInput): Promise<TimetableSlot> => {
    const response = await apiClient.post(`/clinics/${clinicId}/timetables`, wrapRequest(data));
    return extractResponseData<TimetableSlot>(response.data);
  },

  /** PATCH /api/clinics/:id/timetables/:slotId — Update slot. Roles: ADMIN, MANAGER */
  updateTimetableSlot: async (
    clinicId: string,
    slotId: string,
    data: Partial<TimetableSlotInput>
  ): Promise<TimetableSlot> => {
    const response = await apiClient.patch(
      `/clinics/${clinicId}/timetables/${slotId}`,
      wrapRequest(data)
    );
    return extractResponseData<TimetableSlot>(response.data);
  },

  /** DELETE /api/clinics/:id/timetables/:slotId — Remove slot (204). Roles: ADMIN, MANAGER */
  deleteTimetableSlot: async (clinicId: string, slotId: string): Promise<void> => {
    await apiClient.delete(`/clinics/${clinicId}/timetables/${slotId}`);
  },

  // ── FHIR ─────────────────────────────────────────────────────────────────

  /** GET /api/clinics/:id/fhir — Export FHIR R4 Organization JSON. Any auth */
  getFhir: async (id: string): Promise<unknown> => {
    const response = await apiClient.get(`/clinics/${id}/fhir`);
    return response.data;
  },

  /** GET /api/clinics/:id/fhir/status — Last validation result. Any auth */
  getFhirStatus: async (id: string): Promise<ClinicFhirStatus> => {
    const response = await apiClient.get(`/clinics/${id}/fhir/status`);
    return extractResponseData<ClinicFhirStatus>(response.data);
  },

  /** POST /api/clinics/:id/fhir/validate — Re-run validation. Roles: ADMIN, MANAGER */
  validateFhir: async (id: string): Promise<ClinicFhirStatus> => {
    const response = await apiClient.post(`/clinics/${id}/fhir/validate`);
    return extractResponseData<ClinicFhirStatus>(response.data);
  },
};
