import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  clinicTypesApi,
  type ClinicTypeListParams,
  type CreateClinicTypeRequest,
  type UpdateClinicTypeRequest,
} from '@/api/clinic-types';

export const useClinicTypes = (params?: ClinicTypeListParams) => {
  return useQuery({
    queryKey: ['clinic-types', params],
    queryFn: () => clinicTypesApi.list(params),
    staleTime: 5 * 60_000,
  });
};

export const useClinicType = (id: string | undefined) => {
  return useQuery({
    queryKey: ['clinic-types', id],
    queryFn: () => clinicTypesApi.getById(id!),
    enabled: !!id,
  });
};

export const useCreateClinicType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClinicTypeRequest) => clinicTypesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-types'] });
    },
  });
};

export const useUpdateClinicType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClinicTypeRequest }) =>
      clinicTypesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-types'] });
    },
  });
};

export const useDeactivateClinicType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicTypesApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic-types'] });
    },
  });
};
