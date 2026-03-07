import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, type AppointmentListParams, type CreateAppointmentRequest, type UpdateAppointmentRequest, type CheckInRequest } from '@/api/appointments';
import { useToastStore } from '@/store/toastStore';

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

/**
 * Hook to check in an appointment via appointment endpoint
 * PATCH /api/appointments/:id/check-in
 */
export const useAppointmentCheckIn = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CheckInRequest }) =>
      appointmentsApi.checkIn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      showSuccess('Patient checked in successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to check in patient');
    },
  });
};

/**
 * Hook to start consultation (checked_in -> in_progress)
 */
export const useStartAppointment = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      showSuccess('Consultation started!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to start consultation');
    },
  });
};

/**
 * Hook to complete appointment (in_progress -> completed)
 */
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      showSuccess('Appointment completed!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to complete appointment');
    },
  });
};

/**
 * Hook to cancel appointment (booked -> cancelled)
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      showSuccess('Appointment cancelled.');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to cancel appointment');
    },
  });
};

/**
 * Hook to mark appointment as no-show
 */
export const useNoShowAppointment = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: (id: string) => appointmentsApi.noShow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      showSuccess('Marked as no-show.');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to mark as no-show');
    },
  });
};

/**
 * Hook to update appointment details
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['slots'] });
      showSuccess('Appointment updated!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update appointment');
    },
  });
};
