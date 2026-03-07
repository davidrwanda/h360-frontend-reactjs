import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/api/onboarding';

export const useOnboarding = (clinicId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['onboarding', clinicId],
    queryFn: () => onboardingApi.getByClinic(clinicId),
    enabled: !!clinicId && (options?.enabled !== false),
  });
};

export const useStartOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, organizationId }: { clinicId: string; organizationId?: string }) =>
      onboardingApi.start(clinicId, organizationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', variables.clinicId] });
    },
  });
};

export const useSaveOnboardingStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, stepSlug, stepData }: { clinicId: string; stepSlug: string; stepData: Record<string, unknown> }) =>
      onboardingApi.saveStep(clinicId, stepSlug, stepData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', variables.clinicId] });
    },
  });
};

export const useSkipOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clinicId: string) => onboardingApi.skip(clinicId),
    onSuccess: (_, clinicId) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', clinicId] });
    },
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clinicId, data }: { clinicId: string; data?: { start_trial?: boolean; plan_id?: string } }) =>
      onboardingApi.complete(clinicId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', variables.clinicId] });
    },
  });
};

export const useOnboardingChecklist = (clinicId: string, params?: { role?: string; is_completed?: boolean }, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['checklists', clinicId, params],
    queryFn: () => onboardingApi.getChecklist(clinicId, params),
    enabled: !!clinicId && (options?.enabled !== false),
  });
};

export const useCompleteChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => onboardingApi.completeChecklistItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
};

export const useDismissChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => onboardingApi.dismissChecklistItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
    },
  });
};
