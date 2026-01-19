import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicsApi, type CreateClinicRequest, type UpdateClinicRequest, type ClinicListParams } from '@/api/clinics';

/**
 * Hook to fetch clinics list with filters and pagination
 */
export const useClinics = (params?: ClinicListParams) => {
  return useQuery({
    queryKey: ['clinics', 'list', params],
    queryFn: () => clinicsApi.list(params),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch a single clinic by ID
 */
export const useClinic = (id: string | undefined) => {
  return useQuery({
    queryKey: ['clinics', id],
    queryFn: () => clinicsApi.getById(id!),
    enabled: !!id,
  });
};

/**
 * Hook to create a new clinic
 */
export const useCreateClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClinicRequest) => clinicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
    },
  });
};

/**
 * Hook to update a clinic
 */
export const useUpdateClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClinicRequest }) =>
      clinicsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', variables.id] });
    },
  });
};

/**
 * Hook to delete/deactivate a clinic
 */
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

/**
 * Hook to deactivate a clinic (set is_active to false)
 */
export const useDeactivateClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clinicsApi.deactivate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', 'deleted'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', id] });
    },
  });
};

/**
 * Hook to activate a clinic (set is_active to true)
 */
export const useActivateClinic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clinicsApi.activate(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', 'deleted'] });
      queryClient.invalidateQueries({ queryKey: ['clinics', id] });
    },
  });
};

/**
 * Hook to fetch deactivated clinics list
 */
export const useDeletedClinics = (params?: ClinicListParams) => {
  return useQuery({
    queryKey: ['clinics', 'deleted', params],
    queryFn: () => clinicsApi.listDeleted(params),
    staleTime: 30000, // 30 seconds
  });
};
