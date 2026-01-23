import { useQuery } from '@tanstack/react-query';
import { clinicTypesApi, type ClinicTypeListParams } from '@/api/clinicTypes';

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
