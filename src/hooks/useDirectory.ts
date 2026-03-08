import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { directoryApi } from '@/api/directory';
import type { DirectorySearchParams, ClaimRequest, ClaimReviewRequest, BookingAttemptRequest, CreateFeaturedListingRequest, UpdateFeaturedListingRequest, CorrectionRequest, CorrectionReviewRequest, SendOutreachRequest } from '@/types/directory';

// ─── Query Key Factory ──────────────────────────────────────────────────────

const directoryKeys = {
  all: ['directory'] as const,
  clinics: () => [...directoryKeys.all, 'clinics'] as const,
  search: (params?: DirectorySearchParams) => [...directoryKeys.clinics(), 'search', params] as const,
  clinic: (slug: string) => [...directoryKeys.clinics(), 'detail', slug] as const,
  nearby: (params: Record<string, unknown>) => [...directoryKeys.clinics(), 'nearby', params] as const,
  autocomplete: (query: string) => [...directoryKeys.clinics(), 'autocomplete', query] as const,
  stats: (params?: Record<string, unknown>) => [...directoryKeys.all, 'stats', params] as const,
  claims: () => [...directoryKeys.all, 'claims'] as const,
  claim: (id: string) => [...directoryKeys.claims(), id] as const,
  adminClaims: (params?: Record<string, unknown>) => [...directoryKeys.claims(), 'admin', params] as const,
  bookingAttempts: (params?: Record<string, unknown>) => [...directoryKeys.all, 'booking-attempts', params] as const,
  outreachTriggers: (params?: Record<string, unknown>) => [...directoryKeys.all, 'outreach-triggers', params] as const,
  featured: (params?: Record<string, unknown>) => [...directoryKeys.all, 'featured', params] as const,
  adminFeatured: (params?: Record<string, unknown>) => [...directoryKeys.all, 'admin-featured', params] as const,
  corrections: (params?: Record<string, unknown>) => [...directoryKeys.all, 'corrections', params] as const,
};

// ─── Directory Search & Browse ──────────────────────────────────────────────

/**
 * Hook to search clinics in the directory
 */
export const useDirectorySearch = (params?: DirectorySearchParams) => {
  return useQuery({
    queryKey: directoryKeys.search(params),
    queryFn: () => directoryApi.search(params),
  });
};

/**
 * Hook to fetch a single clinic by SEO slug
 */
export const useDirectoryClinic = (slug: string) => {
  return useQuery({
    queryKey: directoryKeys.clinic(slug),
    queryFn: () => directoryApi.getBySlug(slug),
    enabled: !!slug,
  });
};

/**
 * Hook to fetch nearby clinics
 */
export const useNearbyClinics = (params: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: directoryKeys.nearby(params),
    queryFn: () => directoryApi.nearby(params),
    enabled: params.latitude !== 0 && params.longitude !== 0,
  });
};

/**
 * Hook for clinic name autocomplete
 */
export const useDirectoryAutocomplete = (query: string) => {
  return useQuery({
    queryKey: directoryKeys.autocomplete(query),
    queryFn: () => directoryApi.autocomplete(query),
    enabled: query.length >= 2,
  });
};

/**
 * Hook to fetch directory statistics
 */
export const useDirectoryStats = (params?: { city?: string; country?: string }) => {
  return useQuery({
    queryKey: directoryKeys.stats(params),
    queryFn: () => directoryApi.getStats(params),
  });
};

// ─── Claim Flow ─────────────────────────────────────────────────────────────

/**
 * Hook to initiate a claim on a clinic
 */
export const useClaimClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: ClaimRequest }) =>
      directoryApi.claimClinic(clinicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.clinics() });
    },
    onError: (error) => {
      console.error('Error claiming clinic:', error);
      throw error;
    },
  });
};

/**
 * Hook to verify OTP for a claim
 */
export const useVerifyClaimOtp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, otp }: { claimId: string; otp: string }) =>
      directoryApi.verifyClaimOtp(claimId, otp),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.claim(variables.claimId) });
      queryClient.invalidateQueries({ queryKey: directoryKeys.claims() });
    },
    onError: (error) => {
      console.error('Error verifying claim OTP:', error);
      throw error;
    },
  });
};

/**
 * Hook to resend OTP for a claim
 */
export const useResendClaimOtp = () => {
  return useMutation({
    mutationFn: (claimId: string) => directoryApi.resendClaimOtp(claimId),
    onError: (error) => {
      console.error('Error resending claim OTP:', error);
      throw error;
    },
  });
};

/**
 * Hook to upload documents for a claim
 */
export const useUploadClaimDocuments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, files }: { claimId: string; files: File[] }) =>
      directoryApi.uploadClaimDocuments(claimId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.claim(variables.claimId) });
    },
    onError: (error) => {
      console.error('Error uploading claim documents:', error);
      throw error;
    },
  });
};

/**
 * Hook to fetch claim details
 */
export const useClaim = (claimId: string) => {
  return useQuery({
    queryKey: directoryKeys.claim(claimId),
    queryFn: () => directoryApi.getClaim(claimId),
    enabled: !!claimId,
  });
};

/**
 * Hook to list all claims (admin)
 */
