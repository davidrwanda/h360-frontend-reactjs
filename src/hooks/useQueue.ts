import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queueApi } from '@/api/queue';
import type { CheckInOptions } from '@/api/queue';
import { useToastStore } from '@/store/toastStore';
import { format } from 'date-fns';

/**
 * Hook to fetch a doctor's queue with live polling
 * Defaults to today's date
 */
export const useDoctorQueue = (doctorId: string, date?: string) => {
  const today = date || format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['queue', 'doctor', doctorId, today],
    queryFn: () => queueApi.getDoctorQueue(doctorId, today),
    enabled: !!doctorId,
    refetchInterval: 30000,
  });
};

/**
 * Hook to fetch queue statistics for a doctor with live polling
 * Defaults to today as both startDate and endDate
 */
export const useQueueStats = (doctorId: string, startDate?: string, endDate?: string) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const start = startDate || today;
  const end = endDate || today;

  return useQuery({
    queryKey: ['queue', 'stats', doctorId, start, end],
    queryFn: () => queueApi.getStats(doctorId, start, end),
    enabled: !!doctorId,
    refetchInterval: 30000,
  });
};

/**
 * Hook to get queue position for a specific appointment
 */
export const useQueuePosition = (appointmentId: string) => {
  return useQuery({
    queryKey: ['queue', 'position', appointmentId],
    queryFn: () => queueApi.getPosition(appointmentId),
    enabled: !!appointmentId,
  });
};

/**
 * Hook to check in an appointment (optionally reassign doctor)
 */
export const useCheckIn = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ appointmentId, options }: { appointmentId: string; options?: CheckInOptions }) =>
      queueApi.checkIn(appointmentId, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      showSuccess('Patient checked in successfully!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to check in patient');
    },
  });
};

/**
 * Hook to update the current position for a doctor's queue
 */
export const useUpdateCurrentPosition = () => {
  const queryClient = useQueryClient();
  const { success: showSuccess, error: showError } = useToastStore();

  return useMutation({
    mutationFn: ({ doctorId, date, currentPosition }: { doctorId: string; date: string; currentPosition: number }) =>
      queueApi.updateCurrentPosition(doctorId, date, currentPosition),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['queue'] });
      showSuccess('Queue position updated!');
    },
    onError: (error: Error) => {
      showError(error.message || 'Failed to update queue position');
    },
  });
};
