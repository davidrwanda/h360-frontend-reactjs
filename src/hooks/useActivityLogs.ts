import { useQuery } from '@tanstack/react-query';
import { activityLogsApi } from '@/api/activityLogs';
import type {
  ActivityLogListParams,
  EntityType,
} from '@/api/activityLogs';

/**
 * Hook to fetch list of activity logs with filters
 */
export const useActivityLogs = (params?: ActivityLogListParams) => {
  return useQuery({
    queryKey: ['activityLogs', params],
    queryFn: () => activityLogsApi.list(params),
  });
};

/**
 * Hook to fetch a single activity log by ID
 */
export const useActivityLog = (logId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['activityLog', logId],
    queryFn: () => activityLogsApi.getById(logId),
    enabled: !!logId && (options?.enabled !== false),
  });
};

/**
 * Hook to fetch activity logs for a specific entity
 */
export const useEntityActivityLogs = (
  entityType: EntityType | string,
  entityId: string,
  params?: { page?: number; limit?: number },
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['entityActivityLogs', entityType, entityId, params],
    queryFn: () => activityLogsApi.getByEntity(entityType as EntityType, entityId, params),
    enabled: !!entityType && !!entityId && (options?.enabled !== false),
  });
};
