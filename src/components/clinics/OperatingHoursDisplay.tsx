import { OperatingHours } from '@/api/clinics';
import { cn } from '@/utils/cn';

interface OperatingHoursDisplayProps {
  operatingHours?: OperatingHours;
}

const days = [
  { key: 'monday' as const, label: 'Monday' },
  { key: 'tuesday' as const, label: 'Tuesday' },
  { key: 'wednesday' as const, label: 'Wednesday' },
  { key: 'thursday' as const, label: 'Thursday' },
  { key: 'friday' as const, label: 'Friday' },
  { key: 'saturday' as const, label: 'Saturday' },
  { key: 'sunday' as const, label: 'Sunday' },
];

export const OperatingHoursDisplay = ({ operatingHours }: OperatingHoursDisplayProps) => {
  if (!operatingHours) {
    return <p className="text-sm text-carbon/50">Not configured</p>;
  }

  return (
    <div className="space-y-2">
      {days.map((day) => {
        const dayHours = operatingHours[day.key];
        const isConfigured = dayHours && !dayHours.closed && dayHours.open && dayHours.close;

        return (
          <div key={day.key} className="flex items-center gap-4 text-sm">
            <div className="w-24 shrink-0">
              <span className="font-medium text-carbon">{day.label}</span>
            </div>
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-carbon/60 w-10 shrink-0">Open</span>
                <span className={cn(
                  "font-mono tabular-nums",
                  isConfigured ? "text-carbon" : "text-carbon/40"
                )}>
                  {dayHours?.open || '--:--'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-carbon/60 w-12 shrink-0">Close</span>
                <span className={cn(
                  "font-mono tabular-nums",
                  isConfigured ? "text-carbon" : "text-carbon/40"
                )}>
                  {dayHours?.close || '--:--'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
