import { useQuery } from '@tanstack/react-query';
import { serviceCategoriesApi } from '@/api/serviceCategories';
import type { ServiceCategoryListParams } from '@/api/serviceCategories';

/**
 * Hook to fetch list of service categories
 */
export const useServiceCategories = (params?: ServiceCategoryListParams) => {
  return useQuery({
    queryKey: ['service-categories', 'list', params],
    queryFn: () => serviceCategoriesApi.list(params),
    enabled: !!params?.clinic_id, // Only fetch if clinic_id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
