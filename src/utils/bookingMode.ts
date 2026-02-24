import type { BookingMode } from '@/api/clinics';

export interface BookingModeRequirements {
  doctorRequired: boolean;
  serviceRequired: boolean;
  doctorVisible: boolean;
  serviceVisible: boolean;
  canAutoAssignDoctor: boolean;
}

export function getBookingModeRequirements(
  mode: BookingMode | undefined,
  options?: { autoAssignDoctorEnabled?: boolean; serviceRequiresDoctor?: boolean }
): BookingModeRequirements {
  const effectiveMode = mode || 'both_required';
  const autoAssign = options?.autoAssignDoctorEnabled ?? false;

  switch (effectiveMode) {
    case 'both_required':
      return {
        doctorRequired: options?.serviceRequiresDoctor !== false,
        serviceRequired: true,
        doctorVisible: true,
        serviceVisible: true,
        canAutoAssignDoctor: autoAssign && options?.serviceRequiresDoctor === false,
      };
    case 'doctor_required':
      return {
        doctorRequired: true,
        serviceRequired: false,
        doctorVisible: true,
        serviceVisible: true,
        canAutoAssignDoctor: false,
      };
    case 'service_required':
      return {
        doctorRequired: false,
        serviceRequired: true,
        doctorVisible: true,
        serviceVisible: true,
        canAutoAssignDoctor: autoAssign,
      };
    case 'flexible':
      return {
        doctorRequired: false,
        serviceRequired: false,
        doctorVisible: true,
        serviceVisible: true,
        canAutoAssignDoctor: autoAssign,
      };
    case 'time_slot_only':
      return {
        doctorRequired: false,
        serviceRequired: false,
        doctorVisible: false,
        serviceVisible: false,
        canAutoAssignDoctor: autoAssign,
      };
    default:
      return {
        doctorRequired: true,
        serviceRequired: true,
        doctorVisible: true,
        serviceVisible: true,
        canAutoAssignDoctor: false,
      };
  }
}
