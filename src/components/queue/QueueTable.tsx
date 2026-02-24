import { useMemo } from 'react';
import { format, parseISO, isValid, differenceInMinutes } from 'date-fns';
import { Button } from '@/components/ui';
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge';
import { useTranslation, QUEUE } from '@/i18n';
import { MdQueue, MdPerson } from 'react-icons/md';
import type { QueueItem } from '@/api/queue';
import type { Appointment } from '@/api/appointments';

interface QueueTableProps {
  queue: QueueItem[];
  isLoading?: boolean;
  userRole?: string;
  onStartConsultation?: (item: QueueItem) => void;
  onComplete?: (item: QueueItem) => void;
  onMarkNoShow?: (item: QueueItem) => void;
}

const formatTime = (timeStr: string): string => {
  if (!timeStr) return '—';
  const parsed = parseISO(timeStr);
  return isValid(parsed) ? format(parsed, 'hh:mm a') : timeStr;
};

const getWaitMinutes = (checkInTime: string): number | null => {
  if (!checkInTime) return null;
  const parsed = parseISO(checkInTime);
  if (!isValid(parsed)) return null;
  return differenceInMinutes(new Date(), parsed);
};

export const QueueTable = ({
  queue,
  isLoading = false,
  userRole,
  onStartConsultation,
  onComplete,
  onMarkNoShow,
}: QueueTableProps) => {
  const { t } = useTranslation();
  const now = useMemo(() => new Date(), []);
  // Force re-render every minute for wait time
  void now;

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="text-center py-12">
        <MdQueue className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-carbon mb-1">{t(QUEUE.NO_PATIENTS_IN_QUEUE)}</h3>
        <p className="text-xs text-carbon/50">{t(QUEUE.QUEUE_EMPTY_DESC)}</p>
      </div>
    );
  }

  const isDoctor = userRole === 'DOCTOR';

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.POSITION)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.PATIENT)}</th>
            {!isDoctor && (
              <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.DOCTOR)}</th>
            )}
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.SERVICE)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.CHECK_IN_TIME)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.WAIT_TIME)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.STATUS)}</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">{t(QUEUE.ACTIONS)}</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => {
            const waitMins = getWaitMinutes(item.check_in_time);

            return (
              <tr
                key={item.queue_id}
                className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-carbon">{item.position}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MdPerson className="h-4 w-4 text-azure-dragon shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-carbon truncate block">
                        {item.patient_name || item.guest_name || '—'}
                      </span>
                      {item.is_guest_booking && (
                        <span className="text-[10px] font-medium text-carbon/50 bg-carbon/5 px-1.5 py-0.5 rounded">
                          {t(QUEUE.GUEST)}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                {!isDoctor && (
                  <td className="py-3 px-4">
                    <span className="text-sm text-carbon/70">
                      {item.doctor_name || '—'}
                    </span>
                  </td>
                )}
                <td className="py-3 px-4">
                  <span className="text-sm text-carbon/70">
                    {item.service_name || '—'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-carbon/70">
                    {formatTime(item.check_in_time)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-carbon/70">
                    {waitMins !== null ? `${waitMins} ${t(QUEUE.MINUTES_SHORT)}` : '—'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <AppointmentStatusBadge status={item.status as Appointment['status']} />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    {item.status === 'checked_in' && onStartConsultation && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onStartConsultation(item)}
                        className="text-xs"
                      >
                        {t(QUEUE.START_CONSULTATION)}
                      </Button>
                    )}
                    {item.status === 'in_progress' && onComplete && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onComplete(item)}
                        className="text-xs"
                      >
                        {t(QUEUE.COMPLETE)}
                      </Button>
                    )}
                    {(item.status === 'checked_in' || item.status === 'booked') && onMarkNoShow && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkNoShow(item)}
                        className="text-xs text-carbon/50"
                      >
                        {t(QUEUE.MARK_NO_SHOW)}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
