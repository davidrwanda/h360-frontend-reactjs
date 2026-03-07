import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type { PaginationMeta } from '@/types/api';
import type {
  SystemAdmin,
  CreateSystemAdminRequest,
  UpdateSystemAdminRequest,
  SystemAdminListParams,
} from '@/types/organization';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PaginatedSystemAdmins {
  data: SystemAdmin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function extractPaginatedSystemAdmins(responseData: unknown): PaginatedSystemAdmins {
  // ISD envelope: { data: [...], meta: { pagination?: {...} } }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'meta' in responseData
  ) {
    const envelope = responseData as {
      data: SystemAdmin[];
      meta: { pagination?: PaginationMeta; total?: number; page?: number; limit?: number; totalPages?: number };
    };
    const pagination = envelope.meta?.pagination;
    if (pagination) {
      return {
        data: envelope.data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.total_pages,
      };
    }
    // ISD §7.6 list response has total/page/limit/totalPages directly in meta
    if (envelope.meta?.total !== undefined) {
      return {
        data: envelope.data,
        total: envelope.meta.total,
        page: envelope.meta.page ?? 1,
        limit: envelope.meta.limit ?? 20,
        totalPages: envelope.meta.totalPages ?? 1,
      };
    }
    return {
      data: Array.isArray(envelope.data) ? envelope.data : [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }

  return responseData as PaginatedSystemAdmins;
}

// ─── API Methods ────────────────────────────────────────────────────────────

export const systemAdminsApi = {
  /**
   * Create a new system admin
   * POST /api/system-admins
   * Auth: SYSTEM
   */
  create: async (data: CreateSystemAdminRequest): Promise<SystemAdmin> => {
    const response = await apiClient.post('/system-admins', wrapRequest(data));
    return extractResponseData<SystemAdmin>(response.data);
  },

  /**
   * List system admins with pagination
   * GET /api/system-admins
   * Auth: SYSTEM
   */
  list: async (params?: SystemAdminListParams): Promise<PaginatedSystemAdmins> => {
    const response = await apiClient.get('/system-admins', { params });
    return extractPaginatedSystemAdmins(response.data);
  },

  /**
   * Get system admin by ID
   * GET /api/system-admins/:id
   * Auth: SYSTEM
   */
  getById: async (id: string): Promise<SystemAdmin> => {
    const response = await apiClient.get(`/system-admins/${id}`);
    return extractResponseData<SystemAdmin>(response.data);
  },

  /**
   * Update system admin
   * PATCH /api/system-admins/:id
   * Auth: SYSTEM
   */
  update: async (id: string, data: UpdateSystemAdminRequest): Promise<SystemAdmin> => {
    const response = await apiClient.patch(`/system-admins/${id}`, wrapRequest(data));
    return extractResponseData<SystemAdmin>(response.data);
  },

  /**
   * Deactivate system admin (soft-delete)
   * DELETE /api/system-admins/:id
   * Auth: SYSTEM (cannot delete self)
   */
  deactivate: async (id: string): Promise<{ id: string; is_active: boolean }> => {
    const response = await apiClient.delete(`/system-admins/${id}`);
    return extractResponseData<{ id: string; is_active: boolean }>(response.data);
  },
};
