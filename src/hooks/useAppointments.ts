import { useQuery } from '@tanstack/react-query';
import { appointmentsApi } from '@/api/appointments';
import type { AppointmentListParams } from '@/api/appointments';

/**
 * Hook to fetch list of appointments
 */
export const useAppointments = (params?: AppointmentListParams) => {
  return useQuery({
    queryKey: ['appointments', 'list', params],
    queryFn: () => appointmentsApi.list(params),
  });
};

/**
 * Hook to fetch a single appointment by ID
 */
export const useAppointment = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: enabled && !!id,
  });
};
