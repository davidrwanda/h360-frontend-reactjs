import { useState } from 'react';
import { useAdminCorrections, useReviewCorrection } from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY, COMMON } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Select, Modal } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import {
  MdEdit,
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import type { Correction, CorrectionReviewRequest } from '@/types/directory';

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-verdant/10 text-verdant',
  rejected: 'bg-smudged-lips/10 text-smudged-lips',
};

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const AdminCorrectionsPage = () => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useAdminCorrections({
    status: statusFilter || undefined,
    page,
    limit,
  });

  const reviewMutation = useReviewCorrection();

  const corrections = data?.data || [];
  const totalPages = data?.totalPages || 0;

  // Review modal state
  const [reviewCorrection, setReviewCorrection] = useState<Correction | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionTaken, setActionTaken] = useState('');

  const handleReview = async () => {
    if (!reviewCorrection) return;
    try {
      const reqData: CorrectionReviewRequest = {
        decision: reviewDecision,
        action_taken: actionTaken.trim() || undefined,
        notes: reviewNotes.trim() || undefined,
      };
      await reviewMutation.mutateAsync({ correctionId: reviewCorrection.correction_id, data: reqData });
      showSuccess(
        reviewDecision === 'approve'
          ? t(DIRECTORY.CORRECTION_APPROVED)
          : t(DIRECTORY.CORRECTION_REJECTED),
      );
      setReviewCorrection(null);
      setReviewNotes('');
      setActionTaken('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to review correction.';
      showError(msg);
    }
  };

  const openReview = (correction: Correction) => {
    setReviewCorrection(correction);
    setReviewDecision('approve');
    setReviewNotes('');
    setActionTaken('');
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(DIRECTORY.MANAGE_CORRECTIONS)}
          </h1>
          <p className="text-sm text-carbon/60">
            Review and manage submitted corrections for clinic listings.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={statusFilterOptions}
          />
        </div>
      </div>

      {/* Corrections Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t(DIRECTORY.MANAGE_CORRECTIONS)} ({data?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">Failed to load corrections.</p>
            </div>
          )}

          {isLoading ? (
            <Loading />
          ) : corrections.length === 0 ? (
            <div className="py-12 text-center">
              <MdEdit className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60">No corrections found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-carbon/10 text-left">
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Clinic</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">{t(DIRECTORY.CORRECTION_TYPE)}</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Description</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Submitter</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Status</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Date</th>
                    <th className="pb-3 font-medium text-carbon/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {corrections.map((corr) => (
                    <tr key={corr.correction_id} className="border-b border-carbon/5 hover:bg-carbon/2">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-carbon">{corr.clinic_name || corr.clinic_id}</span>
                      </td>
                      <td className="py-3 pr-4 text-carbon/70 capitalize">{corr.correction_type}</td>
                      <td className="py-3 pr-4 text-carbon/70 max-w-xs truncate">{corr.description}</td>
                      <td className="py-3 pr-4 text-carbon/60 text-xs">{corr.email || '-'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusBadgeClasses[corr.status] || 'bg-carbon/10 text-carbon'
                          }`}
                        >
                          {corr.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-carbon/60 text-xs">
                        {format(parseISO(corr.submitted_at), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReview(corr)}
                            title="Review"
                          >
                            <MdVisibility className="h-4 w-4 text-azure-dragon" />
                          </Button>
                          {corr.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  openReview(corr);
                                  setReviewDecision('approve');
                                }}
                                title={t(DIRECTORY.APPROVE)}
                              >
                                <MdCheckCircle className="h-4 w-4 text-verdant" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  openReview(corr);
                                  setReviewDecision('reject');
                                }}
                                title={t(DIRECTORY.REJECT)}
                              >
                                <MdCancel className="h-4 w-4 text-smudged-lips" />
                              </Button>
                            </>
                          )}
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

      {/* Review Modal */}
      {reviewCorrection && (
        <Modal
          isOpen={!!reviewCorrection}
          onClose={() => setReviewCorrection(null)}
          title="Review Correction"
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-carbon/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Clinic</span>
                <span className="font-medium text-carbon">{reviewCorrection.clinic_name || reviewCorrection.clinic_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Type</span>
                <span className="text-carbon capitalize">{reviewCorrection.correction_type}</span>
              </div>
              <div className="text-sm">
                <span className="text-carbon/60 block mb-1">Description</span>
                <p className="text-carbon bg-white rounded p-2 border border-carbon/10">{reviewCorrection.description}</p>
              </div>
              {reviewCorrection.email && (
                <div className="flex justify-between text-sm">
                  <span className="text-carbon/60">Contact</span>
                  <span className="text-carbon">
                    {reviewCorrection.email}
                    {reviewCorrection.phone && ` / ${reviewCorrection.phone}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Submitted</span>
                <span className="text-carbon">{format(parseISO(reviewCorrection.submitted_at), 'dd MMM yyyy HH:mm')}</span>
              </div>
            </div>

            {reviewCorrection.status === 'pending' && (
              <>
                <div className="flex gap-3">
                  <Button
                    variant={reviewDecision === 'approve' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setReviewDecision('approve')}
                    className="flex-1"
                  >
                    <MdCheckCircle className="h-4 w-4 mr-1" />
                    {t(DIRECTORY.APPROVE)}
                  </Button>
                  <Button
                    variant={reviewDecision === 'reject' ? 'danger' : 'outline'}
                    size="sm"
                    onClick={() => setReviewDecision('reject')}
                    className="flex-1"
                  >
                    <MdCancel className="h-4 w-4 mr-1" />
                    {t(DIRECTORY.REJECT)}
                  </Button>
                </div>

                {reviewDecision === 'approve' && (
                  <div>
                    <label className="mb-1 block text-sm font-medium text-carbon">Action Taken</label>
                    <textarea
                      className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                      rows={2}
                      placeholder="Describe what was updated..."
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-carbon">
                    {t(DIRECTORY.REVIEW_NOTES)}
                  </label>
                  <textarea
                    className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                    rows={2}
                    placeholder="Add review notes..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setReviewCorrection(null)}>
                    {t(COMMON.CANCEL)}
                  </Button>
                  <Button
                    variant={reviewDecision === 'approve' ? 'primary' : 'danger'}
                    onClick={handleReview}
                    disabled={reviewMutation.isPending}
                  >
                    {reviewMutation.isPending
                      ? t(COMMON.SAVING)
                      : reviewDecision === 'approve'
                        ? t(DIRECTORY.APPROVE)
                        : t(DIRECTORY.REJECT)}
                  </Button>
                </div>
              </>
            )}

            {reviewCorrection.status !== 'pending' && (
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setReviewCorrection(null)}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
