import React, { useState } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export interface DepartmentInputProps {
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

export const DepartmentInput = ({
  value = '',
  onChange,
  onBlur,
  error,
  label,
  required,
  disabled,
  className,
  id,
}: DepartmentInputProps) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const { user } = useAuth();
  const inputId = id || `department-${Math.random().toString(36).substr(2, 9)}`;

  // Get clinic_id from user (check both direct and nested locations)
  const clinicId = user?.clinic_id || user?.employee?.clinic_id;

  // Fetch departments
  const { data: departmentsResponse, isLoading } = useDepartments({
    clinic_id: clinicId,
    is_active: true,
  });

  const departments = departmentsResponse?.data || [];

  // Check if current value is a custom value (not in the predefined list)
  const isCustomValue = value && !departments.some(dept => dept.name === value);

  // If we have a custom value, automatically switch to custom mode
  React.useEffect(() => {
    if (isCustomValue && !isCustomMode) {
      setIsCustomMode(true);
    }
  }, [isCustomValue, isCustomMode]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'custom') {
      setIsCustomMode(true);
      if (onChange) {
        onChange('');
      }
    } else if (onChange) {
      onChange(selectedValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleInputBlur = () => {
    if (onBlur) {
      onBlur();
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
        {isCustomMode ? (
          <>
            <input
              id={inputId}
              type="text"
              value={value}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="Type department name"
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
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className="absolute inset-y-0 right-0 flex items-center px-2 text-carbon/50 hover:text-carbon"
              title="Switch to dropdown"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <select
              id={inputId}
              value={value}
              onChange={handleSelectChange}
              onBlur={onBlur}
              disabled={disabled || isLoading}
              className={cn(
                'flex h-10 w-full rounded-md border bg-white px-3.5 py-2.5 text-sm',
                'font-ui text-carbon transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white-smoke',
                'appearance-none cursor-pointer',
                error
                  ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
                  : 'border-carbon/15 focus-visible:border-azure-dragon/60',
              )}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? `${inputId}-error` : undefined}
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.department_id} value={department.name}>
                  {department.description ? `${department.name} - ${department.description}` : department.name}
                </option>
              ))}
              <option value="custom">+ Add custom department</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg
                className="h-4 w-4 text-carbon/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-smudged-lips font-ui">
          {error}
        </p>
      )}
    </div>
  );
};