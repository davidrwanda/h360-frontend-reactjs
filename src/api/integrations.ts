import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type { PaginationMeta } from '@/types/api';
import type {
  ApiKey,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  RotateApiKeyResponse,
  ApiKeyListParams,
  WebhookSubscription,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookDelivery,
  WebhookListParams,
  WebhookDeliveryListParams,
} from '@/types/integrations';

// ─── Paginated Response ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helper to extract paginated response (supports both ISD and legacy) ────

function extractPaginatedResponse<T>(responseData: unknown): PaginatedResponse<T> {
  // ISD envelope: { data: [...], meta: { pagination: {...} } }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'meta' in responseData
  ) {
    const envelope = responseData as {
      data: T[];
      meta: { pagination?: PaginationMeta };
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
    // ISD envelope without pagination — handle gracefully
    return {
      data: Array.isArray(envelope.data) ? envelope.data : [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }

  // Legacy envelope: { success: true, data: { data: [...], total, page, limit, totalPages } }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    (responseData as { success: boolean }).success &&
    'data' in responseData
  ) {
    return (responseData as { data: PaginatedResponse<T> }).data;
  }

  // Direct response
  return responseData as PaginatedResponse<T>;
}

// ─── API Key Methods ────────────────────────────────────────────────────────

export const apiKeysApi = {
  /**
   * Create a new API key
   * POST /api/api-keys
   */
  create: async (data: CreateApiKeyRequest): Promise<ApiKey> => {
    const response = await apiClient.post('/api-keys', wrapRequest(data));
    return extractResponseData<ApiKey>(response.data);
  },

  /**
   * List API keys with pagination and filters
   * GET /api/api-keys
   */
  list: async (params?: ApiKeyListParams): Promise<PaginatedResponse<ApiKey>> => {
    const response = await apiClient.get('/api-keys', { params });
    return extractPaginatedResponse<ApiKey>(response.data);
  },

  /**
   * Get API key by ID
   * GET /api/api-keys/:id
   */
  getById: async (id: string): Promise<ApiKey> => {
    const response = await apiClient.get(`/api-keys/${id}`);
    return extractResponseData<ApiKey>(response.data);
  },

  /**
   * Update an API key
   * PATCH /api/api-keys/:id
   */
  update: async (id: string, data: UpdateApiKeyRequest): Promise<ApiKey> => {
    const response = await apiClient.patch(`/api-keys/${id}`, wrapRequest(data));
    return extractResponseData<ApiKey>(response.data);
  },

  /**
   * Revoke (delete) an API key
   * DELETE /api/api-keys/:id
   */
  revoke: async (id: string): Promise<void> => {
    await apiClient.delete(`/api-keys/${id}`);
  },

  /**
   * Rotate an API key (generates a new key, deactivates the old one)
   * POST /api/api-keys/:id/rotate
   */
  rotate: async (id: string): Promise<RotateApiKeyResponse> => {
    const response = await apiClient.post(`/api-keys/${id}/rotate`);
    return extractResponseData<RotateApiKeyResponse>(response.data);
  },
};

// ─── Webhook Methods ────────────────────────────────────────────────────────

export const webhooksApi = {
  /**
   * Create a new webhook subscription
   * POST /api/webhooks
   */
  create: async (data: CreateWebhookRequest): Promise<WebhookSubscription> => {
    const response = await apiClient.post('/webhooks', wrapRequest(data));
    return extractResponseData<WebhookSubscription>(response.data);
  },

  /**
   * List webhook subscriptions with pagination and filters
   * GET /api/webhooks
   */
  list: async (params?: WebhookListParams): Promise<PaginatedResponse<WebhookSubscription>> => {
    const response = await apiClient.get('/webhooks', { params });
    return extractPaginatedResponse<WebhookSubscription>(response.data);
  },

  /**
   * Get webhook subscription by ID
   * GET /api/webhooks/:id
   */
  getById: async (id: string): Promise<WebhookSubscription> => {
    const response = await apiClient.get(`/webhooks/${id}`);
    return extractResponseData<WebhookSubscription>(response.data);
  },

  /**
   * Update a webhook subscription
   * PATCH /api/webhooks/:id
   */
  update: async (id: string, data: UpdateWebhookRequest): Promise<WebhookSubscription> => {
    const response = await apiClient.patch(`/webhooks/${id}`, wrapRequest(data));
    return extractResponseData<WebhookSubscription>(response.data);
  },

  /**
   * Delete a webhook subscription
   * DELETE /api/webhooks/:id
   */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/webhooks/${id}`);
  },

  /**
   * Send a test event to a webhook
   * POST /api/webhooks/:id/test
   */
  test: async (id: string): Promise<WebhookDelivery> => {
    const response = await apiClient.post(`/webhooks/${id}/test`);
    return extractResponseData<WebhookDelivery>(response.data);
  },

  /**
   * List deliveries for a webhook subscription
   * GET /api/webhooks/:id/deliveries
   */
  listDeliveries: async (
    id: string,
    params?: WebhookDeliveryListParams
  ): Promise<PaginatedResponse<WebhookDelivery>> => {
    const response = await apiClient.get(`/webhooks/${id}/deliveries`, { params });
    return extractPaginatedResponse<WebhookDelivery>(response.data);
  },
};
