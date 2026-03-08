import { useState } from 'react';
import {
  useAdminFeaturedListings,
  useCreateFeaturedListing,
  useUpdateFeaturedListing,
  useDeleteFeaturedListing,
} from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY, COMMON } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Input, Select, Modal } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import {
  MdStar,
  MdAdd,
  MdEdit,
  MdDelete,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import type { FeaturedListing, CreateFeaturedListingRequest, UpdateFeaturedListingRequest } from '@/types/directory';

const tierBadge: Record<string, string> = {
  premium: 'bg-amber-100 text-amber-700',
  standard: 'bg-azure-dragon/10 text-azure-dragon',
};

const tierOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
];

export const AdminFeaturedPage = () => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useAdminFeaturedListings({ page, limit });
  const createMutation = useCreateFeaturedListing();
  const updateMutation = useUpdateFeaturedListing();
  const deleteMutation = useDeleteFeaturedListing();

  const listings = data?.data || [];
  const totalPages = data?.totalPages || 0;

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createClinicId, setCreateClinicId] = useState('');
  const [createTier, setCreateTier] = useState<'premium' | 'standard'>('standard');
  const [createStartDate, setCreateStartDate] = useState('');
  const [createEndDate, setCreateEndDate] = useState('');
  const [createPrice, setCreatePrice] = useState('');

  // Edit modal state
  const [editListing, setEditListing] = useState<FeaturedListing | null>(null);
  const [editTier, setEditTier] = useState<'premium' | 'standard'>('standard');
  const [editEndDate, setEditEndDate] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // Delete confirmation
  const [deleteListing, setDeleteListing] = useState<FeaturedListing | null>(null);

  const resetCreateForm = () => {
    setCreateClinicId('');
    setCreateTier('standard');
    setCreateStartDate('');
    setCreateEndDate('');
    setCreatePrice('');
  };

  const handleCreate = async () => {
    if (!createClinicId.trim() || !createStartDate || !createEndDate) return;
    try {
      const data: CreateFeaturedListingRequest = {
        clinic_id: createClinicId.trim(),
        tier: createTier,
        start_date: createStartDate,
        end_date: createEndDate,
        price: createPrice ? Number(createPrice) : undefined,
      };
      await createMutation.mutateAsync(data);
      showSuccess(t(DIRECTORY.FEATURED_CREATED));
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create featured listing.';
      showError(msg);
    }
  };

  const openEdit = (listing: FeaturedListing) => {
    setEditListing(listing);
    setEditTier(listing.tier);
    setEditEndDate(listing.end_date?.split('T')[0] ?? '');
    setEditIsActive(listing.is_active);
  };

  const handleUpdate = async () => {
    if (!editListing) return;
    try {
      const data: UpdateFeaturedListingRequest = {
        tier: editTier,
        end_date: editEndDate,
        is_active: editIsActive,
      };
      await updateMutation.mutateAsync({ id: editListing.listing_id, data });
      showSuccess(t(DIRECTORY.FEATURED_UPDATED));
      setEditListing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update listing.';
      showError(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteListing) return;
    try {
      await deleteMutation.mutateAsync(deleteListing.listing_id);
      showSuccess(t(DIRECTORY.FEATURED_REMOVED));
      setDeleteListing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove listing.';
      showError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(DIRECTORY.MANAGE_FEATURED)}
          </h1>
          <p className="text-sm text-carbon/60">
            Manage featured clinic listings in the directory.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <MdAdd className="h-4 w-4 mr-2" />
          {t(DIRECTORY.CREATE_FEATURED)}
        </Button>
      </div>

      {/* Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t(DIRECTORY.FEATURED_CLINICS)} ({data?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">Failed to load featured listings.</p>
            </div>
          )}

          {isLoading ? (
            <Loading />
          ) : listings.length === 0 ? (
            <div className="py-12 text-center">
              <MdStar className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60">No featured listings yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-carbon/10 text-left">
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Clinic</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">{t(DIRECTORY.LISTING_TIER)}</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Start Date</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">End Date</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Status</th>
                    <th className="pb-3 font-medium text-carbon/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.listing_id} className="border-b border-carbon/5 hover:bg-carbon/2">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-carbon">{listing.clinic_name || listing.clinic_id}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tierBadge[listing.tier] || ''}`}>
                          {listing.tier === 'premium' && <MdStar className="h-3 w-3 mr-0.5" />}
                          {listing.tier}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-carbon/60 text-xs">
                        {format(parseISO(listing.start_date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 pr-4 text-carbon/60 text-xs">
                        {format(parseISO(listing.end_date), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          listing.is_active ? 'bg-verdant/10 text-verdant' : 'bg-carbon/10 text-carbon/60'
                        }`}>
                          {listing.is_active ? t(COMMON.ACTIVE) : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(listing)}
                            title="Edit"
                          >
                            <MdEdit className="h-4 w-4 text-azure-dragon" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteListing(listing)}
                            title="Delete"
                          >
                            <MdDelete className="h-4 w-4 text-smudged-lips" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <MdChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-carbon/60">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <MdChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); resetCreateForm(); }}
          title={t(DIRECTORY.CREATE_FEATURED)}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Clinic ID"
              placeholder="Enter the clinic ID"
              value={createClinicId}
              onChange={(e) => setCreateClinicId(e.target.value)}
              required
            />
            <Select
              label={t(DIRECTORY.LISTING_TIER)}
              value={createTier}
              onChange={(e) => setCreateTier(e.target.value as 'premium' | 'standard')}
              options={tierOptions}
            />
            <Input
              label="Start Date"
              type="date"
              value={createStartDate}
              onChange={(e) => setCreateStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={createEndDate}
              onChange={(e) => setCreateEndDate(e.target.value)}
              required
            />
            <Input
              label="Price (optional)"
              type="number"
              value={createPrice}
              onChange={(e) => setCreatePrice(e.target.value)}
              placeholder="0"
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={!createClinicId.trim() || !createStartDate || !createEndDate || createMutation.isPending}
              >
                {createMutation.isPending ? t(COMMON.SAVING) : t(DIRECTORY.CREATE_FEATURED)}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editListing && (
        <Modal
          isOpen={!!editListing}
          onClose={() => setEditListing(null)}
          title="Edit Featured Listing"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-carbon/5 p-3">
              <p className="text-sm font-medium text-carbon">{editListing.clinic_name || editListing.clinic_id}</p>
            </div>
            <Select
              label={t(DIRECTORY.LISTING_TIER)}
              value={editTier}
              onChange={(e) => setEditTier(e.target.value as 'premium' | 'standard')}
              options={tierOptions}
            />
            <Input
              label="End Date"
              type="date"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
            />
            <label className="flex items-center gap-2 cursor-pointer text-sm text-carbon">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon/30"
              />
              Active
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditListing(null)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? t(COMMON.SAVING) : t(COMMON.SAVE)}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteListing && (
        <Modal
          isOpen={!!deleteListing}
          onClose={() => setDeleteListing(null)}
          title="Remove Featured Listing"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-carbon/70">
              Are you sure you want to remove the featured listing for{' '}
              <strong>{deleteListing.clinic_name || deleteListing.clinic_id}</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteListing(null)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? t(COMMON.SAVING) : t(COMMON.DELETE)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
