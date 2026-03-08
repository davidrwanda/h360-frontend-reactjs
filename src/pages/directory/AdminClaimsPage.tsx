import { useState } from 'react';
import { useAdminClaims, useReviewClaim } from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY, COMMON } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Select, Modal } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import {
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdChevronLeft,
  MdChevronRight,
  MdFlag,
} from 'react-icons/md';
import type { Claim, ClaimReviewRequest } from '@/types/directory';

const statusBadgeClasses: Record<string, string> = {
  pending_otp: 'bg-amber-100 text-amber-700',
  otp_verified: 'bg-azure-dragon/10 text-azure-dragon',
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-verdant/10 text-verdant',
  rejected: 'bg-smudged-lips/10 text-smudged-lips',
};

const statusFilterOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_otp', label: 'Pending OTP' },
  { value: 'otp_verified', label: 'OTP Verified' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const AdminClaimsPage = () => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();

  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useAdminClaims({
    status: statusFilter || undefined,
    page,
    limit,
  });

  const reviewMutation = useReviewClaim();

  const claims = data?.data || [];
  const totalPages = data?.totalPages || 0;

  // Review modal state
  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');

  const handleReview = async () => {
    if (!reviewClaim) return;
    try {
      const data: ClaimReviewRequest = {
        decision: reviewDecision,
        notes: reviewNotes.trim() || undefined,
      };
      await reviewMutation.mutateAsync({ claimId: reviewClaim.claim_id, data });
      showSuccess(reviewDecision === 'approve' ? t(DIRECTORY.CLAIM_APPROVED) : t(DIRECTORY.CLAIM_REJECTED));
      setReviewClaim(null);
      setReviewNotes('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to review claim.';
      showError(msg);
    }
  };

  const openReview = (claim: Claim, decision: 'approve' | 'reject') => {
    setReviewClaim(claim);
    setReviewDecision(decision);
    setReviewNotes('');
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(DIRECTORY.MANAGE_CLAIMS)}
          </h1>
          <p className="text-sm text-carbon/60">
            Review and manage clinic ownership claims.
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

      {/* Claims Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t(DIRECTORY.MANAGE_CLAIMS)} ({data?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">Failed to load claims.</p>
            </div>
          )}

          {isLoading ? (
            <Loading />
          ) : claims.length === 0 ? (
            <div className="py-12 text-center">
              <MdFlag className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60">No claims found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-carbon/10 text-left">
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Clinic</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Claimant</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Role</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Method</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Status</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Date</th>
                    <th className="pb-3 font-medium text-carbon/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.claim_id} className="border-b border-carbon/5 hover:bg-carbon/2">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-carbon">{claim.clinic_name}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <div>
                          <p className="text-carbon">{claim.claimant_name}</p>
                          <p className="text-xs text-carbon/50">{claim.claimant_email}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-carbon/70 capitalize">{claim.claimant_role}</td>
                      <td className="py-3 pr-4 text-carbon/70 capitalize">{claim.verification_method}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusBadgeClasses[claim.status] || 'bg-carbon/10 text-carbon'
                          }`}
                        >
                          {claim.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-carbon/60 text-xs">
                        {format(parseISO(claim.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReview(claim, 'approve')}
                            title={t(DIRECTORY.APPROVE)}
                          >
                            <MdVisibility className="h-4 w-4 text-azure-dragon" />
                          </Button>
                          {(claim.status === 'otp_verified' || claim.status === 'pending_review') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReview(claim, 'approve')}
                                title={t(DIRECTORY.APPROVE)}
                              >
                                <MdCheckCircle className="h-4 w-4 text-verdant" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openReview(claim, 'reject')}
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
              <span className="text-sm text-carbon/60">
                Page {page} of {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <MdChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      {reviewClaim && (
        <Modal
          isOpen={!!reviewClaim}
          onClose={() => setReviewClaim(null)}
          title={t(DIRECTORY.REVIEW_CLAIM)}
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-carbon/5 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Clinic</span>
                <span className="font-medium text-carbon">{reviewClaim.clinic_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Claimant</span>
                <span className="font-medium text-carbon">{reviewClaim.claimant_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Email</span>
                <span className="text-carbon">{reviewClaim.claimant_email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Phone</span>
                <span className="text-carbon">{reviewClaim.claimant_phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Role</span>
                <span className="text-carbon capitalize">{reviewClaim.claimant_role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Verification</span>
                <span className="text-carbon capitalize">{reviewClaim.verification_method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-carbon/60">Status</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusBadgeClasses[reviewClaim.status] || 'bg-carbon/10 text-carbon'
                  }`}
                >
                  {reviewClaim.status.replace(/_/g, ' ')}
                </span>
              </div>
              {reviewClaim.documents && reviewClaim.documents.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-carbon/60 block mb-1">Documents:</span>
                  <div className="space-y-1">
                    {reviewClaim.documents.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-azure-dragon hover:underline"
                      >
                        {doc.type} - uploaded {format(parseISO(doc.uploaded_at), 'dd MMM yyyy')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

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

            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">
                {t(DIRECTORY.REVIEW_NOTES)}
              </label>
              <textarea
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                rows={3}
                placeholder="Add review notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setReviewClaim(null)}>
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
          </div>
        </Modal>
      )}
    </div>
  );
};
