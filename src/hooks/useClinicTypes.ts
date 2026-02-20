import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicTypesApi, type ClinicTypeListParams, type CreateClinicTypeRequest, type UpdateClinicTypeRequest } from '@/api/clinicTypes';

/**
 * Hook to fetch clinic types list
 * Public endpoint - no authentication required
 */
export const useClinicTypes = (params?: ClinicTypeListParams) => {
  return useQuery({
    queryKey: ['clinic-types', 'list', params],
    queryFn: () => clinicTypesApi.list(params),
    staleTime: 300000, // 5 minutes - clinic types don't change often
  });
};

/**
 * Hook to fetch a single clinic type by ID
 * Public endpoint - no authentication required
 */
export const useClinicType = (id: string | undefined) => {
  return useQuery({
    queryKey: ['clinic-types', id],
    queryFn: () => clinicTypesApi.getById(id!),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to create a new clinic type
 * Admin access required
 */
export const useCreateClinicType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClinicTypeRequest) => clinicTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-types'] });
    },
  });
};

/**
 * Hook to update a clinic type
 * Admin access required
 */
export const useUpdateClinicType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClinicTypeRequest }) =>
      clinicTypesApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clinic-types'] });
      queryClient.invalidateQueries({ queryKey: ['clinic-types', variables.id] });
    },
  });
};

/**
 * Hook to deactivate (soft delete) a clinic type
 * Admin access required
 */
export const useDeleteClinicType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clinicTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-types'] });
    },
  });
};
