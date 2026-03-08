export const DIRECTORY = {
  // Page titles
  CLINIC_DIRECTORY: 'dir.clinicDirectory',
  SEARCH_CLINICS: 'dir.searchClinics',
  CLINIC_PROFILE: 'dir.clinicProfile',
  NEARBY_CLINICS: 'dir.nearbyClinics',

  // Search
  SEARCH_PLACEHOLDER: 'dir.searchPlaceholder',
  FILTER_BY_CITY: 'dir.filterByCity',
  FILTER_BY_SERVICES: 'dir.filterByServices',
  SORT_BY: 'dir.sortBy',
  NO_RESULTS: 'dir.noResults',
  NO_RESULTS_HINT: 'dir.noResultsHint',

  // Clinic card
  PROVIDERS: 'dir.providers',
  SERVICES: 'dir.services',
  PROFILE_COMPLETENESS: 'dir.profileCompleteness',
  ONLINE_BOOKING: 'dir.onlineBooking',
  VIEW_PROFILE: 'dir.viewProfile',
  BOOK_NOW: 'dir.bookNow',

  // Claim status
  UNCLAIMED: 'dir.unclaimed',
  CLAIM_PENDING: 'dir.claimPending',
  CLAIMED: 'dir.claimed',
  VERIFIED: 'dir.verified',

  // Claim flow
  CLAIM_CLINIC: 'dir.claimClinic',
  CLAIM_DESCRIPTION: 'dir.claimDescription',
  CLAIMANT_NAME: 'dir.claimantName',
  CLAIMANT_EMAIL: 'dir.claimantEmail',
  CLAIMANT_PHONE: 'dir.claimantPhone',
  CLAIMANT_ROLE: 'dir.claimantRole',
  VERIFICATION_METHOD: 'dir.verificationMethod',
  SUBMIT_CLAIM: 'dir.submitClaim',
  VERIFY_OTP: 'dir.verifyOtp',
  RESEND_OTP: 'dir.resendOtp',
  CLAIM_SUBMITTED: 'dir.claimSubmitted',
  CLAIM_VERIFIED: 'dir.claimVerified',
  CLAIM_APPROVED: 'dir.claimApproved',
  CLAIM_REJECTED: 'dir.claimRejected',

  // Admin claims
  MANAGE_CLAIMS: 'dir.manageClaims',
  REVIEW_CLAIM: 'dir.reviewClaim',
  APPROVE: 'dir.approve',
  REJECT: 'dir.reject',
  REVIEW_NOTES: 'dir.reviewNotes',

  // Booking attempts
  BOOKING_ATTEMPTS: 'dir.bookingAttempts',
  REQUEST_BOOKING: 'dir.requestBooking',
  BOOKING_RECORDED: 'dir.bookingRecorded',

  // Featured
  FEATURED_CLINICS: 'dir.featuredClinics',
  MANAGE_FEATURED: 'dir.manageFeatured',
  CREATE_FEATURED: 'dir.createFeatured',
  LISTING_TIER: 'dir.listingTier',
  PREMIUM: 'dir.premium',
  STANDARD: 'dir.standard',
  FEATURED_CREATED: 'dir.featuredCreated',
  FEATURED_UPDATED: 'dir.featuredUpdated',
  FEATURED_REMOVED: 'dir.featuredRemoved',

  // Corrections
  SUBMIT_CORRECTION: 'dir.submitCorrection',
  CORRECTION_TYPE: 'dir.correctionType',
  CORRECTION_SUBMITTED: 'dir.correctionSubmitted',
  MANAGE_CORRECTIONS: 'dir.manageCorrections',
  CORRECTION_APPROVED: 'dir.correctionApproved',
  CORRECTION_REJECTED: 'dir.correctionRejected',

  // Opt-out
  OPT_OUT: 'dir.optOut',
  OPT_OUT_REASON: 'dir.optOutReason',
  OPT_OUT_SUCCESS: 'dir.optOutSuccess',

  // Outreach
  OUTREACH: 'dir.outreach',
  SEND_OUTREACH: 'dir.sendOutreach',
  OUTREACH_SENT: 'dir.outreachSent',

  // Stats
  DIRECTORY_STATS: 'dir.directoryStats',
  TOTAL_CLINICS: 'dir.totalClinics',
  UNCLAIMED_CLINICS: 'dir.unclaimedClinics',
} as const;
