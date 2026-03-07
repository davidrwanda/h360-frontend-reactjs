import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeletedClinics, useActivateClinic } from '@/hooks/useClinics';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal } from '@/components/ui';
import { MdArrowBack, MdSearch, MdFilterList } from 'react-icons/md';
import type { Clinic } from '@/api/clinics';
import { useTranslation, CLINIC } from '@/i18n';

export const DeletedClinicsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [clinicToActivate, setClinicToActivate] = useState<Clinic | null>(null);

  const { data, isLoading, error } = useDeletedClinics({
    page,
    limit,
    search: search || undefined,
    city: cityFilter || undefined,
    state: stateFilter || undefined,
    sortBy: 'updated_at',
    sortOrder: 'DESC',
  });

  const activateMutation = useActivateClinic();

  const handleEdit = (clinic: Clinic) => {
    navigate(`/clinics/${clinic.clinic_id}/edit`);
  };

  const handleView = (clinic: Clinic) => {
    navigate(`/clinics/${clinic.clinic_id}`);
  };

  const handleActivate = (clinic: Clinic) => {
    setClinicToActivate(clinic);
  };

  const handleActivateConfirm = async () => {
    if (!clinicToActivate) return;

    try {
      await activateMutation.mutateAsync(clinicToActivate.clinic_id);
      setClinicToActivate(null);
    } catch (error) {
      console.error('Failed to activate clinic:', error);
      // Error is handled by the mutation, modal will stay open
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/clinics">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MdArrowBack className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              {t(CLINIC.DEACTIVATED_CLINICS)}
            </h1>
            <p className="text-sm text-carbon/60">
              {t(CLINIC.DEACTIVATED_CLINICS_DESC)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdFilterList className="h-4 w-4" />
            {t(CLINIC.FILTERS)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Input
                label={t(CLINIC.SEARCH)}
                placeholder={t(CLINIC.SEARCH_PLACEHOLDER)}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40" />
            </div>
            <Input
              label={t(CLINIC.CITY)}
              placeholder={t(CLINIC.FILTER_BY_CITY)}
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label={t(CLINIC.STATE)}
              placeholder={t(CLINIC.FILTER_BY_STATE)}
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinics Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            {t(CLINIC.DEACTIVATED_CLINICS)} ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">
                {t(CLINIC.FAILED_LOAD_DEACTIVATED)}
              </p>
            </div>
          )}

          <ClinicsTable
            clinics={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleActivate}
          />

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-carbon/60">
                {t(CLINIC.SHOWING_PAGINATION, { from: String((page - 1) * limit + 1), to: String(Math.min(page * limit, data.total)), total: String(data.total) })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {t(CLINIC.PREVIOUS)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * limit >= data.total}
                >
                  {t(CLINIC.NEXT)}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activate Confirmation Modal */}
      {clinicToActivate && (
        <DeleteConfirmationModal
          isOpen={!!clinicToActivate}
          onClose={() => setClinicToActivate(null)}
          onConfirm={handleActivateConfirm}
          title={t(CLINIC.ACTIVATE_CLINIC)}
          message={t(CLINIC.ACTIVATE_CLINIC_MSG)}
          itemName={clinicToActivate.name}
          isLoading={activateMutation.isPending}
          actionLabel={t(CLINIC.ACTIVATE)}
          variant="delete"
        />
      )}
    </div>
  );
};
