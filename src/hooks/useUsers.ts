import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
} from '@/api/users';

/**
 * Hook to fetch list of users with filters
 */
export const useUsers = (params?: UserListParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.list(params),
  });
};

/**
 * Hook to fetch clinic admins (Managers)
 */
export const useClinicAdmins = (
  clinicId: string,
  params?: Omit<UserListParams, 'role' | 'clinic_id'>
) => {
  return useQuery({
    queryKey: ['clinicAdmins', clinicId, params],
    queryFn: () => usersApi.list({ ...params, role: 'Manager', clinic_id: clinicId }),
    enabled: !!clinicId,
  });
};

/**
 * Hook to fetch system admins (Admins without clinic_id - global admins only)
 */
export const useSystemAdmins = (params?: Omit<UserListParams, 'role' | 'clinic_id'>) => {
  return useQuery({
    queryKey: ['systemAdmins', { ...params, role: 'Admin' }],
    queryFn: async () => {
      // Fetch all Admins, then filter to only those without clinic_id
      const result = await usersApi.list({ ...params, role: 'Admin' });
      // Filter to only show global admins (no clinic_id)
      return {
        ...result,
        data: result.data.filter((user) => !user.clinic_id),
      };
    },
  });
};

/**
 * Hook to fetch a single user by ID
 */
export const useUser = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId),
    enabled: !!userId && (options?.enabled !== false),
  });
};

/**
 * Hook for creating a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['systemAdmins'] });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      throw error;
    },
  });
};

/**
 * Hook for updating a user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['systemAdmins'] });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      throw error;
    },
  });
};

/**
 * Hook for deactivating a user
 */
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['systemAdmins'] });
    },
    onError: (error) => {
      console.error('Error deactivating user:', error);
      throw error;
    },
  });
};

/**
 * Hook for activating a user
 */
export const useActivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['clinicAdmins'] });
      queryClient.invalidateQueries({ queryKey: ['systemAdmins'] });
    },
    onError: (error) => {
      console.error('Error activating user:', error);
      throw error;
    },
  });
};
