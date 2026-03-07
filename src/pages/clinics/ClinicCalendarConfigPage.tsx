import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useClinic } from '@/hooks/useClinics';
import {
  useClinicTimetables,
  useCreateClinicTimetableFromString,
  useUpdateClinicTimetable,
  useDeleteClinicTimetable,
} from '@/hooks/useTimetables';
import { useToastStore } from '@/store/toastStore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Loading,
  Modal,
  DeleteConfirmationModal,
} from '@/components/ui';
import {
  MdSchedule,
  MdAdd,
  MdEdit,
  MdDelete,
  MdPlayArrow,
  MdCalendarToday,
} from 'react-icons/md';
import { cn } from '@/utils/cn';
import { validateSlotWithinOperatingHours } from '@/utils/operatingHours';
import { UserCalendarViewModal } from '@/components/calendar/UserCalendarViewModal';
import type { DayOfWeek, ClinicTimetable } from '@/api/timetables';
import { useTranslation, CLINIC } from '@/i18n';

interface TimetableFormData {
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  is_active: boolean;
  slot_order: number;
  notes?: string;
}

export const ClinicCalendarConfigPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

  const timetableFormSchema = useMemo(() => z.object({
    day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, t(CLINIC.INVALID_TIME_FORMAT)),
    end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, t(CLINIC.INVALID_TIME_FORMAT)),
    is_active: z.boolean().default(true),
    slot_order: z.number().min(1).default(1),
    notes: z.string().optional(),
  }).refine((data) => {
    const startParts = data.start_time.split(':').map(Number);
    const endParts = data.end_time.split(':').map(Number);
    const startHours = startParts[0] ?? 0;
    const startMinutes = startParts[1] ?? 0;
    const endHours = endParts[0] ?? 0;
    const endMinutes = endParts[1] ?? 0;
    const startTime = startHours * 60 + startMinutes;
    const endTime = endHours * 60 + endMinutes;
    return endTime > startTime;
  }, {
    message: t(CLINIC.END_AFTER_START),
    path: ['end_time'],
  }), [t]);

  const dayOfWeekOptions = [
    { value: 'monday', label: t(CLINIC.MONDAY) },
    { value: 'tuesday', label: t(CLINIC.TUESDAY) },
    { value: 'wednesday', label: t(CLINIC.WEDNESDAY) },
    { value: 'thursday', label: t(CLINIC.THURSDAY) },
    { value: 'friday', label: t(CLINIC.FRIDAY) },
    { value: 'saturday', label: t(CLINIC.SATURDAY) },
    { value: 'sunday', label: t(CLINIC.SUNDAY) },
  ];

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
  const { data: timetables, isLoading } = useClinicTimetables(clinicId);
  const createMutation = useCreateClinicTimetableFromString();
  const updateMutation = useUpdateClinicTimetable();
  const deleteMutation = useDeleteClinicTimetable();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserCalendarOpen, setIsUserCalendarOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<ClinicTimetable | null>(null);
  const [deletingTimetable, setDeletingTimetable] = useState<ClinicTimetable | null>(null);

  const form = useForm<TimetableFormData>({
    resolver: zodResolver(timetableFormSchema),
    defaultValues: {
      day_of_week: 'monday',
      start_time: '08:00',
      end_time: '17:00',
      is_active: true,
      slot_order: 1,
      notes: '',
    },
  });

  const timetablesByDay: Record<DayOfWeek, ClinicTimetable[]> = timetables?.reduce((acc: Record<DayOfWeek, ClinicTimetable[]>, timetable) => {
    if (!acc[timetable.day_of_week]) {
      acc[timetable.day_of_week] = [];
    }
    acc[timetable.day_of_week].push(timetable);
    return acc;
  }, {} as Record<DayOfWeek, ClinicTimetable[]>) || ({} as Record<DayOfWeek, ClinicTimetable[]>);

  const handleOpenModal = (timetable?: ClinicTimetable) => {
    if (timetable) {
      setEditingTimetable(timetable);
      const startTime = `${String(timetable.start_time.hours).padStart(2, '0')}:${String(timetable.start_time.minutes).padStart(2, '0')}`;
      const endTime = `${String(timetable.end_time.hours).padStart(2, '0')}:${String(timetable.end_time.minutes).padStart(2, '0')}`;
      form.reset({
        day_of_week: timetable.day_of_week,
        start_time: startTime,
        end_time: endTime,
        is_active: timetable.is_active,
        slot_order: timetable.slot_order,
        notes: timetable.notes || '',
      });
    } else {
      setEditingTimetable(null);
      form.reset({
        day_of_week: 'monday',
        start_time: '08:00',
        end_time: '17:00',
        is_active: true,
        slot_order: 1,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTimetable(null);
    form.reset();
  };

  const handleToggleActive = async (timetable: ClinicTimetable) => {
    if (!clinicId) return;
    try {
      await updateMutation.mutateAsync({
        clinicId,
        id: timetable.timetable_id,
        data: { is_active: !timetable.is_active },
      });
      showSuccess(timetable.is_active ? t(CLINIC.SLOT_TURNED_OFF) : t(CLINIC.SLOT_TURNED_ON));
    } catch (error) {
      showError(error instanceof Error ? error.message : t(CLINIC.FAILED_TO_UPDATE));
    }
  };

  const onSubmit = async (data: TimetableFormData) => {
    if (!clinicId) {
      showError(t(CLINIC.CLINIC_ID_NOT_FOUND));
      return;
    }

    const slotError = validateSlotWithinOperatingHours(
      clinic?.operating_hours,
      data.day_of_week,
      data.start_time,
      data.end_time
    );
    if (slotError) {
      showError(slotError);
      return;
    }

    try {
      if (editingTimetable) {
        const startParts = data.start_time.split(':').map(Number);
        const endParts = data.end_time.split(':').map(Number);
        const startHours = startParts[0] ?? 0;
        const startMinutes = startParts[1] ?? 0;
        const endHours = endParts[0] ?? 0;
        const endMinutes = endParts[1] ?? 0;

        await updateMutation.mutateAsync({
          clinicId,
          id: editingTimetable.timetable_id,
          data: {
            start_time: {
              hours: startHours,
              minutes: startMinutes,
              time: startHours * 60 + startMinutes,
            },
            end_time: {
              hours: endHours,
              minutes: endMinutes,
              time: endHours * 60 + endMinutes,
            },
            is_active: data.is_active,
            slot_order: data.slot_order ?? 1,
            notes: data.notes || undefined,
          },
        });
        showSuccess(t(CLINIC.TIMETABLE_UPDATED));
      } else {
        await createMutation.mutateAsync({
          clinicId,
          data,
        });
        showSuccess(t(CLINIC.TIMETABLE_CREATED));
      }
      handleCloseModal();
    } catch (error) {
      showError(error instanceof Error ? error.message : t(CLINIC.FAILED_TO_SAVE));
    }
  };

  const handleDelete = async () => {
    if (!clinicId || !deletingTimetable) return;
    try {
      await deleteMutation.mutateAsync({
        clinicId,
        id: deletingTimetable.timetable_id,
      });
      showSuccess(t(CLINIC.TIMETABLE_DELETED));
      setDeletingTimetable(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : t(CLINIC.FAILED_TO_DELETE));
    }
  };

  if (!clinicId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(CLINIC.NO_CLINIC_ASSIGNED)}</h2>
          <p className="text-sm text-carbon/60">
            {t(CLINIC.NO_CLINIC_ASSIGNED_DESC)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-semibold text-carbon">
              {t(CLINIC.CLINIC_TIMETABLE)}
            </h1>
            <p className="text-sm text-carbon/60">
              {t(CLINIC.TIMETABLE_DESC)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="md" onClick={() => setIsUserCalendarOpen(true)}>
            <MdCalendarToday className="h-4 w-4 mr-2" />
            {t(CLINIC.VIEW_USER_CALENDAR)}
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate('/slot-generation')}>
            <MdPlayArrow className="h-4 w-4 mr-2" />
            {t(CLINIC.SLOT_GENERATION)}
          </Button>
          <Button variant="primary" size="md" onClick={() => handleOpenModal()}>
            <MdAdd className="h-4 w-4 mr-2" />
            {t(CLINIC.ADD_TIME_SLOT)}
          </Button>
        </div>
      </div>

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className="border-b border-carbon/10 bg-carbon/[0.02]">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-carbon">
            <MdSchedule className="h-5 w-5 text-azure-dragon" />
            {t(CLINIC.OPERATING_SCHEDULE)}
          </CardTitle>
          <p className="text-xs text-carbon/60 mt-1">
            {t(CLINIC.TOGGLE_SLOT_HELPER)}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <div className="divide-y divide-carbon/10">
              {dayOfWeekOptions.map((day) => {
                const dayKey = day.value as DayOfWeek;
                const dayTimetables: ClinicTimetable[] = (timetablesByDay[dayKey] ?? []).sort(
                  (a, b) => {
                    const startA = a.start_time?.time ?? 0;
                    const startB = b.start_time?.time ?? 0;
                    return startA !== startB ? startA - startB : a.slot_order - b.slot_order;
                  }
                );
                return (
                  <div
                    key={day.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 sm:py-3 hover:bg-carbon/[0.02] transition-colors"
                  >
                    <div className="w-28 shrink-0">
                      <span className="text-sm font-medium text-carbon">{day.label}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                      {dayTimetables.length === 0 ? (
                        <span className="text-sm text-carbon/50">{t(CLINIC.NO_TIME_SLOTS)}</span>
                      ) : (
                        dayTimetables.map((timetable) => {
                          const tooltipParts = [
                            timetable.notes ?? null,
                            timetable.slot_order > 1 ? `${t(CLINIC.ORDER)}: ${timetable.slot_order}` : null,
                          ].filter(Boolean) as string[];
                          const tooltip = tooltipParts.length > 0 ? tooltipParts.join('\n') : undefined;

                          return (
                          <div
                            key={timetable.timetable_id}
                            title={tooltip}
                            className={cn(
                              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                              timetable.is_active
                                ? 'border-azure-dragon/20 bg-azure-dragon/5 text-carbon'
                                : 'border-carbon/15 bg-carbon/5 text-carbon/50'
                            )}
                          >
                            <span className="font-medium tabular-nums">
                              {timetable.formatted_time}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={timetable.is_active}
                              aria-label={timetable.is_active ? t(CLINIC.TURN_OFF) : t(CLINIC.TURN_ON)}
                              onClick={() => handleToggleActive(timetable)}
                              disabled={updateMutation.isPending}
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md focus:outline-none focus:ring-1 focus:ring-azure-dragon focus:ring-offset-0"
                            >
                              <span
                                className={cn(
                                  'relative inline-block h-5 w-8 rounded-full transition-colors',
                                  timetable.is_active ? 'bg-azure-dragon/85' : 'bg-carbon/15'
                                )}
                              >
                                <span
                                  className={cn(
                                    'absolute top-0 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-150',
                                    timetable.is_active ? 'left-3' : 'left-0'
                                  )}
                                />
                              </span>
                            </button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(timetable)}
                              className="h-7 w-7 min-w-7 p-0 text-carbon/60 hover:text-azure-dragon"
                              aria-label={t(CLINIC.EDIT)}
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingTimetable(timetable)}
                              className="h-7 w-7 min-w-7 p-0 text-carbon/60 hover:text-smudged-lips"
                              aria-label={t(CLINIC.DELETE_TIME_SLOT)}
                            >
                              <MdDelete className="h-4 w-4" />
                            </Button>
                          </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTimetable ? t(CLINIC.EDIT_TIME_SLOT) : t(CLINIC.ADD_TIME_SLOT)}
        size="md"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="day_of_week"
            control={form.control}
            render={({ field, fieldState }) => (
              <Select
                label={t(CLINIC.DAY)}
                options={dayOfWeekOptions}
                error={fieldState.error?.message}
                disabled={!!editingTimetable}
                {...field}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="start_time"
              control={form.control}
              render={({ field, fieldState }) => (
                <Input
                  label={t(CLINIC.START)}
                  type="time"
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />
            <Controller
              name="end_time"
              control={form.control}
              render={({ field, fieldState }) => (
                <Input
                  label={t(CLINIC.END)}
                  type="time"
                  error={fieldState.error?.message}
                  required
                  {...field}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="slot_order"
              control={form.control}
              render={({ field }) => (
                <Input
                  label={t(CLINIC.ORDER)}
                  type="number"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              )}
            />
            <div className="flex items-end pb-2">
              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                    />
                    <span className="text-sm text-carbon">{t(CLINIC.ACTIVE_SLOT)}</span>
                  </label>
                )}
              />
            </div>
          </div>
          <Controller
            name="notes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Input
                label={t(CLINIC.NOTES_OPTIONAL)}
                error={fieldState.error?.message}
                {...field}
              />
            )}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              {t(CLINIC.CANCEL)}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTimetable ? t(CLINIC.UPDATE) : t(CLINIC.CREATE)}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteConfirmationModal
        isOpen={!!deletingTimetable}
        onClose={() => setDeletingTimetable(null)}
        onConfirm={handleDelete}
        title={t(CLINIC.DELETE_TIME_SLOT)}
        message={t(CLINIC.DELETE_SLOT_MSG, { time: deletingTimetable?.formatted_time || '', day: deletingTimetable?.day_of_week || '' })}
        isLoading={deleteMutation.isPending}
      />

      <UserCalendarViewModal
        isOpen={isUserCalendarOpen}
        onClose={() => setIsUserCalendarOpen(false)}
        clinicId={clinicId}
        title={t(CLINIC.CLINIC_CALENDAR_VIEW)}
      />
    </div>
  );
};
