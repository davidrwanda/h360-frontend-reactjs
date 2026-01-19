import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide"
          >
            {label}
            {props.required && <span className="text-smudged-lips ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3.5 py-2.5 text-sm',
            'font-ui text-carbon transition-all duration-150',
            'placeholder:text-carbon/35 placeholder:text-sm',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white-smoke',
            error
              ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
              : 'border-carbon/15 focus-visible:border-azure-dragon/60',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-smudged-lips font-ui">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-carbon/60 font-ui">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
