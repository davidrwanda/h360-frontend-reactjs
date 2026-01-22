import { useClinics } from '@/hooks/useClinics';
import { cn } from '@/utils/cn';

export interface ClinicMultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  primaryClinicId?: string; // Primary clinic is already selected
}

export const ClinicMultiSelect = ({
  value = [],
  onChange,
  onBlur,
  error,
  label,
  required,
  disabled,
  className,
  primaryClinicId,
}: ClinicMultiSelectProps) => {
  const { data: clinicsData, isLoading } = useClinics({ limit: 100, is_active: true });

  const handleClinicToggle = (clinicId: string) => {
    if (!onChange) return;
    
    const currentValue = value || [];
    if (currentValue.includes(clinicId)) {
      // Remove clinic (but not primary clinic)
      if (primaryClinicId && clinicId !== primaryClinicId) {
        onChange(currentValue.filter((id) => id !== clinicId));
      }
    } else {
      // Add clinic (but not if it's the primary clinic)
      if (!primaryClinicId || clinicId !== primaryClinicId) {
        onChange([...currentValue, clinicId]);
      }
    }
  };

  const clinics = clinicsData?.data || [];

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
          {label}
          {required && <span className="text-smudged-lips ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          'rounded-md border bg-white p-3.5 min-h-[120px] max-h-[200px] overflow-y-auto',
          'focus-within:ring-1 focus-within:ring-azure-dragon/30 focus-within:ring-offset-0',
          error
            ? 'border-smudged-lips/40 focus-within:border-smudged-lips focus-within:ring-smudged-lips/30'
            : 'border-carbon/15 focus-within:border-azure-dragon/60',
          disabled && 'opacity-50 cursor-not-allowed bg-white-smoke'
        )}
      >
        {isLoading ? (
          <p className="text-sm text-carbon/60">Loading clinics...</p>
        ) : clinics.length === 0 ? (
          <p className="text-sm text-carbon/60">No clinics available</p>
        ) : (
          <div className="space-y-2">
            {clinics.map((clinic) => {
              const isPrimary = Boolean(primaryClinicId && clinic.clinic_id === primaryClinicId);
              const isSelected = value?.includes(clinic.clinic_id) || isPrimary;
              
              return (
                <label
                  key={clinic.clinic_id}
                  className={cn(
                    'flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white-smoke transition-colors',
                    isPrimary && 'bg-azure-dragon/5'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleClinicToggle(clinic.clinic_id)}
                    onBlur={onBlur}
                    disabled={disabled || isLoading || isPrimary}
                    className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon disabled:opacity-50"
                  />
                  <span className={cn('text-sm text-carbon', isPrimary && 'font-medium')}>
                    {clinic.name}
                    {isPrimary && <span className="text-xs text-azure-dragon ml-2">(Primary)</span>}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-smudged-lips font-ui">{error}</p>
      )}
      {label && !error && (
        <p className="mt-1.5 text-xs text-carbon/60 font-ui">
          Select additional clinics (primary clinic is automatically included)
        </p>
      )}
    </div>
  );
};
