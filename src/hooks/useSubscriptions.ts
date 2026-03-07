import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi } from '@/api/subscriptions';
import type {
  CreateSubscriptionRequest,
  UpgradeSubscriptionRequest,
  CancelSubscriptionRequest,
} from '@/types/organization';

export const useClinicSubscription = (clinicId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['subscription', 'clinic', clinicId],
    queryFn: () => subscriptionsApi.getByClinic(clinicId),
    enabled: !!clinicId && (options?.enabled !== false),
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSubscriptionRequest) => subscriptionsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', 'clinic', variables.clinic_id] });
    },
  });
};

export const useUpgradeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpgradeSubscriptionRequest }) =>
      subscriptionsApi.upgrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelSubscriptionRequest }) =>
      subscriptionsApi.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useReactivateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.reactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
};

export const useCheckPlanLimit = (clinicId: string, resource: string, count?: number) => {
  return useQuery({
    queryKey: ['subscription', 'limit-check', clinicId, resource, count],
    queryFn: () => subscriptionsApi.checkLimit(clinicId, resource, count),
    enabled: !!clinicId && !!resource,
  });
};
