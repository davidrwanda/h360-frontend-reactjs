import apiClient from './client';
import type { ApiResponse } from '@/types/auth';

export type ActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ACTIVATE'
  | 'DEACTIVATE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'VIEW'
  | 'EXPORT'
  | 'IMPORT'
  | 'APPROVE'
  | 'REJECT'
  | 'ASSIGN'
  | 'UNASSIGN'
  | 'CANCEL'
  | 'RESCHEDULE'
  | 'COMPLETE'
  | 'TERMINATE';

export type EntityType =
  | 'Patient'
  | 'Appointment'
  | 'Doctor'
  | 'Clinic'
  | 'User'
  | 'Service'
  | 'Slot'
  | 'Queue'
  | 'Timetable';

export interface ActivityLog {
  log_id: string;
  employee_id?: string | null;
  employee_name?: string;
  employee_email?: string;
  action_type: ActionType;
  entity_type: EntityType;
  entity_id?: string;
  entity_name?: string;
  clinic_id?: string;
  clinic_name?: string;
  description?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
  is_system_user?: boolean;
  new_values?: Record<string, unknown>;
  request_data?: {
    url?: string;
    body?: Record<string, unknown>;
    path?: string;
    query?: Record<string, unknown>;
    method?: string;
    params?: Record<string, unknown>;
  };
  response_data?: Record<string, unknown>;
  created_at: string;
}

export interface ActivityLogListParams {
  page?: number;
  limit?: number;
  employee_id?: string;
  action_type?: ActionType;
  entity_type?: EntityType;
  entity_id?: string;
  clinic_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const activityLogsApi = {
  /**
   * Get list of activity logs with pagination and filters
   * GET /api/activity-logs
   * Access: Admin, Manager
   */
  list: async (params?: ActivityLogListParams): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ActivityLog>> | PaginatedResponse<ActivityLog>
    >('/activity-logs', { params });
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<ActivityLog>>).data;
    }
    return response.data as PaginatedResponse<ActivityLog>;
  },

  /**
   * Get activity log by ID
   * GET /api/activity-logs/:id
   * Access: Admin, Manager
   */
  getById: async (id: string): Promise<ActivityLog> => {
    const response = await apiClient.get<ApiResponse<ActivityLog> | ActivityLog>(
      `/activity-logs/${id}`
    );
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<ActivityLog>).data;
    }
    return response.data as ActivityLog;
  },

  /**
   * Get activity logs for a specific entity
   * GET /api/activity-logs/entity/:entityType/:entityId
   * Access: Admin, Manager
   */
  getByEntity: async (
    entityType: EntityType,
    entityId: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResponse<ActivityLog>> => {
    const response = await apiClient.get<
      ApiResponse<PaginatedResponse<ActivityLog>> | PaginatedResponse<ActivityLog>
    >(`/activity-logs/entity/${entityType}/${entityId}`, { params });
    
    // Handle wrapped response
    if (typeof response.data === 'object' && 'success' in response.data && response.data.success) {
      return (response.data as ApiResponse<PaginatedResponse<ActivityLog>>).data;
    }
    return response.data as PaginatedResponse<ActivityLog>;
  },
};
