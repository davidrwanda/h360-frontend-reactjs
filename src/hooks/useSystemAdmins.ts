import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemAdminsApi } from '@/api/system-admins';
import type {
  CreateSystemAdminRequest,
  UpdateSystemAdminRequest,
  SystemAdminListParams,
} from '@/types/organization';

export const useSystemAdmins = (params?: SystemAdminListParams) => {
  return useQuery({
    queryKey: ['system-admins', params],
    queryFn: () => systemAdminsApi.list(params),
  });
};

export const useSystemAdmin = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['system-admin', id],
    queryFn: () => systemAdminsApi.getById(id),
    enabled: !!id && (options?.enabled !== false),
  });
};

export const useCreateSystemAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSystemAdminRequest) => systemAdminsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-admins'] });
    },
  });
};

export const useUpdateSystemAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSystemAdminRequest }) =>
      systemAdminsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['system-admin', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['system-admins'] });
    },
  });
};

export const useDeactivateSystemAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => systemAdminsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-admins'] });
    },
  });
};
