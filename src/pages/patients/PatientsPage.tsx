import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClinics } from '@/hooks/useClinics';
import { usePatients, useDeactivatePatient, useActivatePatient } from '@/hooks/usePatients';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, PATIENT } from '@/i18n';
import { PatientsTable } from '@/components/patients';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select } from '@/components/ui';
import { MdAdd, MdSearch, MdFilterList, MdClear, MdPerson } from 'react-icons/md';
import type { Patient } from '@/api/patients';

export const PatientsPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useTranslation();

  // Determine user type and resolve clinic_id from all possible locations
  const normalizedRole = role?.toUpperCase();
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  const userClinicId = user?.clinic_id || user?.employee?.clinic_id || user?.employee_profile?.clinic_id || undefined;
  const isClinicUser = !isSystemAdmin && !!userClinicId;

  // For clinic-level users, automatically use their clinic_id
  // For system admins, allow clinic selection
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    isClinicUser ? (userClinicId || '') : ''
  );

  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [hasAccountFilter, setHasAccountFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [patientToActivate, setPatientToActivate] = useState<Patient | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch all clinics for the clinic filter (only for system admins)
  const { data: clinicsData } = useClinics({ limit: 100, is_active: true });

  // Auto-set clinic_id for clinic-level users
  useEffect(() => {
    if (isClinicUser && userClinicId && !selectedClinicId) {
      setSelectedClinicId(userClinicId);
    }
  }, [isClinicUser, userClinicId, selectedClinicId]);

  // Fetch patients
  const { data: patientsData, isLoading, error } = usePatients({
    page,
    limit,
    search: search || undefined,
    clinic_id: selectedClinicId || undefined,
    gender: genderFilter ? (genderFilter as 'M' | 'F' | 'Other') : undefined,
    has_account: hasAccountFilter === 'yes' ? true : hasAccountFilter === 'no' ? false : undefined,
    // Map statusFilter to is_active: 'active' -> true, 'inactive' -> false, 'all' -> undefined
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    sort_by: 'created_at',
    sort_order: 'DESC',
  });

  const deleteMutation = useDeactivatePatient();
  const activateMutation = useActivatePatient();
  const { success: showSuccess, error: showError } = useToastStore();

  const selectedClinic = clinicsData?.data.find((c) => c.clinic_id === selectedClinicId);

  // For clinic managers, clinic_id is always set, so don't count it as a filter
  const hasActiveFilters = search || statusFilter !== 'active' || genderFilter || hasAccountFilter || (isSystemAdmin && selectedClinicId);

  const handleClearFilters = () => {
    setSearch('');
    setGenderFilter('');
    setStatusFilter('active');
    setHasAccountFilter('');
    // Only clear clinic selection for system admins
    if (isSystemAdmin) {
      setSelectedClinicId('');
    }
    setPage(1);
  };

  const handleView = (patient: Patient) => {
    navigate(`/patients/${patient.patient_id}`);
  };

  const handleEdit = (patient: Patient) => {
    navigate(`/patients/${patient.patient_id}/edit`);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return;
    if (isSystemAdmin && !selectedClinicId && !isClinicUser) return;

    try {
      await deleteMutation.mutateAsync(patientToDelete.patient_id);
      showSuccess(t(PATIENT.DEACTIVATED_SUCCESS));
      setPatientToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(PATIENT.DEACTIVATE_FAILED);
      console.error('Failed to deactivate patient:', error);
      showError(errorMessage);
    }
  };

  const handleActivate = (patient: Patient) => {
    setPatientToActivate(patient);
  };

  const handleActivateConfirm = async () => {
    if (!patientToActivate) return;

    try {
      await activateMutation.mutateAsync(patientToActivate.patient_id);
      showSuccess(t(PATIENT.ACTIVATED_SUCCESS));
      setPatientToActivate(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(PATIENT.ACTIVATE_FAILED);
      console.error('Failed to activate patient:', error);
      showError(errorMessage);
    }
  };

  const handleCreate = () => {
    if (isClinicUser && userClinicId) {
      // Clinic-level users (manager, operator, receptionist, etc.) always use their clinic
      navigate(`/patients/create?clinic_id=${userClinicId}`);
    } else if (selectedClinicId) {
      navigate(`/patients/create?clinic_id=${selectedClinicId}`);
    } else {
      // System admins without a selected clinic — CreatePatientPage will show a clinic selector
      navigate('/patients/create');
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(PATIENT.PATIENTS_MANAGEMENT)}
          </h1>
          <p className="text-sm text-carbon/60">
            {isClinicUser
              ? t(PATIENT.MANAGE_CLINIC_PATIENTS)
              : t(PATIENT.MANAGE_ALL_PATIENTS)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleCreate}
            disabled={isSystemAdmin && !selectedClinicId && !isClinicUser}
          >
            <MdAdd className="h-4 w-4 mr-2" />
            {t(PATIENT.CREATE_PATIENT)}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-5 w-5 text-azure-dragon" />
              {t(PATIENT.FILTERS)}
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-xs"
                >
                  <MdClear className="h-4 w-4 mr-1" />
                  {t(PATIENT.CLEAR)}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs"
              >
                {showAdvancedFilters ? t(PATIENT.HIDE_ADVANCED) : t(PATIENT.SHOW_ADVANCED)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Clinic filter - only for system admins */}
            {isSystemAdmin && !isClinicUser && (
              <Select
                label={t(PATIENT.CLINIC)}
                value={selectedClinicId}
                onChange={(e) => {
                  setSelectedClinicId(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: t(PATIENT.ALL_CLINICS) },
                  ...(clinicsData?.data.map((clinic) => ({
                    value: clinic.clinic_id,
                    label: clinic.name,
                  })) || []),
                ]}
              />
            )}
            <div className="relative">
              <Input
                label={t(PATIENT.SEARCH)}
                placeholder={t(PATIENT.SEARCH_PLACEHOLDER)}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>
            <Select
              label={t(PATIENT.GENDER)}
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: t(PATIENT.ALL_GENDERS) },
                { value: 'M', label: t(PATIENT.MALE) },
                { value: 'F', label: t(PATIENT.FEMALE) },
                { value: 'Other', label: t(PATIENT.OTHER_GENDER) },
              ]}
            />
            <Select
              label={t(PATIENT.HAS_ACCOUNT)}
              value={hasAccountFilter}
              onChange={(e) => {
                setHasAccountFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: t(PATIENT.ALL) },
                { value: 'yes', label: t(PATIENT.YES) },
                { value: 'no', label: t(PATIENT.NO) },
              ]}
            />
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-carbon/10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Select
                label={t(PATIENT.STATUS)}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: 'active', label: t(PATIENT.ACTIVE) },
                  { value: 'inactive', label: t(PATIENT.INACTIVE) },
                  { value: 'all', label: t(PATIENT.ALL) },
                ]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdPerson className="h-5 w-5 text-azure-dragon" />
            {t(PATIENT.PATIENTS)}
            {selectedClinic && (
              <span className="text-sm font-normal text-carbon/60 ml-2">
                ({selectedClinic.name})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">
                {error instanceof Error ? error.message : t(PATIENT.FAILED_TO_LOAD)}
              </p>
            </div>
          )}

          <PatientsTable
            patients={patientsData?.data || []}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
          />

          {/* Pagination */}
          {patientsData && patientsData.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-carbon/60">
                {t(PATIENT.SHOWING, {
                  from: String((page - 1) * limit + 1),
                  to: String(Math.min(page * limit, patientsData.total)),
                  total: String(patientsData.total),
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t(PATIENT.PREVIOUS)}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: patientsData.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === patientsData.totalPages ||
                        (p >= page - 1 && p <= page + 1)
                    )
                    .map((p, idx, arr) => (
                      <div key={p} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-2 text-carbon/40">...</span>
                        )}
                        <Button
                          variant={p === page ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPage(p)}
                          className="min-w-[2.5rem]"
                        >
                          {p}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(patientsData.totalPages, p + 1))}
                  disabled={page === patientsData.totalPages}
                >
                  {t(PATIENT.NEXT)}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!patientToDelete}
        onClose={() => setPatientToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={t(PATIENT.DEACTIVATE_TITLE)}
        message={
          patientToDelete
            ? t(PATIENT.DEACTIVATE_MESSAGE, { name: `${patientToDelete.first_name} ${patientToDelete.last_name}` })
            : ''
        }
        confirmText={t(PATIENT.DEACTIVATE)}
        variant="deactivate"
        isLoading={deleteMutation.isPending}
      />

      {/* Activate Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!patientToActivate}
        onClose={() => setPatientToActivate(null)}
        onConfirm={handleActivateConfirm}
        title={t(PATIENT.ACTIVATE_TITLE)}
        message={
          patientToActivate
            ? t(PATIENT.ACTIVATE_MESSAGE, { name: `${patientToActivate.first_name} ${patientToActivate.last_name}` })
            : ''
        }
        confirmText={t(PATIENT.ACTIVATE)}
        variant="activate"
        isLoading={activateMutation.isPending}
      />
    </div>
  );
};
