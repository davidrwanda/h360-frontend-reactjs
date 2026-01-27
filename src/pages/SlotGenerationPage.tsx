import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinics';
import { useDoctors } from '@/hooks/useDoctors';
import { useGenerateSlots, useRegenerateFutureSlots } from '@/hooks/useSlotGeneration';
import { useToastStore } from '@/store/toastStore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
} from '@/components/ui';
import {
  MdArrowBack,
  MdSchedule,
  MdPlayArrow,
  MdRefresh,
} from 'react-icons/md';
import { format, addMonths } from 'date-fns';

const generateSlotsSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic is required'),
  doctor_id: z.string().optional(),
  service_id: z.string().optional(),
  is_clinic_level: z.boolean().default(false),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  slot_duration_minutes: z.number().min(5).max(120).optional(),
  max_concurrent_appointments: z.number().min(1).optional(),
  // Custom time range (if no timetable exists)
  days_of_week: z.array(z.number().min(1).max(7)).optional(),
  day_start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  day_end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

type GenerateSlotsFormData = z.infer<typeof generateSlotsSchema>;

export const SlotGenerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();

  // Get clinic_id from storage
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch (error) {
      console.warn('Failed to get clinic_id from localStorage:', error);
    }
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  const clinicId = getClinicIdFromStorage();

  const { data: clinic } = useClinic(clinicId);
  const { data: doctorsData } = useDoctors({
    clinic_id: clinicId,
    is_active: true,
    limit: 100,
  });

  const doctors = doctorsData?.data || [];

  const generateMutation = useGenerateSlots();
  const regenerateMutation = useRegenerateFutureSlots();

  const [slotType, setSlotType] = useState<'clinic' | 'doctor'>('clinic');

  const form = useForm<GenerateSlotsFormData>({
    resolver: zodResolver(generateSlotsSchema),
    defaultValues: {
      clinic_id: clinicId || '',
      doctor_id: '',
      is_clinic_level: true,
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
      slot_duration_minutes: clinic?.appointment_slot_duration || 15,
      max_concurrent_appointments: 1,
    },
  });

  const onSubmit = async (data: GenerateSlotsFormData) => {
    try {
      const result = await generateMutation.mutateAsync({
        clinic_id: data.clinic_id,
        doctor_id: data.doctor_id || undefined,
        service_id: data.service_id || undefined,
        is_clinic_level: data.is_clinic_level,
        start_date: data.start_date,
        end_date: data.end_date,
        slot_duration_minutes: data.slot_duration_minutes,
        max_concurrent_appointments: data.max_concurrent_appointments,
        days_of_week: data.days_of_week,
        day_start_time: data.day_start_time,
        day_end_time: data.day_end_time,
      });

      showSuccess(
        `Successfully generated ${result.created} slots${result.skipped > 0 ? ` (${result.skipped} skipped)` : ''}!`
      );
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to generate slots');
    }
  };

  const handleRegenerate = async () => {
    const formData = form.getValues();
    if (!formData.clinic_id) {
      showError('Clinic ID is required');
      return;
    }

    try {
      const result = await regenerateMutation.mutateAsync({
        clinic_id: formData.clinic_id,
        doctor_id: formData.doctor_id || undefined,
        end_date: formData.end_date,
      });

      showSuccess(
        `Successfully regenerated ${result.regenerated} slots${result.deleted > 0 ? ` (${result.deleted} deleted)` : ''}!`
      );
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to regenerate slots');
    }
  };

  if (!clinicId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">No Clinic Assigned</h2>
          <p className="text-sm text-carbon/60">
            You are not assigned to any clinic. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  const doctorOptions = doctors.map((doctor) => ({
    value: doctor.doctor_id,
    label: `${doctor.full_name}${doctor.specialty ? ` - ${doctor.specialty}` : ''}`,
  }));

  const daysOfWeekOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clinic-calendar')}
            className="h-8 w-8 p-0"
          >
            <MdArrowBack className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              Slot Generation
            </h1>
            <p className="text-sm text-carbon/60">
              Manually generate appointment slots for your clinic or doctors
            </p>
          </div>
        </div>
      </div>

      {/* Slot Type Selection */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdSchedule className="h-5 w-5 text-azure-dragon" />
            Slot Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="slotType"
                checked={slotType === 'clinic'}
                onChange={() => {
                  setSlotType('clinic');
                  form.setValue('is_clinic_level', true);
                  form.setValue('doctor_id', '');
                }}
                className="text-azure-dragon focus:ring-azure-dragon"
              />
              <span className="text-sm text-carbon">Clinic-level slots</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="slotType"
                checked={slotType === 'doctor'}
                onChange={() => {
                  setSlotType('doctor');
                  form.setValue('is_clinic_level', false);
                }}
                className="text-azure-dragon focus:ring-azure-dragon"
              />
              <span className="text-sm text-carbon">Doctor-level slots</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Generation Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Generate Slots</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="clinic_id"
              control={form.control}
              render={({ field }) => (
                <Input
                  label="Clinic ID"
                  value={field.value}
                  disabled
                  helperText="Automatically set to your clinic"
                />
              )}
            />

            {slotType === 'doctor' && (
              <Controller
                name="doctor_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Select
                    label="Doctor"
                    options={[
                      { value: '', label: 'Select a doctor...' },
                      ...doctorOptions,
                    ]}
                    error={fieldState.error?.message}
                    required={slotType === 'doctor'}
                    {...field}
                  />
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="start_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    label="Start Date"
                    type="date"
                    error={fieldState.error?.message}
                    required
                    {...field}
                  />
                )}
              />
              <Controller
                name="end_date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    label="End Date"
                    type="date"
                    error={fieldState.error?.message}
                    required
                    {...field}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="slot_duration_minutes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    label="Slot Duration (minutes)"
                    type="number"
                    min={5}
                    max={120}
                    error={fieldState.error?.message}
                    helperText="Default: 15 minutes"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                )}
              />
              <Controller
                name="max_concurrent_appointments"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Input
                    label="Max Concurrent Appointments"
                    type="number"
                    min={1}
                    error={fieldState.error?.message}
                    helperText="Default: 1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                )}
              />
            </div>

            <div className="rounded-lg border border-carbon/10 p-4 bg-carbon/5">
              <p className="text-xs font-medium text-carbon/80 mb-2">
                Custom Time Range (Optional - only used if no timetable exists)
              </p>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {daysOfWeekOptions.map((day) => {
                    const selectedDays = form.watch('days_of_week') || [];
                    return (
                      <label key={day.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDays.includes(day.value)}
                          onChange={(e) => {
                            const currentDays = form.getValues('days_of_week') || [];
                            if (e.target.checked) {
                              form.setValue('days_of_week', [...currentDays, day.value]);
                            } else {
                              form.setValue(
                                'days_of_week',
                                currentDays.filter((d) => d !== day.value)
                              );
                            }
                          }}
                          className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                        />
                        <span className="text-xs text-carbon">{day.label}</span>
                      </label>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="day_start_time"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Input
                        label="Day Start Time"
                        type="time"
                        error={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name="day_end_time"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Input
                        label="Day End Time"
                        type="time"
                        error={fieldState.error?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-carbon/10">
              <Button
                type="button"
                variant="outline"
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
              >
                <MdRefresh className="h-4 w-4 mr-2" />
                Regenerate Future Slots
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={generateMutation.isPending}
              >
                <MdPlayArrow className="h-4 w-4 mr-2" />
                Generate Slots
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card variant="elevated" className="mt-6">
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-carbon/60">
            <p>
              • Slots are automatically generated daily by the system at 02:00 UTC for the next 30
              days.
            </p>
            <p>
              • Use this page to manually generate slots for specific date ranges or after
              changing timetables.
            </p>
            <p>
              • If timetables exist for the clinic/doctor, they will be used. Otherwise, custom
              time ranges will be applied.
            </p>
            <p>
              • "Regenerate Future Slots" deletes all future unbooked slots and regenerates them
              based on current timetables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
