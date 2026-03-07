import { format, parseISO, isValid } from 'date-fns';
import { Modal, Button } from '@/components/ui';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { usePatient } from '@/hooks/usePatients';
import {
  MdPerson, MdEvent, MdAccessTime, MdLocalHospital, MdMedicalServices,
  MdNotes, MdInfo, MdPhone, MdEmail, MdLocationOn, MdBloodtype,
  MdWarning, MdMedication, MdBadge, MdContactEmergency,
} from 'react-icons/md';
import type { Appointment } from '@/api/appointments';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn?: (appointment: Appointment) => void;
  onStart?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onNoShow?: (appointment: Appointment) => void;
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

export const AppointmentDetailModal = ({ appointment, isOpen, onClose, onCheckIn, onStart, onComplete, onCancel, onNoShow, isCheckingIn }: AppointmentDetailModalProps) => {
  const { t } = useTranslation();
  const patientId = appointment?.patient_id;
  const { data: patient, isLoading: isLoadingPatient } = usePatient(
    isOpen && patientId && !appointment?.is_guest_booking ? patientId : undefined
  );

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

        {/* Patient Details Section */}
        {!appointment.is_guest_booking && patientId && (
          <div className="pt-4 border-t border-carbon/10">
            <h4 className="text-sm font-medium text-carbon mb-3">{t(APPOINTMENT.DETAIL_PATIENT_INFO)}</h4>
            {isLoadingPatient ? (
              <p className="text-xs text-carbon/50 italic">{t(APPOINTMENT.DETAIL_LOADING_PATIENT)}</p>
            ) : patient ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {/* Patient Number */}
                {patient.patient_number && (
                  <div className="flex items-start gap-2">
                    <MdBadge className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_PATIENT_NUMBER)}</label>
                      <p className="text-sm text-carbon mt-0.5">{patient.patient_number}</p>
                    </div>
                  </div>
                )}

                {/* National ID */}
                {patient.national_id && (
                  <div className="flex items-start gap-2">
                    <MdBadge className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_NATIONAL_ID)}</label>
                      <p className="text-sm text-carbon mt-0.5">{patient.national_id}</p>
                    </div>
                  </div>
                )}

                {/* Date of Birth */}
                {patient.date_of_birth && (
                  <div className="flex items-start gap-2">
                    <MdEvent className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_DOB)}</label>
                      <p className="text-sm text-carbon mt-0.5">
                        {formatDate(patient.date_of_birth)}
                        {patient.age != null && <span className="text-carbon/50 ml-1">({patient.age} {t(APPOINTMENT.DETAIL_AGE).toLowerCase()})</span>}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gender */}
                {patient.gender && (
                  <div className="flex items-start gap-2">
                    <MdPerson className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_GENDER)}</label>
                      <p className="text-sm text-carbon mt-0.5">
                        {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Phone */}
                {patient.phone && (
                  <div className="flex items-start gap-2">
                    <MdPhone className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_PHONE)}</label>
                      <p className="text-sm text-carbon mt-0.5">{patient.phone}</p>
                    </div>
                  </div>
                )}

                {/* Email */}
                {patient.email && (
                  <div className="flex items-start gap-2">
                    <MdEmail className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_EMAIL)}</label>
                      <p className="text-sm text-carbon mt-0.5">{patient.email}</p>
                    </div>
                  </div>
                )}

                {/* Address */}
                {patient.address && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MdLocationOn className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_ADDRESS)}</label>
                      <p className="text-sm text-carbon mt-0.5">
                        {[patient.address, patient.city, patient.state, patient.postal_code, patient.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Blood Type */}
                {patient.blood_type && (
                  <div className="flex items-start gap-2">
                    <MdBloodtype className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_BLOOD_TYPE)}</label>
                      <p className="text-sm text-carbon mt-0.5">{patient.blood_type}</p>
                    </div>
                  </div>
                )}

                {/* Allergies */}
                {patient.allergies && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MdWarning className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_ALLERGIES)}</label>
                      <p className="text-sm text-carbon mt-0.5 whitespace-pre-wrap">{patient.allergies}</p>
                    </div>
                  </div>
                )}

                {/* Current Medications */}
                {patient.current_medications && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MdMedication className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_MEDICATIONS)}</label>
                      <p className="text-sm text-carbon mt-0.5 whitespace-pre-wrap">{patient.current_medications}</p>
                    </div>
                  </div>
                )}

                {/* Insurance */}
                {patient.insurance_provider && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MdInfo className="h-4 w-4 text-carbon/40 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_INSURANCE)}</label>
                      <p className="text-sm text-carbon mt-0.5">
                        {patient.insurance_provider}
                        {patient.insurance_number && <span className="text-carbon/50 ml-1">({patient.insurance_number})</span>}
                      </p>
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {patient.emergency_contact_name && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MdContactEmergency className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <label className="text-xs font-medium text-carbon/60">{t(APPOINTMENT.DETAIL_EMERGENCY_CONTACT)}</label>
                      <p className="text-sm text-carbon mt-0.5">
                        {patient.emergency_contact_name}
                        {patient.emergency_contact_relationship && (
                          <span className="text-carbon/50 ml-1">({patient.emergency_contact_relationship})</span>
                        )}
                        {patient.emergency_contact_phone && (
                          <span className="text-carbon/50 ml-1">— {patient.emergency_contact_phone}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

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
        <div className="flex justify-end gap-2 pt-2 flex-wrap">
          {appointment.status === 'booked' && onCheckIn && (
            <Button
              variant="primary"
              onClick={() => onCheckIn(appointment)}
              disabled={isCheckingIn}
            >
              {t(APPOINTMENT.CHECK_IN)}
            </Button>
          )}
          {appointment.status === 'checked_in' && onStart && (
            <Button
              variant="primary"
              onClick={() => { onStart(appointment); onClose(); }}
            >
              {t(APPOINTMENT.START_CONSULTATION)}
            </Button>
          )}
          {appointment.status === 'in_progress' && onComplete && (
            <Button
              variant="primary"
              onClick={() => { onComplete(appointment); onClose(); }}
            >
              {t(APPOINTMENT.COMPLETE_APPOINTMENT)}
            </Button>
          )}
          {appointment.status === 'booked' && onCancel && (
            <Button
              variant="outline"
              onClick={() => { onCancel(appointment); onClose(); }}
            >
              {t(APPOINTMENT.CANCEL_APPOINTMENT)}
            </Button>
          )}
          {(appointment.status === 'booked' || appointment.status === 'checked_in') && onNoShow && (
            <Button
              variant="outline"
              onClick={() => { onNoShow(appointment); onClose(); }}
            >
              {t(APPOINTMENT.MARK_NO_SHOW)}
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
