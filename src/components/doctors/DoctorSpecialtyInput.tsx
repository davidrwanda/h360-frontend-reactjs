import { useDoctorSpecialties } from '@/hooks/useDoctorSpecialties';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export interface DoctorSpecialtyInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const DoctorSpecialtyInput = ({
  value = '',
  onChange,
  onBlur,
  placeholder = 'Select or type a specialty',
  error,
  label,
  required,
  disabled,
  className,
  id,
}: DoctorSpecialtyInputProps) => {
  const { user } = useAuth();
  const inputId = id || `specialty-${Math.random().toString(36).substr(2, 9)}`;
  const listId = `specialty-list-${inputId}`;
  
  // Get clinic_id from user (check both direct and nested locations)
  const clinicId = user?.clinic_id || user?.employee?.clinic_id;
  
  // Fetch doctor specialties
  const { data: specialties = [], isLoading } = useDoctorSpecialties({
    clinic_id: clinicId,
    include_inactive: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide"
        >
          {label}
          {required && <span className="text-smudged-lips ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          list={listId}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3.5 py-2.5 text-sm',
            'font-ui text-carbon transition-all duration-150',
            'placeholder:text-carbon/35 placeholder:text-sm',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white-smoke',
            error
              ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
              : 'border-carbon/15 focus-visible:border-azure-dragon/60',
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <datalist id={listId}>
          {specialties.map((specialty) => (
            <option key={specialty.specialty_id} value={specialty.name}>
              {specialty.description ? `${specialty.name} - ${specialty.description}` : specialty.name}
            </option>
          ))}
        </datalist>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-smudged-lips font-ui">
          {error}
        </p>
      )}
    </div>
  );
};
