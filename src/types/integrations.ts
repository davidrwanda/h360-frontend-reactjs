// ─── API Key Types (ISD §12.2) ──────────────────────────────────────────────

export interface ApiKey {
  api_key_id: string;
  name: string;
  key?: string; // Full key, only shown on creation
  key_prefix: string;
  clinic_id?: string;
  permissions: string[];
  is_active: boolean;
  expires_at?: string | null;
  last_used_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  clinic_id?: string;
  permissions: string[];
  expires_at?: string;
}

export interface UpdateApiKeyRequest {
  name?: string;
  permissions?: string[];
  is_active?: boolean;
  expires_at?: string;
}

export interface RotateApiKeyResponse {
  new_key: ApiKey;
  old_key_prefix: string;
  rotation_details: {
    old_expires_at?: string;
    rotated_at: string;
  };
}

export interface ApiKeyListParams {
  clinic_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

// ─── Webhook Types (ISD §12.3) ──────────────────────────────────────────────

export interface WebhookSubscription {
  subscription_id: string;
  clinic_id?: string;
  url: string;
  events: string[];
  secret?: string; // Only shown on creation
  is_active: boolean;
  description?: string;
  last_triggered_at?: string | null;
  failure_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  recent_deliveries?: WebhookDelivery[];
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  description?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  is_active?: boolean;
  description?: string;
}

export interface WebhookDelivery {
  delivery_id: string;
  event_type: string;
  status: 'success' | 'failed' | 'pending';
  response_status?: number;
  attempt_number: number;
  delivered_at: string;
}

export interface WebhookListParams {
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface WebhookDeliveryListParams {
  page?: number;
  limit?: number;
  status?: string;
}
