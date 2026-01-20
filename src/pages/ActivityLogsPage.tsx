import { useState } from 'react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useUsers } from '@/hooks/useUsers';
import { useClinics } from '@/hooks/useClinics';
import { ActivityLogsTable } from '@/components/activityLogs/ActivityLogsTable';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  Modal,
} from '@/components/ui';
import {
  MdSearch,
  MdFilterList,
  MdClear,
  MdDownload,
  MdCalendarToday,
} from 'react-icons/md';
import type { ActivityLog, ActionType, EntityType } from '@/api/activityLogs';
import { format } from 'date-fns';

const ACTION_TYPES: { value: ActionType | ''; label: string }[] = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'ACTIVATE', label: 'Activate' },
  { value: 'DEACTIVATE', label: 'Deactivate' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'VIEW', label: 'View' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'ASSIGN', label: 'Assign' },
  { value: 'UNASSIGN', label: 'Unassign' },
  { value: 'CANCEL', label: 'Cancel' },
  { value: 'RESCHEDULE', label: 'Reschedule' },
  { value: 'COMPLETE', label: 'Complete' },
  { value: 'TERMINATE', label: 'Terminate' },
];

const ENTITY_TYPES: { value: EntityType | ''; label: string }[] = [
  { value: '', label: 'All Entities' },
  { value: 'Patient', label: 'Patient' },
  { value: 'Appointment', label: 'Appointment' },
  { value: 'Doctor', label: 'Doctor' },
  { value: 'Clinic', label: 'Clinic' },
  { value: 'User', label: 'User' },
  { value: 'Service', label: 'Service' },
  { value: 'Slot', label: 'Slot' },
  { value: 'Queue', label: 'Queue' },
  { value: 'Timetable', label: 'Timetable' },
];

