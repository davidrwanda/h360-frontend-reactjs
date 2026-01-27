import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClinic } from '@/hooks/useClinics';
import { useDoctor } from '@/hooks/useDoctors';
import {
  useDoctorTimetables,
  useCreateDoctorTimetableFromString,
  useUpdateDoctorTimetable,
  useDeleteDoctorTimetable,
} from '@/hooks/useTimetables';
import { useToastStore } from '@/store/toastStore';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Modal,
  DeleteConfirmationModal,
  Loading,
} from '@/components/ui';
import { MdSchedule, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { cn } from '@/utils/cn';
import { validateSlotWithinOperatingHours } from '@/utils/operatingHours';
import type { DayOfWeek, DoctorTimetable } from '@/api/timetables';

const dayOfWeekOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const timetableFormSchema = z.object({
  day_of_week: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
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
  message: 'End time must be after start time',
  path: ['end_time'],
});

type TimetableFormData = z.infer<typeof timetableFormSchema>;

interface DoctorTimetableDisplayProps {
  doctorId: string;
  canEdit?: boolean;
}

export const DoctorTimetableDisplay = ({ doctorId, canEdit = false }: DoctorTimetableDisplayProps) => {
  const { success: showSuccess, error: showError } = useToastStore();
  const { data: doctor } = useDoctor(doctorId);
  const { data: clinic } = useClinic(doctor?.clinic_id ?? undefined);
  const { data: timetables, isLoading } = useDoctorTimetables(doctorId);
  const createMutation = useCreateDoctorTimetableFromString();
  const updateMutation = useUpdateDoctorTimetable();
  const deleteMutation = useDeleteDoctorTimetable();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<DoctorTimetable | null>(null);
  const [deletingTimetable, setDeletingTimetable] = useState<DoctorTimetable | null>(null);

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

  // Group timetables by day
  const timetablesByDay: Record<DayOfWeek, DoctorTimetable[]> = timetables?.reduce((acc: Record<DayOfWeek, DoctorTimetable[]>, timetable) => {
    if (!acc[timetable.day_of_week]) {
      acc[timetable.day_of_week] = [];
    }
    acc[timetable.day_of_week].push(timetable);
    return acc;
  }, {} as Record<DayOfWeek, DoctorTimetable[]>) || ({} as Record<DayOfWeek, DoctorTimetable[]>);

  const handleOpenModal = (timetable?: DoctorTimetable) => {
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

  const onSubmit = async (data: TimetableFormData) => {
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
          doctorId,
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
        showSuccess('Timetable updated successfully!');
      } else {
        await createMutation.mutateAsync({
          doctorId,
          data,
        });
        showSuccess('Timetable created successfully!');
      }
      handleCloseModal();
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to save timetable');
    }
  };

  const handleToggleActive = async (timetable: DoctorTimetable) => {
    try {
      await updateMutation.mutateAsync({
        doctorId,
        id: timetable.timetable_id,
        data: { is_active: !timetable.is_active },
      });
      showSuccess(timetable.is_active ? 'Time slot turned off.' : 'Time slot turned on.');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!deletingTimetable) return;

    try {
      await deleteMutation.mutateAsync({
        doctorId,
        id: deletingTimetable.timetable_id,
      });
      showSuccess('Timetable deleted successfully!');
      setDeletingTimetable(null);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete timetable');
    }
  };

  return (
    <>
      <Card variant="elevated" className="overflow-hidden">
        <CardHeader className={canEdit ? 'border-b border-carbon/10 bg-carbon/[0.02]' : ''}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-carbon">
              <MdSchedule className="h-5 w-5 text-azure-dragon" />
              Availability Schedule
            </CardTitle>
            {canEdit && (
              <Button variant="primary" size="sm" onClick={() => handleOpenModal()}>
                <MdAdd className="h-4 w-4 mr-2" />
                Add time slot
              </Button>
            )}
          </div>
          {canEdit && (
            <p className="text-xs text-carbon/60 mt-1">
              Toggle a slot off to make it unavailable without deleting.
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loading size="sm" />
            </div>
          ) : (
            <div className="divide-y divide-carbon/10">
              {dayOfWeekOptions.map((day) => {
                const dayKey = day.value as DayOfWeek;
                const dayTimetables: DoctorTimetable[] = (timetablesByDay[dayKey] ?? []).sort(
                  (a, b) => {
                    const startA = a.start_time?.time ?? 0;
                    const startB = b.start_time?.time ?? 0;
                    return startA !== startB ? startA - startB : a.slot_order - b.slot_order;
                  }
                );
                return (
                  <div
                    key={day.value}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 hover:bg-carbon/[0.02] transition-colors"
                  >
                    <div className="w-28 shrink-0">
                      <span className="text-sm font-medium text-carbon">{day.label}</span>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
                      {dayTimetables.length === 0 ? (
                        <span className="text-sm text-carbon/50">No time slots</span>
                      ) : (
                        dayTimetables.map((timetable) => {
                          const tooltipParts = [
                            timetable.notes ?? null,
                            timetable.slot_order > 1 ? `Order: ${timetable.slot_order}` : null,
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
                            <span className="font-medium tabular-nums">{timetable.formatted_time}</span>
                            {canEdit && (
                              <>
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={timetable.is_active}
                                  aria-label={timetable.is_active ? 'Turn off' : 'Turn on'}
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
                                  aria-label="Edit"
                                >
                                  <MdEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeletingTimetable(timetable)}
                                  className="h-7 w-7 min-w-7 p-0 text-carbon/60 hover:text-smudged-lips"
                                  aria-label="Delete"
                                >
                                  <MdDelete className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTimetable ? 'Edit Time Slot' : 'Add Time Slot'}
        size="md"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="day_of_week"
            control={form.control}
            render={({ field }) => (
              <select
                {...field}
                disabled={!!editingTimetable}
                className="w-full h-10 rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dayOfWeekOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="start_time"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <label className="block text-xs font-medium text-carbon/80 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    {...field}
                    className="w-full h-10 rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                  />
                  {fieldState.error && (
                    <p className="mt-1.5 text-xs text-smudged-lips">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
            <Controller
              name="end_time"
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="w-full">
                  <label className="block text-xs font-medium text-carbon/80 mb-1.5">End Time</label>
                  <input
                    type="time"
                    {...field}
                    className="w-full h-10 rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                  />
                  {fieldState.error && (
                    <p className="mt-1.5 text-xs text-smudged-lips">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="slot_order"
              control={form.control}
              render={({ field }) => (
                <div className="w-full">
                  <label className="block text-xs font-medium text-carbon/80 mb-1.5">Slot Order</label>
                  <input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    className="w-full h-10 rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                  />
                </div>
              )}
            />
            <div className="flex items-center gap-2 pt-8">
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
                    <span className="text-sm text-carbon">Active</span>
                  </label>
                )}
              />
            </div>
          </div>

          <Controller
            name="notes"
            control={form.control}
            render={({ field }) => (
              <div className="w-full">
                <label className="block text-xs font-medium text-carbon/80 mb-1.5">Notes (Optional)</label>
                <input
                  type="text"
                  {...field}
                  className="w-full h-10 rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm font-ui text-carbon focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:border-azure-dragon/60"
                />
              </div>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTimetable ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingTimetable}
        onClose={() => setDeletingTimetable(null)}
        onConfirm={handleDelete}
        title="Delete Time Slot"
        message={`Are you sure you want to delete the time slot "${deletingTimetable?.formatted_time}" for ${deletingTimetable?.day_of_week}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
