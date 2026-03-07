import { format, parseISO, isValid } from 'date-fns';
import { Button } from '@/components/ui';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { MdVisibility, MdEvent, MdPerson, MdLogin, MdPlayArrow, MdCheck, MdCancel, MdPersonOff } from 'react-icons/md';
import type { Appointment } from '@/api/appointments';

interface AppointmentsTableProps {
  appointments: Appointment[];
  isLoading?: boolean;
  onView?: (appointment: Appointment) => void;
  onCheckIn?: (appointment: Appointment) => void;
  onStart?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onNoShow?: (appointment: Appointment) => void;
}

const formatDate = (dateStr: string): string => {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? format(parsed, 'MMM d, yyyy') : dateStr;
};

const formatAppointmentTime = (apt: Appointment): string => {
  if (apt.formatted_time_slot) return apt.formatted_time_slot;
  if (apt.start_time) {
    const h = String(apt.start_time.hours).padStart(2, '0');
    const m = String(apt.start_time.minutes).padStart(2, '0');
    let time = `${h}:${m}`;
    if (apt.end_time) {
      const eh = String(apt.end_time.hours).padStart(2, '0');
      const em = String(apt.end_time.minutes).padStart(2, '0');
      time += ` - ${eh}:${em}`;
    }
    return time;
  }
  if (!apt.appointment_time) return '—';
  const parsed = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
  return isValid(parsed) ? format(parsed, 'hh:mm a') : apt.appointment_time;
};

export const AppointmentsTable = ({
  appointments,
  isLoading = false,
  onView,
  onCheckIn,
  onStart,
  onComplete,
  onCancel,
  onNoShow,
}: AppointmentsTableProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-carbon/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <MdEvent className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">{t(APPOINTMENT.NO_APPOINTMENTS_FOUND)}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-carbon/10">
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_PATIENT)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_DATE)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_TIME)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_DOCTOR)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_SERVICE)}</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_STATUS)}</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-carbon/60">{t(APPOINTMENT.COLUMN_ACTIONS)}</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => (
            <tr
              key={apt.appointment_id}
              className="border-b border-carbon/5 hover:bg-white-smoke transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <MdPerson className="h-4 w-4 text-azure-dragon shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-carbon truncate block">
                      {apt.patient_name || apt.guest_name || '—'}
                    </span>
                    {apt.is_guest_booking && (
                      <span className="text-[10px] font-medium text-carbon/50 bg-carbon/5 px-1.5 py-0.5 rounded">
                        {t(APPOINTMENT.GUEST_TAG)}
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">{formatDate(apt.appointment_date)}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">
                  {formatAppointmentTime(apt)}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">
                  {apt.doctor_name || <span className="text-carbon/40">—</span>}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm text-carbon/70">
                  {apt.service_name || <span className="text-carbon/40">—</span>}
                </span>
              </td>
              <td className="py-3 px-4">
                <AppointmentStatusBadge status={apt.status} />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  {apt.status === 'booked' && onCheckIn && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onCheckIn(apt)}
                      className="text-xs"
                    >
                      <MdLogin className="h-3.5 w-3.5 mr-1" />
                      {t(APPOINTMENT.CHECK_IN)}
                    </Button>
                  )}
                  {apt.status === 'checked_in' && onStart && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onStart(apt)}
                      className="text-xs"
                    >
                      <MdPlayArrow className="h-3.5 w-3.5 mr-1" />
                      {t(APPOINTMENT.START_CONSULTATION)}
                    </Button>
                  )}
                  {apt.status === 'in_progress' && onComplete && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onComplete(apt)}
                      className="text-xs"
                    >
                      <MdCheck className="h-3.5 w-3.5 mr-1" />
                      {t(APPOINTMENT.COMPLETE_APPOINTMENT)}
                    </Button>
                  )}
                  {apt.status === 'booked' && onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(apt)}
                      className="text-xs text-carbon/50"
                    >
                      <MdCancel className="h-3.5 w-3.5 mr-1" />
                      {t(APPOINTMENT.CANCEL_APPOINTMENT)}
                    </Button>
                  )}
                  {(apt.status === 'booked' || apt.status === 'checked_in') && onNoShow && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNoShow(apt)}
                      className="text-xs text-carbon/50"
                    >
                      <MdPersonOff className="h-3.5 w-3.5 mr-1" />
                      {t(APPOINTMENT.MARK_NO_SHOW)}
                    </Button>
                  )}
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(apt)}
                      className="h-8 w-8 p-0"
                      title={t(APPOINTMENT.VIEW_DETAILS)}
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
