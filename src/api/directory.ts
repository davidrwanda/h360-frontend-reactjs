import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type { PaginationMeta } from '@/types/api';
import type {
  DirectoryClinic,
  DirectorySearchParams,
  DirectoryStats,
  ClaimRequest,
  Claim,
  ClaimReviewRequest,
  BookingAttempt,
  BookingAttemptRequest,
  FeaturedListing,
  CreateFeaturedListingRequest,
  UpdateFeaturedListingRequest,
  Correction,
  CorrectionRequest,
  CorrectionReviewRequest,
  OutreachTrigger,
  SendOutreachRequest,
} from '@/types/directory';

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

// ─── API Methods ────────────────────────────────────────────────────────────

export const directoryApi = {
  // ── Directory Search & Browse ───────────────────────────────────────────

  /**
   * Search clinics in the directory
   * GET /api/directory/clinics
   * Auth: Public
   */
  search: async (params?: DirectorySearchParams): Promise<PaginatedResponse<DirectoryClinic>> => {
    const response = await apiClient.get('/directory/clinics', { params });
    return extractPaginatedResponse<DirectoryClinic>(response.data);
  },

  /**
   * Get clinic detail by SEO slug
   * GET /api/directory/clinics/:slug
   * Auth: Public
   */
  getBySlug: async (slug: string): Promise<DirectoryClinic> => {
    const response = await apiClient.get(`/directory/clinics/${slug}`);
    return extractResponseData<DirectoryClinic>(response.data);
  },

  /**
   * Find nearby clinics by lat/lng
   * GET /api/directory/clinics/nearby
   * Auth: Public
   */
  nearby: async (params: {
    latitude: number;
    longitude: number;
    radius_km?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<DirectoryClinic>> => {
    const response = await apiClient.get('/directory/clinics/nearby', { params });
    return extractPaginatedResponse<DirectoryClinic>(response.data);
  },

  /**
   * Autocomplete clinic names
   * GET /api/directory/clinics/autocomplete
   * Auth: Public
   */
  autocomplete: async (query: string): Promise<Array<{ id: string; name: string; seo_slug: string; city?: string }>> => {
    const response = await apiClient.get('/directory/clinics/autocomplete', {
      params: { q: query },
    });
    return extractResponseData<Array<{ id: string; name: string; seo_slug: string; city?: string }>>(response.data);
  },

  /**
   * Get directory statistics
   * GET /api/directory/stats
   * Auth: Admin
   */
  getStats: async (params?: { city?: string; country?: string }): Promise<DirectoryStats> => {
    const response = await apiClient.get('/directory/stats', { params });
    return extractResponseData<DirectoryStats>(response.data);
  },

  // ── Claim Flow ──────────────────────────────────────────────────────────

  /**
   * Initiate a claim on a clinic
   * POST /api/directory/clinics/:id/claim
   * Auth: Public
   */
  claimClinic: async (clinicId: string, data: ClaimRequest): Promise<Claim> => {
    const response = await apiClient.post(`/directory/clinics/${clinicId}/claim`, wrapRequest(data));
    return extractResponseData<Claim>(response.data);
  },

  /**
   * Verify OTP for a claim
   * POST /api/directory/claims/:id/verify-otp
   * Auth: Public
   */
  verifyClaimOtp: async (claimId: string, otp: string): Promise<Claim> => {
    const response = await apiClient.post(
      `/directory/claims/${claimId}/verify-otp`,
      wrapRequest({ otp }),
    );
    return extractResponseData<Claim>(response.data);
  },

  /**
   * Resend OTP for a claim
   * POST /api/directory/claims/:id/resend-otp
   * Auth: Public
   */
  resendClaimOtp: async (claimId: string): Promise<Claim> => {
    const response = await apiClient.post(
      `/directory/claims/${claimId}/resend-otp`,
      wrapRequest({}),
    );
    return extractResponseData<Claim>(response.data);
  },

  /**
   * Upload documents for a claim (multipart)
   * POST /api/directory/claims/:id/documents
   * Auth: Public
   */
  uploadClaimDocuments: async (claimId: string, files: File[]): Promise<Claim> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });
    const response = await apiClient.post(
      `/directory/claims/${claimId}/documents`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return extractResponseData<Claim>(response.data);
  },

  /**
   * Get claim details
   * GET /api/directory/claims/:id
   * Auth: Public (claimant) / Admin
   */
  getClaim: async (claimId: string): Promise<Claim> => {
    const response = await apiClient.get(`/directory/claims/${claimId}`);
    return extractResponseData<Claim>(response.data);
  },

  /**
   * List all claims (admin)
   * GET /api/admin/claims
   * Auth: SYSTEM, ADMIN
   */
  listAdminClaims: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  }): Promise<PaginatedResponse<Claim>> => {
    const response = await apiClient.get('/admin/claims', { params });
    return extractPaginatedResponse<Claim>(response.data);
  },

  /**
   * Review a claim (approve/reject)
   * PATCH /api/admin/claims/:id/review
   * Auth: SYSTEM, ADMIN
   */
  reviewClaim: async (claimId: string, data: ClaimReviewRequest): Promise<Claim> => {
    const response = await apiClient.patch(
      `/admin/claims/${claimId}/review`,
      wrapRequest(data),
    );
    return extractResponseData<Claim>(response.data);
  },

  // ── Booking Attempts ────────────────────────────────────────────────────

  /**
   * Create a booking attempt on an unclaimed clinic
   * POST /api/directory/clinics/:id/booking-attempts
   * Auth: Public
   */
  createBookingAttempt: async (clinicId: string, data: BookingAttemptRequest): Promise<BookingAttempt> => {
    const response = await apiClient.post(
      `/directory/clinics/${clinicId}/booking-attempts`,
      wrapRequest(data),
    );
    return extractResponseData<BookingAttempt>(response.data);
  },

  /**
   * List booking attempts on unclaimed clinics (admin)
   * GET /api/admin/booking-attempts/unclaimed
   * Auth: SYSTEM, ADMIN
   */
  listUnclaimedBookingAttempts: async (params?: {
    page?: number;
    limit?: number;
    clinic_id?: string;
  }): Promise<PaginatedResponse<BookingAttempt>> => {
    const response = await apiClient.get('/admin/booking-attempts/unclaimed', { params });
    return extractPaginatedResponse<BookingAttempt>(response.data);
  },

  // ── Outreach ────────────────────────────────────────────────────────────

  /**
   * Get available outreach triggers
   * GET /api/admin/outreach/triggers
   * Auth: SYSTEM, ADMIN
   */
  getOutreachTriggers: async (params?: {
    is_active?: boolean;
  }): Promise<OutreachTrigger[]> => {
    const response = await apiClient.get('/admin/outreach/triggers', { params });
    return extractResponseData<OutreachTrigger[]>(response.data);
  },

  /**
   * Send outreach to a clinic
   * POST /api/admin/outreach/:clinicId/send
   * Auth: SYSTEM, ADMIN
   */
  sendOutreach: async (clinicId: string, data: SendOutreachRequest): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/admin/outreach/${clinicId}/send`,
      wrapRequest(data),
    );
    return extractResponseData<{ message: string }>(response.data);
  },

  // ── Featured Listings ───────────────────────────────────────────────────

  /**
   * Get active featured clinics (public)
   * GET /api/directory/featured
   * Auth: Public
   */
  getFeaturedClinics: async (params?: {
    tier?: 'premium' | 'standard';
    limit?: number;
  }): Promise<FeaturedListing[]> => {
    const response = await apiClient.get('/directory/featured', { params });
    return extractResponseData<FeaturedListing[]>(response.data);
  },

  /**
   * List all featured listings (admin)
   * GET /api/admin/featured-listings
   * Auth: SYSTEM, ADMIN
   */
  listAdminFeaturedListings: async (params?: {
    is_active?: boolean;
    tier?: 'premium' | 'standard';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FeaturedListing>> => {
    const response = await apiClient.get('/admin/featured-listings', { params });
    return extractPaginatedResponse<FeaturedListing>(response.data);
  },

  /**
   * Create a featured listing
   * POST /api/admin/featured-listings
   * Auth: SYSTEM, ADMIN
   */
  createFeaturedListing: async (data: CreateFeaturedListingRequest): Promise<FeaturedListing> => {
    const response = await apiClient.post('/admin/featured-listings', wrapRequest(data));
    return extractResponseData<FeaturedListing>(response.data);
  },

  /**
   * Update a featured listing
   * PATCH /api/admin/featured-listings/:id
   * Auth: SYSTEM, ADMIN
   */
  updateFeaturedListing: async (id: string, data: UpdateFeaturedListingRequest): Promise<FeaturedListing> => {
    const response = await apiClient.patch(`/admin/featured-listings/${id}`, wrapRequest(data));
    return extractResponseData<FeaturedListing>(response.data);
  },

  /**
   * Delete a featured listing
   * DELETE /api/admin/featured-listings/:id
   * Auth: SYSTEM, ADMIN
   */
  deleteFeaturedListing: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/featured-listings/${id}`);
  },

  // ── Corrections ─────────────────────────────────────────────────────────

  /**
   * Submit a correction for a clinic
   * POST /api/directory/clinics/:id/corrections
   * Auth: Public
   */
  createCorrection: async (clinicId: string, data: CorrectionRequest): Promise<Correction> => {
    const response = await apiClient.post(
      `/directory/clinics/${clinicId}/corrections`,
      wrapRequest(data),
    );
    return extractResponseData<Correction>(response.data);
  },

  /**
   * Opt out a clinic from the directory
   * POST /api/directory/clinics/:id/opt-out
   * Auth: Public (verified owner)
   */
  optOut: async (clinicId: string, data: { reason?: string; email: string }): Promise<{ message: string }> => {
    const response = await apiClient.post(
      `/directory/clinics/${clinicId}/opt-out`,
      wrapRequest(data),
    );
    return extractResponseData<{ message: string }>(response.data);
  },

  /**
   * List all corrections (admin)
   * GET /api/admin/corrections
   * Auth: SYSTEM, ADMIN
   */
  listAdminCorrections: async (params?: {
    status?: string;
    clinic_id?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Correction>> => {
    const response = await apiClient.get('/admin/corrections', { params });
    return extractPaginatedResponse<Correction>(response.data);
  },

  /**
   * Review a correction (approve/reject)
   * PATCH /api/admin/corrections/:id/review
   * Auth: SYSTEM, ADMIN
   */
  reviewCorrection: async (correctionId: string, data: CorrectionReviewRequest): Promise<Correction> => {
    const response = await apiClient.patch(
      `/admin/corrections/${correctionId}/review`,
      wrapRequest(data),
    );
    return extractResponseData<Correction>(response.data);
  },
};
