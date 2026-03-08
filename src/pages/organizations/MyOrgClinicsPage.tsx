import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrgClinics, useDeactivateClinic, useActivateClinic } from '@/hooks/useClinics';
import { useToastStore } from '@/store/toastStore';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Loading,
  DeleteConfirmationModal,
} from '@/components/ui';
import {
  MdAdd,
  MdSearch,
  MdLocalHospital,
  MdEdit,
  MdDelete,
  MdCheckCircle,
  MdArrowBack,
  MdLocationOn,
  MdPhone,
} from 'react-icons/md';
import { cn } from '@/utils/cn';
import type { Clinic } from '@/api/clinics';

export const MyOrgClinicsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToastStore();

  const orgId = user?.organization_id || user?.employee?.organization_id || '';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [page, setPage] = useState(1);
  const [clinicToToggle, setClinicToToggle] = useState<Clinic | null>(null);

  const limit = 12;

  const { data, isLoading, error } = useOrgClinics(orgId || undefined, {
    search: search || undefined,
    is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
    page,
    limit,
    sort_by: 'created_at',
    sort_order: 'DESC',
  });

  const deactivateMutation = useDeactivateClinic();
  const activateMutation = useActivateClinic();

  const handleToggleStatus = async () => {
    if (!clinicToToggle) return;
    try {
      if (clinicToToggle.is_active) {
        await deactivateMutation.mutateAsync(clinicToToggle.clinic_id);
        showSuccess('Clinic deactivated');
      } else {
        await activateMutation.mutateAsync(clinicToToggle.clinic_id);
        showSuccess('Clinic activated');
      }
      setClinicToToggle(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update clinic status');
    }
  };

  const clinics = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-organization')}
            className="rounded-md p-1.5 text-carbon/60 hover:bg-white-smoke hover:text-carbon transition-colors"
          >
            <MdArrowBack className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              My Clinics
            </h1>
            <p className="text-sm text-carbon/60">
              Manage and configure all clinics in your organization
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/my-organization/clinics/create')}
        >
          <MdAdd className="h-4 w-4 mr-2" />
          Add Clinic
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search clinics by name, city, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-carbon/40 pointer-events-none" />
        </div>
        <div className="flex gap-2">
          {(['active', 'inactive', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors',
                statusFilter === s
                  ? 'bg-azure-dragon text-white'
                  : 'bg-carbon/5 text-carbon/60 hover:bg-carbon/10'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-3">
          <p className="text-sm text-smudged-lips">Failed to load clinics</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loading size="lg" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && clinics.length === 0 && (
        <Card variant="elevated">
          <CardContent className="py-16">
            <div className="text-center">
              <MdLocalHospital className="h-14 w-14 text-carbon/15 mx-auto mb-4" />
              <p className="text-sm font-medium text-carbon/60 mb-1">No clinics found</p>
              <p className="text-xs text-carbon/40 mb-6">
                {search ? 'Try a different search term' : 'Add your first clinic to get started'}
              </p>
              {!search && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/my-organization/clinics/create')}
                >
                  <MdAdd className="h-4 w-4 mr-1" />
                  Add First Clinic
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {!isLoading && clinics.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => (
              <Card
                key={clinic.clinic_id}
                variant="elevated"
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/my-organization/clinics/${clinic.clinic_id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-azure-dragon/10">
                        <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm truncate">{clinic.name}</CardTitle>
                        {clinic.clinic_code && (
                          <p className="text-xs text-carbon/40 font-mono">{clinic.clinic_code}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        clinic.is_active
                          ? 'bg-bright-halo/20 text-azure-dragon'
                          : 'bg-carbon/10 text-carbon/50'
                      )}
                    >
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {clinic.profile_completeness !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-carbon/50 mb-1">
                        <span>Profile</span>
                        <span>{clinic.profile_completeness}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-carbon/10">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            clinic.profile_completeness >= 70
                              ? 'bg-azure-dragon'
                              : 'bg-amber-400'
                          )}
                          style={{ width: `${clinic.profile_completeness}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {(clinic.city || clinic.address) && (
                    <div className="flex items-center gap-1.5 text-xs text-carbon/60">
                      <MdLocationOn className="h-3.5 w-3.5 flex-shrink-0 text-carbon/40" />
                      <span className="truncate">{[clinic.city, clinic.state].filter(Boolean).join(', ') || clinic.address}</span>
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-carbon/60">
                      <MdPhone className="h-3.5 w-3.5 flex-shrink-0 text-carbon/40" />
                      <span>{clinic.phone}</span>
                    </div>
                  )}
                  {/* Actions */}
                  <div
                    className="flex items-center gap-2 pt-2 border-t border-carbon/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => navigate(`/my-organization/clinics/${clinic.clinic_id}`)}
                    >
                      <MdEdit className="h-3.5 w-3.5 mr-1" />
                      Manage
                    </Button>
                    {clinic.is_active ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-smudged-lips hover:text-smudged-lips"
                        onClick={() => setClinicToToggle(clinic)}
                      >
                        <MdDelete className="h-3.5 w-3.5 mr-1" />
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-azure-dragon hover:text-azure-dragon"
                        onClick={() => setClinicToToggle(clinic)}
                      >
                        <MdCheckCircle className="h-3.5 w-3.5 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-carbon/60">
                Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} clinics
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Deactivate/Activate modal */}
      {clinicToToggle && (
        <DeleteConfirmationModal
          isOpen={!!clinicToToggle}
          onClose={() => setClinicToToggle(null)}
          onConfirm={handleToggleStatus}
          title={clinicToToggle.is_active ? 'Deactivate Clinic' : 'Activate Clinic'}
          message={
            clinicToToggle.is_active
              ? 'Deactivating this clinic will hide it from the directory and disable bookings.'
              : 'Activating this clinic will restore its visibility and enable bookings.'
          }
          itemName={clinicToToggle.name}
          isLoading={deactivateMutation.isPending || activateMutation.isPending}
          variant={clinicToToggle.is_active ? 'deactivate' : 'delete'}
          actionLabel={clinicToToggle.is_active ? 'Deactivate' : 'Activate'}
        />
      )}
    </div>
  );
};
