import { useQuery } from '@tanstack/react-query';
import { slotsApi } from '@/api/slots';
import type { SlotListParams, AvailableDoctorsParams } from '@/api/slots';

/**
 * Hook to fetch available appointment slots
 * 
 * Supports multiple search modes:
 * - Location-based: Provide latitude and longitude to find nearest clinics
 * - Clinic-based: Provide clinic_id to get slots for a specific clinic
 * - Doctor-based: Provide doctor_id and clinic_id for doctor-specific slots
 * - Service-based: Provide service_id to filter by service
 * - Date range: Provide dateFrom and dateTo for range queries
 */
export const useSlots = (params?: SlotListParams) => {
  return useQuery({
    queryKey: ['slots', 'list', params],
    queryFn: () => slotsApi.list(params),
    staleTime: 1 * 60 * 1000, // 1 minute - slots change frequently
    enabled: !!(
      // Enable if location-based search
      (params?.latitude !== undefined && params?.longitude !== undefined) ||
      // Or clinic-based search
      params?.clinic_id ||
      // Or doctor-based search
      params?.doctor_id ||
      // Or service-based search
      params?.service_id ||
      // Or clinic type-based search
      params?.clinic_type_id ||
      // Or date range search
      (params?.dateFrom && params?.dateTo)
    ),
  });
};

/**
 * Hook to fetch available doctors for a specific slot
 */
export const useAvailableDoctors = (params?: AvailableDoctorsParams) => {
  return useQuery({
    queryKey: ['slots', 'doctors', 'available', params],
    queryFn: () => slotsApi.getAvailableDoctors(params!),
    enabled: !!(
      params?.clinic_id &&
      params?.slot_date &&
      params?.start_time &&
      params?.end_time
    ),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};
