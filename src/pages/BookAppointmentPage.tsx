import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useSlots, useAvailableDoctors } from '@/hooks/useSlots';
import { useServices } from '@/hooks/useServices';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import {
  MdArrowBack,
  MdCalendarToday,
  MdAccessTime,
  MdPerson,
  MdLocalHospital,
  MdMedicalServices,
} from 'react-icons/md';

const appointmentSchema = z.object({
  doctor_id: z.string().min(1, 'Doctor is required'),
  service_id: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
  // Guest booking fields
  guest_name: z.string().optional(),
  guest_phone: z.string().optional(),
  guest_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

type GuestInfoFormData = {
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
};

export const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const { success: showSuccess, error: showError } = useToastStore();
  const createMutation = useCreateAppointment();

  // Get guest info from location state (if coming from auth page)
  const guestInfoFromState = (location.state as { guestInfo?: GuestInfoFormData })?.guestInfo;

  // Get slot and clinic info from URL params
  const slotId = searchParams.get('slot_id');
  const clinicId = searchParams.get('clinic_id');
  const slotDateParam = searchParams.get('slot_date');

  // Fetch slot details - use specific date if available (more efficient and reliable)
  const { data: slotsData, isLoading: isLoadingSlot } = useSlots(
    slotId && clinicId && slotDateParam
      ? {
          clinic_id: clinicId,
          slot_date: slotDateParam, // Use specific date from URL - ensures we get the slot
          available_only: false, // Include all slots to find our specific one
          limit: 100, // API maximum limit
        }
      : undefined
  );

  // Find the selected slot
  const selectedSlot = useMemo(() => {
    if (!slotId || !slotsData?.data) return null;
    return slotsData.data.find((slot) => slot.slot_id === slotId);
  }, [slotId, slotsData]);

  // Fetch available doctors for the selected slot
  const { data: availableDoctorsData } = useAvailableDoctors(
    selectedSlot && clinicId && slotDateParam
      ? {
          clinic_id: clinicId,
          slot_date: slotDateParam,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          service_id: selectedSlot.service_id || undefined,
        }
      : undefined
  );

  const availableDoctors = useMemo(() => availableDoctorsData || [], [availableDoctorsData]);

  // Fetch services for the clinic
  const { data: servicesData } = useServices({
    clinic_id: clinicId || undefined,
    is_active: true,
    limit: 100,
  });

  const services = useMemo(() => servicesData?.data || [], [servicesData]);

  // Check if user is a PATIENT type (even if patient data is still loading)
  const isPatientType = isAuthenticated && user?.user_type === 'PATIENT';
  
  // Check if user is logged in but not a patient (should not be able to book)
  const isLoggedInButNotPatient = isAuthenticated && user?.user_type !== 'PATIENT';
  
  // Get patient_id for authenticated patients
  const patientId = isPatientType ? user?.patient?.patient_id : undefined;
  
  // If user is a PATIENT type but patient data is still loading, show loading state
  const isWaitingForPatientData = isPatientType && !patientId && isLoadingAuth;

  // Redirect to auth page if not logged in and no guest info
  useEffect(() => {
    if (!isAuthenticated && !guestInfoFromState) {
      const slotId = searchParams.get('slot_id');
      const clinicId = searchParams.get('clinic_id');
      const slotDateParam = searchParams.get('slot_date');
      navigate(
        `/book-appointment-auth?clinic_id=${clinicId}&slot_id=${slotId}&slot_date=${slotDateParam}`,
        { replace: true }
      );
    }
  }, [isAuthenticated, guestInfoFromState, navigate, searchParams]);

  // Show error if logged in but not a patient
  useEffect(() => {
    if (isLoggedInButNotPatient) {
      showError('Only Patients are allowed to book an appointment');
    }
  }, [isLoggedInButNotPatient, showError]);

  // Show error if logged in but not a patient
  useEffect(() => {
    if (isLoggedInButNotPatient) {
      showError('Only Patients are allowed to book an appointment');
    }
  }, [isLoggedInButNotPatient, showError]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctor_id: selectedSlot?.doctor_id || '',
      service_id: selectedSlot?.service_id || '',
    },
  });

  // Update form when slot is found
  useEffect(() => {
    if (selectedSlot) {
      if (selectedSlot.doctor_id) {
        setValue('doctor_id', selectedSlot.doctor_id);
      }
      if (selectedSlot.service_id) {
        setValue('service_id', selectedSlot.service_id);
      }
    }
  }, [selectedSlot, setValue]);

  const selectedDoctorId = watch('doctor_id');

  // Filter services based on selected doctor (if doctor has assigned services)
  const availableServices = useMemo(() => {
    if (!selectedDoctorId) return services;
    // If doctor is selected, show services assigned to that doctor
    // For now, return all services - you might want to filter by doctor assignments
    return services;
  }, [services, selectedDoctorId]);

  const onSubmit = async (data: AppointmentFormData) => {
    if (!selectedSlot || !clinicId) {
      showError('Slot information is missing. Please go back and select a slot again.');
      return;
    }

    // Prevent booking if user is logged in but not a patient
    if (isLoggedInButNotPatient) {
      showError('Only Patients are allowed to book an appointment');
      return;
    }

    // Validate that selected doctor is available
    if (data.doctor_id) {
      const selectedDoctor = availableDoctors.find((d) => d.doctor_id === data.doctor_id);
      if (selectedDoctor && !selectedDoctor.isAvailable) {
        showError('The selected doctor is not available for this time slot.');
        return;
      }
    }

    try {
      // Parse appointment date from slot
      const appointmentDate = format(parseISO(selectedSlot.slot_date), 'yyyy-MM-dd');

      // Build appointment payload
      // For registered patients, use patient_id; for guests, use guest information
      
      // If user is a PATIENT type but patient_id is not available yet, wait for it
      if (isPatientType && !patientId) {
        if (isLoadingAuth) {
          showError('Loading patient information. Please wait...');
          return;
        }
        showError('Patient information is missing. Please log in again.');
        return;
      }

      // If user is not a registered patient and no guest info provided, show error
      if (!isPatientType && !guestInfoFromState && !data.guest_name) {
        showError('Please provide your information to continue as a guest.');
        return;
      }

      const appointmentPayload = {
        doctor_id: data.doctor_id,
        clinic_id: clinicId,
        service_id: data.service_id || undefined,
        appointment_date: appointmentDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        reason: data.reason || undefined,
        notes: data.notes || undefined,
        // Include patient_id for registered patients
        ...(isPatientType && patientId
          ? {
              patient_id: patientId,
            }
          : {
              // Guest booking fields
              guest_name: guestInfoFromState?.guest_name || data.guest_name || undefined,
              guest_phone: guestInfoFromState?.guest_phone || data.guest_phone || undefined,
              guest_email: guestInfoFromState?.guest_email || data.guest_email || undefined,
            }),
      };

      await createMutation.mutateAsync(appointmentPayload);
      showSuccess('Appointment booked successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to book appointment';
      showError(errorMessage);
    }
  };

  if (isLoadingSlot || isWaitingForPatientData) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!selectedSlot || !clinicId) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-medium text-smudged-lips mb-4">Slot Not Found</h2>
              <p className="text-carbon/60 mb-6">The selected slot is no longer available or invalid.</p>
              <Link to="/">
                <Button variant="primary">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Show error message if logged in but not a patient
  if (isLoggedInButNotPatient) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <h2 className="text-lg font-medium text-smudged-lips mb-4">Booking Not Allowed</h2>
              <p className="text-carbon/60 mb-6">Only Patients are allowed to book an appointment.</p>
              <Link to="/">
                <Button variant="primary">Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Format date and time for display
  const appointmentDate = parseISO(selectedSlot.slot_date);
  const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = selectedSlot.formatted_time_slot;

  return (
    <div className="flex min-h-screen flex-col bg-white-smoke">
      <PublicHeader />
      <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-carbon/60 hover:text-carbon transition-colors mb-4"
          >
            <MdArrowBack className="h-4 w-4" />
            Back to Search
          </Link>
          <h1 className="text-2xl font-heading font-semibold text-azure-dragon mb-2">Book Appointment</h1>
          <p className="text-sm text-carbon/60">Complete your appointment booking details</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selected Slot Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdCalendarToday className="h-5 w-5 text-azure-dragon" />
              Selected Appointment Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <MdCalendarToday className="h-5 w-5 text-azure-dragon/60" />
                <div>
                  <p className="text-xs text-carbon/60 mb-1">Date</p>
                  <p className="text-sm font-medium text-carbon">{formattedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdAccessTime className="h-5 w-5 text-azure-dragon/60" />
                <div>
                  <p className="text-xs text-carbon/60 mb-1">Time</p>
                  <p className="text-sm font-medium text-carbon">{formattedTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdLocalHospital className="h-5 w-5 text-azure-dragon/60" />
                <div>
                  <p className="text-xs text-carbon/60 mb-1">Clinic</p>
                  <p className="text-sm font-medium text-carbon">{selectedSlot.clinic_name}</p>
                </div>
              </div>
              {selectedSlot.doctor_name && (
                <div className="flex items-center gap-3">
                  <MdPerson className="h-5 w-5 text-azure-dragon/60" />
                  <div>
                    <p className="text-xs text-carbon/60 mb-1">Doctor</p>
                    <p className="text-sm font-medium text-carbon">{selectedSlot.doctor_name}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdMedicalServices className="h-5 w-5 text-azure-dragon" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Doctor Selection */}
            <div>
              <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                Doctor <span className="text-smudged-lips ml-0.5">*</span>
              </label>
              <Controller
                name="doctor_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select a doctor</option>
                    {availableDoctors.map((doctor) => (
                      <option
                        key={doctor.doctor_id}
                        value={doctor.doctor_id}
                        disabled={!doctor.isAvailable}
                      >
                        {doctor.doctor_name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        {!doctor.isAvailable && doctor.unavailability_reason
                          ? ` (${doctor.unavailability_reason})`
                          : ''}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.doctor_id && (
                <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.doctor_id.message}</p>
              )}
              {availableDoctors.length > 0 && (
                <p className="mt-1.5 text-xs text-carbon/60 font-ui">
                  {availableDoctors.filter((d) => d.isAvailable).length} doctor(s) available for this time slot
                </p>
              )}
            </div>

            {/* Service Selection */}
            <div>
              <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                Service (Optional)
              </label>
              <Controller
                name="service_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                  >
                    <option value="">Select a service (optional)</option>
                    {availableServices.map((service) => (
                      <option key={service.service_id} value={service.service_id}>
                        {service.name} {service.price ? `- ${service.price}` : ''}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.service_id && (
                <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.service_id.message}</p>
              )}
            </div>

            {/* Reason */}
            <Input
              label="Reason for Visit (Optional)"
              placeholder="e.g., Regular checkup, Consultation"
              {...register('reason')}
              error={errors.reason?.message}
            />

            {/* Notes */}
            <div>
              <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                Notes (Optional)
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Any additional information or special requests..."
                    className="flex w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                  />
                )}
              />
              {errors.notes && (
                <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Submit Button */}
        <div className="flex gap-4">
          <Link to="/" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" className="flex-1" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <>
                <Loading size="sm" className="mr-2" />
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
        </div>
        </form>
      </div>
      <PublicFooter />
    </div>
  );
};
