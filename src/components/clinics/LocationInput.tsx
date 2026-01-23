import { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';

interface LocationInputProps {
  value?: string;
  onChange: (location: string) => void;
  onLocationSelect?: (locationData: {
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google?: {
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
        Map?: new (element: HTMLElement, options?: {
          center?: { lat: number; lng: number };
          zoom?: number;
          styles?: Array<{ featureType: string; stylers: Array<{ saturation?: number; lightness?: number }> }>;
          mapTypeControl?: boolean;
          streetViewControl?: boolean;
          fullscreenControl?: boolean;
        }) => {
          fitBounds: (bounds: { extend: (point: { lat: number; lng: number }) => void; isEmpty: () => boolean }) => void;
        };
        Marker?: new (options?: {
          position?: { lat: number; lng: number };
          map?: unknown;
          title?: string;
        }) => void;
        LatLngBounds?: new () => {
          extend: (point: { lat: number; lng: number }) => void;
          isEmpty: () => boolean;
        };
      };
    };
  }
}

export const LocationInput = ({
  value = '',
  onChange,
  onLocationSelect,
  placeholder = 'City or Postal Code',
  className,
  disabled = false,
}: LocationInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<InstanceType<NonNullable<typeof window.google>['maps']['places']['Autocomplete']> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Check if API key is available
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('[LocationInput] Checking API key...', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'none',
    });
    
    if (apiKey && apiKey !== 'your_google_maps_api_key_here' && apiKey.trim() !== '') {
      setHasApiKey(true);
      console.log('[LocationInput] API key found, will load Google Maps');
    } else {
      console.warn('[LocationInput] No API key found. Add VITE_GOOGLE_MAPS_API_KEY to .env file');
      setLoadError('No Google Maps API key configured');
      setIsLoaded(true); // Set loaded to true so manual input works
    }
  }, []);

  // Load Google Places API script
  useEffect(() => {
    if (!hasApiKey) {
      return undefined;
    }

    if (window.google?.maps?.places?.Autocomplete) {
      console.log('[LocationInput] Google Maps already loaded');
      setIsLoaded(true);
      return undefined;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('[LocationInput] Google Maps script already exists, waiting for load...');
      const checkGoogle = setInterval(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          console.log('[LocationInput] Google Maps loaded successfully');
          setIsLoaded(true);
          clearInterval(checkGoogle);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.google?.maps?.places?.Autocomplete) {
          console.error('[LocationInput] Timeout waiting for Google Maps to load');
          setLoadError('Timeout loading Google Maps API');
          setIsLoaded(true); // Allow manual input
        }
      }, 10000);
      
      return () => clearInterval(checkGoogle);
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey.trim() === '') {
      return undefined;
    }

    console.log('[LocationInput] Loading Google Maps API script...');
    
    let checkPlacesInterval: NodeJS.Timeout | null = null;
    
    const script = document.createElement('script');
    // Using Maps JavaScript API with Places library (works with Places API New)
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('[LocationInput] Google Maps script loaded successfully');
      // Wait for places library to be fully loaded
      checkPlacesInterval = setInterval(() => {
        if (window.google?.maps?.places?.Autocomplete) {
          console.log('[LocationInput] Google Maps Places API ready');
          setIsLoaded(true);
          setLoadError(null);
          if (checkPlacesInterval) {
            clearInterval(checkPlacesInterval);
            checkPlacesInterval = null;
          }
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (checkPlacesInterval) {
          clearInterval(checkPlacesInterval);
          checkPlacesInterval = null;
        }
        if (!window.google?.maps?.places?.Autocomplete) {
          console.error('[LocationInput] Script loaded but Google Maps Places API not available');
          setLoadError('Google Maps Places API not available after script load');
          setIsLoaded(true); // Allow manual input
        }
      }, 5000);
    };
    script.onerror = (error) => {
      console.error('[LocationInput] Failed to load Google Maps API script', error);
      setLoadError('Failed to load Google Maps API. Check your API key and ensure Places API is enabled.');
      setIsLoaded(true);
    };
    document.head.appendChild(script);
    
    return () => {
      if (checkPlacesInterval) {
        clearInterval(checkPlacesInterval);
      }
    };
  }, [hasApiKey]);

  // Initialize autocomplete
  useEffect(() => {
    if (!hasApiKey || !isLoaded || !inputRef.current || autocompleteRef.current || disabled) return;
    
    // Double-check that places API is available before initializing
    if (!window.google?.maps?.places?.Autocomplete) {
      console.warn('[LocationInput] Places API not ready, skipping autocomplete initialization');
      return;
    }

    try {
      console.log('[LocationInput] Initializing Google Places Autocomplete...');
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'], // Search for addresses and locations (includes cities, postal codes, full addresses)
        componentRestrictions: { country: 'rw' }, // Restrict to Rwanda only
        fields: ['formatted_address', 'address_components', 'name', 'geometry.location'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        console.log('[LocationInput] Place selected:', place);

        if (!place.geometry || !place.geometry.location) {
          console.warn('[LocationInput] Place selected but no geometry available');
          return;
        }

        const locationData: {
          address?: string;
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
              locationData.city = component.long_name;
            } else if (types.includes('administrative_area_level_1')) {
              locationData.state = component.short_name;
            } else if (types.includes('postal_code')) {
              locationData.postal_code = component.long_name;
            } else if (types.includes('country')) {
              locationData.country = component.short_name;
            }
          });
        }

        // Update the input value - use formatted address
        const displayValue = place.formatted_address || place.name || value;
        onChange(displayValue);

        // Callback with parsed data including geolocation
        if (onLocationSelect) {
          onLocationSelect(locationData);
        }
      });

      autocompleteRef.current = autocomplete;
      console.log('[LocationInput] Autocomplete initialized successfully');
      setLoadError(null);
    } catch (error) {
      console.error('[LocationInput] Error initializing autocomplete:', error);
      setLoadError('Failed to initialize address autocomplete');
    }
  }, [hasApiKey, isLoaded, onChange, onLocationSelect, value, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={disabled ? 'Select a clinic first' : placeholder}
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
      {/* Debug info - only show errors in development */}
      {import.meta.env.DEV && loadError && (
        <div className="absolute -bottom-5 left-0 text-xs text-carbon/50 whitespace-nowrap">
          ⚠️ {loadError}
        </div>
      )}
    </div>
  );
};
