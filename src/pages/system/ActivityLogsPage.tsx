import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useUsers } from '@/hooks/useUsers';
import { useClinics } from '@/hooks/useClinics';
import { useTranslation, ACTIVITY_LOG } from '@/i18n';
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
import { activityLogsApi } from '@/api/activityLogs';
import type { ActivityLog, ActionType, EntityType } from '@/api/activityLogs';
import { format } from 'date-fns';

const ACTION_TYPES: { value: ActionType | ''; labelKey: string }[] = [
  { value: '', labelKey: ACTIVITY_LOG.ALL_ACTIONS },
  { value: 'CREATE', labelKey: ACTIVITY_LOG.ACTION_CREATE },
  { value: 'UPDATE', labelKey: ACTIVITY_LOG.ACTION_UPDATE },
  { value: 'DELETE', labelKey: ACTIVITY_LOG.ACTION_DELETE },
  { value: 'ACTIVATE', labelKey: ACTIVITY_LOG.ACTION_ACTIVATE },
  { value: 'DEACTIVATE', labelKey: ACTIVITY_LOG.ACTION_DEACTIVATE },
  { value: 'LOGIN', labelKey: ACTIVITY_LOG.ACTION_LOGIN },
  { value: 'LOGOUT', labelKey: ACTIVITY_LOG.ACTION_LOGOUT },
  { value: 'VIEW', labelKey: ACTIVITY_LOG.ACTION_VIEW },
  { value: 'EXPORT', labelKey: ACTIVITY_LOG.ACTION_EXPORT },
  { value: 'IMPORT', labelKey: ACTIVITY_LOG.ACTION_IMPORT },
  { value: 'APPROVE', labelKey: ACTIVITY_LOG.ACTION_APPROVE },
  { value: 'REJECT', labelKey: ACTIVITY_LOG.ACTION_REJECT },
  { value: 'ASSIGN', labelKey: ACTIVITY_LOG.ACTION_ASSIGN },
  { value: 'UNASSIGN', labelKey: ACTIVITY_LOG.ACTION_UNASSIGN },
  { value: 'CANCEL', labelKey: ACTIVITY_LOG.ACTION_CANCEL },
  { value: 'RESCHEDULE', labelKey: ACTIVITY_LOG.ACTION_RESCHEDULE },
  { value: 'COMPLETE', labelKey: ACTIVITY_LOG.ACTION_COMPLETE },
  { value: 'TERMINATE', labelKey: ACTIVITY_LOG.ACTION_TERMINATE },
];

const ENTITY_TYPES: { value: EntityType | ''; labelKey: string }[] = [
  { value: '', labelKey: ACTIVITY_LOG.ALL_ENTITIES },
  { value: 'Patient', labelKey: ACTIVITY_LOG.ENTITY_PATIENT },
  { value: 'Appointment', labelKey: ACTIVITY_LOG.ENTITY_APPOINTMENT },
  { value: 'Doctor', labelKey: ACTIVITY_LOG.ENTITY_DOCTOR },
  { value: 'Clinic', labelKey: ACTIVITY_LOG.ENTITY_CLINIC },
  { value: 'User', labelKey: ACTIVITY_LOG.ENTITY_USER },
  { value: 'Service', labelKey: ACTIVITY_LOG.ENTITY_SERVICE },
  { value: 'Slot', labelKey: ACTIVITY_LOG.ENTITY_SLOT },
  { value: 'Queue', labelKey: ACTIVITY_LOG.ENTITY_QUEUE },
  { value: 'Timetable', labelKey: ACTIVITY_LOG.ENTITY_TIMETABLE },
];

