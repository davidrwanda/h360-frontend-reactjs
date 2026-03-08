import { useState } from 'react';
import { useUnclaimedBookingAttempts, useSendOutreach } from '@/hooks/useDirectory';
import { useTranslation, DIRECTORY, COMMON } from '@/i18n';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, Modal, Input } from '@/components/ui';
import { format, parseISO } from 'date-fns';
import {
  MdEvent,
  MdSend,
  MdEmail,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';

export const AdminBookingAttemptsPage = () => {
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error } = useUnclaimedBookingAttempts({ page, limit });
  const sendOutreach = useSendOutreach();

  const attempts = data?.data || [];
  const totalPages = data?.totalPages || 0;

  // Outreach modal state
  const [outreachTarget, setOutreachTarget] = useState<{ clinicId: string; clinicName: string } | null>(null);
  const [outreachEmail, setOutreachEmail] = useState('');
  const [outreachMessage, setOutreachMessage] = useState('');

  const handleSendOutreach = async () => {
    if (!outreachTarget || !outreachEmail.trim()) return;
    try {
      await sendOutreach.mutateAsync({
        clinicId: outreachTarget.clinicId,
        data: {
          trigger_type: 'booking_attempt',
          recipient_email: outreachEmail.trim(),
          custom_message: outreachMessage.trim() || undefined,
        },
      });
      showSuccess(t(DIRECTORY.OUTREACH_SENT));
      setOutreachTarget(null);
      setOutreachEmail('');
      setOutreachMessage('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send outreach.';
      showError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(DIRECTORY.BOOKING_ATTEMPTS)}
          </h1>
          <p className="text-sm text-carbon/60">
            Booking attempts for unclaimed clinics. Use this to drive outreach and onboarding.
          </p>
        </div>
      </div>

      {/* Booking Attempts Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            {t(DIRECTORY.BOOKING_ATTEMPTS)} ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">Failed to load booking attempts.</p>
            </div>
          )}

          {isLoading ? (
            <Loading />
          ) : attempts.length === 0 ? (
            <div className="py-12 text-center">
              <MdEvent className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60">No booking attempts for unclaimed clinics.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-carbon/10 text-left">
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Clinic</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Visitor</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Contact</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Message</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Date</th>
                    <th className="pb-3 font-medium text-carbon/60">{t(DIRECTORY.OUTREACH)}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt) => (
                    <tr key={attempt.booking_attempt_id} className="border-b border-carbon/5 hover:bg-carbon/2">
                      <td className="py-3 pr-4">
                        <span className="font-medium text-carbon">{attempt.clinic_name || attempt.clinic_id}</span>
                      </td>
                      <td className="py-3 pr-4 text-carbon">{attempt.visitor_name}</td>
                      <td className="py-3 pr-4">
                        {attempt.visitor_email && (
                          <span className="block text-carbon/70 text-xs">{attempt.visitor_email}</span>
                        )}
                        {attempt.visitor_phone && (
                          <span className="block text-carbon/50 text-xs">{attempt.visitor_phone}</span>
                        )}
                        {!attempt.visitor_email && !attempt.visitor_phone && (
                          <span className="text-carbon/40 text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-carbon/60 max-w-xs truncate text-xs">
                        {attempt.message || '-'}
                      </td>
                      <td className="py-3 pr-4 text-carbon/60 text-xs">
                        {format(parseISO(attempt.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setOutreachTarget({
                              clinicId: attempt.clinic_id,
                              clinicName: attempt.clinic_name || attempt.clinic_id,
                            })
                          }
                        >
                          <MdSend className="h-3.5 w-3.5 mr-1" />
                          {t(DIRECTORY.SEND_OUTREACH)}
                        </Button>
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

      {/* Outreach Modal */}
      {outreachTarget && (
        <Modal
          isOpen={!!outreachTarget}
          onClose={() => setOutreachTarget(null)}
          title={t(DIRECTORY.SEND_OUTREACH)}
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-md bg-azure-dragon/5 border border-azure-dragon/15 p-3">
              <p className="text-sm text-carbon">
                <MdEmail className="h-4 w-4 inline mr-1 text-azure-dragon" />
                Send an outreach email to invite <strong>{outreachTarget.clinicName}</strong> to claim their listing on H360.
              </p>
            </div>
            <Input
              label="Recipient Email"
              type="email"
              placeholder="clinic@example.com"
              value={outreachEmail}
              onChange={(e) => setOutreachEmail(e.target.value)}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">Custom Message (optional)</label>
              <textarea
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                rows={3}
                placeholder="Add a personal message..."
                value={outreachMessage}
                onChange={(e) => setOutreachMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOutreachTarget(null)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                onClick={handleSendOutreach}
                disabled={!outreachEmail.trim() || sendOutreach.isPending}
              >
                <MdSend className="h-4 w-4 mr-2" />
                {sendOutreach.isPending ? t(COMMON.SAVING) : t(DIRECTORY.SEND_OUTREACH)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
