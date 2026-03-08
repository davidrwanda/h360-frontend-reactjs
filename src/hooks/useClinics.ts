import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clinicsApi,
  type CreateClinicRequest,
  type UpdateClinicRequest,
  type ClinicListParams,
  type OrgClinicListParams,
  type NearestClinicsParams,
  type TimetableSlotInput,
  type InitializeTimetableRequest,
} from '@/api/clinics';
import type { UpdateTenantSettingsRequest } from '@/types/organization';

// ─── Clinic Queries ───────────────────────────────────────────────────────────

export const useClinics = (params?: ClinicListParams) => {
  return useQuery({
    queryKey: ['clinics', 'list', params],
    queryFn: () => clinicsApi.list(params),
    staleTime: 30_000,
  });
};

/** ORG_OWNER scoped: GET /api/organizations/:id/clinics (ISD §3) */
export const useOrgClinics = (orgId: string | undefined, params?: OrgClinicListParams) => {
  return useQuery({
    queryKey: ['clinics', 'org', orgId, params],
    queryFn: () => clinicsApi.listByOrganization(orgId!, params),
    enabled: !!orgId,
    staleTime: 30_000,
  });
};

export const useClinic = (id: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', id],
    queryFn: () => clinicsApi.getById(id!),
    enabled: !!id,
  });
};

export const useDeletedClinics = (params?: ClinicListParams) => {
  return useQuery({
    queryKey: ['clinics', 'deleted', params],
    queryFn: () => clinicsApi.listDeleted(params),
    staleTime: 30_000,
  });
};

export const useNearestClinics = (params: NearestClinicsParams | undefined) => {
  return useQuery({
    queryKey: ['clinics', 'nearest', params],
    queryFn: () => clinicsApi.nearest(params!),
    enabled: !!params?.latitude && !!params?.longitude,
    staleTime: 60_000,
  });
};

// ─── Clinic Mutations ─────────────────────────────────────────────────────────

export const useCreateClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClinicRequest) => clinicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
};

export const useUpdateClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClinicRequest }) =>
      clinicsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', id] });
    },
  });
};

export const useDeleteClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', 'deleted'] });
    },
  });
};

export const useDeactivateClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicsApi.update(id, { is_active: false }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', id] });
    },
  });
};

export const useActivateClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicsApi.update(id, { is_active: true }),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', id] });
    },
  });
};

// ─── Tenant ───────────────────────────────────────────────────────────────────

export const useTenantInfo = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'tenant-info'],
    queryFn: () => clinicsApi.getTenantInfo(clinicId!),
    enabled: !!clinicId,
  });
};

export const useUpdateTenantSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: UpdateTenantSettingsRequest }) =>
      clinicsApi.updateTenantSettings(clinicId, data),
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', clinicId, 'tenant-info'] });
    },
  });
};

// ─── Timetable ────────────────────────────────────────────────────────────────

export const useTimetableSlots = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'timetable'],
    queryFn: () => clinicsApi.listTimetableSlots(clinicId!),
    enabled: !!clinicId,
  });
};

export const useInitializeTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: InitializeTimetableRequest }) =>
      clinicsApi.initializeTimetable(clinicId, data),
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', clinicId, 'timetable'] });
    },
  });
};

export const useAddTimetableSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data: TimetableSlotInput }) =>
      clinicsApi.addTimetableSlot(clinicId, data),
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', clinicId, 'timetable'] });
    },
  });
};

export const useUpdateTimetableSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      clinicId,
      slotId,
      data,
    }: {
      clinicId: string;
      slotId: string;
      data: Partial<TimetableSlotInput>;
    }) => clinicsApi.updateTimetableSlot(clinicId, slotId, data),
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', clinicId, 'timetable'] });
    },
  });
};

export const useDeleteTimetableSlot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, slotId }: { clinicId: string; slotId: string }) =>
      clinicsApi.deleteTimetableSlot(clinicId, slotId),
    onSuccess: (_, { clinicId }) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', clinicId, 'timetable'] });
    },
  });
};

// ─── FHIR ─────────────────────────────────────────────────────────────────────

export const useClinicFhirStatus = (clinicId: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'fhir-status'],
    queryFn: () => clinicsApi.getFhirStatus(clinicId!),
    enabled: !!clinicId,
  });
};

export const useValidateClinicFhir = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clinicId: string) => clinicsApi.validateFhir(clinicId),
    onSuccess: (_, clinicId) => {
      queryClient.invalidateQueries({ queryKey: ['clinics', clinicId, 'fhir-status'] });
    },
  });
};
