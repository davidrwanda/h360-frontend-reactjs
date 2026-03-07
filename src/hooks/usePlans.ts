import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plansApi } from '@/api/plans';
import type { CreatePlanRequest, UpdatePlanRequest, PlanListParams } from '@/types/organization';

export const usePlans = (params?: PlanListParams) => {
  return useQuery({
    queryKey: ['plans', params],
    queryFn: () => plansApi.list(params),
  });
};

export const usePlan = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => plansApi.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => plansApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
      plansApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plan', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
};
