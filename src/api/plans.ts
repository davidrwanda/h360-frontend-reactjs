import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanListParams,
} from '@/types/organization';

export const plansApi = {
  /** GET /api/plans — List Available Plans (@Public) */
  list: async (params?: PlanListParams): Promise<Plan[]> => {
    const response = await apiClient.get('/plans', { params });
    return extractResponseData<Plan[]>(response.data);
  },

  /** GET /api/plans/:id — Get Plan Details (@Public) */
  getById: async (id: string): Promise<Plan> => {
    const response = await apiClient.get(`/plans/${id}`);
    return extractResponseData<Plan>(response.data);
  },

  /** POST /api/plans — Create Plan (Auth: SYSTEM) */
  create: async (data: CreatePlanRequest): Promise<Plan> => {
    const response = await apiClient.post('/plans', wrapRequest(data));
    return extractResponseData<Plan>(response.data);
  },

  /** PATCH /api/plans/:id — Update Plan (Auth: SYSTEM) */
  update: async (id: string, data: UpdatePlanRequest): Promise<Plan> => {
    const response = await apiClient.patch(`/plans/${id}`, wrapRequest(data));
    return extractResponseData<Plan>(response.data);
  },
};
