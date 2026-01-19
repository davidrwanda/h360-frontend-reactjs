import { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface AddressInputProps {
  label?: string;
  value?: string;
  onChange: (address: string) => void;
  onAddressSelect: (addressData: {
    address: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: {
              types?: string[];
              componentRestrictions?: { country?: string };
              fields?: string[];
            }
          ) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address?: string;
              name?: string;
              address_components?: Array<{
                types: string[];
                long_name: string;
                short_name: string;
              }>;
              geometry?: {
                location: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
          };
        };
      };
    };
  }
}

export const AddressInput = ({
  label,
  value = '',
  onChange,
  onAddressSelect,
  error,
  required,
  placeholder = 'Start typing an address...',
  className,
}: AddressInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<InstanceType<typeof window.google.maps.places.Autocomplete> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Check if API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey && apiKey !== 'your_google_maps_api_key_here' && apiKey.trim() !== '') {
      setHasApiKey(true);
    } else {
      // No API key - allow manual entry only
      setIsLoaded(true); // Set loaded to true so manual input works
    }
  }, []);

  // Load Google Places API script (only if API key is available)
  useEffect(() => {
    if (!hasApiKey) {
      return; // Skip Google Maps loading if no API key
    }

    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Wait for it to load
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places) {
          setIsLoaded(true);
          clearInterval(checkGoogle);
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey.trim() === '') {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      setIsLoaded(true); // Allow manual entry even if script fails
    };
    document.head.appendChild(script);

    return () => {
      // Don't remove script as it may be used by other components
    };
  }, [hasApiKey]);

  // Initialize autocomplete when Google Maps is loaded (only if API key is available)
  useEffect(() => {
    if (!hasApiKey || !isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'rw' }, // Restrict to Rwanda
      fields: [
        'formatted_address',
        'address_components',
        'geometry.location',
        'name',
      ],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        return;
      }

      // Parse address components
      const addressData: {
        address: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
        latitude?: number;
        longitude?: number;
      } = {
        address: place.formatted_address || place.name || '',
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };

      // Extract address components
      if (place.address_components) {
        place.address_components.forEach((component: {
          types: string[];
          long_name: string;
          short_name: string;
        }) => {
          const types = component.types;

          if (types.includes('locality')) {
            addressData.city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            addressData.state = component.short_name;
          } else if (types.includes('postal_code')) {
            addressData.postal_code = component.long_name;
          } else if (types.includes('country')) {
            addressData.country = component.short_name;
          }
        });
      }

      // Update the input value
      onChange(addressData.address);

      // Callback with parsed data
      onAddressSelect(addressData);
    });

    autocompleteRef.current = autocomplete;
  }, [hasApiKey, isLoaded, onChange, onAddressSelect]);

  // Handle manual input when no API key is available
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // If no API key, still call onAddressSelect with just the address
    // This allows the form to work normally
    if (!hasApiKey && newValue.trim() !== '') {
      onAddressSelect({
        address: newValue,
      });
    }
  };

  const inputId = `address-${Math.random().toString(36).substr(2, 9)}`;

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
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        value={value}
        onChange={hasApiKey ? (e) => onChange(e.target.value) : handleManualChange}
        placeholder={hasApiKey ? placeholder : 'Enter address manually...'}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3.5 py-2.5 text-sm',
          'font-ui text-carbon transition-all duration-150',
          'placeholder:text-carbon/35 placeholder:text-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white-smoke',
          error
            ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
            : 'border-carbon/15 focus-visible:border-azure-dragon/60'
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-smudged-lips font-ui">
          {error}
        </p>
      )}
      {hasApiKey && !isLoaded && (
        <p className="mt-1.5 text-xs text-carbon/50 font-ui">
          Loading address suggestions...
        </p>
      )}
      {!hasApiKey && (
        <p className="mt-1.5 text-xs text-carbon/50 font-ui">
          💡 Enter address manually. Add Google Maps API key for autocomplete suggestions.
        </p>
      )}
    </div>
  );
};
