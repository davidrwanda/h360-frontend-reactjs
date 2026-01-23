import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, parseISO, addWeeks, subWeeks, isBefore, startOfDay, isAfter } from 'date-fns';
import { useSlots } from '@/hooks/useSlots';
import { Loading } from '@/components/ui';
import type { Clinic } from '@/api/clinics';
import type { AppointmentSlot } from '@/api/slots';
import { MdChevronLeft, MdChevronRight, MdExpandMore, MdLocalHospital } from 'react-icons/md';

interface ClinicSlotsDisplayProps {
  clinic: Clinic;
  serviceId?: string;
  onSlotSelect?: (slot: AppointmentSlot) => void;
}

export const ClinicSlotsDisplay = ({
  clinic,
  serviceId,
  onSlotSelect,
}: ClinicSlotsDisplayProps) => {
  const today = useMemo(() => startOfDay(new Date()), []);
  const twoWeeksFromToday = useMemo(() => addDays(today, 14), [today]);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Start from today's week, but ensure we don't go before today
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    return isBefore(weekStart, today) ? today : weekStart;
  });
  const [showAllSlots, setShowAllSlots] = useState(false);

  // Fetch slots with two-week interval from today
  const { data: slotsData, isLoading } = useSlots({
    clinic_id: clinic.clinic_id,
    service_id: serviceId,
    dateFrom: format(today, 'yyyy-MM-dd'),
    dateTo: format(twoWeeksFromToday, 'yyyy-MM-dd'),
    available_only: true,
    limit: 100,
  });

  const slots = useMemo(() => slotsData?.data || [], [slotsData?.data]);
  const lastAvailableDate = useMemo(() => {
    return slotsData?.last_available_slot_date 
      ? parseISO(slotsData.last_available_slot_date)
      : null;
  }, [slotsData?.last_available_slot_date]);

  // Generate days for the week, filtering out past dates
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const day = addDays(currentWeekStart, i);
      // Only include days that are today or in the future
      if (!isBefore(day, today)) {
        days.push(day);
      }
    }
    return days;
  }, [currentWeekStart, today]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AppointmentSlot[]> = {};
    slots.forEach((slot) => {
      const dateKey = format(parseISO(slot.slot_date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    return grouped;
  }, [slots]);

  // Get slots for a specific date
  const getSlotsForDate = (date: Date): AppointmentSlot[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const daySlots = slotsByDate[dateKey] || [];
    // Sort by start time
    return daySlots.sort((a, b) => a.start_time.time - b.start_time.time);
  };

  const handlePreviousWeek = () => {
    const previousWeek = subWeeks(currentWeekStart, 1);
    // Don't allow going before today
    if (!isBefore(previousWeek, today)) {
      setCurrentWeekStart(previousWeek);
    } else {
      // If previous week would be before today, set to today
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      setCurrentWeekStart(isBefore(weekStart, today) ? today : weekStart);
    }
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, 1);
    // Check if next week would go beyond last available date
    if (lastAvailableDate && isAfter(nextWeek, lastAvailableDate)) {
      return; // Don't allow going beyond last available date
    }
    // Check if next week would go beyond two weeks from today
    if (isAfter(nextWeek, twoWeeksFromToday)) {
      return; // Don't allow going beyond two weeks
    }
    setCurrentWeekStart(nextWeek);
  };

  // Check if we can go to previous week (not before today)
  const canGoPrevious = useMemo(() => {
    const previousWeek = subWeeks(currentWeekStart, 1);
    return !isBefore(previousWeek, today);
  }, [currentWeekStart, today]);

  // Check if we can go to next week (not beyond last available date or two weeks)
  const canGoNext = useMemo(() => {
    const nextWeek = addWeeks(currentWeekStart, 1);
    if (lastAvailableDate && isAfter(nextWeek, lastAvailableDate)) {
      return false;
    }
    return !isAfter(nextWeek, twoWeeksFromToday);
  }, [currentWeekStart, lastAvailableDate, twoWeeksFromToday]);

  const getFullAddress = () => {
    const parts = [
      clinic.address,
      clinic.city,
      clinic.state,
      clinic.postal_code,
      clinic.country,
    ].filter(Boolean);
    return parts.join(', ') || 'Address not available';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-carbon/10 overflow-hidden">
      {/* Clinic Header */}
      <div className="bg-azure-dragon/5 p-4 border-b border-carbon/10">
        <div className="flex items-start gap-3">
          <div className="bg-azure-dragon/10 p-2 rounded-lg shrink-0">
            <MdLocalHospital className="h-6 w-6 text-azure-dragon" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-carbon mb-1">{clinic.name}</h3>
            <p className="text-sm text-carbon/70 line-clamp-2">{getFullAddress()}</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousWeek}
            disabled={!canGoPrevious}
            className={`p-2 rounded-lg transition-colors ${
              canGoPrevious
                ? 'hover:bg-carbon/5 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            aria-label="Previous week"
          >
            <MdChevronLeft className="h-5 w-5 text-carbon" />
          </button>
          <div className="text-sm font-medium text-carbon">
            {weekDays.length > 0 && weekDays[0] ? (
              <>
                {format(weekDays[0], 'd MMM')} - {(() => {
                  const lastDay = weekDays[weekDays.length - 1];
                  return lastDay ? format(lastDay, 'd MMM yyyy') : format(today, 'd MMM yyyy');
                })()}
              </>
            ) : (
              format(today, 'd MMM yyyy')
            )}
          </div>
          <button
            onClick={handleNextWeek}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-colors ${
              canGoNext
                ? 'hover:bg-carbon/5 cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
            }`}
            aria-label="Next week"
          >
            <MdChevronRight className="h-5 w-5 text-carbon" />
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {weekDays.map((day) => (
            <div key={day.toISOString()} className="text-center">
              <div className="text-xs font-medium text-carbon/60 mb-1">
                {format(day, 'EEE')}
              </div>
              <div className="text-sm font-semibold text-carbon">
                {format(day, 'd MMM')}
              </div>
            </div>
          ))}
        </div>

        {/* Slots Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="sm" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {weekDays.map((day) => {
              const daySlots = getSlotsForDate(day);
              const displaySlots = showAllSlots ? daySlots : daySlots.slice(0, 5);
              const hasMore = daySlots.length > 5;

              return (
                <div key={day.toISOString()} className="space-y-2">
                  {displaySlots.length > 0 ? (
                    <>
                      {displaySlots.map((slot) => (
                        <button
                          key={slot.slot_id}
                          onClick={() => onSlotSelect?.(slot)}
                          className="w-full px-3 py-2 text-xs font-medium text-azure-dragon bg-azure-dragon/10 hover:bg-azure-dragon/20 rounded-lg transition-colors text-center"
                        >
                          {slot.formatted_time_slot}
                        </button>
                      ))}
                      {hasMore && !showAllSlots && (
                        <button
                          onClick={() => setShowAllSlots(true)}
                          className="w-full text-xs text-carbon/60 hover:text-azure-dragon py-1"
                        >
                          +{daySlots.length - 5} more
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-carbon/40 text-center py-2">No slots</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Show More Schedules Link */}
        {slots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-carbon/10">
            <button
              onClick={() => setShowAllSlots(!showAllSlots)}
              className="flex items-center justify-center gap-2 text-sm text-azure-dragon hover:text-azure-dragon/80 mx-auto"
            >
              {showAllSlots ? 'Show less' : 'See more schedules'}
              <MdExpandMore
                className={`h-4 w-4 transition-transform ${showAllSlots ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}

        {/* Contact Message */}
        {slots.length === 0 && !isLoading && (
          <div className="mt-4 pt-4 border-t border-carbon/10">
            <p className="text-xs text-carbon/60 text-center">
              If you do not find a time slot that suits you, please contact your veterinarian at:{' '}
              {clinic.phone ? (
                <a href={`tel:${clinic.phone}`} className="text-azure-dragon hover:underline">
                  {clinic.phone}
                </a>
              ) : (
                <span>Contact clinic</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
