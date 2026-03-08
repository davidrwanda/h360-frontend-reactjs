import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClinics, useDeactivateClinic, useActivateClinic } from '@/hooks/useClinics';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select } from '@/components/ui';
import { timezones } from '@/config/clinicOptions';
import { MdAdd, MdSearch, MdFilterList, MdDeleteOutline, MdClear } from 'react-icons/md';
import type { Clinic } from '@/api/clinics';
import { useTranslation, CLINIC } from '@/i18n';

export const ClinicsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [timezoneFilter, setTimezoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // Default to 'all'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data, isLoading, error } = useClinics({
    page,
    limit,
    search: search || undefined,
    city: cityFilter || undefined,
    state: stateFilter || undefined,
    country: countryFilter || undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    sort_by: sortBy || undefined,
    sort_order: (sortOrder || undefined) as 'ASC' | 'DESC' | undefined,
  });

  const hasActiveFilters = 
    search || statusFilter !== 'all' || cityFilter || stateFilter || countryFilter || 
    timezoneFilter || dateFrom || dateTo || sortBy !== 'created_at' || sortOrder !== 'DESC';

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCityFilter('');
    setStateFilter('');
    setCountryFilter('');
    setTimezoneFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('created_at');
    setSortOrder('DESC');
    setPage(1);
  };

  const deactivateMutation = useDeactivateClinic();
  const activateMutation = useActivateClinic();

  const handleEdit = (clinic: Clinic) => {
    navigate(`/clinics/${clinic.clinic_id}/edit`);
  };

  const handleView = (clinic: Clinic) => {
    navigate(`/clinics/${clinic.clinic_id}`);
  };

  const handleDelete = (clinic: Clinic) => {
    setClinicToDelete(clinic);
  };

  const handleActivate = (clinic: Clinic) => {
    setClinicToDelete(clinic);
  };

  const handleDeleteConfirm = async () => {
    if (!clinicToDelete) return;

    try {
      await deactivateMutation.mutateAsync(clinicToDelete.clinic_id);
      setClinicToDelete(null);
    } catch (error) {
      console.error('Failed to deactivate clinic:', error);
      // Error is handled by the mutation, modal will stay open
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(CLINIC.CLINICS_MANAGEMENT)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(CLINIC.MANAGE_ALL_CLINICS)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/clinics/deleted">
            <Button variant="outline" size="md">
              <MdDeleteOutline className="h-4 w-4 mr-2" />
              {t(CLINIC.VIEW_DEACTIVATED)}
            </Button>
          </Link>
          <Link to="/clinics/create">
            <Button variant="primary" size="md">
              <MdAdd className="h-4 w-4 mr-2" />
              {t(CLINIC.CREATE_CLINIC)}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-4 w-4" />
              {t(CLINIC.FILTERS_SORTING)}
            </CardTitle>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs"
              >
                {showAdvancedFilters ? t(CLINIC.HIDE_ADVANCED) : t(CLINIC.SHOW_ADVANCED)}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
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
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
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
            <Select
              label={t(CLINIC.TH_STATUS)}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'active', label: t(CLINIC.ACTIVE) },
                { value: 'inactive', label: t(CLINIC.INACTIVE) },
                { value: 'all', label: t(CLINIC.ALL) },
              ]}
            />
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-carbon/10">
              <Input
                label={t(CLINIC.COUNTRY)}
                placeholder={t(CLINIC.FILTER_BY_COUNTRY)}
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                label={t(CLINIC.TIMEZONE)}
                value={timezoneFilter}
                onChange={(e) => {
                  setTimezoneFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: t(CLINIC.ALL_TIMEZONES) },
                  ...timezones.map((tz) => ({ value: tz.value, label: tz.label })),
                ]}
              />
              <Input
                label={t(CLINIC.DATE_FROM)}
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                label={t(CLINIC.DATE_TO)}
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}

          {/* Sorting */}
          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-carbon/10">
            <Select
              label={t(CLINIC.SORT_BY)}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'created_at', label: t(CLINIC.CREATED_DATE) },
                { value: 'updated_at', label: t(CLINIC.UPDATED_DATE) },
                { value: 'name', label: t(CLINIC.TH_NAME) },
                { value: 'city', label: t(CLINIC.CITY) },
                { value: 'state', label: t(CLINIC.STATE) },
                { value: 'country', label: t(CLINIC.COUNTRY) },
              ]}
            />
            <Select
              label={t(CLINIC.SORT_ORDER)}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'ASC' | 'DESC');
                setPage(1);
              }}
              options={[
                { value: 'ASC', label: t(CLINIC.ASCENDING) },
                { value: 'DESC', label: t(CLINIC.DESCENDING) },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinics Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            {t(CLINIC.CLINICS_MANAGEMENT)} ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">
                {t(CLINIC.FAILED_LOAD_CLINICS)}
              </p>
            </div>
          )}

          <ClinicsTable
            clinics={data?.data || []}
            isLoading={isLoading}
            onEdit={handleEdit}
            onView={handleView}
            onDelete={handleDelete}
            onActivate={handleActivate}
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

      {/* Deactivate Confirmation Modal */}
      {clinicToDelete && clinicToDelete.is_active && (
        <DeleteConfirmationModal
          isOpen={!!clinicToDelete}
          onClose={() => setClinicToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title={t(CLINIC.DEACTIVATE_CLINIC)}
          message={t(CLINIC.DEACTIVATE_CLINIC_MSG)}
          itemName={clinicToDelete.name}
          isLoading={deactivateMutation.isPending}
          variant="deactivate"
        />
      )}

      {/* Activate Confirmation Modal */}
      {clinicToDelete && !clinicToDelete.is_active && (
        <DeleteConfirmationModal
          isOpen={!!clinicToDelete}
          onClose={() => setClinicToDelete(null)}
          onConfirm={async () => {
            if (!clinicToDelete) return;
            try {
              await activateMutation.mutateAsync(clinicToDelete.clinic_id);
              setClinicToDelete(null);
            } catch (error) {
              console.error('Failed to activate clinic:', error);
            }
          }}
          title={t(CLINIC.ACTIVATE_CLINIC)}
          message={t(CLINIC.ACTIVATE_CLINIC_MSG)}
          itemName={clinicToDelete.name}
          isLoading={activateMutation.isPending}
          actionLabel={t(CLINIC.ACTIVATE)}
          variant="delete"
        />
      )}
    </div>
  );
};
