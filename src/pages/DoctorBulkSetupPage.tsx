import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useClinic } from '@/hooks/useClinics';
import { useDoctor } from '@/hooks/useDoctors';
import { useInitializeDoctorTimetable } from '@/hooks/useTimetables';
import { useToastStore } from '@/store/toastStore';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Loading } from '@/components/ui';
import { MdArrowBack, MdSchedule, MdAdd, MdDelete } from 'react-icons/md';
import { validateSlotWithinOperatingHours } from '@/utils/operatingHours';
import type { DayOfWeek, InitializeDoctorTimetableSchedule } from '@/api/timetables';

const dayOfWeekOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const DoctorBulkSetupPage = () => {
  const { id: doctorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();

  const { data: doctor, isLoading: isLoadingDoctor } = useDoctor(doctorId!, !!doctorId);
  const { data: clinic } = useClinic(doctor?.clinic_id ?? undefined);
  const initializeMutation = useInitializeDoctorTimetable();

  const form = useForm<{
    schedule: InitializeDoctorTimetableSchedule[];
    is_active: boolean;
    replace_existing: boolean;
  }>({
    defaultValues: {
      schedule: dayOfWeekOptions.map((day) => ({
        day_of_week: day.value as DayOfWeek,
        time_slots: [],
      })),
      is_active: true,
      replace_existing: false,
    },
  });

  const handleSubmit = async (data: {
    schedule: InitializeDoctorTimetableSchedule[];
    is_active: boolean;
    replace_existing: boolean;
  }) => {
    if (!doctorId) {
      showError('Doctor not found');
      return;
    }

    for (const daySchedule of data.schedule) {
      for (const slot of daySchedule.time_slots) {
        const err = validateSlotWithinOperatingHours(
          clinic?.operating_hours,
          daySchedule.day_of_week,
          slot.start_time,
          slot.end_time
        );
        if (err) {
          showError(`${daySchedule.day_of_week}: ${err}`);
          return;
        }
      }
    }

    try {
      await initializeMutation.mutateAsync({
        doctorId,
        data,
      });
      showSuccess('Doctor timetable initialized successfully!');
      navigate(`/doctors/${doctorId}/timetable`);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to initialize timetable');
    }
  };

  if (isLoadingDoctor || !doctor) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (!doctorId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12 text-sm text-carbon/60">
          Doctor not found.
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mt-2">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/doctors/${doctorId}/timetable`)}
            className="h-9 w-9 p-0 shrink-0"
            aria-label="Back"
          >
            <MdArrowBack className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-carbon">
              Bulk Setup — {doctor.full_name}
            </h1>
            <p className="text-sm text-carbon/60">
              Configure time slots for each day of the week. You can add multiple slots per day.
            </p>
          </div>
        </div>
      </div>

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-carbon/10 bg-carbon/[0.02]">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-carbon">
            <MdSchedule className="h-5 w-5 text-azure-dragon" />
            Weekly Schedule
          </CardTitle>
          <p className="text-xs text-carbon/60 mt-1">
            Add start/end times and optional notes for each day. Slots are created when you submit.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col max-h-[calc(100vh-280px)] min-h-[400px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {dayOfWeekOptions.map((day, dayIndex) => {
                const schedule = form.watch('schedule');
                const daySchedule = schedule?.[dayIndex];
                const timeSlots = daySchedule?.time_slots || [];

                return (
                  <div key={day.value} className="space-y-2 rounded-lg border border-carbon/10 p-4">
                    <h4 className="text-sm font-medium text-carbon">{day.label}</h4>
                    <div className="space-y-2">
                      {timeSlots.map((slot, slotIndex) => {
                        const currentSchedule = form.getValues('schedule');
                        const currentDaySchedule = currentSchedule?.[dayIndex];
                        if (!currentDaySchedule) return null;

                        return (
                          <div key={slotIndex} className="flex flex-wrap items-center gap-2">
                            <Input
                              type="time"
                              value={slot.start_time || ''}
                              onChange={(e) => {
                                const newSchedule = [...currentSchedule];
                                if (newSchedule[dayIndex]?.time_slots[slotIndex]) {
                                  newSchedule[dayIndex].time_slots[slotIndex].start_time = e.target.value;
                                  form.setValue('schedule', newSchedule);
                                }
                              }}
                              className="flex-1 min-w-[100px]"
                            />
                            <span className="text-sm text-carbon/60">to</span>
                            <Input
                              type="time"
                              value={slot.end_time || ''}
                              onChange={(e) => {
                                const newSchedule = [...currentSchedule];
                                if (newSchedule[dayIndex]?.time_slots[slotIndex]) {
                                  newSchedule[dayIndex].time_slots[slotIndex].end_time = e.target.value;
                                  form.setValue('schedule', newSchedule);
                                }
                              }}
                              className="flex-1 min-w-[100px]"
                            />
                            <Input
                              placeholder="Notes (optional)"
                              value={slot.notes || ''}
                              onChange={(e) => {
                                const newSchedule = [...currentSchedule];
                                if (newSchedule[dayIndex]?.time_slots[slotIndex]) {
                                  newSchedule[dayIndex].time_slots[slotIndex].notes = e.target.value;
                                  form.setValue('schedule', newSchedule);
                                }
                              }}
                              className="flex-1 min-w-[120px]"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSchedule = [...currentSchedule];
                                if (newSchedule[dayIndex]?.time_slots) {
                                  newSchedule[dayIndex].time_slots.splice(slotIndex, 1);
                                  form.setValue('schedule', newSchedule);
                                }
                              }}
                              className="h-8 w-8 p-0 text-smudged-lips shrink-0"
                              aria-label="Remove slot"
                            >
                              <MdDelete className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newSchedule = [...form.getValues('schedule')];
                          const daySchedule = newSchedule[dayIndex];
                          if (daySchedule) {
                            daySchedule.time_slots.push({
                              start_time: '08:00',
                              end_time: '17:00',
                              notes: '',
                            });
                            form.setValue('schedule', newSchedule);
                          }
                        }}
                      >
                        <MdAdd className="h-4 w-4 mr-1" />
                        Add Time Slot
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 border-t border-carbon/10 bg-carbon/[0.02] p-4 space-y-4">
              <div className="flex flex-wrap gap-6">
                <Controller
                  name="is_active"
                  control={form.control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                      />
                      <span className="text-sm text-carbon">Mark all as active</span>
                    </label>
                  )}
                />
                <Controller
                  name="replace_existing"
                  control={form.control}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                      />
                      <span className="text-sm text-carbon">Replace existing timetables</span>
                    </label>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate(`/doctors/${doctorId}/timetable`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={initializeMutation.isPending}
                >
                  {initializeMutation.isPending ? 'Initializing…' : 'Initialize Schedule'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
