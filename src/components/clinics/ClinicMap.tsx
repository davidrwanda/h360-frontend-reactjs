import { useEffect, useRef, useState } from 'react';
import type { Clinic } from '@/api/clinics';
import { MdMyLocation } from 'react-icons/md';

interface ClinicMapProps {
  clinics: Clinic[];
  center?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number };
  onCenterMap?: () => void;
}

export const ClinicMap = ({ clinics, center, userLocation, onCenterMap }: ClinicMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'your_google_maps_api_key_here' || apiKey.trim() === '') {
      setMapError('Google Maps API key not configured');
      return undefined;
    }

    // Type guard for Google Maps API
    const hasGoogleMaps = (): boolean => {
      const google = window.google as { maps?: { Map?: unknown } } | undefined;
      return !!google?.maps?.Map;
    };

    // Check if Google Maps is already loaded
    if (hasGoogleMaps()) {
      console.log('[ClinicMap] Google Maps already loaded');
      setIsLoaded(true);
      return undefined;
    }

    // Load Google Maps script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('[ClinicMap] Google Maps script exists, waiting for load...');
      const checkGoogle = setInterval(() => {
        if (hasGoogleMaps()) {
          console.log('[ClinicMap] Google Maps loaded successfully');
          setIsLoaded(true);
          clearInterval(checkGoogle);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!hasGoogleMaps()) {
          console.error('[ClinicMap] Timeout waiting for Google Maps to load');
          setMapError('Timeout loading Google Maps API');
          setIsLoaded(true); // Allow map to show error
        }
      }, 10000);
      
      return () => clearInterval(checkGoogle);
    }

    console.log('[ClinicMap] Loading Google Maps API script...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('[ClinicMap] Google Maps script loaded successfully');
      // Wait a bit for the API to be fully available
      const checkPlaces = setInterval(() => {
        if (hasGoogleMaps()) {
          console.log('[ClinicMap] Google Maps API ready');
          setIsLoaded(true);
          clearInterval(checkPlaces);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkPlaces);
        if (!hasGoogleMaps()) {
          console.error('[ClinicMap] Script loaded but Google Maps API not available');
          setMapError('Google Maps API not available after script load');
          setIsLoaded(true);
        }
      }, 5000);
    };
    script.onerror = () => {
      console.error('[ClinicMap] Failed to load Google Maps API script');
      setMapError('Failed to load Google Maps');
      setIsLoaded(true);
    };
    document.head.appendChild(script);
    return undefined;
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) {
      console.log('[ClinicMap] Not ready:', { isLoaded, hasRef: !!mapRef.current });
      return;
    }
    
    // Don't render if we have no location data at all
    if (!center && !userLocation && clinics.length === 0) {
      console.log('[ClinicMap] No location data available');
      return;
    }

    const defaultCenter = center || userLocation || {
      lat: clinics[0]?.latitude || -1.9441,
      lng: clinics[0]?.longitude || 30.0619,
    };

    console.log('[ClinicMap] Initializing map with center:', defaultCenter);

    // Type assertion for Google Maps API
    type GoogleMapsAPI = {
      maps: {
        Map: new (element: HTMLElement, options?: {
          center?: { lat: number; lng: number };
          zoom?: number;
          styles?: Array<{ featureType: string; stylers: Array<{ saturation?: number; lightness?: number }> }>;
          mapTypeControl?: boolean;
          streetViewControl?: boolean;
          fullscreenControl?: boolean;
        }) => {
          fitBounds: (bounds: { extend: (point: { lat: number; lng: number }) => void; isEmpty: () => boolean }, options?: { padding?: number }) => void;
          setCenter: (center: { lat: number; lng: number }) => void;
          setZoom: (zoom: number) => void;
          getZoom: () => number;
        };
        Marker: new (options?: {
          position?: { lat: number; lng: number };
          map?: unknown;
          title?: string;
          icon?: {
            path?: unknown;
            scale?: number;
            fillColor?: string;
            fillOpacity?: number;
            strokeColor?: string;
            strokeWeight?: number;
          };
        }) => void;
        SymbolPath: {
          CIRCLE: unknown;
        };
        LatLngBounds: new () => {
          extend: (point: { lat: number; lng: number }) => void;
          isEmpty: () => boolean;
        };
      };
    };
    
    const google = window.google as unknown as GoogleMapsAPI | undefined;
    if (!google?.maps?.Map) {
      console.error('[ClinicMap] Google Maps API not available');
      return;
    }

    console.log('[ClinicMap] Creating map instance...');

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: userLocation || center ? 14 : 12, // Start with a wider view
      styles: [
        {
          featureType: 'all',
          stylers: [{ saturation: -100 }, { lightness: 50 }],
        },
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    
    console.log('[ClinicMap] Map created successfully');

    // Store markers for cleanup
    const markers: Array<InstanceType<typeof google.maps.Marker>> = [];

    // Add user location marker (if provided) - use blue color
    if (userLocation) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const googleMapsAny = google.maps as any;
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map,
        title: 'Your Location',
        icon: {
          path: googleMapsAny.SymbolPath?.CIRCLE || 0,
          scale: 10,
          fillColor: '#4285F4', // Google blue
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });
      markers.push(userMarker);
    }

    // Add markers for each clinic - use red color to distinguish from user location
    clinics.forEach((clinic) => {
      if (clinic.latitude && clinic.longitude) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const googleMapsAny = google.maps as any;
        const clinicMarker = new google.maps.Marker({
          position: { lat: clinic.latitude, lng: clinic.longitude },
          map,
          title: clinic.name || 'Clinic',
          icon: {
            path: googleMapsAny.SymbolPath?.CIRCLE || 0,
            scale: 8,
            fillColor: '#EA4335', // Google red
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });
        markers.push(clinicMarker);
      }
    });

    // Fit bounds to show all clinics and user location
    const bounds = new google.maps.LatLngBounds();
    
    // Add user location to bounds if present
    if (userLocation) {
      bounds.extend(userLocation);
    }
    
    // Add clinic locations to bounds
    const clinicsWithLocation = clinics.filter((c) => c.latitude && c.longitude);
    clinicsWithLocation.forEach((clinic) => {
      bounds.extend({ lat: clinic.latitude!, lng: clinic.longitude! });
    });
    
    // Fit bounds if we have at least one location
    if (!bounds.isEmpty()) {
      // Add padding to bounds so markers aren't at the edge (50px on all sides)
      map.fitBounds(bounds, { padding: 50 });
      
      // After fitting bounds, check zoom level and adjust if needed
      setTimeout(() => {
        const currentZoom = map.getZoom();
        
        // If we have multiple clinics, ensure they're all visible
        // Don't zoom in too much if clinics are scattered
        if (clinicsWithLocation.length > 1) {
          // If zoomed in too much (above 15), zoom out a bit to show scattered clinics
          if (currentZoom && currentZoom > 15) {
            map.setZoom(15);
          }
          // If zoomed out too much (below 11), zoom in a bit for better detail
          else if (currentZoom && currentZoom < 11) {
            map.setZoom(11);
          }
        } else if (clinicsWithLocation.length === 1 || userLocation) {
          // Single clinic or just user location - can zoom in more
          if (currentZoom && currentZoom < 14) {
            map.setZoom(14);
          } else if (currentZoom && currentZoom > 16) {
            map.setZoom(16);
          }
        }
      }, 200);
    } else if (userLocation || center) {
      // If only user location or center, center on it with a zoomed-in view
      const locationToCenter = userLocation || center;
      if (locationToCenter) {
        map.setCenter(locationToCenter);
        map.setZoom(14); // Good zoom level for single location
      }
    }
  }, [isLoaded, clinics, center, userLocation]);

  if (mapError) {
    return (
      <div className="w-full h-full bg-carbon/5 rounded-lg flex items-center justify-center">
        <p className="text-sm text-carbon/60">{mapError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden border border-carbon/10 bg-white">
      <div ref={mapRef} className="w-full h-[600px] lg:h-[calc(100vh-120px)] bg-carbon/5" />
      {onCenterMap && (
        <button
          onClick={onCenterMap}
          className="absolute top-4 right-4 bg-white hover:bg-carbon/5 shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium text-carbon transition-colors z-10"
        >
          <MdMyLocation className="h-4 w-4" />
          Center Map
        </button>
      )}
      {!isLoaded && (
        <div className="absolute inset-0 bg-carbon/5 flex items-center justify-center">
          <p className="text-sm text-carbon/60">Loading map...</p>
        </div>
      )}
    </div>
  );
};

