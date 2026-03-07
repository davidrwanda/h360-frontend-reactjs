import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors, useDeactivateDoctor, useActivateDoctor } from '@/hooks/useDoctors';
import { DoctorsTable } from '@/components/doctors/DoctorsTable';
import { Button, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select, Input } from '@/components/ui';
import { MdAdd, MdSearch, MdFilterList, MdClear } from 'react-icons/md';
import type { Doctor } from '@/api/doctors';
import { useTranslation, DOCTOR } from '@/i18n';

export const DoctorsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  // Check if user can edit (Admin, Manager, Receptionist)
  const normalizedRole = role?.toUpperCase();
  const canEdit = normalizedRole === 'ADMIN' || normalizedRole === 'MANAGER' || normalizedRole === 'RECEPTIONIST';
  
  // For clinic managers, automatically use their clinic_id (check both direct and nested locations)
  const clinicId = user?.clinic_id || user?.employee?.clinic_id || undefined;
  
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [acceptsNewPatientsFilter, setAcceptsNewPatientsFilter] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 20;
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [doctorToActivate, setDoctorToActivate] = useState<Doctor | null>(null);

  const { data, isLoading, error } = useDoctors({
    page,
    limit,
    search: search || undefined,
    clinic_id: clinicId,
    specialty: specialtyFilter || undefined,
    accepts_new_patients: acceptsNewPatientsFilter === 'true' ? true : acceptsNewPatientsFilter === 'false' ? false : undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  });

  const doctors = data?.data || [];
  const totalPages = data?.totalPages || Math.ceil((data?.total || 0) / limit);

  const hasActiveFilters = 
    search || statusFilter !== 'active' || specialtyFilter || acceptsNewPatientsFilter;

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('active');
    setSpecialtyFilter('');
    setAcceptsNewPatientsFilter('');
    setPage(1);
  };

  const deactivateMutation = useDeactivateDoctor();
  const activateMutation = useActivateDoctor();

  const handleEdit = (doctor: Doctor) => {
    navigate(`/doctors/${doctor.doctor_id}/edit`);
  };

  const handleView = (doctor: Doctor) => {
    navigate(`/doctors/${doctor.doctor_id}`);
  };

  const handleDelete = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
  };

  const handleDeleteConfirm = async () => {
    if (!doctorToDelete) return;

    try {
      // Determine clinicId for deactivation
      // Use doctor's primary clinic_id or first active clinic relationship, or user's clinic
      const targetClinicId = 
        doctorToDelete.clinic_id || 
        doctorToDelete.clinic_relationships?.find(rel => rel.is_active)?.clinic_id ||
        clinicId;

      if (!targetClinicId) {
        console.error('Cannot deactivate: No clinic ID available');
        return;
      }

      await deactivateMutation.mutateAsync({
        doctorId: doctorToDelete.doctor_id,
        clinicId: targetClinicId,
      });
      setDoctorToDelete(null);
    } catch (error) {
      console.error('Failed to deactivate doctor-clinic relationship:', error);
    }
  };

  const handleActivate = (doctor: Doctor) => {
    setDoctorToActivate(doctor);
  };

  const handleActivateConfirm = async () => {
    if (!doctorToActivate) return;

    try {
      await activateMutation.mutateAsync(doctorToActivate.doctor_id);
      setDoctorToActivate(null);
    } catch (error) {
      console.error('Failed to activate doctor:', error);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(DOCTOR.DOCTORS_MANAGEMENT)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(DOCTOR.MANAGE_CLINIC_DOCTORS)}
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/doctors/create')}
            >
              <MdAdd className="h-4 w-4 mr-2" />
              {t(DOCTOR.CREATE_DOCTOR)}
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-5 w-5" />
              {t(DOCTOR.FILTERS)}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              {showAdvancedFilters ? t(DOCTOR.HIDE_ADVANCED) : t(DOCTOR.SHOW_ADVANCED)}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Input
                label={t(DOCTOR.SEARCH)}
                type="text"
                placeholder={t(DOCTOR.SEARCH_PLACEHOLDER)}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>

            <Select
              label={t(DOCTOR.STATUS)}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: t(DOCTOR.ALL_STATUS) },
                { value: 'active', label: t(DOCTOR.ACTIVE) },
                { value: 'inactive', label: t(DOCTOR.INACTIVE) },
              ]}
            />
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-carbon/10 mt-4">
              <Input
                label={t(DOCTOR.SPECIALTY)}
                type="text"
                placeholder={t(DOCTOR.SPECIALTY_FILTER_PLACEHOLDER)}
                value={specialtyFilter}
                onChange={(e) => {
                  setSpecialtyFilter(e.target.value);
                  setPage(1);
                }}
              />

              <Select
                label={t(DOCTOR.ACCEPTS_NEW_PATIENTS)}
                value={acceptsNewPatientsFilter}
                onChange={(e) => {
                  setAcceptsNewPatientsFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: t(DOCTOR.ALL) },
                  { value: 'true', label: t(DOCTOR.YES) },
                  { value: 'false', label: t(DOCTOR.NO) },
                ]}
              />
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                <MdClear className="h-4 w-4 mr-1" />
                {t(DOCTOR.CLEAR_FILTERS)}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doctors Table */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-smudged-lips">
                {t(DOCTOR.FAILED_TO_LOAD)}
              </p>
            </div>
          ) : (
            <>
              <DoctorsTable
                doctors={doctors}
                isLoading={isLoading}
                onEdit={canEdit ? handleEdit : undefined}
                onDelete={canEdit ? handleDelete : undefined}
                onActivate={canEdit ? handleActivate : undefined}
                onView={handleView}
                canEdit={canEdit}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-carbon/10 px-4 py-3">
                  <p className="text-sm text-carbon/60">
                    {t(DOCTOR.PAGE_OF, { page, totalPages })} ({data?.total || 0} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      {t(DOCTOR.PREVIOUS)}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      {t(DOCTOR.NEXT)}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {doctorToDelete && doctorToDelete.is_active && (
        <DeleteConfirmationModal
          isOpen={!!doctorToDelete}
          onClose={() => setDoctorToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title={t(DOCTOR.DEACTIVATE_TITLE)}
          message={t(DOCTOR.DEACTIVATE_MESSAGE, { name: doctorToDelete.full_name })}
          confirmText={t(DOCTOR.DEACTIVATE)}
          isLoading={deactivateMutation.isPending}
        />
      )}

      {/* Activate Confirmation Modal */}
      {doctorToActivate && !doctorToActivate.is_active && (
        <DeleteConfirmationModal
          isOpen={!!doctorToActivate}
          onClose={() => setDoctorToActivate(null)}
          onConfirm={handleActivateConfirm}
          title={t(DOCTOR.ACTIVATE_TITLE)}
          message={t(DOCTOR.ACTIVATE_MESSAGE, { name: doctorToActivate.full_name })}
          confirmText={t(DOCTOR.ACTIVATE)}
          actionLabel={t(DOCTOR.ACTIVATE)}
          isLoading={activateMutation.isPending}
        />
      )}
    </div>
  );
};
