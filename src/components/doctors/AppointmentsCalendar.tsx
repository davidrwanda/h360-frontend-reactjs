import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Button } from '@/components/ui';
import { MdChevronLeft, MdChevronRight, MdCalendarToday, MdEvent } from 'react-icons/md';
import { cn } from '@/utils/cn';
import type { Appointment } from '@/api/appointments';

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  onDateClick?: (date: Date) => void;
  title?: string;
}

export const AppointmentsCalendar = ({ appointments, onDateClick, title = 'My Calendar' }: AppointmentsCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.appointment_date);
      return isSameDay(aptDate, date) && apt.status !== 'completed' && apt.status !== 'cancelled';
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card variant="elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MdCalendarToday className="h-5 w-5 text-azure-dragon" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPreviousMonth}
              className="h-8 w-8 p-0"
            >
              <MdChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-xs px-3"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextMonth}
              className="h-8 w-8 p-0"
            >
              <MdChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-carbon/60 mt-2">
          {format(currentMonth, 'MMMM yyyy')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-carbon/60 text-center py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((day, dayIdx) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isTodayDate = isToday(day);
              const hasAppointments = dayAppointments.length > 0;

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    'min-h-[80px] border border-carbon/10 rounded-md p-1.5 cursor-pointer transition-colors',
                    !isCurrentMonth && 'opacity-40',
                    isTodayDate && 'border-azure-dragon/50 bg-azure-dragon/5',
                    hasAppointments && 'bg-bright-halo/5 hover:bg-bright-halo/10',
                    onDateClick && 'hover:border-azure-dragon/30'
                  )}
                  onClick={() => onDateClick?.(day)}
                >
                  <div
                    className={cn(
                      'text-xs font-medium mb-1',
                      isTodayDate && 'text-azure-dragon font-semibold',
                      !isCurrentMonth && 'text-carbon/40'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayAppointments.slice(0, 2).map((apt) => {
                      const aptDateTime = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
                      return (
                        <div
                          key={apt.appointment_id}
                          className={cn(
                            'text-[10px] px-1 py-0.5 rounded truncate',
                            apt.status === 'booked'
                              ? 'bg-azure-dragon/20 text-azure-dragon'
                              : apt.status === 'checked_in'
                              ? 'bg-blue-500/20 text-blue-600'
                              : apt.status === 'in_progress'
                              ? 'bg-yellow-500/20 text-yellow-600'
                              : 'bg-carbon/10 text-carbon/70'
                          )}
                          title={`${format(aptDateTime, 'hh:mm a')} - ${apt.patient_name || apt.guest_name || 'Unknown'}`}
                        >
                          <MdEvent className="inline h-2.5 w-2.5 mr-0.5" />
                          {format(aptDateTime, 'hh:mm a')}
                        </div>
                      );
                    })}
                    {dayAppointments.length > 2 && (
                      <div className="text-[10px] text-carbon/60 px-1">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-carbon/10">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-azure-dragon/20 border border-azure-dragon/50"></div>
              <span className="text-carbon/70">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-azure-dragon/20"></div>
              <span className="text-carbon/70">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500/20"></div>
              <span className="text-carbon/70">Checked In</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500/20"></div>
              <span className="text-carbon/70">In Progress</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
