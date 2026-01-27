import type { OperatingHours } from '@/api/clinics';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export interface DayBounds {
  openMinutes: number;
  closeMinutes: number;
  openStr: string;
  closeStr: string;
}

/**
 * Returns the clinic's open/close bounds for a given day, or null if the day
 * has no operating hours (closed or not set).
 */
export function getDayOperatingBounds(
  operatingHours: OperatingHours | undefined,
  dayOfWeek: string
): DayBounds | null {
  if (!operatingHours) return null;
  const dayKey = dayOfWeek.toLowerCase() as DayKey;
  const dayHours = operatingHours[dayKey];
  if (!dayHours || dayHours.closed || !dayHours.open || !dayHours.close) return null;
  return {
    openMinutes: parseTimeToMinutes(dayHours.open),
    closeMinutes: parseTimeToMinutes(dayHours.close),
    openStr: dayHours.open,
    closeStr: dayHours.close,
  };
}

/**
 * Validates that a time slot (start_time, end_time in "HH:mm") falls fully
 * within the clinic's operating hours for that day.
 * Returns an error message or null if valid.
 */
export function validateSlotWithinOperatingHours(
  operatingHours: OperatingHours | undefined,
  dayOfWeek: string,
  startTime: string,
  endTime: string
): string | null {
  const bounds = getDayOperatingBounds(operatingHours, dayOfWeek);
  if (!bounds) {
    return 'That day has no operating hours configured. Set clinic operating hours first.';
  }
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes < bounds.openMinutes) {
    return `Start time must be within clinic hours (${bounds.openStr}–${bounds.closeStr}).`;
  }
  if (endMinutes > bounds.closeMinutes) {
    return `End time must be within clinic hours (${bounds.openStr}–${bounds.closeStr}).`;
  }
  return null;
}
