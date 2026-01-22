import { useQuery } from '@tanstack/react-query';
import { doctorSpecialtiesApi } from '@/api/doctorSpecialties';
import type { DoctorSpecialtyListParams } from '@/api/doctorSpecialties';

/**
 * Hook to fetch list of doctor specialties
 */
export const useDoctorSpecialties = (params?: DoctorSpecialtyListParams) => {
  return useQuery({
    queryKey: ['doctor-specialties', 'list', params],
    queryFn: () => doctorSpecialtiesApi.list(params),
    enabled: !!params?.clinic_id, // Only fetch if clinic_id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
