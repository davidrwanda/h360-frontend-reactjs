import { useQuery } from '@tanstack/react-query';
import { departmentsApi } from '@/api/departments';

export const useDepartments = (params?: {
  clinic_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: () => departmentsApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};