import { useState, useMemo } from 'react';
import { Modal, Button, Select } from '@/components/ui';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { useDoctors } from '@/hooks/useDoctors';
import { MdPerson, MdSwapHoriz } from 'react-icons/md';
import type { Appointment } from '@/api/appointments';

interface CheckInModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (appointmentId: string, options?: { doctor_id?: string; notes?: string }) => void;
  isCheckingIn?: boolean;
  clinicId?: string;
}

export const CheckInModal = ({
  appointment,
  isOpen,
  onClose,
  onCheckIn,
  isCheckingIn,
  clinicId,
}: CheckInModalProps) => {
  const { t } = useTranslation();
  const [changeDoctor, setChangeDoctor] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [notes, setNotes] = useState('');

  const { data: doctorsData } = useDoctors(
    changeDoctor && clinicId ? { clinic_id: clinicId, limit: 100 } : undefined
  );

  const doctorOptions = useMemo(() => {
    const options = [{ value: '', label: t(APPOINTMENT.CHECK_IN_SELECT_DOCTOR) }];
    (doctorsData?.data || []).forEach((doc) => {
      // Exclude the current doctor from the list
      if (doc.doctor_id !== appointment?.doctor_id) {
        options.push({
          value: doc.doctor_id,
          label: doc.full_name || `${doc.first_name} ${doc.last_name}`,
        });
      }
    });
    return options;
  }, [doctorsData, appointment?.doctor_id, t]);

  const handleCheckIn = () => {
    if (!appointment) return;

    if (changeDoctor && selectedDoctorId) {
      onCheckIn(appointment.appointment_id, {
        doctor_id: selectedDoctorId,
        notes: notes || undefined,
      });
    } else {
      onCheckIn(appointment.appointment_id);
    }

    // Reset state
    setChangeDoctor(false);
    setSelectedDoctorId('');
    setNotes('');
  };

  const handleClose = () => {
    setChangeDoctor(false);
    setSelectedDoctorId('');
    setNotes('');
    onClose();
  };

  if (!appointment) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t(APPOINTMENT.CHECK_IN_PATIENT)} size="md">
      <div className="space-y-5">
        {/* Patient info */}
        <div className="flex items-center gap-3 p-3 bg-white-smoke rounded-lg">
          <MdPerson className="h-8 w-8 text-azure-dragon shrink-0" />
          <div>
            <p className="text-sm font-medium text-carbon">
              {appointment.patient_name || appointment.guest_name || '—'}
            </p>
            {appointment.doctor_name && (
              <p className="text-xs text-carbon/60">
                {t(APPOINTMENT.DOCTOR)}: {appointment.doctor_name}
              </p>
            )}
          </div>
        </div>

        {/* Check-in options */}
        <div className="space-y-3">
          {/* Option 1: Current doctor */}
          <label
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              !changeDoctor
                ? 'border-azure-dragon bg-azure-dragon/5'
                : 'border-carbon/10 hover:border-carbon/20'
            }`}
          >
            <input
              type="radio"
              name="checkin-option"
              checked={!changeDoctor}
              onChange={() => {
                setChangeDoctor(false);
                setSelectedDoctorId('');
                setNotes('');
              }}
              className="text-azure-dragon focus:ring-azure-dragon"
            />
            <div>
              <p className="text-sm font-medium text-carbon">{t(APPOINTMENT.CHECK_IN_CURRENT_DOCTOR)}</p>
            </div>
          </label>

          {/* Option 2: Change doctor */}
          <label
            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              changeDoctor
                ? 'border-azure-dragon bg-azure-dragon/5'
                : 'border-carbon/10 hover:border-carbon/20'
            }`}
          >
            <input
              type="radio"
              name="checkin-option"
              checked={changeDoctor}
              onChange={() => setChangeDoctor(true)}
              className="mt-0.5 text-azure-dragon focus:ring-azure-dragon"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <MdSwapHoriz className="h-4 w-4 text-carbon/60" />
                <p className="text-sm font-medium text-carbon">{t(APPOINTMENT.CHECK_IN_CHANGE_DOCTOR)}</p>
              </div>
            </div>
          </label>
        </div>

        {/* Doctor select + notes (shown when changing doctor) */}
        {changeDoctor && (
          <div className="space-y-3 pl-2 border-l-2 border-azure-dragon/20 ml-4">
            <Select
              label={t(APPOINTMENT.CHECK_IN_SELECT_DOCTOR)}
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              options={doctorOptions}
            />
            <div>
              <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                {t(APPOINTMENT.CHECK_IN_NOTES)}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t(APPOINTMENT.CHECK_IN_NOTES_PLACEHOLDER)}
                rows={2}
                className="flex w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-carbon/10">
          <Button variant="outline" onClick={handleClose} disabled={isCheckingIn}>
            {t(APPOINTMENT.CANCEL)}
          </Button>
          <Button
            variant="primary"
            onClick={handleCheckIn}
            disabled={isCheckingIn || (changeDoctor && !selectedDoctorId)}
          >
            {isCheckingIn ? t(APPOINTMENT.CHECKING_IN) : t(APPOINTMENT.CHECK_IN)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