export const useAdminClaims = (params?: {
  status?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}) => {
  return useQuery({
    queryKey: directoryKeys.adminClaims(params),
    queryFn: () => directoryApi.listAdminClaims(params),
    enabled: params !== undefined,
  });
};

/**
 * Hook to review a claim (approve/reject)
 */
export const useReviewClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ claimId, data }: { claimId: string; data: ClaimReviewRequest }) =>
      directoryApi.reviewClaim(claimId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.claim(variables.claimId) });
      queryClient.invalidateQueries({ queryKey: directoryKeys.claims() });
      queryClient.invalidateQueries({ queryKey: directoryKeys.clinics() });
    },
    onError: (error) => {
      console.error('Error reviewing claim:', error);
      throw error;
    },
  });
};

// ─── Booking Attempts ───────────────────────────────────────────────────────

/**
 * Hook to create a booking attempt on an unclaimed clinic
 */
export const useCreateBookingAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: BookingAttemptRequest }) =>
      directoryApi.createBookingAttempt(clinicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.all });
    },
    onError: (error) => {
      console.error('Error creating booking attempt:', error);
      throw error;
    },
  });
};

/**
 * Hook to list booking attempts on unclaimed clinics (admin)
 */
export const useUnclaimedBookingAttempts = (params?: {
  page?: number;
  limit?: number;
  clinic_id?: string;
}) => {
  return useQuery({
    queryKey: directoryKeys.bookingAttempts(params),
    queryFn: () => directoryApi.listUnclaimedBookingAttempts(params),
    enabled: params !== undefined,
  });
};

// ─── Outreach ───────────────────────────────────────────────────────────────

/**
 * Hook to fetch available outreach triggers
 */
export const useOutreachTriggers = (params?: { is_active?: boolean }) => {
  return useQuery({
    queryKey: directoryKeys.outreachTriggers(params),
    queryFn: () => directoryApi.getOutreachTriggers(params),
  });
};

/**
 * Hook to send outreach to a clinic
 */
export const useSendOutreach = () => {
  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: SendOutreachRequest }) =>
      directoryApi.sendOutreach(clinicId, data),
    onError: (error) => {
      console.error('Error sending outreach:', error);
      throw error;
    },
  });
};

// ─── Featured Listings ──────────────────────────────────────────────────────

/**
 * Hook to fetch active featured clinics (public)
 */
export const useFeaturedClinics = (params?: {
  tier?: 'premium' | 'standard';
  limit?: number;
}) => {
  return useQuery({
    queryKey: directoryKeys.featured(params),
    queryFn: () => directoryApi.getFeaturedClinics(params),
  });
};

/**
 * Hook to list all featured listings (admin)
 */
export const useAdminFeaturedListings = (params?: {
  is_active?: boolean;
  tier?: 'premium' | 'standard';
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: directoryKeys.adminFeatured(params),
    queryFn: () => directoryApi.listAdminFeaturedListings(params),
    enabled: params !== undefined,
  });
};

/**
 * Hook to create a featured listing
 */
export const useCreateFeaturedListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeaturedListingRequest) =>
      directoryApi.createFeaturedListing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.featured() });
      queryClient.invalidateQueries({ queryKey: directoryKeys.adminFeatured() });
    },
    onError: (error) => {
      console.error('Error creating featured listing:', error);
      throw error;
    },
  });
};

/**
 * Hook to update a featured listing
 */
export const useUpdateFeaturedListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFeaturedListingRequest }) =>
      directoryApi.updateFeaturedListing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.featured() });
      queryClient.invalidateQueries({ queryKey: directoryKeys.adminFeatured() });
    },
    onError: (error) => {
      console.error('Error updating featured listing:', error);
      throw error;
    },
  });
};

/**
 * Hook to delete a featured listing
 */
export const useDeleteFeaturedListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => directoryApi.deleteFeaturedListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.featured() });
      queryClient.invalidateQueries({ queryKey: directoryKeys.adminFeatured() });
    },
    onError: (error) => {
      console.error('Error deleting featured listing:', error);
      throw error;
    },
  });
};

// ─── Corrections ────────────────────────────────────────────────────────────

/**
 * Hook to submit a correction for a clinic
 */
export const useCreateCorrection = () => {
  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: CorrectionRequest }) =>
      directoryApi.createCorrection(clinicId, data),
    onError: (error) => {
      console.error('Error creating correction:', error);
      throw error;
    },
  });
};

/**
 * Hook to opt out a clinic from the directory
 */
export const useOptOutClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: { reason?: string; email: string } }) =>
      directoryApi.optOut(clinicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.clinics() });
    },
    onError: (error) => {
      console.error('Error opting out clinic:', error);
      throw error;
    },
  });
};

/**
 * Hook to list all corrections (admin)
 */
export const useAdminCorrections = (params?: {
  status?: string;
  clinic_id?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: directoryKeys.corrections(params),
    queryFn: () => directoryApi.listAdminCorrections(params),
    enabled: params !== undefined,
  });
};

/**
 * Hook to review a correction (approve/reject)
 */
export const useReviewCorrection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ correctionId, data }: { correctionId: string; data: CorrectionReviewRequest }) =>
      directoryApi.reviewCorrection(correctionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: directoryKeys.corrections() });
    },
    onError: (error) => {
      console.error('Error reviewing correction:', error);
      throw error;
    },
  });
};
