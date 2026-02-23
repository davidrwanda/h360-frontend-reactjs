import { useMemo } from 'react';
import { OperatingHours } from '@/api/clinics';
import { Input } from '@/components/ui';
import { useTranslation, CLINIC } from '@/i18n';

interface OperatingHoursEditorProps {
  value?: OperatingHours;
  onChange: (value: OperatingHours) => void;
}

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '17:00';

export const OperatingHoursEditor = ({ value = {}, onChange }: OperatingHoursEditorProps) => {
  const { t } = useTranslation();

  const days = [
    { key: 'monday' as const, label: t(CLINIC.MONDAY) },
    { key: 'tuesday' as const, label: t(CLINIC.TUESDAY) },
    { key: 'wednesday' as const, label: t(CLINIC.WEDNESDAY) },
    { key: 'thursday' as const, label: t(CLINIC.THURSDAY) },
    { key: 'friday' as const, label: t(CLINIC.FRIDAY) },
    { key: 'saturday' as const, label: t(CLINIC.SATURDAY) },
    { key: 'sunday' as const, label: t(CLINIC.SUNDAY) },
  ];

  // Check if all active days have the default hours (08:00 - 17:00)
  const isDefault = useMemo(() => {
    return days.every(({ key }) => {
      const dayHours = value[key];
      if (!dayHours || dayHours.closed) return true;
      return dayHours.open === DEFAULT_OPEN && dayHours.close === DEFAULT_CLOSE;
    });
  }, [value, days]);

  const applyDefaultHours = () => {
    const defaultHours: OperatingHours = {};
    for (const { key } of days) {
      defaultHours[key] = {
        open: DEFAULT_OPEN,
        close: DEFAULT_CLOSE,
        closed: false,
      };
    }
    onChange(defaultHours);
  };

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
      {/* Default / Custom toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={applyDefaultHours}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            isDefault
              ? 'bg-azure-dragon text-white border-azure-dragon'
              : 'bg-white text-carbon/70 border-carbon/20 hover:border-azure-dragon/40'
          }`}
        >
          {t(CLINIC.DEFAULT_HOURS)}
        </button>
        <button
          type="button"
          onClick={() => {
            // If currently default, don't change anything — user will edit individual days
          }}
          className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
            !isDefault
              ? 'bg-azure-dragon text-white border-azure-dragon'
              : 'bg-white text-carbon/70 border-carbon/20 hover:border-azure-dragon/40'
          }`}
        >
          {t(CLINIC.CUSTOM_HOURS)}
        </button>
      </div>

      {/* Day rows */}
      {days.map((day) => {
        const dayHours = value[day.key] || {};
        return (
          <div key={day.key} className="flex items-center gap-4 rounded-md border border-carbon/10 p-3 hover:border-azure-dragon/30 transition-colors">
            <div className="w-24 shrink-0">
              <span className="text-sm font-medium text-carbon">{day.label}</span>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-carbon/60 w-10 shrink-0">{t(CLINIC.OPEN)}</span>
                <Input
                  type="time"
                  value={dayHours.open || ''}
                  onChange={(e) => updateDay(day.key, { open: e.target.value, closed: false })}
                  placeholder="--:--"
                  className="flex-1 max-w-[120px]"
                  disabled={dayHours.closed}
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs text-carbon/60 w-12 shrink-0">{t(CLINIC.CLOSE)}</span>
                <Input
                  type="time"
                  value={dayHours.close || ''}
                  onChange={(e) => updateDay(day.key, { close: e.target.value, closed: false })}
                  placeholder="--:--"
                  className="flex-1 max-w-[120px]"
                  disabled={dayHours.closed}
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="checkbox"
                  checked={!dayHours.closed}
                  onChange={(e) => updateDay(day.key, { closed: !e.target.checked })}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-xs text-carbon/60">{t(CLINIC.ACTIVE)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
