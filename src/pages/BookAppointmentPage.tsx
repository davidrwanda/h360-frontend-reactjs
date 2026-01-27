import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { useCreateAppointment } from '@/hooks/useAppointments';
import { useSlots, useAvailableDoctors } from '@/hooks/useSlots';
import { useServices } from '@/hooks/useServices';
import type { AppointmentSlot } from '@/api/slots';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import { cn } from '@/utils/cn';
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
  const [selectedAlternativeSlot, setSelectedAlternativeSlot] = useState<string | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Reset expanded days and selected alternative slot when doctor changes
  useEffect(() => {
    setExpandedDays(new Set());
    setSelectedAlternativeSlot(null);
  }, [selectedDoctorId]);

  // Check if selected doctor is available for the original slot
  const selectedDoctorAvailable = useMemo(() => {
    if (!selectedDoctorId) return true;
    if (!availableDoctors.length) return false; // If no doctors in list, assume not available
    const doctor = availableDoctors.find((d) => d.doctor_id === selectedDoctorId);
    return doctor?.isAvailable ?? false; // If doctor not found, assume not available
  }, [selectedDoctorId, availableDoctors]);

  // Fetch alternative slots for selected doctor if not available for original slot
  const weekStart = useMemo(() => {
    if (!slotDateParam) return null;
    const date = parseISO(slotDateParam);
    return startOfWeek(date, { weekStartsOn: 1 });
  }, [slotDateParam]);

  const weekEnd = useMemo(() => {
    if (!weekStart) return null;
    return endOfWeek(weekStart, { weekStartsOn: 1 });
  }, [weekStart]);

  const { data: alternativeSlotsData } = useSlots(
    selectedDoctorId && !selectedDoctorAvailable && clinicId && weekStart && weekEnd
      ? {
          clinic_id: clinicId,
          doctor_id: selectedDoctorId,
          dateFrom: format(weekStart, 'yyyy-MM-dd'),
          dateTo: format(weekEnd, 'yyyy-MM-dd'),
          available_only: true,
          limit: 1000,
        }
      : undefined
  );

  const alternativeSlots = useMemo(() => {
    const slots = alternativeSlotsData?.data;
    if (!slots) return {} as Record<string, AppointmentSlot[]>;
    // Group slots by date
    const grouped: Record<string, AppointmentSlot[]> = {};
    slots.forEach((slot) => {
      const dateKey = slot.slot_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey]!.push(slot);
    });
    return grouped;
  }, [alternativeSlotsData]);

  // Check if there are days with more than 5 slots
  const hasDaysWithMoreSlots = useMemo(() => {
    return Object.values(alternativeSlots).some(slots => slots.length > 5);
  }, [alternativeSlots]);

  // Check if all days are expanded
  const isAllExpanded = useMemo(() => {
    if (!hasDaysWithMoreSlots) return false;
    const daysWithMore = Object.keys(alternativeSlots).filter(
      dateStr => (alternativeSlots[dateStr]?.length ?? 0) > 5
    );
    return daysWithMore.length > 0 && daysWithMore.every(dateStr => expandedDays.has(dateStr));
  }, [alternativeSlots, expandedDays, hasDaysWithMoreSlots]);

  // Determine which slot to display (alternative if selected, otherwise original)
  const displaySlot = useMemo(() => {
    if (selectedAlternativeSlot && alternativeSlotsData?.data) {
      const altSlot = alternativeSlotsData.data.find((s) => s.slot_id === selectedAlternativeSlot);
      if (altSlot) return altSlot;
    }
    return selectedSlot;
  }, [selectedAlternativeSlot, alternativeSlotsData, selectedSlot]);

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

    // Use alternative slot if selected, otherwise use original slot
    if (!selectedSlot) {
      showError('Slot information is missing. Please go back and select a slot again.');
      return;
    }
    
    let slotToUse = selectedSlot;
    if (selectedAlternativeSlot && alternativeSlotsData?.data) {
      const altSlot = alternativeSlotsData.data.find((s) => s.slot_id === selectedAlternativeSlot);
      if (altSlot) {
        slotToUse = altSlot;
      }
    }

    // Validate that selected doctor is available (only if using original slot)
    if (!selectedAlternativeSlot && data.doctor_id) {
      const selectedDoctor = availableDoctors.find((d) => d.doctor_id === data.doctor_id);
      if (selectedDoctor && !selectedDoctor.isAvailable) {
        showError('The selected doctor is not available for this time slot. Please select an alternative slot below.');
        return;
      }
    }

    try {
      // Parse appointment date from slot
      const appointmentDate = format(parseISO(slotToUse.slot_date), 'yyyy-MM-dd');

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
        start_time: slotToUse.start_time,
        end_time: slotToUse.end_time,
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
  // displaySlot is guaranteed to be non-null here due to early return check above
  const appointmentDate = parseISO(displaySlot!.slot_date);
  const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = displaySlot!.formatted_time_slot;

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
                  <p className="text-sm font-medium text-carbon">{displaySlot!.clinic_name}</p>
                </div>
              </div>
              {displaySlot!.doctor_name && (
                <div className="flex items-center gap-3">
                  <MdPerson className="h-5 w-5 text-azure-dragon/60" />
                  <div>
                    <p className="text-xs text-carbon/60 mb-1">Doctor</p>
                    <p className="text-sm font-medium text-carbon">{displaySlot!.doctor_name}</p>
                  </div>
                </div>
              )}
              {selectedAlternativeSlot && (
                <div className="col-span-2">
                  <p className="text-xs text-azure-dragon/80 font-medium">
                    ✓ Using alternative time slot
                  </p>
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
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                  >
                    <option value="">Select a doctor</option>
                    {availableDoctors.map((doctor) => (
                      <option
                        key={doctor.doctor_id}
                        value={doctor.doctor_id}
                        style={!doctor.isAvailable ? { color: '#666', fontStyle: 'italic' } : {}}
                      >
                        {doctor.doctor_name} {doctor.specialty ? `- ${doctor.specialty}` : ''}
                        {!doctor.isAvailable
                          ? doctor.unavailability_reason
                            ? ` (${doctor.unavailability_reason})`
                            : ' (No available slots)'
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
              {selectedDoctorId && !selectedDoctorAvailable && (
                <p className="mt-1.5 text-xs text-smudged-lips font-ui">
                  This doctor is not available for the selected time slot. Please choose an alternative slot below.
                </p>
              )}
            </div>

            {/* Alternative Slots - Show when selected doctor is not available and no alternative slot selected yet */}
            {selectedDoctorId && !selectedDoctorAvailable && Object.keys(alternativeSlots).length > 0 && !selectedAlternativeSlot && (
              <div className="mt-4">
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-2 tracking-wide">
                  Available Time Slots for Selected Doctor
                </label>
                <div className="space-y-3">
                  {weekStart && weekEnd && (
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 7 }, (_, i) => {
                        const day = addDays(weekStart, i);
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const daySlots = alternativeSlots[dateStr] || [];
                        const isOriginalDay = slotDateParam === dateStr;
                        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

                        return (
                          <div
                            key={dateStr}
                            className={cn(
                              'border rounded-lg p-2 min-h-[120px]',
                              isOriginalDay
                                ? 'border-smudged-lips/50 bg-smudged-lips/5'
                                : 'border-carbon/10 bg-white'
                            )}
                          >
                            <div className="mb-2">
                              <div className="text-[10px] text-carbon/60 mb-0.5">{dayNames[i]}</div>
                              <div
                                className={cn(
                                  'text-xs font-medium',
                                  isOriginalDay ? 'text-smudged-lips' : 'text-carbon'
                                )}
                              >
                                {format(day, 'd')}
                              </div>
                            </div>
                            <div className="space-y-1">
                              {daySlots.length === 0 ? (
                                <div className="text-[10px] text-carbon/40 text-center py-2">No slots</div>
                              ) : (
                                <>
                                  {daySlots
                                    .sort((a, b) => a.start_time.time - b.start_time.time)
                                    .slice(0, expandedDays.has(dateStr) ? daySlots.length : 5)
                                    .map((slot) => (
                                      <button
                                        key={slot.slot_id}
                                        type="button"
                                        onClick={() => setSelectedAlternativeSlot(slot.slot_id)}
                                        className={cn(
                                          'w-full text-[10px] p-1.5 rounded border text-left transition-colors',
                                          selectedAlternativeSlot === slot.slot_id
                                            ? 'bg-azure-dragon text-white border-azure-dragon'
                                            : 'bg-bright-halo/10 border-bright-halo/30 text-azure-dragon hover:bg-bright-halo/20'
                                        )}
                                      >
                                        {slot.formatted_time_slot || `${String(slot.start_time.hours).padStart(2, '0')}:${String(slot.start_time.minutes).padStart(2, '0')} - ${String(slot.end_time.hours).padStart(2, '0')}:${String(slot.end_time.minutes).padStart(2, '0')}`}
                                      </button>
                                    ))}
                                  {daySlots.length > 5 && !expandedDays.has(dateStr) && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDays(prev => new Set(prev).add(dateStr))}
                                      className="w-full text-[10px] text-azure-dragon hover:text-azure-dragon/80 hover:bg-azure-dragon/5 py-1.5 rounded border border-azure-dragon/20 transition-colors"
                                    >
                                      +{daySlots.length - 5} more
                                    </button>
                                  )}
                                  {expandedDays.has(dateStr) && daySlots.length > 5 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newSet = new Set(expandedDays);
                                        newSet.delete(dateStr);
                                        setExpandedDays(newSet);
                                      }}
                                      className="w-full text-[10px] text-carbon/60 hover:text-carbon hover:bg-carbon/5 py-1.5 rounded border border-carbon/20 transition-colors"
                                    >
                                      Show less
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Global Expand/Collapse Button */}
                  {hasDaysWithMoreSlots && (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (isAllExpanded) {
                            // Collapse all
                            setExpandedDays(new Set());
                          } else {
                            // Expand all days with more than 5 slots
                            const daysToExpand = Object.keys(alternativeSlots).filter(
                              dateStr => (alternativeSlots[dateStr]?.length ?? 0) > 5
                            );
                            setExpandedDays(new Set(daysToExpand));
                          }
                        }}
                        className={cn(
                          'px-4 py-2 text-sm rounded-md border transition-colors',
                          isAllExpanded
                            ? 'text-carbon/60 hover:text-carbon hover:bg-carbon/5 border-carbon/20'
                            : 'text-azure-dragon hover:text-azure-dragon/80 hover:bg-azure-dragon/5 border-azure-dragon/20'
                        )}
                      >
                        {isAllExpanded ? 'Show less' : 'Show more'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation message when alternative slot is selected */}
            {selectedAlternativeSlot && displaySlot && (
              <div className="mt-4 p-3 bg-azure-dragon/5 border border-azure-dragon/20 rounded-md">
                <p className="text-xs font-medium text-azure-dragon mb-1">
                  ✓ Alternative time slot selected
                </p>
                <p className="text-xs text-carbon/70">
                  Your appointment will be booked for {format(parseISO(displaySlot.slot_date), 'EEEE, MMMM d, yyyy')} at {displaySlot.formatted_time_slot}
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedAlternativeSlot(null)}
                  className="mt-2 text-xs text-azure-dragon hover:text-azure-dragon/80 underline"
                >
                  Change selection
                </button>
              </div>
            )}

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
