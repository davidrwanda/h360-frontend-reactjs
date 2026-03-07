import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type {
  Onboarding,
  OnboardingChecklistItem,
} from '@/types/organization';

export const onboardingApi = {
  /** POST /api/onboarding/start — Start Onboarding (Auth: ADMIN) */
  start: async (clinicId: string, organizationId?: string): Promise<Onboarding> => {
    const response = await apiClient.post('/onboarding/start', wrapRequest({
      clinic_id: clinicId,
      organization_id: organizationId,
    }));
    return extractResponseData<Onboarding>(response.data);
  },

  /** GET /api/onboarding/clinic/:clinicId — Get Onboarding Status (Auth: ADMIN, MANAGER) */
  getByClinic: async (clinicId: string): Promise<Onboarding> => {
    const response = await apiClient.get(`/onboarding/clinic/${clinicId}`);
    return extractResponseData<Onboarding>(response.data);
  },

  /** PUT /api/onboarding/clinic/:clinicId/steps/:stepSlug — Save Step Data (Auth: ADMIN) */
  saveStep: async (clinicId: string, stepSlug: string, stepData: Record<string, unknown>): Promise<Onboarding> => {
    const response = await apiClient.put(`/onboarding/clinic/${clinicId}/steps/${stepSlug}`, wrapRequest(stepData));
    return extractResponseData<Onboarding>(response.data);
  },

  /** POST /api/onboarding/clinic/:clinicId/skip — Skip Onboarding (Auth: ADMIN) */
  skip: async (clinicId: string): Promise<Onboarding> => {
    const response = await apiClient.post(`/onboarding/clinic/${clinicId}/skip`, wrapRequest({}));
    return extractResponseData<Onboarding>(response.data);
  },

  /** POST /api/onboarding/clinic/:clinicId/complete — Complete Onboarding (Auth: ADMIN) */
  complete: async (clinicId: string, data?: { start_trial?: boolean; plan_id?: string }): Promise<Onboarding> => {
    const response = await apiClient.post(`/onboarding/clinic/${clinicId}/complete`, wrapRequest(data ?? {}));
    return extractResponseData<Onboarding>(response.data);
  },

  /** GET /api/checklists/clinic/:clinicId — Get Checklists by Role (ISD §1.6) */
  getChecklist: async (clinicId: string, params?: { role?: string; is_completed?: boolean }): Promise<OnboardingChecklistItem[]> => {
    const response = await apiClient.get(`/checklists/clinic/${clinicId}`, { params });
    return extractResponseData<OnboardingChecklistItem[]>(response.data);
  },

  /** PATCH /api/checklists/:id/complete — Mark Checklist Item Complete (ISD §1.6) */
  completeChecklistItem: async (itemId: string): Promise<OnboardingChecklistItem> => {
    const response = await apiClient.patch(`/checklists/${itemId}/complete`, wrapRequest({}));
    return extractResponseData<OnboardingChecklistItem>(response.data);
  },

  /** PATCH /api/checklists/:id/dismiss — Dismiss Checklist Item (ISD §1.6) */
  dismissChecklistItem: async (itemId: string): Promise<OnboardingChecklistItem> => {
    const response = await apiClient.patch(`/checklists/${itemId}/dismiss`, wrapRequest({}));
    return extractResponseData<OnboardingChecklistItem>(response.data);
  },
};
