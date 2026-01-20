import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  patientsApi, 
  type CreatePatientRequest, 
  type UpdatePatientRequest, 
  type PatientListParams,
  type PatientSelfRegistrationRequest,
  type CreateAccountRequest,
  type SubscribePatientRequest,
} from '@/api/patients';

/**
 * Hook to fetch patients list with filters and pagination
 */
export const usePatients = (params?: PatientListParams) => {
  return useQuery({
    queryKey: ['patients', 'list', params],
    queryFn: () => patientsApi.list(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch a single patient by ID
 */
export const usePatient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsApi.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new patient
 */
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

/**
 * Hook to update a patient
 */
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) =>
      patientsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
    },
  });
};

/**
 * Hook to deactivate a patient (soft delete) - Global deactivation
 * Sets is_active = false system-wide, affects all clinics
 */
export const useDeactivatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsApi.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
    },
  });
};

/**
 * Hook to activate a patient - Global activation
 * Sets is_active = true system-wide, affects all clinics
 */
export const useActivatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => patientsApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
    },
  });
};

/**
 * Hook to remove patient from a specific clinic
 * Only removes PatientClinic relationship, patient remains active in other clinics
 */
export const useRemovePatientFromClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clinicId }: { id: string; clinicId: string }) =>
      patientsApi.removeFromClinic(id, clinicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
    },
  });
};

/**
 * Hook for patient self-registration (public endpoint)
 */
export const usePatientSelfRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientSelfRegistrationRequest) => patientsApi.register(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

/**
 * Hook to create account for existing patient
 */
export const useCreatePatientAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateAccountRequest }) =>
      patientsApi.createAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
    },
  });
};

/**
 * Hook to subscribe patient to clinic
 */
export const useSubscribePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubscribePatientRequest }) =>
      patientsApi.subscribe(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.id] });
    },
  });
};
