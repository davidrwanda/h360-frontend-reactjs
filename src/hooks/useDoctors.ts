import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorsApi } from '@/api/doctors';
import type {
  CreateDoctorRequest,
  UpdateDoctorRequest,
  DoctorListParams,
  SubscribeDoctorRequest,
  UpdateDoctorClinicRequest,
} from '@/api/doctors';
import { useToastStore } from '@/store/toastStore';

/**
 * Hook to fetch list of doctors
 */
export const useDoctors = (params?: DoctorListParams) => {
  return useQuery({
    queryKey: ['doctors', 'list', params],
    queryFn: () => doctorsApi.list(params),
  });
};

/**
 * Hook to fetch a single doctor by ID
 */
export const useDoctor = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['doctors', id],
    queryFn: () => doctorsApi.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook to create a new doctor
 */
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (data: CreateDoctorRequest) => doctorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      showSuccess('Doctor created successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create doctor');
    },
  });
};

/**
 * Hook to update a doctor
 */
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorRequest }) =>
      doctorsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.id] });
      showSuccess('Doctor updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update doctor');
    },
  });
};

/**
 * Hook to deactivate a doctor-clinic relationship
 * Requires both doctorId and clinicId
 */
export const useDeactivateDoctor = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ doctorId, clinicId }: { doctorId: string; clinicId: string }) =>
      doctorsApi.deactivate(doctorId, clinicId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId] });
      showSuccess('Doctor-clinic relationship deactivated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to deactivate doctor-clinic relationship');
    },
  });
};

/**
 * Hook to activate a doctor
 */
export const useActivateDoctor = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => doctorsApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctors', id] });
      showSuccess('Doctor activated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to activate doctor');
    },
  });
};

/**
 * Hook to subscribe a doctor to a clinic using doctor code
 */
export const useSubscribeDoctor = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ doctorCode, data }: { doctorCode: string; data: SubscribeDoctorRequest }) =>
      doctorsApi.subscribe(doctorCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      showSuccess('Doctor subscribed to clinic successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to subscribe doctor to clinic');
    },
  });
};

/**
 * Hook to update doctor-clinic relationship
 */
export const useUpdateDoctorClinic = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({
      doctorId,
      clinicId,
      data,
    }: {
      doctorId: string;
      clinicId: string;
      data: UpdateDoctorClinicRequest;
    }) => doctorsApi.updateClinicRelationship(doctorId, clinicId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctors', variables.doctorId] });
      showSuccess('Clinic relationship updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update clinic relationship');
    },
  });
};