export const ActivityLogsPage = () => {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  
  // Determine if user is a manager
  const normalizedRole = role?.toUpperCase();
  const isManager = normalizedRole === 'MANAGER' && user?.clinic_id;
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  
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

  // Fetch users for employee filter (only for managers/system admins)
  const { data: usersData } = useUsers({ 
    limit: 100, 
    is_active: true,
    clinic_id: isManager && user?.clinic_id ? user.clinic_id : undefined,
  });
  
  // Fetch clinics for clinic filter (only for system admins)
  const { data: clinicsData } = useClinics({ limit: 100, is_active: true });

  // Auto-set filters based on user role
  useEffect(() => {
    if (isManager && user?.clinic_id && !clinicId) {
      // Manager: filter by clinic_id
      setClinicId(user.clinic_id);
    } else if (!isManager && !isSystemAdmin && user?.user_id && !employeeId) {
      // Regular user: filter by user_id
      setEmployeeId(user.user_id);
    }
  }, [isManager, isSystemAdmin, user?.clinic_id, user?.user_id, clinicId, employeeId]);

  // Determine which filters to apply based on user role
  // Managers: filter by clinic_id (auto-set)
  // Regular users: filter by user_id (auto-set)
  // System admins: no auto-filter (can see all)
  const effectiveUserId = isSystemAdmin ? employeeId : (isManager ? employeeId : (user?.user_id || employeeId));
  const effectiveClinicId = isSystemAdmin ? clinicId : (isManager ? (user?.clinic_id || clinicId) : undefined);

  // Fetch activity logs
  // For clinic managers, fetch more records to filter out system users properly
  const fetchLimit = isManager ? 1000 : limit;
  const { data: logsDataRaw, isLoading, error } = useActivityLogs({
    page: isManager ? 1 : page, // Always fetch page 1 for managers since we'll paginate after filtering
    limit: fetchLimit,
    search: search || undefined,
    action_type: actionType || undefined,
    entity_type: entityType || undefined,
    user_id: effectiveUserId || undefined,
    clinic_id: effectiveClinicId || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  // For clinic managers, filter out system user activities
  // Only show activities from users in their clinic (not system users)
  // System users have is_system_user=true or no user_id
  const filteredLogs = logsDataRaw?.data
    ? isManager
      ? logsDataRaw.data.filter(
          (log) => 
            !log.is_system_user && 
            log.clinic_id === user?.clinic_id &&
            log.user_id !== null &&
            log.user_id !== undefined
        )
      : logsDataRaw.data
    : [];

  // Apply pagination to filtered logs for clinic managers
  const paginatedLogs = isManager
    ? filteredLogs.slice((page - 1) * limit, page * limit)
    : filteredLogs;

  const logsData = logsDataRaw
    ? {
        ...logsDataRaw,
        data: paginatedLogs,
        total: isManager ? filteredLogs.length : logsDataRaw.total,
        page: isManager ? page : logsDataRaw.page,
        limit: limit,
        totalPages: isManager ? Math.ceil(filteredLogs.length / limit) : logsDataRaw.totalPages,
      }
    : undefined;

  // Don't count auto-set filters as "active" filters
  const hasActiveFilters =
    search ||
    actionType ||
    entityType ||
    (isSystemAdmin && employeeId) ||
    (isSystemAdmin && clinicId) ||
    startDate ||
    endDate;

  const handleClearFilters = () => {
    setSearch('');
    setActionType('');
    setEntityType('');
    // Only clear employee/clinic filters for system admins
    if (isSystemAdmin) {
      setEmployeeId('');
      setClinicId('');
    }
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Try server-side export first (ISD §8.3)
      const blob = await activityLogsApi.export({
        format: 'csv',
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        action_type: actionType || undefined,
        entity_type: entityType || undefined,
        clinic_id: effectiveClinicId || undefined,
        user_id: effectiveUserId || undefined,
      });

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

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: client-side CSV export from current data
      if (!logsData || !logsData.data || logsData.data.length === 0) {
        alert(t(ACTIVITY_LOG.NO_LOGS_TO_EXPORT));
        return;
      }

      const headers = [
        t(ACTIVITY_LOG.CSV_TIMESTAMP),
        t(ACTIVITY_LOG.CSV_USER),
        t(ACTIVITY_LOG.CSV_EMAIL),
        t(ACTIVITY_LOG.CSV_ACTION),
        t(ACTIVITY_LOG.CSV_ENTITY_TYPE),
        t(ACTIVITY_LOG.CSV_ENTITY_ID),
        t(ACTIVITY_LOG.CSV_ENTITY_NAME),
        t(ACTIVITY_LOG.CSV_CLINIC),
        t(ACTIVITY_LOG.CSV_DESCRIPTION),
        t(ACTIVITY_LOG.CSV_IP_ADDRESS),
        t(ACTIVITY_LOG.CSV_USER_AGENT),
      ];

      const csvRows = [
        headers.join(','),
        ...logsData.data.map((log) => {
          const row = [
            format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
            log.employee_name || t(ACTIVITY_LOG.SYSTEM),
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
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      const filename = `activity-logs_${dateStr}.csv`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
  };

  const formatJSON = (data?: Record<string, unknown> | null): string => {
    if (!data || Object.keys(data).length === 0) return t(ACTIVITY_LOG.NO_DATA);
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-1">
            {t(ACTIVITY_LOG.ACTIVITY_LOGS)}
          </h1>
          <p className="text-sm text-carbon/60">
            {isManager
              ? t(ACTIVITY_LOG.MONITOR_CLINIC)
              : isSystemAdmin
              ? t(ACTIVITY_LOG.MONITOR_SYSTEM)
              : t(ACTIVITY_LOG.VIEW_YOUR_LOGS)
            }
          </p>
        </div>
        <Button variant="outline" size="md" onClick={handleExport} disabled={exporting}>
          <MdDownload className="h-4 w-4 mr-2" />
          {exporting ? t(ACTIVITY_LOG.EXPORT) + '...' : t(ACTIVITY_LOG.EXPORT)}
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-4 w-4" />
              {t(ACTIVITY_LOG.FILTERS_SEARCH)}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Only show advanced filters button for managers and system admins */}
              {(isManager || isSystemAdmin) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  {showAdvancedFilters ? t(ACTIVITY_LOG.HIDE_ADVANCED) : t(ACTIVITY_LOG.SHOW_ADVANCED)}
                </Button>
              )}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
                  <MdClear className="h-3 w-3 mr-1" />
                  {t(ACTIVITY_LOG.CLEAR_ALL)}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Input
                label={t(ACTIVITY_LOG.SEARCH)}
                placeholder={t(ACTIVITY_LOG.SEARCH_PLACEHOLDER)}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>
            <Select
              label={t(ACTIVITY_LOG.ACTION_TYPE)}
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value as ActionType | '');
                setPage(1);
              }}
              options={ACTION_TYPES.map((opt) => ({ value: opt.value, label: t(opt.labelKey) }))}
            />
            <Select
              label={t(ACTIVITY_LOG.ENTITY_TYPE)}
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as EntityType | '');
                setPage(1);
              }}
              options={ENTITY_TYPES.map((opt) => ({ value: opt.value, label: t(opt.labelKey) }))}
            />
          </div>

          {showAdvancedFilters && (
            <div className="mt-4 grid gap-4 md:grid-cols-4 border-t border-carbon/10 pt-4">
              {/* Only show User filter for managers and system admins */}
              {(isManager || isSystemAdmin) && (
                <Select
                  label={t(ACTIVITY_LOG.USER)}
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: t(ACTIVITY_LOG.ALL_USERS) },
                    ...(usersData?.data.map((user) => ({
                      value: user.user_id,
                      label: `${user.first_name} ${user.last_name}`,
                    })) || []),
                  ]}
                />
              )}
              {/* Only show Clinic filter for system admins */}
              {isSystemAdmin && (
                <Select
                  label={t(ACTIVITY_LOG.CLINIC)}
                  value={clinicId}
                  onChange={(e) => {
                    setClinicId(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: '', label: t(ACTIVITY_LOG.ALL_CLINICS) },
                    ...(clinicsData?.data.map((clinic) => ({
                      value: clinic.clinic_id,
                      label: clinic.name,
                    })) || []),
                  ]}
                />
              )}
              <div className="relative">
                <Input
                  label={t(ACTIVITY_LOG.START_DATE)}
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
                  label={t(ACTIVITY_LOG.END_DATE)}
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
            {t(ACTIVITY_LOG.ACTIVITY_LOGS_COUNT, { count: logsData?.total || 0 })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">
                {t(ACTIVITY_LOG.FAILED_TO_LOAD)}
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
                {t(ACTIVITY_LOG.SHOWING, { from: (page - 1) * limit + 1, to: Math.min(page * limit, logsData.total), total: logsData.total })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t(ACTIVITY_LOG.PREVIOUS)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= logsData.total}
                >
                  {t(ACTIVITY_LOG.NEXT)}
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
          title={t(ACTIVITY_LOG.LOG_DETAILS)}
          size="xl"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold text-carbon mb-3">{t(ACTIVITY_LOG.BASIC_INFORMATION)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.TIMESTAMP)}</label>
                  <p className="text-sm text-carbon">
                    {format(new Date(selectedLog.created_at), 'PPpp')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.USER)}</label>
                  <p className="text-sm text-carbon">
                    {selectedLog.employee_name || t(ACTIVITY_LOG.SYSTEM)}
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
                  <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.ACTION)}</label>
                  <p className="text-sm text-carbon">{selectedLog.action_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.ENTITY_TYPE)}</label>
                  <p className="text-sm text-carbon">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.ENTITY_ID)}</label>
                  <p className="text-sm text-carbon font-mono text-xs break-all">{selectedLog.entity_id || '—'}</p>
                </div>
                {selectedLog.clinic_id && (
                  <div>
                    <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.CLINIC_ID)}</label>
                    <p className="text-sm text-carbon font-mono text-xs break-all">{selectedLog.clinic_id}</p>
                  </div>
                )}
                {selectedLog.ip_address && (
                  <div>
                    <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.IP_ADDRESS)}</label>
                    <p className="text-sm text-carbon font-mono">{selectedLog.ip_address}</p>
                  </div>
                )}
                {selectedLog.user_agent && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.USER_AGENT)}</label>
                    <p className="text-sm text-carbon text-xs break-words">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedLog.description && (
              <div>
                <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.DESCRIPTION)}</label>
                <p className="text-sm text-carbon">{selectedLog.description}</p>
              </div>
            )}

            {/* Request Data */}
            {selectedLog.request_data && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">{t(ACTIVITY_LOG.REQUEST_DATA)}</h3>
                <div className="space-y-3">
                  <div className="grid gap-2">
                    {selectedLog.request_data.method && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-carbon/60">{t(ACTIVITY_LOG.METHOD)}:</span>
                        <span className="text-xs px-2 py-0.5 bg-azure-dragon/20 text-azure-dragon rounded font-medium">
                          {selectedLog.request_data.method}
                        </span>
                      </div>
                    )}
                    {selectedLog.request_data.url && (
                      <div>
                        <span className="text-xs font-medium text-carbon/60">{t(ACTIVITY_LOG.URL)}:</span>
                        <p className="text-xs text-carbon font-mono mt-1 break-all bg-white-smoke p-2 rounded">
                          {selectedLog.request_data.url}
                        </p>
                      </div>
                    )}
                    {selectedLog.request_data.path && (
                      <div>
                        <span className="text-xs font-medium text-carbon/60">{t(ACTIVITY_LOG.PATH)}:</span>
                        <p className="text-xs text-carbon font-mono mt-1 bg-white-smoke p-2 rounded">
                          {selectedLog.request_data.path}
                        </p>
                      </div>
                    )}
                  </div>
                  {selectedLog.request_data.body && Object.keys(selectedLog.request_data.body).length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.REQUEST_BODY)}</label>
                      <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-64 border border-carbon/10">
                        {formatJSON(selectedLog.request_data.body)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.request_data.query && Object.keys(selectedLog.request_data.query).length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.QUERY_PARAMS)}</label>
                      <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-48 border border-carbon/10">
                        {formatJSON(selectedLog.request_data.query)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.request_data.params && Object.keys(selectedLog.request_data.params).length > 0 && (
                    <div>
                      <label className="block text-xs font-medium text-carbon/60 mb-1">{t(ACTIVITY_LOG.PATH_PARAMS)}</label>
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
                <h3 className="text-sm font-semibold text-carbon mb-3">{t(ACTIVITY_LOG.RESPONSE_DATA)}</h3>
                <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-96 border border-carbon/10">
                  {formatJSON(selectedLog.response_data)}
                </pre>
              </div>
            )}

            {/* New Values (for UPDATE actions) */}
            {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">{t(ACTIVITY_LOG.UPDATED_VALUES)}</h3>
                <pre className="text-xs bg-white-smoke p-3 rounded-md overflow-auto max-h-96 border border-carbon/10">
                  {formatJSON(selectedLog.new_values)}
                </pre>
              </div>
            )}

            {/* Metadata (fallback) */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-carbon mb-3">{t(ACTIVITY_LOG.METADATA)}</h3>
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
