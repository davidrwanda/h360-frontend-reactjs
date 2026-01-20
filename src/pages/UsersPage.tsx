import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClinics } from '@/hooks/useClinics';
import { useUsers, useClinicAdmins, useSystemAdmins, useDeactivateUser, useActivateUser } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { ClinicAdminsTable } from '@/components/users/ClinicAdminsTable';
import { SystemAdminsTable } from '@/components/users/SystemAdminsTable';
import { CreateSystemAdminForm } from '@/components/users/CreateSystemAdminForm';
import { EditSystemAdminForm } from '@/components/users/EditSystemAdminForm';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select, Modal } from '@/components/ui';
import { MdAdd, MdSearch, MdFilterList, MdClear, MdPerson } from 'react-icons/md';
import type { User } from '@/api/users';

export const UsersPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  // Determine if user is a clinic manager (not system admin)
  const normalizedRole = role?.toUpperCase();
  const isClinicManager = normalizedRole === 'MANAGER' && user?.clinic_id;
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  
  // For clinic managers, automatically use their clinic_id
  // For system admins, allow clinic selection
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    isClinicManager ? (user?.clinic_id || '') : ''
  );
  
  const [activeTab, setActiveTab] = useState<'clinic-admins' | 'system-admins'>('clinic-admins');
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
  const [systemAdminToDelete, setSystemAdminToDelete] = useState<User | null>(null);
  const [showCreateSystemAdminModal, setShowCreateSystemAdminModal] = useState(false);
  const [systemAdminToEdit, setSystemAdminToEdit] = useState<User | null>(null);

  // Fetch all clinics for the clinic filter (only for system admins)
  const { data: clinicsData } = useClinics({ limit: 100, is_active: true });

  // Auto-set clinic_id for clinic managers
  useEffect(() => {
    if (isClinicManager && user?.clinic_id && !selectedClinicId) {
      setSelectedClinicId(user.clinic_id);
    }
  }, [isClinicManager, user?.clinic_id, selectedClinicId]);

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

  // System Admins hooks
  const { data: systemAdminsData, isLoading: systemAdminsLoading, error: systemAdminsError } = useSystemAdmins({
    page: systemAdminPage,
    limit,
    search: systemAdminSearch || undefined,
    is_active: systemAdminStatusFilter === 'active' ? true : systemAdminStatusFilter === 'inactive' ? false : undefined,
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const systemAdminDeleteMutation = useDeactivateUser();
  const systemAdminActivateMutation = useActivateUser();

  const selectedClinic = clinicsData?.data.find((c) => c.clinic_id === selectedClinicId);

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
      showSuccess('User deactivated successfully!');
      setAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate user';
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
      showSuccess('User activated successfully!');
      setAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate user';
      console.error('Failed to activate clinic admin:', error);
      showError(errorMessage);
    }
  };

  // System Admins handlers
  const handleSystemAdminEdit = (admin: User) => {
    setSystemAdminToEdit(admin);
  };

  const handleSystemAdminDelete = (admin: User) => {
    setSystemAdminToDelete(admin);
  };

  const handleSystemAdminActivate = (admin: User) => {
    setSystemAdminToDelete(admin);
  };

  const handleSystemAdminDeleteConfirm = async () => {
    if (!systemAdminToDelete) return;

    try {
      await systemAdminDeleteMutation.mutateAsync(systemAdminToDelete.user_id);
      showSuccess('System admin deactivated successfully!');
      setSystemAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate system admin';
      console.error('Failed to deactivate system admin:', error);
      showError(errorMessage);
    }
  };

  const handleSystemAdminActivateConfirm = async () => {
    if (!systemAdminToDelete) return;

    try {
      await systemAdminActivateMutation.mutateAsync(systemAdminToDelete.user_id);
      showSuccess('System admin activated successfully!');
      setSystemAdminToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to activate system admin';
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

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            Users Management
          </h1>
          <p className="text-sm text-carbon/60">
            Manage clinic administrators and view system users
          </p>
        </div>
        {activeTab === 'clinic-admins' && selectedClinicId && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              navigate(`/clinics/${selectedClinicId}/admins/create`);
            }}
          >
            <MdAdd className="h-4 w-4 mr-2" />
            {isClinicManager ? 'Create User' : 'Create Clinic Admin'}
          </Button>
        )}
        {activeTab === 'system-admins' && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateSystemAdminModal(true)}
          >
            <MdAdd className="h-4 w-4 mr-2" />
            Create System Admin
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-carbon/10">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setActiveTab('clinic-admins');
              // Only clear clinic selection for system admins
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
            {isClinicManager ? 'Users' : 'Clinic Admins'}
          </button>
          {/* Only show System Admins tab for system admins */}
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
              System Admins
            </button>
          )}
        </div>
      </div>

      {/* Clinic Admins Tab */}
      {activeTab === 'clinic-admins' && (
        <>
          {/* Filters */}
          <Card variant="elevated" className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MdFilterList className="h-4 w-4" />
                  Filters & Search
                </CardTitle>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="text-xs"
                  >
                    <MdClear className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`grid gap-4 ${isSystemAdmin ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                {/* Only show clinic selector for system admins */}
                {isSystemAdmin && (
                  <Select
                    label="Select Clinic"
                    value={selectedClinicId}
                    onChange={(e) => {
                      setSelectedClinicId(e.target.value);
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
                )}
                {/* Role filter - show for clinic managers, hide for system admins (they only see Managers) */}
                {isClinicManager && (
                  <Select
                    label="Role"
                    value={roleFilter}
                    onChange={(e) => {
                      setRoleFilter(e.target.value);
                      setPage(1);
                    }}
                    options={[
                      { value: '', label: 'All Roles' },
                      { value: 'Manager', label: 'Manager' },
                      { value: 'Doctor', label: 'Doctor' },
                      { value: 'Nurse', label: 'Nurse' },
                      { value: 'Receptionist', label: 'Receptionist' },
                    ]}
                  />
                )}
                <div className="relative">
                  <Input
                    label="Search"
                    placeholder="Search by name, email, username..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                  <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
                </div>
                <Select
                  label="Status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'all', label: 'All' },
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
                    ? `Users (${displayData?.total || 0})`
                    : `Clinic Admins for ${selectedClinic?.name} (${displayData?.total || 0})`
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {displayError && (
                  <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                    <p className="text-xs text-smudged-lips">
                      Failed to load users. Please try again.
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
                      Showing {(page - 1) * limit + 1} to {Math.min(page * limit, displayData.total)} of{' '}
                      {displayData.total} users
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
                        disabled={page * limit >= (displayData?.total || 0)}
                      >
                        Next
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
                      Please select a clinic to view its administrators
                    </p>
                    <p className="text-xs text-carbon/40">
                      Use the clinic filter above to get started
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
              title="Deactivate Clinic Admin"
              message="Are you sure you want to deactivate this clinic admin? The admin will be marked as inactive and will not be able to access the system."
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
              title="Activate Clinic Admin"
              message="Are you sure you want to activate this clinic admin? The admin will be able to access the system again."
              itemName={`${adminToDelete.first_name} ${adminToDelete.last_name}`}
              isLoading={activateMutation.isPending}
              actionLabel="Activate"
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
                  Filters & Search
                </CardTitle>
                {systemAdminHasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSystemAdminFilters}
                    className="text-xs"
                  >
                    <MdClear className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Input
                    label="Search"
                    placeholder="Search by name, email, username..."
                    value={systemAdminSearch}
                    onChange={(e) => {
                      setSystemAdminSearch(e.target.value);
                      setSystemAdminPage(1);
                    }}
                  />
                  <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
                </div>
                <Select
                  label="Status"
                  value={systemAdminStatusFilter}
                  onChange={(e) => {
                    setSystemAdminStatusFilter(e.target.value);
                    setSystemAdminPage(1);
                  }}
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'all', label: 'All' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Admins Table */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>
                System Admins ({systemAdminsData?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {systemAdminsError && (
                <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                  <p className="text-xs text-smudged-lips">
                    Failed to load system admins. Please try again.
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
                    Showing {(systemAdminPage - 1) * limit + 1} to {Math.min(systemAdminPage * limit, systemAdminsData.total)} of{' '}
                    {systemAdminsData.total} admins
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSystemAdminPage((p) => Math.max(1, p - 1))}
                      disabled={systemAdminPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSystemAdminPage((p) => p + 1)}
                      disabled={systemAdminPage * limit >= systemAdminsData.total}
                    >
                      Next
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
              title="Deactivate System Admin"
              message="Are you sure you want to deactivate this system admin? The admin will be marked as inactive and will not be able to access the system."
              itemName={`${systemAdminToDelete.first_name} ${systemAdminToDelete.last_name}`}
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
              title="Activate System Admin"
              message="Are you sure you want to activate this system admin? The admin will be able to access the system again."
              itemName={`${systemAdminToDelete.first_name} ${systemAdminToDelete.last_name}`}
              isLoading={systemAdminActivateMutation.isPending}
              actionLabel="Activate"
              variant="delete"
            />
          )}

          {/* Create System Admin Modal */}
          {showCreateSystemAdminModal && (
            <Modal
              isOpen={showCreateSystemAdminModal}
              onClose={() => setShowCreateSystemAdminModal(false)}
              title="Create System Admin"
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
              title="Edit System Admin"
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
