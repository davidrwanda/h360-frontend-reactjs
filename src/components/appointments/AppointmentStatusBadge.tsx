import { useTranslation, APPOINTMENT } from '@/i18n';
import { cn } from '@/utils/cn';
import type { Appointment } from '@/api/appointments';

const statusClasses: Record<string, string> = {
  booked: 'bg-azure-dragon/20 text-azure-dragon',
  checked_in: 'bg-blue-500/20 text-blue-600',
  in_progress: 'bg-yellow-500/20 text-yellow-600',
  completed: 'bg-bright-halo/20 text-bright-halo',
  cancelled: 'bg-smudged-lips/20 text-smudged-lips',
  no_show: 'bg-carbon/10 text-carbon/70',
};

const statusKeys: Record<string, string> = {
  booked: APPOINTMENT.STATUS_BOOKED,
  checked_in: APPOINTMENT.STATUS_CHECKED_IN,
  in_progress: APPOINTMENT.STATUS_IN_PROGRESS,
  completed: APPOINTMENT.STATUS_COMPLETED,
  cancelled: APPOINTMENT.STATUS_CANCELLED,
  no_show: APPOINTMENT.STATUS_NO_SHOW,
};

interface AppointmentStatusBadgeProps {
  status: Appointment['status'];
  className?: string;
}

export const AppointmentStatusBadge = ({ status, className }: AppointmentStatusBadgeProps) => {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        statusClasses[status] || 'bg-carbon/10 text-carbon/70',
        className
      )}
    >
      {t(statusKeys[status] || status)}
    </span>
  );
};
