import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicAdminsApi } from '@/api/clinicAdmins';
import type {
  CreateClinicAdminRequest,
  UpdateClinicAdminRequest,
  ClinicAdminListParams,
} from '@/api/clinicAdmins';

/**
 * Hook to fetch list of clinic admins for a specific clinic
 */
export const useClinicAdmins = (
  clinicId: string,
  params?: ClinicAdminListParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['clinicAdmins', clinicId, params],
    queryFn: () => clinicAdminsApi.list(clinicId, params),
    enabled: !!clinicId && (options?.enabled !== false),
  });
};

/**
 * Hook to fetch a single clinic admin by ID
 */
export const useClinicAdmin = (clinicId: string, adminId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['clinicAdmin', clinicId, adminId],
    queryFn: () => clinicAdminsApi.getById(clinicId, adminId),
    enabled: !!clinicId && !!adminId && (options?.enabled !== false),
  });
};

/**
 * Hook for creating a new clinic admin
 */
export const useCreateClinicAdmin = (clinicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClinicAdminRequest) =>
      clinicAdminsApi.create(clinicId, data),
    onSuccess: () => {
      // Invalidate clinic admins list to refresh
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins', clinicId] });
      // Also invalidate employees list in case it's being used elsewhere
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Error creating clinic admin:', error);
      throw error;
    },
  });
};

/**
 * Hook for updating a clinic admin
 */
export const useUpdateClinicAdmin = (clinicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClinicAdminRequest }) =>
      clinicAdminsApi.update(clinicId, id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific admin and list
      queryClient.invalidateQueries({ queryKey: ['clinicAdmin', clinicId, variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins', clinicId] });
      // Also invalidate employees list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Error updating clinic admin:', error);
      throw error;
    },
  });
};

/**
 * Hook for deactivating a clinic admin
 */
export const useDeleteClinicAdmin = (clinicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clinicAdminsApi.delete(clinicId, id),
    onSuccess: (_, adminId) => {
      // Invalidate specific admin and list
      queryClient.invalidateQueries({ queryKey: ['clinicAdmin', clinicId, adminId] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins', clinicId] });
      // Also invalidate employees list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Error deactivating clinic admin:', error);
      throw error;
    },
  });
};

/**
 * Hook for activating a clinic admin
 */
export const useActivateClinicAdmin = (clinicId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      clinicAdminsApi.update(clinicId, id, { is_active: true }),
    onSuccess: (_, adminId) => {
      // Invalidate specific admin and list
      queryClient.invalidateQueries({ queryKey: ['clinicAdmin', clinicId, adminId] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins', clinicId] });
      // Also invalidate employees list
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error) => {
      console.error('Error activating clinic admin:', error);
      throw error;
    },
  });
};
