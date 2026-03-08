// ─── Organization Types (ISD §1.2) ──────────────────────────────────────────

export type OrganizationType = 'single_clinic' | 'multi_branch' | 'health_network';

export interface OrganizationAddress {
  line1?: string;
  line2?: string;
  city?: string;
  province?: string;
  country?: string;
  postal_code?: string;
}

export interface OrganizationBranding {
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  favicon_url?: string;
}

export interface OrganizationNotifications {
  email_enabled?: boolean;
  sms_enabled?: boolean;
  sms_provider?: 'pindo' | 'twilio' | 'africas_talking';
  reminder_hours_before?: number;
  followup_days_after?: number;
}

export interface OrganizationBooking {
  allow_online_booking?: boolean;
  require_phone_verification?: boolean;
  max_advance_days?: number;
  cancellation_window_hours?: number;
  slot_duration_minutes?: number;
}

export interface OrganizationDataSharing {
  share_patients_across_clinics?: boolean;
  share_doctors_across_clinics?: boolean;
  share_services_across_clinics?: boolean;
}

export interface OrganizationSettings {
  default_language?: string;
  default_timezone?: string;
  default_currency?: string;
  branding?: OrganizationBranding;
  notifications?: OrganizationNotifications;
  booking?: OrganizationBooking;
  data_sharing?: OrganizationDataSharing;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  owner_user_id?: string;
  logo_url?: string | null;
  contact_email: string;
  contact_phone: string;
  address?: OrganizationAddress;
  settings?: OrganizationSettings;
  is_active: boolean;
  clinic_count?: number;
  clinics?: OrganizationClinic[];
  created_at: string;
  updated_at: string;
}

export interface OrganizationClinic {
  id: string;
  facility_name: string;
  is_active: boolean;
  subscription_status?: string;
  plan_name?: string;
}

export interface CreateOrganizationOwner {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  type: OrganizationType;
  contact_email: string;
  contact_phone: string;
  address?: OrganizationAddress;
  settings?: OrganizationSettings;
  owner?: CreateOrganizationOwner;
}

export interface UpdateOrganizationRequest {
  name?: string;
  type?: OrganizationType;
  contact_email?: string;
  contact_phone?: string;
  address?: OrganizationAddress;
  settings?: OrganizationSettings;
}

export interface OrganizationListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: OrganizationType;
  is_active?: boolean;
}

// ─── Plan Types (ISD §1.4) ──────────────────────────────────────────────────

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'quarterly' | 'annual';

export interface PlanLimits {
  max_doctors: number;
  max_staff: number;
  max_appointments_per_month: number;
  max_patients: number;
  max_branches: number;
  max_services: number;
  max_sms_per_month: number;
  storage_mb: number;
}

