import { OperatingHours } from '@/api/clinics';
import { Input } from '@/components/ui';

interface OperatingHoursEditorProps {
  value?: OperatingHours;
  onChange: (value: OperatingHours) => void;
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

export const OperatingHoursEditor = ({ value = {}, onChange }: OperatingHoursEditorProps) => {
  const updateDay = (day: keyof OperatingHours, updates: Partial<OperatingHours[typeof day]>) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        ...updates,
      },
    });
  };

  return (
    <div className="space-y-3">
      {days.map((day) => {
        const dayHours = value[day.key] || {};
        return (
          <div key={day.key} className="flex flex-col gap-2 rounded-md border border-carbon/10 p-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!dayHours.closed}
                onChange={(e) => updateDay(day.key, { closed: !e.target.checked })}
                className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
              />
              <label className="text-sm font-medium text-carbon">{day.label}</label>
            </div>
            {!dayHours.closed && (
              <div className="grid grid-cols-2 gap-2 ml-6">
                <Input
                  label="Open"
                  type="time"
                  value={dayHours.open || ''}
                  onChange={(e) => updateDay(day.key, { open: e.target.value })}
                  className="text-xs"
                />
                <Input
                  label="Close"
                  type="time"
                  value={dayHours.close || ''}
                  onChange={(e) => updateDay(day.key, { close: e.target.value })}
                  className="text-xs"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
