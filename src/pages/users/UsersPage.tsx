import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClinics } from '@/hooks/useClinics';
import { useOrganizations, useOrgMembers } from '@/hooks/useOrganizations';
import { useUsers, useClinicAdmins, useSystemAdmins, useOrgOwners, useDeactivateUser, useActivateUser, useDeactivateSystemAdmin, useUpdateSystemAdmin } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, USERS, CLINIC, COMMON } from '@/i18n';
import { ClinicAdminsTable } from '@/components/users/ClinicAdminsTable';
import { SystemAdminsTable } from '@/components/users/SystemAdminsTable';
import { CreateSystemAdminForm } from '@/components/users/CreateSystemAdminForm';
import { EditSystemAdminForm } from '@/components/users/EditSystemAdminForm';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select, Modal } from '@/components/ui';
import { MdAdd, MdSearch, MdFilterList, MdClear, MdPerson } from 'react-icons/md';
import type { User } from '@/api/users';
import type { SystemAdmin } from '@/types/organization';

export const UsersPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useTranslation();
  
  // Get clinic_id from storage (fallback to user object)
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      // Try to get from localStorage directly (Zustand persist)
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch (error) {
      console.warn('Failed to get clinic_id from localStorage:', error);
    }

    // Fallback to user object from auth hook
    return user?.clinic_id || user?.employee?.clinic_id;
  };
  
  // Determine if user is a clinic manager (not system admin)
  const normalizedRole = role?.toUpperCase();
  const clinicIdFromStorage = getClinicIdFromStorage();
  const isClinicManager = normalizedRole === 'MANAGER' && clinicIdFromStorage;
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  
  // For clinic managers, automatically use their clinic_id from storage
  // For system admins, allow clinic selection
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    isClinicManager ? (clinicIdFromStorage || '') : ''
  );
  
  const isSystemUser = user?.user_type === 'SYSTEM';

  // SYSTEM users: default to 'org-owners' tab; others: default to 'clinic-admins'
  const [activeTab, setActiveTab] = useState<'clinic-admins' | 'system-admins' | 'org-owners'>(
    isSystemUser ? 'org-owners' : 'clinic-admins'
  );
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);
  
  // System Admins state
  const [systemAdminSearch, setSystemAdminSearch] = useState('');
  const [systemAdminStatusFilter, setSystemAdminStatusFilter] = useState<string>('active');
  const [systemAdminPage, setSystemAdminPage] = useState(1);
  const [systemAdminToDelete, setSystemAdminToDelete] = useState<SystemAdmin | null>(null);
  const [showCreateSystemAdminModal, setShowCreateSystemAdminModal] = useState(false);
  const [systemAdminToEdit, setSystemAdminToEdit] = useState<SystemAdmin | null>(null);

  // Org Owners state
  const [orgOwnerSearch, setOrgOwnerSearch] = useState('');
  const [orgOwnerStatusFilter, setOrgOwnerStatusFilter] = useState<string>('active');
  const [orgOwnerOrgFilter, setOrgOwnerOrgFilter] = useState<string>('');
  const [orgOwnerPage, setOrgOwnerPage] = useState(1);
  const [orgOwnerToDelete, setOrgOwnerToDelete] = useState<User | null>(null);

  // Fetch all clinics for the clinic filter (only for non-SYSTEM admins)
  const { data: clinicsData } = useClinics(isSystemUser ? undefined : { limit: 100, is_active: true });

  // Fetch organizations for the org filter (SYSTEM users only)
  const { data: orgsData } = useOrganizations(isSystemUser ? { limit: 100, is_active: true } : undefined);

  // Auto-set clinic_id for clinic managers from storage
  useEffect(() => {
    if (isClinicManager && clinicIdFromStorage && !selectedClinicId) {
      setSelectedClinicId(clinicIdFromStorage);
    }
  }, [isClinicManager, clinicIdFromStorage, selectedClinicId]);

  // For clinic managers, use general users hook with clinic_id and role filter
  // For system admins, use clinic admins hook (Managers only)
  const { data: usersData, isLoading: usersLoading, error: usersError } = useUsers(
    isClinicManager && selectedClinicId
      ? {
          page,
          limit,
          search: search || undefined,
          role: roleFilter || undefined,
          clinic_id: selectedClinicId,
          is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
          sortBy: 'created_at',
          sortOrder: 'DESC',
        }
      : undefined
  );

  const { data: adminsData, isLoading, error } = useClinicAdmins(
    selectedClinicId || '',
    {
      page,
      limit,
      search: search || undefined,
      is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      sortBy: 'created_at',
      sortOrder: 'DESC',
    }
  );

  // Use appropriate data based on user type
  const displayData = isClinicManager ? usersData : adminsData;
  const displayLoading = isClinicManager ? usersLoading : isLoading;
  const displayError = isClinicManager ? usersError : error;

  const deleteMutation = useDeactivateUser();
  const activateMutation = useActivateUser();
  const { success: showSuccess, error: showError } = useToastStore();

  // System Admins hooks (only for System Admins)
  const { data: systemAdminsData, isLoading: systemAdminsLoading, error: systemAdminsError } = useSystemAdmins(
    isSystemAdmin
      ? {
          page: systemAdminPage,
          limit,
          search: systemAdminSearch || undefined,
          is_active: systemAdminStatusFilter === 'active' ? true : systemAdminStatusFilter === 'inactive' ? false : undefined,
        }
      : undefined
  );

  const systemAdminDeleteMutation = useDeactivateSystemAdmin();
  const systemAdminActivateMutation = useUpdateSystemAdmin();

  // Org Owners hooks (only for SYSTEM users)
  // When no org selected: fetch all ORG_OWNER users via /api/users
  const { data: allOrgOwnersData, isLoading: allOrgOwnersLoading, error: allOrgOwnersError } = useOrgOwners(
    isSystemUser && !orgOwnerOrgFilter
      ? {
          page: orgOwnerPage,
          limit,
          search: orgOwnerSearch || undefined,
          is_active: orgOwnerStatusFilter === 'active' ? true : orgOwnerStatusFilter === 'inactive' ? false : undefined,
          sortBy: 'created_at',
          sortOrder: 'DESC',
        }
      : undefined
  );

  // When org selected: fetch ORG_OWNER members via /api/organizations/:id/members
  const { data: orgMembersData, isLoading: orgMembersLoading, error: orgMembersError } = useOrgMembers(
    orgOwnerOrgFilter,
    {
      page: orgOwnerPage,
      limit,
      search: orgOwnerSearch || undefined,
      role: 'ORG_OWNER',
    },
    { enabled: isSystemUser && !!orgOwnerOrgFilter }
  );

  // Map OrganizationMember to User-compatible shape when filtering by org
  const orgMembersAsUsers = orgMembersData?.data?.map((member) => ({
    user_id: member.user_id || member.id,
    first_name: member.first_name || '',
    last_name: member.last_name || '',
    full_name: `${member.first_name || ''} ${member.last_name || ''}`.trim(),
    email: member.email,
    username: member.email,
    role: member.role,
    is_active: member.status === 'active',
    created_at: member.created_at,
    updated_at: member.updated_at,
  })) as User[] | undefined;

  // Unified data: use members API when org selected, users API otherwise
  const orgOwnersData = orgOwnerOrgFilter
    ? (orgMembersData ? { data: orgMembersAsUsers || [], total: orgMembersData.total, page: orgMembersData.page, limit: orgMembersData.limit, totalPages: orgMembersData.totalPages } : undefined)
    : allOrgOwnersData;
  const orgOwnersLoading = orgOwnerOrgFilter ? orgMembersLoading : allOrgOwnersLoading;
  const orgOwnersError = orgOwnerOrgFilter ? orgMembersError : allOrgOwnersError;

  const orgOwnerDeleteMutation = useDeactivateUser();
  const orgOwnerActivateMutation = useActivateUser();

  const selectedClinic = clinicsData?.data?.find((c) => c.clinic_id === selectedClinicId);

  // For clinic managers, clinic_id is always set, so don't count it as a filter
  const hasActiveFilters = search || statusFilter !== 'active' || roleFilter || (isSystemAdmin && selectedClinicId);

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('active');
    // Only clear clinic selection for system admins
    if (isSystemAdmin) {
      setSelectedClinicId('');
    }
    setPage(1);
  };

  const handleEdit = (admin: User) => {
    // TODO: Navigate to edit page or open edit modal
    if (admin.clinic_id) {
      navigate(`/clinics/${admin.clinic_id}/admins/${admin.user_id}/edit`);
    }
  };

  const handleDelete = (admin: User) => {
    setAdminToDelete(admin);
  };

  const handleActivate = (admin: User) => {
    setAdminToDelete(admin);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;
    // For clinic managers, clinic_id is always set, so this check is only for system admins
    if (isSystemAdmin && !selectedClinicId) return;

    try {
      await deleteMutation.mutateAsync(adminToDelete.user_id);
      showSuccess(t(USERS.USER_DEACTIVATED));
      setAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(USERS.FAILED_DEACTIVATE_USER);
      console.error('Failed to deactivate clinic admin:', error);
      showError(errorMessage);
    }
  };

  const handleActivateConfirm = async () => {
    if (!adminToDelete) return;
    // For clinic managers, clinic_id is always set, so this check is only for system admins
    if (isSystemAdmin && !selectedClinicId) return;

    try {
      await activateMutation.mutateAsync(adminToDelete.user_id);
      showSuccess(t(USERS.USER_ACTIVATED));
      setAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(USERS.FAILED_ACTIVATE_USER);
      console.error('Failed to activate clinic admin:', error);
      showError(errorMessage);
    }
  };

  // System Admins handlers
  const handleSystemAdminEdit = (admin: SystemAdmin) => {
    setSystemAdminToEdit(admin);
  };

  const handleSystemAdminDelete = (admin: SystemAdmin) => {
    setSystemAdminToDelete(admin);
  };

  const handleSystemAdminActivate = (admin: SystemAdmin) => {
    setSystemAdminToDelete(admin);
  };

  const handleSystemAdminDeleteConfirm = async () => {
    if (!systemAdminToDelete) return;

    try {
      await systemAdminDeleteMutation.mutateAsync(systemAdminToDelete.id);
      showSuccess(t(USERS.SYSTEM_ADMIN_DEACTIVATED));
      setSystemAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(USERS.FAILED_DEACTIVATE_SYSTEM_ADMIN);
      console.error('Failed to deactivate system admin:', error);
      showError(errorMessage);
    }
  };

  const handleSystemAdminActivateConfirm = async () => {
    if (!systemAdminToDelete) return;

    try {
      await systemAdminActivateMutation.mutateAsync({ id: systemAdminToDelete.id, data: { is_active: true } });
      showSuccess(t(USERS.SYSTEM_ADMIN_ACTIVATED));
      setSystemAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(USERS.FAILED_ACTIVATE_SYSTEM_ADMIN);
      console.error('Failed to activate system admin:', error);
      showError(errorMessage);
    }
  };

  const handleCreateSystemAdminSuccess = () => {
    setShowCreateSystemAdminModal(false);
  };

  const handleEditSystemAdminSuccess = () => {
    setSystemAdminToEdit(null);
  };

  const systemAdminHasActiveFilters = systemAdminSearch || systemAdminStatusFilter !== 'active';

  const handleClearSystemAdminFilters = () => {
    setSystemAdminSearch('');
    setSystemAdminStatusFilter('active');
    setSystemAdminPage(1);
  };

  // Org Owners handlers
  const orgOwnerHasActiveFilters = orgOwnerSearch || orgOwnerStatusFilter !== 'active' || orgOwnerOrgFilter;

  const handleClearOrgOwnerFilters = () => {
    setOrgOwnerSearch('');
    setOrgOwnerStatusFilter('active');
    setOrgOwnerOrgFilter('');
    setOrgOwnerPage(1);
  };

  const handleOrgOwnerDelete = (owner: User) => {
    setOrgOwnerToDelete(owner);
  };

  const handleOrgOwnerActivate = (owner: User) => {
    setOrgOwnerToDelete(owner);
  };

  const handleOrgOwnerDeleteConfirm = async () => {
    if (!orgOwnerToDelete) return;
    try {
      await orgOwnerDeleteMutation.mutateAsync(orgOwnerToDelete.user_id);
      showSuccess(t(USERS.USER_DEACTIVATED));
      setOrgOwnerToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(USERS.FAILED_DEACTIVATE_USER);
      showError(errorMessage);
    }
  };

  const handleOrgOwnerActivateConfirm = async () => {
    if (!orgOwnerToDelete) return;
    try {
      await orgOwnerActivateMutation.mutateAsync(orgOwnerToDelete.user_id);
      showSuccess(t(USERS.USER_ACTIVATED));
      setOrgOwnerToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(USERS.FAILED_ACTIVATE_USER);
      showError(errorMessage);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(USERS.USERS_MANAGEMENT)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(USERS.MANAGE_USERS_DESC)}
          </p>
        </div>
        {activeTab === 'clinic-admins' && !isSystemAdmin && !isSystemUser && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/users/create')}
          >
            <MdAdd className="h-4 w-4 mr-2" />
            {t(USERS.CREATE_USER)}
          </Button>
        )}
        {activeTab === 'system-admins' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateSystemAdminModal(true)}
          >
            <MdAdd className="h-4 w-4 mr-2" />
            {t(USERS.CREATE_SYSTEM_ADMIN)}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-carbon/10">
        <div className="flex gap-4">
          {/* SYSTEM users: Org Owners tab instead of Users tab */}
          {isSystemUser ? (
            <button
              onClick={() => { setActiveTab('org-owners'); setOrgOwnerPage(1); }}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'org-owners'
                    ? 'border-azure-dragon text-azure-dragon'
                    : 'border-transparent text-carbon/60 hover:text-carbon'
                }
              `}
            >
              Organization Owners
            </button>
          ) : (
            <button
              onClick={() => {
                setActiveTab('clinic-admins');
                if (isSystemAdmin) {
                  setSelectedClinicId('');
                }
                setPage(1);
              }}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'clinic-admins'
                    ? 'border-azure-dragon text-azure-dragon'
                    : 'border-transparent text-carbon/60 hover:text-carbon'
                }
              `}
            >
              {t(USERS.USERS_TAB)}
            </button>
          )}
          {/* System Admins tab for system admins */}
          {isSystemAdmin && (
            <button
              onClick={() => setActiveTab('system-admins')}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === 'system-admins'
                    ? 'border-azure-dragon text-azure-dragon'
                    : 'border-transparent text-carbon/60 hover:text-carbon'
                }
              `}
            >
              {t(USERS.SYSTEM_ADMINS_TAB)}
            </button>
          )}
        </div>
      </div>

      {/* Org Owners Tab (SYSTEM users only) */}
      {activeTab === 'org-owners' && isSystemUser && (
        <>
          {/* Filters */}
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MdFilterList className="h-4 w-4" />
                  {t(CLINIC.FILTERS_SORTING)}
                </CardTitle>
                {orgOwnerHasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearOrgOwnerFilters}
                    className="text-xs"
                  >
                    <MdClear className="h-3 w-3 mr-1" />
                    {t(CLINIC.CLEAR_ALL)}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  label={t(USERS.SELECT_ORGANIZATION)}
                  value={orgOwnerOrgFilter}
                  onChange={(e) => {
                    setOrgOwnerOrgFilter(e.target.value);
                    setOrgOwnerPage(1);
                  }}
                  options={[
                    { value: '', label: t(USERS.ALL_ORGANIZATIONS) },
                    ...(orgsData?.data?.map((org) => ({
                      value: org.id,
                      label: org.name,
                    })) || []),
                  ]}
                />
                <div className="relative">
                  <Input
                    label={t(CLINIC.SEARCH)}
                    placeholder={t(USERS.SEARCH_PLACEHOLDER)}
                    value={orgOwnerSearch}
                    onChange={(e) => {
                      setOrgOwnerSearch(e.target.value);
                      setOrgOwnerPage(1);
                    }}
                  />
                  <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
                </div>
                <Select
                  label={t(CLINIC.TH_STATUS)}
                  value={orgOwnerStatusFilter}
                  onChange={(e) => {
                    setOrgOwnerStatusFilter(e.target.value);
                    setOrgOwnerPage(1);
                  }}
                  options={[
                    { value: 'active', label: t(USERS.ACTIVE) },
                    { value: 'inactive', label: t(USERS.INACTIVE) },
                    { value: 'all', label: t(USERS.ALL) },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Org Owners Table */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>
                Organization Owners ({orgOwnersData?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orgOwnersError && (
                <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                  <p className="text-xs text-smudged-lips">
                    {t(USERS.FAILED_LOAD_USERS)}
                  </p>
                </div>
              )}

              <ClinicAdminsTable
                admins={orgOwnersData?.data || []}
                isLoading={orgOwnersLoading}
                onEdit={() => {}}
                onDelete={handleOrgOwnerDelete}
                onActivate={handleOrgOwnerActivate}
              />

              {/* Pagination */}
              {orgOwnersData && orgOwnersData.total > limit && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-carbon/60">
                    {t(USERS.SHOWING)} {(orgOwnerPage - 1) * limit + 1} {t(USERS.TO)} {Math.min(orgOwnerPage * limit, orgOwnersData.total)} {t(USERS.OF)}{' '}
                    {orgOwnersData.total} {t(USERS.USERS_LOWER)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrgOwnerPage((p) => Math.max(1, p - 1))}
                      disabled={orgOwnerPage === 1}
                    >
                      {t(USERS.PREVIOUS)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOrgOwnerPage((p) => p + 1)}
                      disabled={orgOwnerPage * limit >= orgOwnersData.total}
                    >
                      {t(USERS.NEXT)}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deactivate Confirmation Modal */}
          {orgOwnerToDelete && orgOwnerToDelete.is_active && (
            <DeleteConfirmationModal
              isOpen={!!orgOwnerToDelete}
              onClose={() => setOrgOwnerToDelete(null)}
              onConfirm={handleOrgOwnerDeleteConfirm}
              title={t(USERS.DEACTIVATE_CLINIC_ADMIN)}
              message="Are you sure you want to deactivate this organization owner?"
              itemName={`${orgOwnerToDelete.first_name} ${orgOwnerToDelete.last_name}`}
              isLoading={orgOwnerDeleteMutation.isPending}
              variant="deactivate"
            />
          )}

          {/* Activate Confirmation Modal */}
          {orgOwnerToDelete && !orgOwnerToDelete.is_active && (
            <DeleteConfirmationModal
              isOpen={!!orgOwnerToDelete}
              onClose={() => setOrgOwnerToDelete(null)}
              onConfirm={handleOrgOwnerActivateConfirm}
              title={t(USERS.ACTIVATE_CLINIC_ADMIN)}
              message="Are you sure you want to activate this organization owner?"
              itemName={`${orgOwnerToDelete.first_name} ${orgOwnerToDelete.last_name}`}
              isLoading={orgOwnerActivateMutation.isPending}
              actionLabel={t(USERS.ACTIVATE_ACTION)}
              variant="delete"
            />
          )}
        </>
      )}

      {/* Clinic Admins Tab */}
      {activeTab === 'clinic-admins' && (
        <>
          {/* Filters */}
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MdFilterList className="h-4 w-4" />
                  {t(CLINIC.FILTERS_SORTING)}
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    <MdClear className="h-3 w-3 mr-1" />
                    {t(CLINIC.CLEAR_ALL)}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${isSystemAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                {/* Only show clinic selector for system admins */}
                {isSystemAdmin && (
                  <Select
                    label={t(USERS.SELECT_CLINIC)}
                    value={selectedClinicId}
                    onChange={(e) => {
                      setSelectedClinicId(e.target.value);
                      setPage(1);
                    }}
                    options={[
                      { value: '', label: t(USERS.PLEASE_SELECT_CLINIC) },
                      ...(clinicsData?.data.map((clinic) => ({
                        value: clinic.clinic_id,
                        label: clinic.name,
                      })) || []),
                    ]}
                  />
                )}
                {/* Role filter - show for clinic managers, hide for system admins (they only see Managers) */}
                {isClinicManager && (
                  <Select
                    label={t(COMMON.ROLE)}
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    options={[
                      { value: '', label: t(USERS.ALL_ROLES) },
                      { value: 'Manager', label: t(USERS.ROLE_MANAGER) },
                      { value: 'Doctor', label: t(USERS.ROLE_DOCTOR) },
                      { value: 'Nurse', label: t(USERS.ROLE_NURSE) },
                      { value: 'Receptionist', label: t(USERS.ROLE_RECEPTIONIST) },
                    ]}
                  />
                )}
                <div className="relative">
                  <Input
                    label={t(CLINIC.SEARCH)}
                    placeholder={t(USERS.SEARCH_PLACEHOLDER)}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                  <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
                </div>
                <Select
                  label={t(CLINIC.TH_STATUS)}
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'active', label: t(USERS.ACTIVE) },
                    { value: 'inactive', label: t(USERS.INACTIVE) },
                    { value: 'all', label: t(USERS.ALL) },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clinic Admins Table */}
          {selectedClinicId ? (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>
                  {isClinicManager 
                    ? `${t(USERS.USERS_COUNT)} (${displayData?.total || 0})`
                    : `${t(USERS.CLINIC_ADMINS_FOR)} ${selectedClinic?.name} (${displayData?.total || 0})`
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayError && (
                  <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                    <p className="text-xs text-smudged-lips">
                      {t(USERS.FAILED_LOAD_USERS)}
                    </p>
                  </div>
                )}

                <ClinicAdminsTable
                  admins={displayData?.data || []}
                  isLoading={displayLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onActivate={handleActivate}
                  clinicName={selectedClinic?.name}
                />

                {/* Pagination */}
                {displayData && displayData.total > limit && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-carbon/60">
                      {t(USERS.SHOWING)} {(page - 1) * limit + 1} {t(USERS.TO)} {Math.min(page * limit, displayData.total)} {t(USERS.OF)}{' '}
                      {displayData.total} {t(USERS.USERS_LOWER)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        {t(USERS.PREVIOUS)}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page * limit >= (displayData?.total || 0)}
                      >
                        {t(USERS.NEXT)}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Only show this message for system admins (clinic managers always have selectedClinicId)
            isSystemAdmin && (
              <Card variant="elevated">
                <CardContent className="py-12">
                  <div className="text-center">
                    <MdPerson className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
                    <p className="text-sm text-carbon/60 mb-2">
                      {t(USERS.SELECT_CLINIC_MESSAGE)}
                    </p>
                    <p className="text-xs text-carbon/40">
                      {t(USERS.SELECT_CLINIC_HINT)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* Deactivate Confirmation Modal */}
          {adminToDelete && adminToDelete.is_active && (
            <DeleteConfirmationModal
              isOpen={!!adminToDelete}
              onClose={() => setAdminToDelete(null)}
              onConfirm={handleDeleteConfirm}
              title={t(USERS.DEACTIVATE_CLINIC_ADMIN)}
              message={t(USERS.DEACTIVATE_CLINIC_ADMIN_MSG)}
              itemName={`${adminToDelete.first_name} ${adminToDelete.last_name}`}
              isLoading={deleteMutation.isPending}
              variant="deactivate"
            />
          )}

          {/* Activate Confirmation Modal */}
          {adminToDelete && !adminToDelete.is_active && (
            <DeleteConfirmationModal
              isOpen={!!adminToDelete}
              onClose={() => setAdminToDelete(null)}
              onConfirm={handleActivateConfirm}
              title={t(USERS.ACTIVATE_CLINIC_ADMIN)}
              message={t(USERS.ACTIVATE_CLINIC_ADMIN_MSG)}
              itemName={`${adminToDelete.first_name} ${adminToDelete.last_name}`}
              isLoading={activateMutation.isPending}
              actionLabel={t(USERS.ACTIVATE_ACTION)}
              variant="delete"
            />
          )}
        </>
      )}

      {/* System Admins Tab */}
      {activeTab === 'system-admins' && (
        <>
          {/* Filters */}
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MdFilterList className="h-4 w-4" />
                  {t(CLINIC.FILTERS_SORTING)}
                </CardTitle>
                {systemAdminHasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSystemAdminFilters}
                    className="text-xs"
                  >
                    <MdClear className="h-3 w-3 mr-1" />
                    {t(CLINIC.CLEAR_ALL)}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Input
                    label={t(CLINIC.SEARCH)}
                    placeholder={t(USERS.SEARCH_PLACEHOLDER)}
                    value={systemAdminSearch}
                    onChange={(e) => {
                      setSystemAdminSearch(e.target.value);
                      setSystemAdminPage(1);
                    }}
                  />
                  <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
                </div>
                <Select
                  label={t(CLINIC.TH_STATUS)}
                  value={systemAdminStatusFilter}
                  onChange={(e) => {
                    setSystemAdminStatusFilter(e.target.value);
                    setSystemAdminPage(1);
                  }}
                  options={[
                    { value: 'active', label: t(USERS.ACTIVE) },
                    { value: 'inactive', label: t(USERS.INACTIVE) },
                    { value: 'all', label: t(USERS.ALL) },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Admins Table */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>
                {t(USERS.SYSTEM_ADMINS_COUNT)} ({systemAdminsData?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemAdminsError && (
                <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                  <p className="text-xs text-smudged-lips">
                    {t(USERS.FAILED_LOAD_SYSTEM_ADMINS)}
                  </p>
                </div>
              )}

              <SystemAdminsTable
                admins={systemAdminsData?.data || []}
                isLoading={systemAdminsLoading}
                onEdit={handleSystemAdminEdit}
                onDelete={handleSystemAdminDelete}
                onActivate={handleSystemAdminActivate}
              />

              {/* Pagination */}
              {systemAdminsData && systemAdminsData.total > limit && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-carbon/60">
                    {t(USERS.SHOWING)} {(systemAdminPage - 1) * limit + 1} {t(USERS.TO)} {Math.min(systemAdminPage * limit, systemAdminsData.total)} {t(USERS.OF)}{' '}
                    {systemAdminsData.total} {t(USERS.ADMINS_LOWER)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSystemAdminPage((p) => Math.max(1, p - 1))}
                      disabled={systemAdminPage === 1}
                    >
                      {t(USERS.PREVIOUS)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSystemAdminPage((p) => p + 1)}
                      disabled={systemAdminPage * limit >= systemAdminsData.total}
                    >
                      {t(USERS.NEXT)}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deactivate Confirmation Modal */}
          {systemAdminToDelete && systemAdminToDelete.is_active && (
            <DeleteConfirmationModal
              isOpen={!!systemAdminToDelete}
              onClose={() => setSystemAdminToDelete(null)}
              onConfirm={handleSystemAdminDeleteConfirm}
              title={t(USERS.DEACTIVATE_SYSTEM_ADMIN)}
              message={t(USERS.DEACTIVATE_SYSTEM_ADMIN_MSG)}
              itemName={systemAdminToDelete.name || systemAdminToDelete.email}
              isLoading={systemAdminDeleteMutation.isPending}
              variant="deactivate"
            />
          )}

          {/* Activate Confirmation Modal */}
          {systemAdminToDelete && !systemAdminToDelete.is_active && (
            <DeleteConfirmationModal
              isOpen={!!systemAdminToDelete}
              onClose={() => setSystemAdminToDelete(null)}
              onConfirm={handleSystemAdminActivateConfirm}
              title={t(USERS.ACTIVATE_SYSTEM_ADMIN)}
              message={t(USERS.ACTIVATE_SYSTEM_ADMIN_MSG)}
              itemName={systemAdminToDelete.name || systemAdminToDelete.email}
              isLoading={systemAdminActivateMutation.isPending}
              actionLabel={t(USERS.ACTIVATE_ACTION)}
              variant="delete"
            />
          )}

          {/* Create System Admin Modal */}
          {showCreateSystemAdminModal && (
            <Modal
              isOpen={showCreateSystemAdminModal}
              onClose={() => setShowCreateSystemAdminModal(false)}
              title={t(USERS.CREATE_SYSTEM_ADMIN)}
              size="xl"
            >
              <CreateSystemAdminForm
                onSuccess={handleCreateSystemAdminSuccess}
                onCancel={() => setShowCreateSystemAdminModal(false)}
              />
            </Modal>
          )}

          {/* Edit System Admin Modal */}
          {systemAdminToEdit && (
            <Modal
              isOpen={!!systemAdminToEdit}
              onClose={() => setSystemAdminToEdit(null)}
              title={t(USERS.EDIT_SYSTEM_ADMIN)}
              size="xl"
            >
              <EditSystemAdminForm
                admin={systemAdminToEdit}
                onSuccess={handleEditSystemAdminSuccess}
                onCancel={() => setSystemAdminToEdit(null)}
              />
            </Modal>
          )}
        </>
      )}
    </div>
  );
};