export interface PlanFeatures {
  booking_widget: boolean;
  sms_reminders: boolean;
  email_reminders: boolean;
  queue_management: boolean;
  analytics_dashboard: boolean;
  advanced_analytics: boolean;
  api_access: boolean;
  webhooks: boolean;
  custom_roles: boolean;
  fhir_export: boolean;
  white_label: boolean;
  priority_support: boolean;
  csv_import: boolean;
  multi_language: boolean;
  payment_integration: boolean;
  audit_log_export: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  tier: PlanTier;
  description?: string;
  billing_cycle: BillingCycle;
  price: number;
  currency: string;
  trial_days: number;
  limits: PlanLimits;
  features: Partial<PlanFeatures>;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePlanRequest {
  name: string;
  tier: PlanTier;
  description?: string;
  billing_cycle: BillingCycle;
  price: number;
  currency?: string;
  trial_days?: number;
  limits: PlanLimits;
  features: Partial<PlanFeatures>;
  sort_order?: number;
}

export interface UpdatePlanRequest {
  name?: string;
  tier?: PlanTier;
  description?: string;
  billing_cycle?: BillingCycle;
  price?: number;
  currency?: string;
  trial_days?: number;
  limits?: Partial<PlanLimits>;
  features?: Partial<PlanFeatures>;
  sort_order?: number;
}

export interface PlanListParams {
  billing_cycle?: BillingCycle;
  tier?: PlanTier;
  lang?: string;
}

// ─── Subscription Types (ISD §1.4) ─────────────────────────────────────────

export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'bank_transfer' | 'manual';
export type CancelReason = 'too_expensive' | 'missing_features' | 'switching_provider' | 'closing_clinic' | 'other';

export interface Subscription {
  id: string;
  clinic_id: string;
  plan_id: string;
  plan_name?: string;
  plan_tier?: PlanTier;
  organization_id?: string;
  status: SubscriptionStatus;
  trial_start?: string | null;
  trial_end?: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at?: string | null;
  canceled_at?: string | null;
  payment_method?: PaymentMethod | null;
  payment_reference?: string | null;
  limits?: PlanLimits;
  features?: Partial<PlanFeatures>;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  clinic_id: string;
  plan_id: string;
  start_trial?: boolean;
  payment_method?: PaymentMethod;
}

export interface UpgradeSubscriptionRequest {
  plan_id: string;
  effective?: 'immediate' | 'next_period';
}

export interface CancelSubscriptionRequest {
  reason: CancelReason;
  feedback?: string;
  cancel_at?: 'immediate' | 'end_of_period';
}

export interface PlanLimitCheck {
  resource: string;
  current_usage: number;
  limit: number;
  requested: number;
  allowed: boolean;
  remaining: number;
}

export interface SubscriptionUsage {
  doctors: number;
  staff: number;
  appointments_this_month: number;
  patients: number;
  branches: number;
  services: number;
  sms_this_month: number;
  storage_mb_used: number;
}

// ─── Onboarding Types (ISD §1.5) ───────────────────────────────────────────

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';

export interface Onboarding {
  id: string;
  clinic_id: string;
  organization_id?: string;
  status: OnboardingStatus;
  current_step: number;
  completed_steps: string[];
  step_data: Record<string, unknown>;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OnboardingChecklistItem {
  id: string;
  clinic_id: string;
  user_id?: string;
  role: string;
  key: string;
  title: string;
  description?: string;
  action_url?: string;
  sort_order: number;
  is_completed: boolean;
  completed_at?: string | null;
  completed_by?: string | null;
  is_dismissed: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Organization Member Types (ISD §1.1.2) ────────────────────────────────

export type OrgMemberRole = 'ORG_OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'DOCTOR';
export type OrgMemberStatus = 'pending' | 'active' | 'suspended';

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string | null;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role: OrgMemberRole;
  clinic_ids?: string[];
  clinics?: Array<{ clinic_id: string; name: string }>;
  status: OrgMemberStatus;
  invited_by?: string;
  invitation_message?: string | null;
  expires_at?: string | null;
  joined_at?: string | null;
  invited_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InviteMemberRequest {
  email: string;
  role: OrgMemberRole;
  clinic_ids?: string[];
  message?: string;
}

export interface UpdateMemberRequest {
  role?: OrgMemberRole;
  clinic_ids?: string[];
}

export interface OrgMemberListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: OrgMemberRole;
  status?: OrgMemberStatus;
  clinic_id?: string;
}

// ─── Organization Settings Types (ISD §1.2) ────────────────────────────────

export interface UpdateOrgSettingsRequest {
  default_language?: string;
  default_timezone?: string;
  default_currency?: string;
  branding?: OrganizationBranding;
  notifications?: OrganizationNotifications;
  booking?: OrganizationBooking;
  data_sharing?: OrganizationDataSharing;
}

export interface OrgSettingsWithInheritance {
  id: string;
  settings: OrganizationSettings;
  inheritance: {
    total_clinics: number;
    inheriting_clinics: number;
    overriding_clinics: Array<{ clinic_id: string; name: string; overrides: string[] }>;
  };
}

// ─── Organization Ownership Transfer (ISD §1.2) ────────────────────────────

export interface TransferOwnershipRequest {
  new_owner_user_id: string;
  confirmation: {
    method: 'password' | 'otp';
    value: string;
  };
}

export interface TransferOwnershipResponse {
  organization_id: string;
  previous_owner: { user_id: string; email: string; new_role: string };
  new_owner: { user_id: string; email: string; role: string };
  transferred_at: string;
}

// ─── Organization Analytics Types (ISD §1.2) ───────────────────────────────

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface OrgAnalyticsParams {
  period?: AnalyticsPeriod;
  start_date?: string;
  end_date?: string;
  clinic_id?: string;
}

export interface OrgAnalyticsTrend {
  direction: 'up' | 'down' | 'flat';
  percentage: number;
  compared_to: string;
}

export interface OrgAnalytics {
  organization_id: string;
  period: { type: AnalyticsPeriod; start: string; end: string };
  overview: {
    total_clinics: number;
    active_clinics: number;
    total_staff: number;
    total_doctors: number;
    total_patients: number;
  };
  appointments: {
    total: number;
    completed: number;
    canceled: number;
    no_show: number;
    completion_rate: number;
    trend: OrgAnalyticsTrend;
  };
  patients: {
    new_registrations: number;
    active_patients: number;
    returning_rate: number;
    trend: OrgAnalyticsTrend;
  };
  revenue: {
    total: number;
    currency: string;
    by_clinic: Array<{ clinic_id: string; name: string; amount: number }>;
    trend: OrgAnalyticsTrend;
  };
  clinic_performance: Array<{
    clinic_id: string;
    name: string;
    appointments: number;
    patients: number;
    revenue: number;
    staff_count: number;
    satisfaction_score: number;
  }>;
}

export type ComparisonMetric = 'appointments' | 'patients' | 'revenue' | 'satisfaction';

export interface ClinicsComparisonParams {
  period?: AnalyticsPeriod;
  metric?: ComparisonMetric;
  clinic_ids?: string;
}

export interface ClinicsComparison {
  organization_id: string;
  metric: ComparisonMetric;
  period: string;
  clinics: Array<{
    clinic_id: string;
    name: string;
    current_value: number;
    previous_value: number;
    change_percentage: number;
    rank: number;
  }>;
  org_average: number;
  org_total: number;
}

// ─── Organization Billing Types (ISD §1.2) ─────────────────────────────────

export interface OrgBillingParams {
  include?: string;
}

export interface OrgBillingSummary {
  organization_id: string;
  organization_name: string;
  billing_summary: {
    total_monthly_cost: number;
    currency: string;
    active_subscriptions: number;
    trialing_subscriptions: number;
    next_renewal_date: string;
    next_renewal_amount: number;
  };
  subscriptions: Array<{
    subscription_id: string;
    clinic_id: string;
    clinic_name: string;
    plan_name: string;
    plan_tier: string;
    status: string;
    billing_cycle: string;
    price: number;
    currency: string;
    current_period_start: string;
    current_period_end: string;
    trial_end?: string | null;
    payment_method: string | null;
  }>;
  cost_by_plan: Array<{ plan: string; count: number; subtotal: number }>;
}

export interface OrgInvoiceListParams {
  page?: number;
  limit?: number;
  status?: 'paid' | 'pending' | 'overdue' | 'canceled';
  clinic_id?: string;
  start_date?: string;
  end_date?: string;
}

export interface OrgInvoice {
  invoice_id: string;
  invoice_number: string;
  clinic_id: string;
  clinic_name: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  billing_period_start: string;
  billing_period_end: string;
  paid_at?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  issued_at: string;
}

export interface UpdatePaymentMethodRequest {
  payment_method: PaymentMethod;
  payment_details: {
    phone_number?: string;
    account_name?: string;
    bank_name?: string;
    account_number?: string;
  };
  apply_to_all_clinics?: boolean;
}

export interface UpdatePaymentMethodResponse {
  organization_id: string;
  payment_method: PaymentMethod;
  payment_details: {
    phone_number?: string;
    account_name?: string;
  };
  clinics_updated: number;
  clinics_skipped: number;
}

// ─── Tenant Isolation Types (ISD §1.3) ─────────────────────────────────────

export interface TenantInfo {
  clinic_id: string;
  organization_id?: string;
  organization_name?: string;
  data_isolation: string;
  data_summary: {
    patients: number;
    appointments: number;
    doctors: number;
    staff: number;
    services: number;
  };
  sharing_settings: TenantSharingSettings;
}

export interface TenantSharingSettings {
  share_patient_data_within_org: boolean;
  share_analytics_within_org: boolean;
}

export interface UpdateTenantSettingsRequest {
  sharing_settings: Partial<TenantSharingSettings>;
}

// ─── Import Job Types (ISD §1.1.6) ─────────────────────────────────────────

export type ImportJobType = 'patients' | 'appointments' | 'services' | 'doctors';
export type ImportJobStatus = 'pending' | 'validating' | 'processing' | 'completed' | 'failed' | 'partial';

export interface ImportJob {
  id: string;
  clinic_id: string;
  initiated_by: string;
  type: ImportJobType;
  status: ImportJobStatus;
  file_name: string;
  file_url: string;
  total_rows: number;
  processed_rows: number;
  success_count: number;
  error_count: number;
  errors: Array<{ row: number; field: string; message: string }>;
  mapping: Record<string, string>;
  options: { skip_duplicates?: boolean; update_existing?: boolean; dry_run?: boolean };
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ─── System Admin Types (ISD §7.6) ─────────────────────────────────────────

export interface SystemAdmin {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSystemAdminRequest {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateSystemAdminRequest {
  password?: string;
  name?: string;
  is_active?: boolean;
}

export interface SystemAdminListParams {
  search?: string;
  page?: number;
  limit?: number;
  is_active?: boolean;
}
