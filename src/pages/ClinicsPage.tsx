import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClinics, useDeactivateClinic, useActivateClinic } from '@/hooks/useClinics';
import { ClinicsTable } from '@/components/clinics/ClinicsTable';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select } from '@/components/ui';
import { timezones } from '@/config/clinicOptions';
import { MdAdd, MdSearch, MdFilterList, MdDeleteOutline, MdClear } from 'react-icons/md';
import type { Clinic } from '@/api/clinics';

export const ClinicsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [timezoneFilter, setTimezoneFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active'); // Default to 'active'
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
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  const hasActiveFilters = 
    search || statusFilter !== 'active' || cityFilter || stateFilter || countryFilter || 
    timezoneFilter || dateFrom || dateTo || sortBy !== 'created_at' || sortOrder !== 'DESC';

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('active');
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
            Clinics Management
          </h1>
          <p className="text-sm text-carbon/60">
            Manage all clinics in the system
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/clinics/deleted">
            <Button variant="outline" size="md">
              <MdDeleteOutline className="h-4 w-4 mr-2" />
              View Deactivated
            </Button>
          </Link>
          <Link to="/clinics/create">
            <Button variant="primary" size="md">
              <MdAdd className="h-4 w-4 mr-2" />
              Create Clinic
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
              Filters & Sorting
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
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-xs"
              >
                {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Basic Filters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <div className="relative">
              <Input
                label="Search"
                placeholder="Search by name, address, phone..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>
            <Input
              label="City"
              placeholder="Filter by city"
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              label="State"
              placeholder="Filter by state"
              value={stateFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
            />
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

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-carbon/10">
              <Input
                label="Country"
                placeholder="Filter by country"
                value={countryFilter}
                onChange={(e) => {
                  setCountryFilter(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                label="Timezone"
                value={timezoneFilter}
                onChange={(e) => {
                  setTimezoneFilter(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: '', label: 'All Timezones' },
                  ...timezones.map((tz) => ({ value: tz.value, label: tz.label })),
                ]}
              />
              <Input
                label="Date From"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
              />
              <Input
                label="Date To"
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
              label="Sort By"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              options={[
                { value: 'created_at', label: 'Created Date' },
                { value: 'updated_at', label: 'Updated Date' },
                { value: 'name', label: 'Name' },
                { value: 'city', label: 'City' },
                { value: 'state', label: 'State' },
                { value: 'country', label: 'Country' },
              ]}
            />
            <Select
              label="Sort Order"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'ASC' | 'DESC');
                setPage(1);
              }}
              options={[
                { value: 'ASC', label: 'Ascending' },
                { value: 'DESC', label: 'Descending' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Clinics Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            Clinics ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">
                Failed to load clinics. Please try again.
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
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of{' '}
                {data.total} clinics
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
                  disabled={page * limit >= data.total}
                >
                  Next
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
          title="Deactivate Clinic"
          message="Are you sure you want to deactivate this clinic? The clinic will be marked as inactive and will not be available for new appointments."
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
          title="Activate Clinic"
          message="Are you sure you want to activate this clinic? The clinic will be available for appointments and operations."
          itemName={clinicToDelete.name}
          isLoading={activateMutation.isPending}
          actionLabel="Activate"
          variant="delete"
        />
      )}
    </div>
  );
};
