// ─── Clinic Directory Types ─────────────────────────────────────────────────

export interface DirectoryClinic {
  id: string;
  name: string;
  seo_slug: string;
  description?: string;
  claim_status: 'unclaimed' | 'pending' | 'claimed' | 'verified';
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  image_url?: string;
  operating_hours?: Record<string, { open: string; close: string; is_closed: boolean }>;
  services_summary?: string[];
  provider_count?: number;
  profile_completeness?: number;
  allow_online_booking?: boolean;
  booking_mode?: string;
  established_date?: string;
  license_number?: string;
  timezone?: string;
  language?: string;
  organization?: { id: string; name: string };
  distance_km?: number;
  // Detail-only fields
  seo_title?: string;
  seo_description?: string;
  services?: Array<{ id: string; name: string; price?: number; duration_minutes?: number }>;
  providers?: Array<{ id: string; name: string; specialty: string; photo_url?: string }>;
  photos?: DirectoryPhoto[];
}

export interface DirectoryPhoto {
  id: string;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  is_primary?: boolean;
}

export interface DirectorySearchParams {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  services?: string[];
  specialties?: string[];
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  claim_status?: string;
  has_online_booking?: boolean;
  language?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
}

export interface DirectoryStats {
  total_clinics: number;
  unclaimed_count: number;
  by_claim_status: Record<string, number>;
  by_city: Record<string, number>;
}

// ─── Claim Types ────────────────────────────────────────────────────────────

export interface ClaimRequest {
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string;
  claimant_role: string;
  verification_method: 'phone' | 'email';
}

export interface Claim {
  claim_id: string;
  clinic_id: string;
  clinic_name: string;
  status: 'pending_otp' | 'otp_verified' | 'pending_review' | 'approved' | 'rejected';
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string;
  claimant_role: string;
  verification_method: string;
  verification_sent_to?: string;
  verification_expires_at?: string;
  max_attempts?: number;
  documents?: ClaimDocument[];
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  auto_approved_reason?: string;
  trial_eligible?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClaimDocument {
  id: string;
  type: string;
  url: string;
  uploaded_at: string;
}

export interface ClaimReviewRequest {
  decision: 'approve' | 'reject';
  notes?: string;
  evidence_links?: string[];
}

// ─── Booking Attempt Types ──────────────────────────────────────────────────

export interface BookingAttempt {
  booking_attempt_id: string;
  clinic_id: string;
  clinic_name?: string;
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  message?: string;
  status: string;
  created_at: string;
}

export interface BookingAttemptRequest {
  visitor_name: string;
  visitor_email?: string;
  visitor_phone?: string;
  message?: string;
}

// ─── Featured Listing Types ─────────────────────────────────────────────────

export interface FeaturedListing {
  listing_id: string;
  clinic_id: string;
  clinic_name?: string;
  tier: 'premium' | 'standard';
  start_date: string;
  end_date: string;
  is_active: boolean;
  price?: number;
  created_at: string;
}

export interface CreateFeaturedListingRequest {
  clinic_id: string;
  start_date: string;
  end_date: string;
  tier: 'premium' | 'standard';
  price?: number;
}

export interface UpdateFeaturedListingRequest {
  tier?: 'premium' | 'standard';
  end_date?: string;
  is_active?: boolean;
}

// ─── Correction Types ───────────────────────────────────────────────────────

export interface Correction {
  correction_id: string;
  clinic_id: string;
  clinic_name?: string;
  correction_type: string;
  description: string;
  email?: string;
  phone?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at?: string;
  reviewed_by?: string;
  action_taken?: string;
  notes?: string;
  submitted_at: string;
}

export interface CorrectionRequest {
  correction_type: string;
  description: string;
  email?: string;
  phone?: string;
}

export interface CorrectionReviewRequest {
  decision: 'approve' | 'reject';
  action_taken?: string;
  notes?: string;
}

// ─── Outreach Types ─────────────────────────────────────────────────────────

export interface OutreachTrigger {
  id: string;
  trigger_type: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface SendOutreachRequest {
  trigger_type: string;
  recipient_email: string;
  custom_message?: string;
}
