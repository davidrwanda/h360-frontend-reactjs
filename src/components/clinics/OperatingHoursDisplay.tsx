import { OperatingHours } from '@/api/clinics';
import { cn } from '@/utils/cn';
import { useTranslation, CLINIC } from '@/i18n';

interface OperatingHoursDisplayProps {
  operatingHours?: OperatingHours;
}

export const OperatingHoursDisplay = ({ operatingHours }: OperatingHoursDisplayProps) => {
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

  if (!operatingHours) {
    return <p className="text-sm text-carbon/50">{t(CLINIC.NOT_CONFIGURED)}</p>;
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
                <span className="text-xs text-carbon/60 w-10 shrink-0">{t(CLINIC.OPEN)}</span>
                <span className={cn(
                  "font-mono tabular-nums",
                  isConfigured ? "text-carbon" : "text-carbon/40"
                )}>
                  {dayHours?.open || '--:--'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-carbon/60 w-12 shrink-0">{t(CLINIC.CLOSE)}</span>
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
