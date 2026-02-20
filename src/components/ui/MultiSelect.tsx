import { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { MdClose, MdExpandMore, MdCheck } from 'react-icons/md';

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

export interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

export const MultiSelect = ({
  label,
  placeholder = 'Select...',
  options,
  value,
  onChange,
  error,
  required,
  disabled,
  isLoading,
  loadingText = 'Loading...',
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
          {label}
          {required && <span className="text-smudged-lips ml-0.5">*</span>}
        </label>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 h-10 px-3.5 border border-carbon/15 rounded-md bg-white-smoke">
          <div className="h-3.5 w-3.5 border-2 border-azure-dragon/30 border-t-azure-dragon rounded-full animate-spin" />
          <span className="text-xs text-carbon/60">{loadingText}</span>
        </div>
      ) : (
        <div className="relative">
          {/* Trigger */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'flex items-center w-full min-h-[2.5rem] rounded-md border bg-white px-3 py-1.5 text-sm',
              'font-ui text-carbon transition-all duration-150 text-left',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white-smoke',
              error
                ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
                : isOpen
                  ? 'border-azure-dragon/60 ring-1 ring-azure-dragon/30'
                  : 'border-carbon/15 hover:border-carbon/30',
            )}
          >
            <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
              {selectedOptions.length === 0 ? (
                <span className="text-carbon/40 text-sm">{placeholder}</span>
              ) : (
                selectedOptions.map((opt) => (
                  <span
                    key={opt.value}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-ui bg-azure-dragon/10 text-azure-dragon border border-azure-dragon/20"
                  >
                    {opt.color && (
                      <span
                        className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: opt.color }}
                      />
                    )}
                    {opt.label}
                    <button
                      type="button"
                      onClick={(e) => removeOption(opt.value, e)}
                      className="ml-0.5 hover:text-smudged-lips transition-colors"
                    >
                      <MdClose className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            <MdExpandMore
              className={cn(
                'h-5 w-5 text-carbon/40 flex-shrink-0 ml-2 transition-transform duration-150',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-carbon/15 bg-white shadow-lg">
              {options.length === 0 ? (
                <div className="px-3.5 py-2.5 text-xs text-carbon/50 text-center">
                  No options available
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = value.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleOption(opt.value)}
                      className={cn(
                        'flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left text-sm font-ui transition-colors',
                        isSelected
                          ? 'bg-azure-dragon/5 text-azure-dragon'
                          : 'text-carbon hover:bg-carbon/5'
                      )}
                    >
                      <span
                        className={cn(
                          'flex items-center justify-center h-4 w-4 rounded border flex-shrink-0 transition-colors',
                          isSelected
                            ? 'bg-azure-dragon border-azure-dragon text-white'
                            : 'border-carbon/25 bg-white'
                        )}
                      >
                        {isSelected && <MdCheck className="h-3 w-3" />}
                      </span>
                      {opt.color && (
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-smudged-lips font-ui">{error}</p>
      )}
    </div>
  );
};
