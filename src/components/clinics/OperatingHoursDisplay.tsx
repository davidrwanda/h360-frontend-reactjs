import { OperatingHours } from '@/api/clinics';

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
        if (!dayHours) return null;

        return (
          <div key={day.key} className="flex items-center justify-between text-sm">
            <span className="text-carbon/70 font-medium">{day.label}</span>
            <span className="text-carbon">
              {dayHours.closed
                ? 'Closed'
                : dayHours.open && dayHours.close
                  ? `${dayHours.open} - ${dayHours.close}`
                  : 'Not set'}
            </span>
          </div>
        );
      })}
    </div>
  );
};
