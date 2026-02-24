import { format, parseISO, isValid } from 'date-fns';
import { Modal, Button } from '@/components/ui';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { MdPerson, MdEvent, MdAccessTime, MdLocalHospital, MdMedicalServices, MdNotes, MdInfo } from 'react-icons/md';
import type { Appointment } from '@/api/appointments';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn?: (appointment: Appointment) => void;
  isCheckingIn?: boolean;
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

const formatTimestamp = (dateStr: string): string => {
  const parsed = parseISO(dateStr);
  return isValid(parsed) ? format(parsed, 'MMM d, yyyy hh:mm a') : dateStr;
};

export const AppointmentDetailModal = ({ appointment, isOpen, onClose, onCheckIn, isCheckingIn }: AppointmentDetailModalProps) => {
  const { t } = useTranslation();

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t(APPOINTMENT.DETAIL_TITLE)} size="lg">
      <div className="space-y-6">
        {/* Status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_STATUS)}:</span>
          <AppointmentStatusBadge status={appointment.status} />
          {appointment.is_doctor_auto_assigned && (
            <span className="text-xs text-carbon/50 italic">{t(APPOINTMENT.DETAIL_AUTO_ASSIGNED)}</span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Patient / Guest */}
          <div className="flex items-start gap-3">
            <MdPerson className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">
                {appointment.is_guest_booking ? t(APPOINTMENT.DETAIL_GUEST_INFO) : t(APPOINTMENT.DETAIL_PATIENT)}
              </label>
              <p className="text-sm text-carbon mt-0.5">
                {appointment.patient_name || appointment.guest_name || '—'}
              </p>
              {appointment.is_guest_booking && appointment.guest_phone && (
                <p className="text-xs text-carbon/60 mt-0.5">{t(APPOINTMENT.DETAIL_GUEST_PHONE)}: {appointment.guest_phone}</p>
              )}
              {appointment.is_guest_booking && appointment.guest_email && (
                <p className="text-xs text-carbon/60">{t(APPOINTMENT.DETAIL_GUEST_EMAIL)}: {appointment.guest_email}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <MdEvent className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_DATE)}</label>
              <p className="text-sm text-carbon mt-0.5">{formatDate(appointment.appointment_date)}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <MdAccessTime className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_TIME)}</label>
              <p className="text-sm text-carbon mt-0.5">
                {formatAppointmentTime(appointment)}
              </p>
            </div>
          </div>

          {/* Clinic */}
          <div className="flex items-start gap-3">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_CLINIC)}</label>
              <p className="text-sm text-carbon mt-0.5">{appointment.clinic_name || '—'}</p>
            </div>
          </div>

          {/* Doctor */}
          <div className="flex items-start gap-3">
            <MdPerson className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_DOCTOR)}</label>
              <p className="text-sm text-carbon mt-0.5">{appointment.doctor_name || '—'}</p>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-start gap-3">
            <MdMedicalServices className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_SERVICE)}</label>
              <p className="text-sm text-carbon mt-0.5">{appointment.service_name || '—'}</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="flex items-start gap-3 pt-4 border-t border-carbon/10">
            <MdNotes className="h-5 w-5 text-azure-dragon mt-0.5 shrink-0" />
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_NOTES)}</label>
              <p className="text-sm text-carbon mt-0.5 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="flex items-start gap-3 pt-4 border-t border-carbon/10">
          <MdInfo className="h-5 w-5 text-carbon/40 mt-0.5 shrink-0" />
          <div className="grid gap-2 sm:grid-cols-2 flex-1">
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_CREATED)}</label>
              <p className="text-xs text-carbon/50 mt-0.5">{formatTimestamp(appointment.created_at)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_UPDATED)}</label>
              <p className="text-xs text-carbon/50 mt-0.5">{formatTimestamp(appointment.updated_at)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          {appointment.status === 'booked' && onCheckIn && (
            <Button
              variant="primary"
              onClick={() => onCheckIn(appointment)}
              disabled={isCheckingIn}
            >
              {t(APPOINTMENT.CHECK_IN)}
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {t(APPOINTMENT.CLOSE)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
