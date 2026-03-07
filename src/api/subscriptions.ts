import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type {
  Subscription,
  CreateSubscriptionRequest,
  UpgradeSubscriptionRequest,
  CancelSubscriptionRequest,
  PlanLimitCheck,
} from '@/types/organization';

export const subscriptionsApi = {
  /** POST /api/subscriptions — Create Subscription (Auth: SYSTEM, ADMIN) */
  create: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await apiClient.post('/subscriptions', wrapRequest(data));
    return extractResponseData<Subscription>(response.data);
  },

  /** GET /api/subscriptions/clinic/:clinicId — Get Clinic Subscription (Auth: SYSTEM, ADMIN, MANAGER) */
  getByClinic: async (clinicId: string): Promise<Subscription> => {
    const response = await apiClient.get(`/subscriptions/clinic/${clinicId}`);
    return extractResponseData<Subscription>(response.data);
  },

  /** PATCH /api/subscriptions/:id/upgrade — Upgrade/Downgrade Plan (Auth: SYSTEM, ADMIN) */
  upgrade: async (id: string, data: UpgradeSubscriptionRequest): Promise<Subscription> => {
    const response = await apiClient.patch(`/subscriptions/${id}/upgrade`, wrapRequest(data));
    return extractResponseData<Subscription>(response.data);
  },

  /** POST /api/subscriptions/:id/cancel — Cancel Subscription (Auth: SYSTEM, ADMIN) */
  cancel: async (id: string, data: CancelSubscriptionRequest): Promise<Subscription> => {
    const response = await apiClient.post(`/subscriptions/${id}/cancel`, wrapRequest(data));
    return extractResponseData<Subscription>(response.data);
  },

  /** POST /api/subscriptions/:id/reactivate — Reactivate Canceled Subscription (Auth: SYSTEM, ADMIN) */
  reactivate: async (id: string): Promise<Subscription> => {
    const response = await apiClient.post(`/subscriptions/${id}/reactivate`, wrapRequest({}));
    return extractResponseData<Subscription>(response.data);
  },

  /** GET /api/subscriptions/clinic/:clinicId/limits/check — Check Plan Limit (Auth: SYSTEM, ADMIN, MANAGER) */
  checkLimit: async (clinicId: string, resource: string, count?: number): Promise<PlanLimitCheck> => {
    const response = await apiClient.get(`/subscriptions/clinic/${clinicId}/limits/check`, {
      params: { resource, count },
    });
    return extractResponseData<PlanLimitCheck>(response.data);
  },
};
