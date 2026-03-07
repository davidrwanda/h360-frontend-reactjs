import apiClient from './client';
import { extractResponseData, wrapRequest } from '@/types/api';
import type { PaginationMeta } from '@/types/api';
import type {
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationListParams,
  OrganizationMember,
  InviteMemberRequest,
  UpdateMemberRequest,
  OrgMemberListParams,
  UpdateOrgSettingsRequest,
  OrgSettingsWithInheritance,
  TransferOwnershipRequest,
  TransferOwnershipResponse,
  OrgAnalyticsParams,
  OrgAnalytics,
  ClinicsComparisonParams,
  ClinicsComparison,
  OrgBillingParams,
  OrgBillingSummary,
  OrgInvoiceListParams,
  OrgInvoice,
  UpdatePaymentMethodRequest,
  UpdatePaymentMethodResponse,
} from '@/types/organization';

interface PaginatedOrganizations {
  data: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedMembers {
  data: OrganizationMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedInvoices {
  data: OrgInvoice[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function extractPaginated<T>(responseData: unknown): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  if (responseData && typeof responseData === 'object' && 'meta' in responseData) {
    const envelope = responseData as { data: T[]; meta: { pagination?: PaginationMeta } };
    const p = envelope.meta?.pagination;
    if (p) {
      return { data: envelope.data, total: p.total, page: p.page, limit: p.limit, totalPages: p.total_pages };
    }
  }
  return extractResponseData(responseData);
}

function extractPaginatedOrgs(responseData: unknown): PaginatedOrganizations {
  return extractPaginated<Organization>(responseData);
}

function extractPaginatedMembers(responseData: unknown): PaginatedMembers {
  return extractPaginated<OrganizationMember>(responseData);
}

function extractPaginatedInvoices(responseData: unknown): PaginatedInvoices {
  return extractPaginated<OrgInvoice>(responseData);
}

export const organizationsApi = {
  /** POST /api/organizations — Create Organization (Auth: SYSTEM) */
  create: async (data: CreateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.post('/organizations', wrapRequest(data));
    return extractResponseData<Organization>(response.data);
  },

  /** GET /api/organizations — List Organizations (Auth: SYSTEM, paginated) */
  list: async (params?: OrganizationListParams): Promise<PaginatedOrganizations> => {
    const response = await apiClient.get('/organizations', { params });
    return extractPaginatedOrgs(response.data);
  },

  /** GET /api/organizations/:id — Get Organization (Auth: SYSTEM, ORG_OWNER) */
  getById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get(`/organizations/${id}`);
    return extractResponseData<Organization>(response.data);
  },

  /** PATCH /api/organizations/:id — Update Organization (Auth: SYSTEM, ORG_OWNER) */
  update: async (id: string, data: UpdateOrganizationRequest): Promise<Organization> => {
    const response = await apiClient.patch(`/organizations/${id}`, wrapRequest(data));
    return extractResponseData<Organization>(response.data);
  },

  /** DELETE /api/organizations/:id — Deactivate Organization (Auth: SYSTEM) */
  deactivate: async (id: string): Promise<{ id: string; is_active: boolean }> => {
    const response = await apiClient.delete(`/organizations/${id}`);
    return extractResponseData<{ id: string; is_active: boolean }>(response.data);
  },

  /** POST /api/organizations/:id/clinics — Add Clinic to Organization */
  addClinic: async (orgId: string, clinicId: string): Promise<{ clinic_id: string; organization_id: string; inherited_plan?: string }> => {
    const response = await apiClient.post(`/organizations/${orgId}/clinics`, wrapRequest({ clinic_id: clinicId }));
    return extractResponseData(response.data);
  },

  /** DELETE /api/organizations/:id/clinics/:clinicId — Remove Clinic from Organization */
  removeClinic: async (orgId: string, clinicId: string): Promise<{ clinic_id: string; organization_id: string }> => {
    const response = await apiClient.delete(`/organizations/${orgId}/clinics/${clinicId}`);
    return extractResponseData(response.data);
  },

  // ─── Members ────────────────────────────────────────────────────────────────

  /** POST /api/organizations/:id/members — Invite Member to Organization */
  inviteMember: async (orgId: string, data: InviteMemberRequest): Promise<OrganizationMember> => {
    const response = await apiClient.post(`/organizations/${orgId}/members`, wrapRequest(data));
    return extractResponseData<OrganizationMember>(response.data);
  },

  /** GET /api/organizations/:id/members — List Organization Members */
  listMembers: async (orgId: string, params?: OrgMemberListParams): Promise<PaginatedMembers> => {
    const response = await apiClient.get(`/organizations/${orgId}/members`, { params });
    return extractPaginatedMembers(response.data);
  },

  /** PATCH /api/organizations/:id/members/:memberId — Update Member Role */
  updateMember: async (orgId: string, memberId: string, data: UpdateMemberRequest): Promise<OrganizationMember> => {
    const response = await apiClient.patch(`/organizations/${orgId}/members/${memberId}`, wrapRequest(data));
    return extractResponseData<OrganizationMember>(response.data);
  },

  /** DELETE /api/organizations/:id/members/:memberId — Remove Member from Organization */
  removeMember: async (orgId: string, memberId: string): Promise<{ id: string; user_id: string; organization_id: string; removed: boolean }> => {
    const response = await apiClient.delete(`/organizations/${orgId}/members/${memberId}`);
    return extractResponseData(response.data);
  },

  /** POST /api/organizations/:id/members/:memberId/resend-invitation — Resend Invitation */
  resendInvitation: async (orgId: string, memberId: string): Promise<{ id: string; email: string; status: string; expires_at: string; resent_at: string }> => {
    const response = await apiClient.post(`/organizations/${orgId}/members/${memberId}/resend-invitation`, wrapRequest({}));
    return extractResponseData(response.data);
  },

  // ─── Settings ───────────────────────────────────────────────────────────────

  /** GET /api/organizations/:id/settings — Get Organization Settings */
  getSettings: async (orgId: string): Promise<OrgSettingsWithInheritance> => {
    const response = await apiClient.get(`/organizations/${orgId}/settings`);
    return extractResponseData<OrgSettingsWithInheritance>(response.data);
  },

  /** PATCH /api/organizations/:id/settings — Update Organization Settings */
  updateSettings: async (orgId: string, data: UpdateOrgSettingsRequest): Promise<OrgSettingsWithInheritance> => {
    const response = await apiClient.patch(`/organizations/${orgId}/settings`, wrapRequest(data));
    return extractResponseData<OrgSettingsWithInheritance>(response.data);
  },

  // ─── Ownership Transfer ─────────────────────────────────────────────────────

  /** POST /api/organizations/:id/transfer-ownership — Transfer Organization Ownership */
  transferOwnership: async (orgId: string, data: TransferOwnershipRequest): Promise<TransferOwnershipResponse> => {
    const response = await apiClient.post(`/organizations/${orgId}/transfer-ownership`, wrapRequest(data));
    return extractResponseData<TransferOwnershipResponse>(response.data);
  },

  // ─── Analytics ──────────────────────────────────────────────────────────────

  /** GET /api/organizations/:id/analytics — Get Organization Analytics Dashboard */
  getAnalytics: async (orgId: string, params?: OrgAnalyticsParams): Promise<OrgAnalytics> => {
    const response = await apiClient.get(`/organizations/${orgId}/analytics`, { params });
    return extractResponseData<OrgAnalytics>(response.data);
  },

  /** GET /api/organizations/:id/analytics/clinics-comparison — Compare Clinics Performance */
  getClinicsComparison: async (orgId: string, params?: ClinicsComparisonParams): Promise<ClinicsComparison> => {
    const response = await apiClient.get(`/organizations/${orgId}/analytics/clinics-comparison`, { params });
    return extractResponseData<ClinicsComparison>(response.data);
  },

  // ─── Billing ────────────────────────────────────────────────────────────────

  /** GET /api/organizations/:id/billing — Get Organization Billing Summary */
  getBilling: async (orgId: string, params?: OrgBillingParams): Promise<OrgBillingSummary> => {
    const response = await apiClient.get(`/organizations/${orgId}/billing`, { params });
    return extractResponseData<OrgBillingSummary>(response.data);
  },

  /** GET /api/organizations/:id/billing/invoices — List Organization Invoices */
  listInvoices: async (orgId: string, params?: OrgInvoiceListParams): Promise<PaginatedInvoices> => {
    const response = await apiClient.get(`/organizations/${orgId}/billing/invoices`, { params });
    return extractPaginatedInvoices(response.data);
  },

  /** PATCH /api/organizations/:id/billing/payment-method — Update Organization Default Payment Method */
  updatePaymentMethod: async (orgId: string, data: UpdatePaymentMethodRequest): Promise<UpdatePaymentMethodResponse> => {
    const response = await apiClient.patch(`/organizations/${orgId}/billing/payment-method`, wrapRequest(data));
    return extractResponseData<UpdatePaymentMethodResponse>(response.data);
  },
};
