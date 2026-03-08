import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi, webhooksApi } from '@/api/integrations';
import type {
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
  ApiKeyListParams,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookListParams,
  WebhookDeliveryListParams,
} from '@/types/integrations';

// ─── API Key Hooks ──────────────────────────────────────────────────────────

/**
 * Hook to fetch list of API keys with filters
 */
export const useApiKeys = (params?: ApiKeyListParams) => {
  return useQuery({
    queryKey: ['apiKeys', params],
    queryFn: () => apiKeysApi.list(params),
  });
};

/**
 * Hook to fetch a single API key by ID
 */
export const useApiKey = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['apiKey', id],
    queryFn: () => apiKeysApi.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

/**
 * Hook for creating a new API key
 */
export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyRequest) => apiKeysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: (error) => {
      console.error('Error creating API key:', error);
      throw error;
    },
  });
};

/**
 * Hook for updating an API key
 */
export const useUpdateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApiKeyRequest }) =>
      apiKeysApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apiKey', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: (error) => {
      console.error('Error updating API key:', error);
      throw error;
    },
  });
};

/**
 * Hook for revoking (deleting) an API key
 */
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: (error) => {
      console.error('Error revoking API key:', error);
      throw error;
    },
  });
};

/**
 * Hook for rotating an API key
 */
export const useRotateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiKeysApi.rotate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    },
    onError: (error) => {
      console.error('Error rotating API key:', error);
      throw error;
    },
  });
};

// ─── Webhook Hooks ──────────────────────────────────────────────────────────

/**
 * Hook to fetch list of webhook subscriptions with filters
 */
export const useWebhooks = (params?: WebhookListParams) => {
  return useQuery({
    queryKey: ['webhooks', params],
    queryFn: () => webhooksApi.list(params),
  });
};

/**
 * Hook to fetch a single webhook subscription by ID
 */
export const useWebhook = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['webhook', id],
    queryFn: () => webhooksApi.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

/**
 * Hook for creating a new webhook subscription
 */
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWebhookRequest) => webhooksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (error) => {
      console.error('Error creating webhook:', error);
      throw error;
    },
  });
};

/**
 * Hook for updating a webhook subscription
 */
export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookRequest }) =>
      webhooksApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['webhook', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (error) => {
      console.error('Error updating webhook:', error);
      throw error;
    },
  });
};

/**
 * Hook for deleting a webhook subscription
 */
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
    onError: (error) => {
      console.error('Error deleting webhook:', error);
      throw error;
    },
  });
};

/**
 * Hook for sending a test event to a webhook
 */
export const useTestWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => webhooksApi.test(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
      queryClient.invalidateQueries({ queryKey: ['webhookDeliveries', id] });
    },
    onError: (error) => {
      console.error('Error testing webhook:', error);
      throw error;
    },
  });
};

/**
 * Hook to fetch deliveries for a webhook subscription
 */
export const useWebhookDeliveries = (
  id: string,
  params?: WebhookDeliveryListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['webhookDeliveries', id, params],
    queryFn: () => webhooksApi.listDeliveries(id, params),
    enabled: !!id && (options?.enabled !== false),
  });
};
