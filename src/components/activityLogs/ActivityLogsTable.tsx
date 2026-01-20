import { ActivityLog } from '@/api/activityLogs';
import { cn } from '@/utils/cn';
import { MdHistory, MdPerson, MdBusiness, MdInfo } from 'react-icons/md';
import { format } from 'date-fns';

interface ActivityLogsTableProps {
  logs: ActivityLog[];
  isLoading?: boolean;
  onViewDetails?: (log: ActivityLog) => void;
}

const getActionColor = (actionType: string): string => {
  const colors: Record<string, string> = {
    CREATE: 'bg-bright-halo/20 text-azure-dragon',
    UPDATE: 'bg-azure-dragon/20 text-azure-dragon-dark',
    DELETE: 'bg-smudged-lips/20 text-smudged-lips',
    ACTIVATE: 'bg-bright-halo/20 text-azure-dragon',
    DEACTIVATE: 'bg-carbon/20 text-carbon/70',
    LOGIN: 'bg-bright-halo/20 text-azure-dragon',
    LOGOUT: 'bg-carbon/20 text-carbon/70',
    VIEW: 'bg-white-smoke text-carbon/70',
    EXPORT: 'bg-azure-dragon/20 text-azure-dragon-dark',
    IMPORT: 'bg-azure-dragon/20 text-azure-dragon-dark',
    APPROVE: 'bg-bright-halo/20 text-azure-dragon',
    REJECT: 'bg-smudged-lips/20 text-smudged-lips',
    ASSIGN: 'bg-azure-dragon/20 text-azure-dragon-dark',
    UNASSIGN: 'bg-carbon/20 text-carbon/70',
    CANCEL: 'bg-smudged-lips/20 text-smudged-lips',
    RESCHEDULE: 'bg-azure-dragon/20 text-azure-dragon-dark',
    COMPLETE: 'bg-bright-halo/20 text-azure-dragon',
    TERMINATE: 'bg-smudged-lips/20 text-smudged-lips',
  };
  return colors[actionType] || 'bg-white-smoke text-carbon/70';
};

const formatActionType = (actionType: string): string => {
  return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatEntityType = (entityType: string): string => {
  return entityType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

export const ActivityLogsTable = ({
  logs,
  isLoading = false,
  onViewDetails,
}: ActivityLogsTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12">
        <MdHistory className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">No activity logs found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Timestamp</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">User</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Action</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Entity</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Entity Name</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Clinic</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">Description</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr
              key={log.log_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">
                  {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdPerson className="h-4 w-4 text-azure-dragon" />
                  <div>
                    <div className="text-sm font-medium text-carbon">
                      {log.employee_name || 'System'}
                    </div>
                    {log.employee_email && (
                      <div className="text-xs text-carbon/60">{log.employee_email}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getActionColor(log.action_type)
                  )}
                >
                  {formatActionType(log.action_type)}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">{formatEntityType(log.entity_type)}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70">
                  {log.entity_name || log.entity_id || '—'}
                </div>
              </td>
              <td className="py-3 px-4">
                {log.clinic_name ? (
                  <div className="flex items-center gap-2">
                    <MdBusiness className="h-4 w-4 text-carbon/40" />
                    <div className="text-sm text-carbon/70">{log.clinic_name}</div>
                  </div>
                ) : (
                  <div className="text-sm text-carbon/40">—</div>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-carbon/70 max-w-xs truncate">
                  {log.description || '—'}
                </div>
              </td>
              <td className="py-3 px-4">
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(log)}
                    className="ml-auto flex items-center gap-1 text-xs text-azure-dragon hover:text-azure-dragon-dark transition-colors"
                    title="View details"
                  >
                    <MdInfo className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
