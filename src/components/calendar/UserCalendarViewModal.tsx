import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from 'date-fns';
import { Modal, Loading } from '@/components/ui';
import { useSlots } from '@/hooks/useSlots';
import { cn } from '@/utils/cn';
import type { AppointmentSlot } from '@/api/slots';

interface UserCalendarViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicId?: string;
  doctorId?: string;
  title?: string;
}

export const UserCalendarViewModal = ({
  isOpen,
  onClose,
  clinicId,
  doctorId,
  title = 'User Calendar View',
}: UserCalendarViewModalProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  
  // Reset to today when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setIsAllExpanded(false);
    }
  }, [isOpen]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday

  const { data: slotsData, isLoading } = useSlots({
    clinic_id: clinicId,
    doctor_id: doctorId,
    dateFrom: format(weekStart, 'yyyy-MM-dd'),
    dateTo: format(weekEnd, 'yyyy-MM-dd'),
    limit: 1000,
  });

  const slots = slotsData?.data || [];
  const slotsByDate: Record<string, AppointmentSlot[]> = slots.reduce((acc, slot) => {
    const date = slot.slot_date;
    if (date) {
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
    }
    return acc;
  }, {} as Record<string, AppointmentSlot[]>);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate which days have more than 5 slots
  const daysWithMoreSlots = weekDays
    .map(d => format(d, 'yyyy-MM-dd'))
    .filter(d => (slotsByDate[d]?.length ?? 0) > 5);
  const hasDaysWithMoreSlots = daysWithMoreSlots.length > 0;

  const formatTime = (timeSlot: { hours: number; minutes: number }) => {
    return `${String(timeSlot.hours).padStart(2, '0')}:${String(timeSlot.minutes).padStart(2, '0')}`;
  };

  const getStatusColor = (slot: AppointmentSlot) => {
    const status = slot.status?.toLowerCase();
    if (status === 'booked') return 'bg-smudged-lips/10 border-smudged-lips/30 text-smudged-lips';
    if (status === 'cancelled') return 'bg-carbon/5 border-carbon/20 text-carbon/50';
    if (slot.is_at_capacity) return 'bg-carbon/5 border-carbon/20 text-carbon/50';
    return 'bg-bright-halo/10 border-bright-halo/30 text-azure-dragon';
  };

  const getStatusLabel = (slot: AppointmentSlot) => {
    const status = slot.status?.toLowerCase();
    if (status === 'booked') return 'Booked';
    if (status === 'cancelled') return 'Cancelled';
    if (slot.is_at_capacity) return 'Full';
    return 'Available';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Week Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            className="px-3 py-1.5 text-sm text-carbon/70 hover:text-carbon hover:bg-carbon/5 rounded-md transition-colors"
          >
            ← Previous Week
          </button>
          <div className="text-sm font-medium text-carbon">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            className="px-3 py-1.5 text-sm text-carbon/70 hover:text-carbon hover:bg-carbon/5 rounded-md transition-colors"
          >
            Next Week →
          </button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loading size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const daySlots = slotsByDate[dateStr] || [];
              const isToday = isSameDay(day, new Date());
              const isPast = day < new Date() && !isToday;

              return (
                <div
                  key={dateStr}
                  className={cn(
                    'border border-carbon/10 rounded-lg p-3 min-h-[400px] flex flex-col',
                    isToday && 'border-azure-dragon/50 bg-azure-dragon/5',
                    isPast && 'opacity-50'
                  )}
                >
                  <div className="mb-2 shrink-0">
                    <div className="text-xs text-carbon/60 mb-0.5">{dayNames[index]}</div>
                    <div
                      className={cn(
                        'text-sm font-medium',
                        isToday ? 'text-azure-dragon' : 'text-carbon',
                        isPast && 'text-carbon/50'
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1 overflow-y-auto min-h-0">
                    {daySlots.length === 0 ? (
                      <div className="text-xs text-carbon/40 text-center py-4">No slots</div>
                    ) : (
                      <>
                        {daySlots
                          .sort((a, b) => a.start_time.time - b.start_time.time)
                          .slice(0, isAllExpanded ? daySlots.length : 5)
                          .map((slot) => (
                            <div
                              key={slot.slot_id}
                              className={cn(
                                'text-xs p-1.5 rounded border shrink-0',
                                getStatusColor(slot)
                              )}
                              title={`${slot.formatted_time_slot || `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`} | ${getStatusLabel(slot)}`}
                            >
                              <div className="font-medium">
                                {slot.formatted_time_slot || `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
                              </div>
                              <div className="text-[10px] mt-0.5 opacity-70">
                                {getStatusLabel(slot)}
                              </div>
                            </div>
                          ))}
                        {!isAllExpanded && daySlots.length > 5 && (
                          <div className="text-xs text-carbon/40 text-center py-1">
                            +{daySlots.length - 5} more
                          </div>
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
              onClick={() => setIsAllExpanded(!isAllExpanded)}
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

        {/* Legend */}
        <div className="flex items-center gap-4 pt-4 border-t border-carbon/10 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-bright-halo/10 border-bright-halo/30" />
            <span className="text-carbon/70">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-smudged-lips/10 border-smudged-lips/30" />
            <span className="text-carbon/70">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-carbon/5 border-carbon/20" />
            <span className="text-carbon/70">Full/Cancelled</span>
          </div>
        </div>

        {/* Summary */}
        {slotsData && (
          <div className="text-xs text-carbon/60 pt-2 border-t border-carbon/10">
            Showing {slots.length} slot{slots.length !== 1 ? 's' : ''} from {format(weekStart, 'MMM d')} to{' '}
            {format(weekEnd, 'MMM d')}
            {slotsData.last_available_slot_date && (
              <span className="ml-2">
                • Last available slot: {format(parseISO(slotsData.last_available_slot_date), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
