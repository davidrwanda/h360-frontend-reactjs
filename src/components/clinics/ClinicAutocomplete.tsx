import { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import type { Clinic } from '@/api/clinics';

interface ClinicAutocompleteProps {
  value?: string;
  onChange: (clinicName: string) => void;
  onClinicSelect?: (clinic: Clinic) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface ClinicAutocompleteHookResult {
  clinics: Clinic[];
  isLoading: boolean;
  error: Error | null;
}

// Hook to fetch clinics for autocomplete
const useClinicAutocomplete = (searchQuery: string): ClinicAutocompleteHookResult => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setClinics([]);
      return;
    }

    const fetchClinics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { clinicsApi } = await import('@/api/clinics');
        const response = await clinicsApi.list({
          search: searchQuery,
          is_active: true,
          limit: 10,
        });
        setClinics(response.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch clinics'));
        setClinics([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchClinics, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return { clinics, isLoading, error };
};

export const ClinicAutocomplete = ({
  value = '',
  onChange,
  onClinicSelect,
  placeholder = 'Clinic Name or Establishment',
  className,
  disabled = false,
}: ClinicAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const { clinics, isLoading } = useClinicAutocomplete(value);

  // Show suggestions when there are results and user is typing
  useEffect(() => {
    if (clinics.length > 0 && value.trim().length >= 2 && !disabled) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [clinics, value, disabled]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleClinicSelect = (clinic: Clinic) => {
    onChange(clinic.name);
    setShowSuggestions(false);
    if (onClinicSelect) {
      onClinicSelect(clinic);
    }
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || clinics.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < clinics.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && clinics[selectedIndex]) {
      e.preventDefault();
      handleClinicSelect(clinics[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (clinics.length > 0 && value.trim().length >= 2) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex h-full w-full rounded-xl border-0 bg-[#f5f5f5] px-4 py-4 text-base',
          'font-ui text-carbon transition-all duration-150',
          'placeholder:text-carbon/35 placeholder:text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-dragon/20 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
      
      {/* Suggestions Dropdown */}
      {showSuggestions && clinics.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-carbon/10 rounded-lg shadow-xl max-h-60 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-3 text-sm text-carbon/60 text-center">Loading...</div>
          )}
          {clinics.map((clinic, index) => (
            <button
              key={clinic.clinic_id}
              type="button"
              onClick={() => handleClinicSelect(clinic)}
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-azure-dragon/5 transition-colors',
                'border-b border-carbon/5 last:border-b-0',
                index === selectedIndex && 'bg-azure-dragon/10'
              )}
            >
              <div className="font-medium text-carbon">{clinic.name}</div>
              {clinic.city && (
                <div className="text-sm text-carbon/60 mt-0.5">
                  {[clinic.city, clinic.state, clinic.country].filter(Boolean).join(', ')}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
