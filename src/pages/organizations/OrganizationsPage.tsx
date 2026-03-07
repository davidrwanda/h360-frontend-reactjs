import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizations, useDeactivateOrganization } from '@/hooks/useOrganizations';
import { OrganizationsTable } from '@/components/organizations/OrganizationsTable';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, DeleteConfirmationModal, Select } from '@/components/ui';
import { MdAdd, MdSearch, MdFilterList, MdClear } from 'react-icons/md';
import type { Organization, OrganizationType } from '@/types/organization';

export const OrganizationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 20;
  const [orgToDeactivate, setOrgToDeactivate] = useState<Organization | null>(null);

  const { data, isLoading, error } = useOrganizations({
    page,
    limit,
    search: search || undefined,
    type: (typeFilter as OrganizationType) || undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
  });

  const deactivateMutation = useDeactivateOrganization();

  const hasActiveFilters = search || typeFilter || statusFilter !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('all');
    setPage(1);
  };

  const handleView = (org: Organization) => {
    navigate(`/organizations/${org.id}`);
  };

  const handleEdit = (org: Organization) => {
    navigate(`/organizations/${org.id}/edit`);
  };

  const handleDeactivate = (org: Organization) => {
    setOrgToDeactivate(org);
  };

  const handleDeactivateConfirm = async () => {
    if (!orgToDeactivate) return;
    try {
      await deactivateMutation.mutateAsync(orgToDeactivate.id);
      showSuccess(t(ORGANIZATION.DEACTIVATED_SUCCESS));
      setOrgToDeactivate(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(ORGANIZATION.FAILED_UPDATE);
      showError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(ORGANIZATION.ORGANIZATIONS)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(ORGANIZATION.MANAGE_ORGANIZATIONS)}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/organizations/create')}>
          <MdAdd className="h-4 w-4 mr-2" />
          {t(ORGANIZATION.CREATE_ORGANIZATION)}
        </Button>
      </div>

      {/* Filters */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MdFilterList className="h-4 w-4" />
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
                <MdClear className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Input
                label="Search"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              <MdSearch className="absolute right-3 top-8 h-4 w-4 text-carbon/40 pointer-events-none" />
            </div>
            <Select
              label={t(ORGANIZATION.TYPE)}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'All Types' },
                { value: 'single_clinic', label: t(ORGANIZATION.TYPE_SINGLE_CLINIC) },
                { value: 'multi_branch', label: t(ORGANIZATION.TYPE_MULTI_BRANCH) },
                { value: 'health_network', label: t(ORGANIZATION.TYPE_HEALTH_NETWORK) },
              ]}
            />
            <Select
              label={t(COMMON.STATUS)}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { value: 'all', label: 'All' },
                { value: 'active', label: t(COMMON.ACTIVE) },
                { value: 'inactive', label: t(COMMON.INACTIVE) },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            {t(ORGANIZATION.ORGANIZATIONS)} ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{t(ORGANIZATION.FAILED_LOAD)}</p>
            </div>
          )}

          <OrganizationsTable
            organizations={data?.data || []}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
          />

          {/* Pagination */}
          {data && data.total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-carbon/60">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total}
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

      {/* Deactivate Confirmation */}
      {orgToDeactivate && (
        <DeleteConfirmationModal
          isOpen={!!orgToDeactivate}
          onClose={() => setOrgToDeactivate(null)}
          onConfirm={handleDeactivateConfirm}
          title={t(ORGANIZATION.DEACTIVATE)}
          message={`Are you sure you want to deactivate this organization? All clinics under it will be affected.`}
          itemName={orgToDeactivate.name}
          isLoading={deactivateMutation.isPending}
          variant="deactivate"
        />
      )}
    </div>
  );
};