export const ActivityLogsPage = () => {
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState<ActionType | ''>('');
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  const [employeeId, setEmployeeId] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const limit = 50;

  // Fetch users for employee filter
  const { data: usersData } = useUsers({ limit: 100, is_active: true });
  
  // Fetch clinics for clinic filter
  const { data: clinicsData } = useClinics({ limit: 100, is_active: true });

  // Fetch activity logs
  const { data: logsData, isLoading, error } = useActivityLogs({
    page,
    limit,
    search: search || undefined,
    action_type: actionType || undefined,
    entity_type: entityType || undefined,
    employee_id: employeeId || undefined,
    clinic_id: clinicId || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const hasActiveFilters =
    search ||
    actionType ||
    entityType ||
    employeeId ||
    clinicId ||
    startDate ||
    endDate;

  const handleClearFilters = () => {
    setSearch('');
    setActionType('');
    setEntityType('');
    setEmployeeId('');
    setClinicId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleExport = () => {
    if (!logsData || !logsData.data || logsData.data.length === 0) {
      alert('No activity logs to export');
      return;
    }

    // Fetch all logs with current filters (without pagination limit)
    // For now, export current page data. In production, you might want to fetch all matching logs
    const logsToExport = logsData.data;

    // Convert to CSV format
    const headers = [
      'Timestamp',
      'User',
      'Email',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Name',
      'Clinic',
      'Description',
      'IP Address',
      'User Agent',
    ];

    const csvRows = [
      headers.join(','),
      ...logsToExport.map((log) => {
        const row = [
          format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
          log.employee_name || 'System',
          log.employee_email || '',
          log.action_type,
          log.entity_type,
          log.entity_id || '',
          log.entity_name || '',
          log.clinic_name || '',
          log.description ? `"${log.description.replace(/"/g, '""')}"` : '',
          log.ip_address || '',
          log.user_agent ? `"${log.user_agent.replace(/"/g, '""')}"` : '',
        ];
        return row.join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Generate filename with current date and filters
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const filterStr = [
      actionType && `action-${actionType}`,
      entityType && `entity-${entityType}`,
      startDate && `from-${startDate}`,
      endDate && `to-${endDate}`,
    ]
      .filter(Boolean)
      .join('_');
    const filename = `activity-logs_${dateStr}${filterStr ? `_${filterStr}` : ''}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
  };

  const formatJSON = (data?: Record<string, unknown> | null): string => {
    if (!data || Object.keys(data).length === 0) return 'No data available';
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-1">
            Activity Logs
          </h1>
          <p className="text-sm text-carbon/60">
            Monitor and track all system activities and user actions
          </p>
        </div>
        <Button variant="outline" size="md" onClick={handleExport}>
          <MdDownload className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-4 w-4" />
              Filters & Search
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
                  <MdClear className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Input
                label="Search"
                placeholder="Search by description, entity name..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>
            <Select
              label="Action Type"
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value as ActionType | '');
                setPage(1);
              }}
              options={ACTION_TYPES.map((opt) => ({ value: opt.value, label: opt.label }))}
            />
            <Select
              label="Entity Type"
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as EntityType | '');
                setPage(1);
              }}
              options={ENTITY_TYPES.map((opt) => ({ value: opt.value, label: opt.label }))}
            />
          </div>

          {showAdvancedFilters && (
            <div className="mt-4 grid gap-4 md:grid-cols-4 border-t border-carbon/10 pt-4">
              <Select
                label="User"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Users' },
                  ...(usersData?.data.map((user) => ({
                    value: user.employee_id,
                    label: `${user.first_name} ${user.last_name}`,
                  })) || []),
                ]}
              />
              <Select
                label="Clinic"
                value={clinicId}
                onChange={(e) => {
                  setClinicId(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Clinics' },
                  ...(clinicsData?.data.map((clinic) => ({
                    value: clinic.clinic_id,
                    label: clinic.name,
                  })) || []),
                ]}
              />
              <div className="relative">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                />
                <MdCalendarToday className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
              </div>
              <div className="relative">
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                />
                <MdCalendarToday className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            Activity Logs ({logsData?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">
                Failed to load activity logs. Please try again.
              </p>
            </div>
          )}

          <ActivityLogsTable
            logs={logsData?.data || []}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />

          {/* Pagination */}
          {logsData && logsData.total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-carbon/60">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, logsData.total)} of{' '}
                {logsData.total} logs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= logsData.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title="Activity Log Details"
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-carbon mb-3">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">Timestamp</label>
                  <p className="text-sm text-carbon">
                    {format(new Date(selectedLog.created_at), 'PPpp')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">User</label>
                  <p className="text-sm text-carbon">
                    {selectedLog.employee_name || 'System'}
                    {selectedLog.is_system_user && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-azure-dragon/20 text-azure-dragon rounded">
                        SYSTEM
                      </span>
                    )}
                    {selectedLog.employee_email && (
                      <span className="text-carbon/60 ml-2">({selectedLog.employee_email})</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">Action</label>
                  <p className="text-sm text-carbon">{selectedLog.action_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">Entity Type</label>
                  <p className="text-sm text-carbon">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">Entity ID</label>
                  <p className="text-sm text-carbon font-mono text-xs break-all">{selectedLog.entity_id || '—'}</p>
                </div>
                {selectedLog.clinic_id && (
                  <div>
                    <label className="block text-xs font-medium text-carbon/60 mb-1">Clinic ID</label>
                    <p className="text-sm text-carbon font-mono text-xs break-all">{selectedLog.clinic_id}</p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <label className="block text-xs font-medium text-carbon/60 mb-1">IP Address</label>
                    <p className="text-sm text-carbon font-mono">{selectedLog.ip_address}</p>
                  </div>
                )}
                {selectedLog.user_agent && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-carbon/60 mb-1">User Agent</label>
                    <p className="text-sm text-carbon text-xs break-words">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedLog.description && (
              <div>
                <label className="block text-xs font-medium text-carbon/60 mb-1">Description</label>
                <p className="text-sm text-carbon">{selectedLog.description}</p>
              </div>
            )}

            {/* Request Data */}
            {selectedLog.request_data && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">Request Data</h3>
                <div className="space-y-3">
                  <div className="grid gap-2">
                    {selectedLog.request_data.method && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-carbon/60">Method:</span>
                        <span className="text-xs px-2 py-0.5 bg-azure-dragon/20 text-azure-dragon rounded font-medium">
                          {selectedLog.request_data.method}
                        </span>
                      </div>
                    )}
                    {selectedLog.request_data.url && (
                      <div>
                        <span className="text-xs font-medium text-carbon/60">URL:</span>
                        <p className="text-xs text-carbon font-mono mt-1 break-all bg-white-smoke p-2 rounded">
                          {selectedLog.request_data.url}
                        </p>
                      </div>
                    )}
                    {selectedLog.request_data.path && (
                      <div>
                        <span className="text-xs font-medium text-carbon/60">Path:</span>
                        <p className="text-xs text-carbon font-mono mt-1 bg-white-smoke p-2 rounded">
                          {selectedLog.request_data.path}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedLog.request_data.body && Object.keys(selectedLog.request_data.body).length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">Request Body</label>
                      <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-64 border border-carbon/10">
                        {formatJSON(selectedLog.request_data.body)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.request_data.query && Object.keys(selectedLog.request_data.query).length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">Query Parameters</label>
                      <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-48 border border-carbon/10">
                        {formatJSON(selectedLog.request_data.query)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.request_data.params && Object.keys(selectedLog.request_data.params).length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">Path Parameters</label>
                      <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-48 border border-carbon/10">
                        {formatJSON(selectedLog.request_data.params)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Response Data */}
            {selectedLog.response_data && Object.keys(selectedLog.response_data).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">Response Data</h3>
                <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-96 border border-carbon/10">
                  {formatJSON(selectedLog.response_data)}
                </pre>
              </div>
            )}

            {/* New Values (for UPDATE actions) */}
            {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">Updated Values</h3>
                <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-96 border border-carbon/10">
                  {formatJSON(selectedLog.new_values)}
                </pre>
              </div>
            )}

            {/* Metadata (fallback) */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">Metadata</h3>
                <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-48 border border-carbon/10">
                  {formatJSON(selectedLog.metadata)}
                </pre>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
