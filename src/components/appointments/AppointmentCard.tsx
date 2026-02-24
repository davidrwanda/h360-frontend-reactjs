import { format, parseISO, isValid } from 'date-fns';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { MdEvent, MdAccessTime, MdLocalHospital, MdPerson, MdMedicalServices } from 'react-icons/md';
import type { Appointment } from '@/api/appointments';

interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

export const AppointmentCard = ({ appointment, onClick }: AppointmentCardProps) => {
  const { t } = useTranslation();

  const aptDate = parseISO(appointment.appointment_date);
  const formattedDate = isValid(aptDate) ? format(aptDate, 'MMM d, yyyy') : appointment.appointment_date;

  let formattedTime = '—';
  if (appointment.formatted_time_slot) {
    formattedTime = appointment.formatted_time_slot;
  } else if (appointment.start_time) {
    const h = String(appointment.start_time.hours).padStart(2, '0');
    const m = String(appointment.start_time.minutes).padStart(2, '0');
    formattedTime = `${h}:${m}`;
    if (appointment.end_time) {
      const eh = String(appointment.end_time.hours).padStart(2, '0');
      const em = String(appointment.end_time.minutes).padStart(2, '0');
      formattedTime += ` - ${eh}:${em}`;
    }
  } else if (appointment.appointment_time) {
    const aptDateTime = parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`);
    if (isValid(aptDateTime)) {
      formattedTime = format(aptDateTime, 'hh:mm a');
    }
  }

  return (
    <button
      onClick={() => onClick?.(appointment)}
      className="w-full text-left p-4 rounded-lg border border-carbon/10 hover:border-azure-dragon/30 transition-colors bg-white"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm font-medium text-carbon">
          <MdEvent className="h-4 w-4 text-azure-dragon shrink-0" />
          {formattedDate}
          <span className="text-carbon/40">·</span>
          <MdAccessTime className="h-3.5 w-3.5 text-carbon/60" />
          {formattedTime}
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <div className="space-y-1.5">
        {appointment.clinic_name && (
          <div className="flex items-center gap-2 text-sm text-carbon/70">
            <MdLocalHospital className="h-4 w-4 text-carbon/40 shrink-0" />
            {appointment.clinic_name}
          </div>
        )}
        {appointment.doctor_name && (
          <div className="flex items-center gap-2 text-sm text-carbon/70">
            <MdPerson className="h-4 w-4 text-carbon/40 shrink-0" />
            {appointment.doctor_name}
          </div>
        )}
        {appointment.service_name && (
          <div className="flex items-center gap-2 text-sm text-carbon/70">
            <MdMedicalServices className="h-4 w-4 text-carbon/40 shrink-0" />
            {appointment.service_name}
          </div>
        )}
      </div>

      {appointment.notes && (
        <p className="text-xs text-carbon/50 mt-2 line-clamp-2">{appointment.notes}</p>
      )}

      {appointment.is_guest_booking && (
        <span className="inline-block mt-2 text-[10px] font-medium text-carbon/50 bg-carbon/5 px-1.5 py-0.5 rounded">
          {t(APPOINTMENT.GUEST_TAG)}
        </span>
      )}
    </button>
  );
};
