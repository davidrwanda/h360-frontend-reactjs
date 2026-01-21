import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserListParams,
  UpdatePreferencesRequest,
  UserPreferences,
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

/**
 * Hook to fetch current user's preferences
 */
export const useMyPreferences = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['preferences', 'me'],
    queryFn: () => usersApi.getMyPreferences(),
    enabled: options?.enabled !== false,
    staleTime: 0, // Always consider data stale to ensure fresh updates
    refetchOnMount: true,
  });
};

/**
 * Hook to update current user's preferences
 */
export const useUpdateMyPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesRequest) => usersApi.updateMyPreferences(data),
    onMutate: async (newPreferences) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['preferences', 'me'] });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<UserPreferences>(['preferences', 'me']);

      // Optimistically update to the new value
      queryClient.setQueryData<UserPreferences>(['preferences', 'me'], (old) => {
        if (!old) return old;
        return { ...old, ...newPreferences };
      });

      return { previousPreferences };
    },
    onSuccess: (updatedPreferences) => {
      // Update cache with server response (this ensures all fields are correct)
      queryClient.setQueryData(['preferences', 'me'], updatedPreferences);
    },
    onError: (error, newPreferences, context) => {
      // Rollback to previous value on error
      if (context?.previousPreferences) {
        queryClient.setQueryData(['preferences', 'me'], context.previousPreferences);
      }
      console.error('Error updating preferences:', error);
      throw error;
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['preferences', 'me'] });
    },
  });
};

/**
 * Hook to fetch any user's preferences (Admin/System only)
 */
export const useUserPreferences = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => usersApi.getUserPreferences(userId),
    enabled: !!userId && (options?.enabled !== false),
  });
};

/**
 * Hook to update any user's preferences (Admin/System only)
 */
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdatePreferencesRequest }) =>
      usersApi.updateUserPreferences(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['preferences', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['preferences', 'me'] });
    },
    onError: (error) => {
      console.error('Error updating user preferences:', error);
      throw error;
    },
  });
};
