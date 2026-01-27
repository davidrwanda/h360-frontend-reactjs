import { useState, useMemo } from 'react';
import { useDoctorSpecialties } from '@/hooks/useDoctorSpecialties';
import { cn } from '@/utils/cn';

export interface DoctorSpecialtyInputProps {
  /** Selected specialty IDs; doctor can have more than one. */
  value?: string[];
  onChange?: (ids: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Optional filter by clinic (public list is global; can still filter if API supports it). */
  clinicId?: string | null;
}

export const DoctorSpecialtyInput = ({
  value = [],
  onChange,
  onBlur,
  placeholder = 'Select or type to filter specialties',
  error,
  label,
  required,
  disabled,
  className,
  id,
  clinicId,
}: DoctorSpecialtyInputProps) => {
  const inputId = id || `specialty-${Math.random().toString(36).substr(2, 9)}`;
  const [filter, setFilter] = useState('');

  const { data: specialties = [], isLoading } = useDoctorSpecialties({
    clinic_id: clinicId ?? undefined,
    include_inactive: false,
  });

  const selectedSet = useMemo(() => new Set(value), [value]);

  const filteredSpecialties = useMemo(() => {
    if (!filter.trim()) return specialties;
    const q = filter.toLowerCase();
    return specialties.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q) ?? false)
    );
  }, [specialties, filter]);

  const handleToggle = (specialtyId: string) => {
    if (!onChange) return;
    if (selectedSet.has(specialtyId)) {
      onChange(value.filter((id) => id !== specialtyId));
    } else {
      onChange([...value, specialtyId]);
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

      {/* Filter / custom hint */}
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3.5 py-2.5 text-sm mb-3',
          'font-ui text-carbon placeholder:text-carbon/35',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30',
          'disabled:opacity-50 disabled:bg-white-smoke border-carbon/15'
        )}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      {/* Selectable specialty buttons (by ID) – multi-select */}
      {filteredSpecialties.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filteredSpecialties.map((specialty) => (
            <button
              key={specialty.specialty_id}
              type="button"
              onClick={() => handleToggle(specialty.specialty_id)}
              disabled={disabled || isLoading}
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-ui transition-colors',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-1',
                selectedSet.has(specialty.specialty_id)
                  ? 'border-azure-dragon bg-azure-dragon/10 text-azure-dragon'
                  : 'border-carbon/20 bg-white text-carbon/80 hover:border-azure-dragon/40 hover:bg-azure-dragon/5',
                (disabled || isLoading) && 'cursor-not-allowed opacity-50'
              )}
            >
              {specialty.description ? `${specialty.name} – ${specialty.description}` : specialty.name}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-carbon/50 py-2">
          {isLoading ? 'Loading specialties…' : filter.trim() ? 'No matching specialties.' : 'No specialties available.'}
        </p>
      )}

      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-smudged-lips font-ui">
          {error}
        </p>
      )}
    </div>
  );
};
