import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, type AppointmentListParams, type CreateAppointmentRequest } from '@/api/appointments';

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

/**
 * Hook to fetch appointments for a specific patient
 */
export const usePatientAppointments = (patientId: string, params?: AppointmentListParams) => {
  return useQuery({
    queryKey: ['appointments', 'patient', patientId, params],
    queryFn: () => appointmentsApi.getByPatientId(patientId, params),
    enabled: !!patientId,
  });
};

/**
 * Hook to create a new appointment
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};
