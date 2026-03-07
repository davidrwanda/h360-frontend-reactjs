import { useState, useMemo } from 'react';
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
import { useTranslation, TIMETABLE } from '@/i18n';

interface GenerateSlotsFormData {
  clinic_id: string;
  doctor_id?: string;
  service_id?: string;
  is_clinic_level: boolean;
  start_date: string;
  end_date: string;
  slot_duration_minutes?: number;
  max_concurrent_appointments?: number;
  days_of_week?: number[];
  day_start_time?: string;
  day_end_time?: string;
}

export const SlotGenerationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

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

  const generateSlotsSchema = useMemo(() => z.object({
    clinic_id: z.string().min(1, t(TIMETABLE.CLINIC_ID_REQUIRED)),
    doctor_id: z.string().optional(),
    service_id: z.string().optional(),
    is_clinic_level: z.boolean().default(false),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t(TIMETABLE.INVALID_DATE)),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, t(TIMETABLE.INVALID_DATE)),
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
    message: t(TIMETABLE.END_AFTER_START),
    path: ['end_date'],
  }), [t]);

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
      showError(error instanceof Error ? error.message : t(TIMETABLE.GENERATE_FAILED));
    }
  };

  const handleRegenerate = async () => {
    const formData = form.getValues();
    if (!formData.clinic_id) {
      showError(t(TIMETABLE.CLINIC_ID_REQUIRED));
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
      showError(error instanceof Error ? error.message : t(TIMETABLE.REGENERATE_FAILED));
    }
  };

  if (!clinicId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(TIMETABLE.NO_CLINIC_ASSIGNED)}</h2>
          <p className="text-sm text-carbon/60">
            {t(TIMETABLE.CONTACT_ADMIN)}
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
    { value: 1, label: t(TIMETABLE.MONDAY) },
    { value: 2, label: t(TIMETABLE.TUESDAY) },
    { value: 3, label: t(TIMETABLE.WEDNESDAY) },
    { value: 4, label: t(TIMETABLE.THURSDAY) },
    { value: 5, label: t(TIMETABLE.FRIDAY) },
    { value: 6, label: t(TIMETABLE.SATURDAY) },
    { value: 7, label: t(TIMETABLE.SUNDAY) },
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
              {t(TIMETABLE.SLOT_GENERATION_TITLE)}
            </h1>
            <p className="text-sm text-carbon/60">
              {t(TIMETABLE.SLOT_GENERATION_PAGE_DESC)}
            </p>
          </div>
        </div>
      </div>

      {/* Slot Type Selection */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdSchedule className="h-5 w-5 text-azure-dragon" />
            {t(TIMETABLE.SLOT_TYPE)}
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
              <span className="text-sm text-carbon">{t(TIMETABLE.CLINIC_LEVEL_SLOTS)}</span>
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
              <span className="text-sm text-carbon">{t(TIMETABLE.DOCTOR_LEVEL_SLOTS)}</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Generation Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t(TIMETABLE.GENERATE_SLOTS)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="clinic_id"
              control={form.control}
              render={({ field }) => (
                <Input
                  label={t(TIMETABLE.CLINIC_ID)}
                  value={field.value}
                  disabled
                  helperText={t(TIMETABLE.AUTO_SET_CLINIC)}
                />
              )}
            />

            {slotType === 'doctor' && (
              <Controller
                name="doctor_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Select
                    label={t(TIMETABLE.DOCTOR)}
                    options={[
                      { value: '', label: `${t(TIMETABLE.SELECT_DOCTOR)}...` },
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
                    label={t(TIMETABLE.START_DATE)}
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
                    label={t(TIMETABLE.END_DATE)}
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
                    label={t(TIMETABLE.SLOT_DURATION)}
                    type="number"
                    min={5}
                    max={120}
                    error={fieldState.error?.message}
                    helperText={t(TIMETABLE.SLOT_DURATION_DEFAULT)}
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
                    label={t(TIMETABLE.MAX_CONCURRENT)}
                    type="number"
                    min={1}
                    error={fieldState.error?.message}
                    helperText={t(TIMETABLE.MAX_CONCURRENT_DEFAULT)}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                  />
                )}
              />
            </div>

            <div className="rounded-lg border border-carbon/10 p-4 bg-carbon/5">
              <p className="text-xs font-medium text-carbon/80 mb-2">
                {t(TIMETABLE.CUSTOM_TIME_RANGE)}
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
                        label={t(TIMETABLE.DAY_START_TIME)}
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
                        label={t(TIMETABLE.DAY_END_TIME)}
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
                {t(TIMETABLE.REGENERATE_FUTURE)}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={generateMutation.isPending}
              >
                <MdPlayArrow className="h-4 w-4 mr-2" />
                {t(TIMETABLE.GENERATE_SLOTS)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card variant="elevated" className="mt-6">
        <CardHeader>
          <CardTitle>{t(TIMETABLE.INFORMATION)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-carbon/60">
            <p>
              {t(TIMETABLE.INFO_AUTO_GENERATE)}
            </p>
            <p>
              {t(TIMETABLE.INFO_MANUAL)}
            </p>
            <p>
              {t(TIMETABLE.INFO_TIMETABLE_USED)}
            </p>
            <p>
              {t(TIMETABLE.INFO_REGENERATE)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
