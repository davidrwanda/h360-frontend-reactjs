import { useState, useMemo, useRef, useEffect } from 'react';
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
  placeholder = 'Select specialties…',
  error,
  label,
  required,
  disabled,
  className,
  id,
  clinicId,
}: DoctorSpecialtyInputProps) => {
  const inputId = id || `specialty-${Math.random().toString(36).substr(2, 9)}`;
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = (specialtyId: string) => {
    if (!onChange) return;
    if (selectedSet.has(specialtyId)) {
      onChange(value.filter((id) => id !== specialtyId));
    } else {
      onChange([...value, specialtyId]);
    }
  };

  const selectedNames = useMemo(
    () =>
      value
        .map((id) => specialties.find((s) => s.specialty_id === id)?.name)
        .filter(Boolean) as string[],
    [value, specialties]
  );
  const triggerLabel =
    selectedNames.length > 0
      ? selectedNames.length === 1
        ? selectedNames[0]
        : `${selectedNames.length} selected`
      : placeholder;

  return (
    <div ref={containerRef} className={cn('w-full relative', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide"
        >
          {label}
          {required && <span className="text-smudged-lips ml-0.5">*</span>}
        </label>
      )}

      <button
        type="button"
        id={inputId}
        onClick={() => !disabled && !isLoading && setOpen((o) => !o)}
        onBlur={onBlur}
        disabled={disabled || isLoading}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label || 'Specialties'}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3.5 py-2.5 text-sm text-left font-ui transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white-smoke',
          error
            ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
            : 'border-carbon/15 focus-visible:border-azure-dragon/60',
          !selectedNames.length && 'text-carbon/50'
        )}
        aria-describedby={error ? `${inputId}-error` : undefined}
      >
        <span className="truncate">{triggerLabel}</span>
        <svg
          className={cn('h-4 w-4 shrink-0 text-carbon/50 transition-transform', open && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable
          aria-label="Specialties"
          className={cn(
            'absolute z-50 mt-1 w-full rounded-md border border-carbon/15 bg-white shadow-lg',
            'max-h-64 overflow-hidden flex flex-col'
          )}
        >
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Type to filter…"
            className={cn(
              'flex h-9 shrink-0 border-b border-carbon/10 mx-2 mt-2 px-2 py-1.5 text-sm',
              'font-ui text-carbon placeholder:text-carbon/40',
              'focus:outline-none focus:ring-0'
            )}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="overflow-y-auto p-2 min-h-0">
            {filteredSpecialties.length > 0 ? (
              <div className="space-y-0.5">
                {filteredSpecialties.map((specialty) => {
                  const isSelected = selectedSet.has(specialty.specialty_id);
                  return (
                    <label
                      key={specialty.specialty_id}
                      className={cn(
                        'flex items-center gap-2 cursor-pointer px-2 py-2 rounded-md text-sm font-ui text-carbon',
                        'hover:bg-azure-dragon/5 transition-colors'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggle(specialty.specialty_id)}
                        disabled={disabled || isLoading}
                        className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon disabled:opacity-50 h-4 w-4 shrink-0"
                      />
                      <span className="truncate">{specialty.name}</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-carbon/50 py-2 px-2">
                {isLoading ? 'Loading…' : filter.trim() ? 'No matches.' : 'No specialties.'}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-smudged-lips font-ui">
          {error}
        </p>
      )}
    </div>
  );
};
