import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '@/api/services';
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceListParams,
  AssignDoctorToServiceRequest,
} from '@/api/services';
import { useToastStore } from '@/store/toastStore';

/**
 * Hook to fetch list of services
 */
export const useServices = (params?: ServiceListParams) => {
  return useQuery({
    queryKey: ['services', 'list', params],
    queryFn: () => servicesApi.list(params),
  });
};

/**
 * Hook to fetch a single service by ID
 */
export const useService = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => servicesApi.getById(id),
    enabled: enabled && !!id,
  });
};

/**
 * Hook to create a new service
 */
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (data: CreateServiceRequest) => servicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      showSuccess('Service created successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to create service');
    },
  });
};

/**
 * Hook to update a service
 */
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      servicesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', variables.id] });
      showSuccess('Service updated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update service');
    },
  });
};

/**
 * Hook to deactivate a service
 */
export const useDeactivateService = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => servicesApi.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', id] });
      showSuccess('Service deactivated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to deactivate service');
    },
  });
};

/**
 * Hook to activate a service
 */
export const useActivateService = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => servicesApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['services', id] });
      showSuccess('Service activated successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to activate service');
    },
  });
};

/**
 * Hook to assign a doctor to a service
 */
export const useAssignDoctorToService = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ serviceId, data }: { serviceId: string; data: AssignDoctorToServiceRequest }) =>
      servicesApi.assignDoctor(serviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services', variables.serviceId, 'doctors'] });
      queryClient.invalidateQueries({ queryKey: ['services', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services', 'doctors', variables.data.doctor_id] });
      showSuccess('Doctor assigned to service successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to assign doctor to service');
    },
  });
};

/**
 * Hook to remove a doctor from a service
 */
export const useRemoveDoctorFromService = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ serviceId, doctorId }: { serviceId: string; doctorId: string }) =>
      servicesApi.removeDoctor(serviceId, doctorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services', variables.serviceId, 'doctors'] });
      queryClient.invalidateQueries({ queryKey: ['services', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services', 'doctors', variables.doctorId] });
      showSuccess('Doctor removed from service successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to remove doctor from service');
    },
  });
};

/**
 * Hook to fetch doctors for a service
 */
export const useServiceDoctors = (serviceId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['services', serviceId, 'doctors'],
    queryFn: () => servicesApi.getServiceDoctors(serviceId),
    enabled: enabled && !!serviceId,
  });
};

/**
 * Hook to fetch services for a doctor
 */
export const useDoctorServices = (doctorId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['services', 'doctors', doctorId],
    queryFn: () => servicesApi.getDoctorServices(doctorId),
    enabled: enabled && !!doctorId,
  });
};
