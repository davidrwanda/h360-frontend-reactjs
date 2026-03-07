import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '@/api/organizations';
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationListParams,
  InviteMemberRequest,
  UpdateMemberRequest,
  OrgMemberListParams,
  UpdateOrgSettingsRequest,
  TransferOwnershipRequest,
  OrgAnalyticsParams,
  ClinicsComparisonParams,
  OrgBillingParams,
  OrgInvoiceListParams,
  UpdatePaymentMethodRequest,
} from '@/types/organization';

// ─── Organizations CRUD ─────────────────────────────────────────────────────

export const useOrganizations = (params?: OrganizationListParams) => {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => organizationsApi.list(params),
    enabled: params !== undefined,
  });
};

export const useOrganization = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationsApi.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationRequest }) =>
      organizationsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useDeactivateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useAddClinicToOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, clinicId }: { orgId: string; clinicId: string }) =>
      organizationsApi.addClinic(orgId, clinicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useRemoveClinicFromOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, clinicId }: { orgId: string; clinicId: string }) =>
      organizationsApi.removeClinic(orgId, clinicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// ─── Organization Members ───────────────────────────────────────────────────

export const useOrgMembers = (orgId: string, params?: OrgMemberListParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', orgId, 'members', params],
    queryFn: () => organizationsApi.listMembers(orgId, params),
    enabled: !!orgId && (options?.enabled !== false),
  });
};

export const useInviteOrgMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: InviteMemberRequest }) =>
      organizationsApi.inviteMember(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'members'] });
    },
  });
};

export const useUpdateOrgMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId, data }: { orgId: string; memberId: string; data: UpdateMemberRequest }) =>
      organizationsApi.updateMember(orgId, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'members'] });
    },
  });
};

export const useRemoveOrgMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationsApi.removeMember(orgId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'members'] });
    },
  });
};

export const useResendOrgInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationsApi.resendInvitation(orgId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'members'] });
    },
  });
};

// ─── Organization Settings ──────────────────────────────────────────────────

export const useOrgSettings = (orgId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', orgId, 'settings'],
    queryFn: () => organizationsApi.getSettings(orgId),
    enabled: !!orgId && (options?.enabled !== false),
  });
};

export const useUpdateOrgSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdateOrgSettingsRequest }) =>
      organizationsApi.updateSettings(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'settings'] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId] });
    },
  });
};

// ─── Organization Ownership Transfer ────────────────────────────────────────

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: TransferOwnershipRequest }) =>
      organizationsApi.transferOwnership(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'members'] });
    },
  });
};

// ─── Organization Analytics ─────────────────────────────────────────────────

export const useOrgAnalytics = (orgId: string, params?: OrgAnalyticsParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', orgId, 'analytics', params],
    queryFn: () => organizationsApi.getAnalytics(orgId, params),
    enabled: !!orgId && (options?.enabled !== false),
  });
};

export const useOrgClinicsComparison = (orgId: string, params?: ClinicsComparisonParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', orgId, 'analytics', 'clinics-comparison', params],
    queryFn: () => organizationsApi.getClinicsComparison(orgId, params),
    enabled: !!orgId && (options?.enabled !== false),
  });
};

// ─── Organization Billing ───────────────────────────────────────────────────

export const useOrgBilling = (orgId: string, params?: OrgBillingParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', orgId, 'billing', params],
    queryFn: () => organizationsApi.getBilling(orgId, params),
    enabled: !!orgId && (options?.enabled !== false),
  });
};

export const useOrgInvoices = (orgId: string, params?: OrgInvoiceListParams, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['organization', orgId, 'billing', 'invoices', params],
    queryFn: () => organizationsApi.listInvoices(orgId, params),
    enabled: !!orgId && (options?.enabled !== false),
  });
};

export const useUpdateOrgPaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: UpdatePaymentMethodRequest }) =>
      organizationsApi.updatePaymentMethod(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId, 'billing'] });
    },
  });
};
