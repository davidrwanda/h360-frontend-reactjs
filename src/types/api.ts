// ─── ISD Standard Response Envelope ─────────────────────────────────────────

export interface ApiResponseMeta {
  request_id: string;
  message_id: string;
  correlation_id: string;
  timestamp: string;
  api_version?: string;
  locale?: string;
  source_system?: string;
  message?: string;
  status_code?: number;
  error?: string;
  error_code?: string;
  pagination?: PaginationMeta;
  warnings?: string[];
  deprecation?: { sunset_date: string; replacement: string };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface FieldError {
  field: string;
  code: string;
  message: string;
  rejected_value?: unknown;
}

export interface ApiResponseExtras {
  audit_log_id?: string;
  clinic_context?: { clinic_id: string; clinic_name: string };
  errors?: FieldError[];
  context?: Record<string, unknown> | null;
  related_links?: Record<string, string> | null;
  [key: string]: unknown;
}

/** ISD Standard Response Envelope */
export interface ApiResponse<T> {
  data: T;
  meta: ApiResponseMeta;
  extras: ApiResponseExtras;
}

/** ISD Standard Error Response */
export interface ApiErrorResponse {
  data: null;
  meta: ApiResponseMeta & {
    status_code: number;
    error: string;
    error_code: string;
    message: string;
  };
  extras: {
    errors: FieldError[];
    context: Record<string, unknown> | null;
    related_links: Record<string, string> | null;
  };
}

// ─── ISD Standard Request Envelope ──────────────────────────────────────────

export interface RequestMeta {
  message_id: string;
  correlation_id?: string;
  idempotency_key?: string;
  source_system?: string;
  locale?: string;
  timestamp?: string;
}

export interface ApiRequestEnvelope<T> {
  data: T;
  meta: RequestMeta;
  extras: Record<string, unknown>;
}

// ─── Paginated Response (data is an array) ──────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: ApiResponseMeta & { pagination: PaginationMeta };
  extras: ApiResponseExtras;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const SOURCE_SYSTEM = 'h360-web';

/** Create request meta with auto-generated tracing IDs */
export function createRequestMeta(correlationId?: string): RequestMeta {
  const messageId = `msg_${crypto.randomUUID()}`;
  return {
    message_id: messageId,
    correlation_id: correlationId || messageId,
    source_system: SOURCE_SYSTEM,
    locale: getLocale(),
    timestamp: new Date().toISOString(),
  };
}

/** Wrap data in ISD request envelope */
export function wrapRequest<T>(data: T, correlationId?: string): ApiRequestEnvelope<T> {
  return {
    data,
    meta: createRequestMeta(correlationId),
    extras: {},
  };
}

/** Get current locale from i18n store */
function getLocale(): string {
  try {
    const i18nStorage = localStorage.getItem('h360-i18n-storage');
    if (i18nStorage) {
      return JSON.parse(i18nStorage)?.state?.lang || 'en';
    }
  } catch {
    // fallback
  }
  return 'en';
}

/** Extract data from ISD response envelope (supports both old and new format) */
export function extractResponseData<T>(responseData: unknown): T {
  // ISD envelope: { data, meta, extras }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'data' in responseData &&
    'meta' in responseData
  ) {
    return (responseData as ApiResponse<T>).data;
  }

  // Legacy envelope: { success, data }
  if (
    responseData &&
    typeof responseData === 'object' &&
    'success' in responseData &&
    'data' in responseData &&
    (responseData as { success: boolean }).success
  ) {
    return (responseData as { data: T }).data;
  }

  // Direct response (no envelope)
  return responseData as T;
}

/** Extract pagination from ISD response meta */
export function extractPagination(responseData: unknown): PaginationMeta | null {
  if (
    responseData &&
    typeof responseData === 'object' &&
    'meta' in responseData
  ) {
    const meta = (responseData as { meta: ApiResponseMeta }).meta;
    return meta.pagination || null;
  }
  return null;
}

/** Check if response is an ISD error */
export function isApiError(responseData: unknown): responseData is ApiErrorResponse {
  return (
    responseData !== null &&
    typeof responseData === 'object' &&
    'data' in responseData &&
    (responseData as { data: unknown }).data === null &&
    'meta' in responseData &&
    typeof (responseData as { meta: unknown }).meta === 'object' &&
    'status_code' in ((responseData as { meta: Record<string, unknown> }).meta)
  );
}

/** Uniform error handler per ISD spec */
export function handleApiError(response: ApiErrorResponse): {
  fieldErrors: Record<string, string>;
  message: string;
  errorCode: string;
  statusCode: number;
  context: Record<string, unknown> | null;
} {
  const { meta, extras } = response;
  const fieldErrors: Record<string, string> = {};

  if (extras.errors && extras.errors.length > 0) {
    for (const err of extras.errors) {
      const fieldName = err.field.replace(/^data\./, '');
      fieldErrors[fieldName] = err.message;
    }
  }

  return {
    fieldErrors,
    message: meta.message,
    errorCode: meta.error_code,
    statusCode: meta.status_code,
    context: extras.context,
  };
}
