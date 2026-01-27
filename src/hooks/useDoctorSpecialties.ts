import { useQuery } from '@tanstack/react-query';
import { doctorSpecialtiesApi } from '@/api/doctorSpecialties';
import type { DoctorSpecialtyListParams } from '@/api/doctorSpecialties';

/**
 * Hook to fetch list of doctor specialties (public, no auth required).
 * Always fetches; clinic_id is optional for filtering.
 */
export const useDoctorSpecialties = (params?: DoctorSpecialtyListParams) => {
  return useQuery({
    queryKey: ['doctor-specialties', 'list', params],
    queryFn: () => doctorSpecialtiesApi.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single specialty by ID (public).
 */
export const useDoctorSpecialty = (id: string | undefined) => {
  return useQuery({
    queryKey: ['doctor-specialties', 'detail', id],
    queryFn: () => doctorSpecialtiesApi.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
