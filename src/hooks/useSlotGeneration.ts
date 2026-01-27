import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  slotsApi,
  type GenerateSlotsRequest,
  type RegenerateFutureSlotsRequest,
} from '@/api/slots';

/**
 * Hook to generate slots manually
 */
export const useGenerateSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateSlotsRequest) => slotsApi.generate(data),
    onSuccess: () => {
      // Invalidate slots queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};

/**
 * Hook to regenerate future slots
 */
export const useRegenerateFutureSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegenerateFutureSlotsRequest) => slotsApi.regenerateFuture(data),
    onSuccess: () => {
      // Invalidate slots queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['slots'] });
    },
  });
};
