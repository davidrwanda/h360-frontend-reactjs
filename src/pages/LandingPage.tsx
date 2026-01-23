import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO, addDays, startOfDay } from 'date-fns';
import { useClinics } from '@/hooks/useClinics';
import { useClinicTypes } from '@/hooks/useClinicTypes';
import { useSlots } from '@/hooks/useSlots';
import { Button, Loading } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import { LocationInput } from '@/components/clinics/LocationInput';
import { ClinicAutocomplete } from '@/components/clinics/ClinicAutocomplete';
import { ClinicSlotsDisplay } from '@/components/clinics/ClinicSlotsDisplay';
import { ClinicMap } from '@/components/clinics/ClinicMap';
import type { Clinic } from '@/api/clinics';
import {
  MdSearch,
  MdLocationOn,
  MdLocalHospital,
  MdCalendarToday,
  MdPeople,
  MdNotifications,
  MdSecurity,
  MdAccessibility,
  MdArrowForward,
  MdClose,
  MdPerson,
  MdMedicalServices,
} from 'react-icons/md';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [clinicName, setClinicName] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [location, setLocation] = useState('');
  const [selectedClinicTypeId, setSelectedClinicTypeId] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [maxClinics, setMaxClinics] = useState(10);
  const queryClient = useQueryClient();
  const searchTriggeredRef = useRef(false);

  // Fetch clinic types for the dropdown
  const { data: clinicTypes } = useClinicTypes({ include_inactive: false });


  // Fetch clinics based on search
  // If clinic is selected, search only by clinic name
  // Otherwise, search by location (address) - service is handled separately
  const { data: clinicsData, isLoading, error } = useClinics({
    ...(selectedClinic
      ? { search: selectedClinic.name, is_active: true, limit: 20 }
      : {
          city: selectedLocation?.city || location || undefined,
          state: selectedLocation?.state || undefined,
          is_active: true,
          limit: 20,
        }),
  });

  const clinics = useMemo(() => clinicsData?.data || [], [clinicsData?.data]);

  // Calculate date range: today to two weeks from today
  const today = useMemo(() => startOfDay(new Date()), []);
  const twoWeeksFromToday = useMemo(() => addDays(today, 14), [today]);

  // Build slots query params based on current state - memoized to prevent unnecessary refetches
  const slotsParams = useMemo(() => {
    const baseParams = {
      dateFrom: format(today, 'yyyy-MM-dd'),
      dateTo: format(twoWeeksFromToday, 'yyyy-MM-dd'),
      available_only: true,
      limit: 100,
    };

    if (selectedClinic) {
      return {
        ...baseParams,
        clinic_id: selectedClinic.clinic_id,
        clinic_type_id: selectedClinicTypeId || undefined,
      };
    }
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      return {
        ...baseParams,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        radius_km: radiusKm,
        max_clinics: maxClinics,
        clinic_type_id: selectedClinicTypeId || undefined,
      };
    }
    if (selectedClinicTypeId) {
      return {
        ...baseParams,
        clinic_type_id: selectedClinicTypeId,
      };
    }
    return undefined;
  }, [selectedClinic, selectedLocation, selectedClinicTypeId, radiusKm, maxClinics, today, twoWeeksFromToday]);

  // Fetch slots - only when showResults is true (after search button click)
  const { data: slotsData, isLoading: isLoadingSlots, refetch: refetchSlots } = useSlots(
    showResults ? slotsParams : undefined
  );

  // Extract unique clinic IDs from slots
  const clinicIdsFromSlots = useMemo(() => {
    if (!slotsData?.data) return [];
    const clinicIdSet = new Set<string>();
    slotsData.data.forEach((slot) => {
      if (slot.clinic_id) {
        clinicIdSet.add(slot.clinic_id);
      }
    });
    return Array.from(clinicIdSet);
  }, [slotsData]);

  // Fetch clinic details for clinics from slots (if we have clinic IDs and they're not in our clinics list)
  const clinicsToFetch = useMemo(() => {
    if (clinicIdsFromSlots.length === 0) return [];
    return clinicIdsFromSlots.filter(
      (id) => !clinics.some((c) => c.clinic_id === id && c.latitude && c.longitude)
    );
  }, [clinicIdsFromSlots, clinics]);

  // Fetch clinics by IDs if we have clinics from slots that don't have location data
  const { data: fetchedClinicsData } = useClinics({
    ...(clinicsToFetch.length > 0
      ? {
          // Fetch all active clinics and filter client-side (API might not support multiple IDs)
          is_active: true,
          limit: 100,
        }
      : undefined),
  });

  // Merge all clinic data
  const allClinics = useMemo(() => {
    const clinicMap = new Map<string, Clinic>();
    
    // Add clinics from initial search
    clinics.forEach((clinic) => {
      clinicMap.set(clinic.clinic_id, clinic);
    });
    
    // Add fetched clinics (if any)
    if (fetchedClinicsData?.data) {
      fetchedClinicsData.data.forEach((clinic) => {
        if (clinicsToFetch.includes(clinic.clinic_id)) {
          clinicMap.set(clinic.clinic_id, clinic);
        }
      });
    }
    
    return Array.from(clinicMap.values());
  }, [clinics, fetchedClinicsData, clinicsToFetch]);

  // If we have slots, extract unique clinics from slots and merge with clinic data
  const clinicsFromSlots = useMemo(() => {
    // If slotsData exists (even if empty), process it - this ensures we clear old data
    if (slotsData === undefined) return undefined; // No search performed yet
    if (!slotsData.data || slotsData.data.length === 0) return []; // Empty results - clear previous data
    
    const clinicMap = new Map<string, Clinic>();
    slotsData.data.forEach((slot) => {
      if (!clinicMap.has(slot.clinic_id)) {
        // Find clinic from our merged clinics list (which has full data including lat/lng)
        const clinic = allClinics.find((c) => c.clinic_id === slot.clinic_id);
        if (clinic) {
          clinicMap.set(slot.clinic_id, clinic);
        } else {
          // Create minimal clinic from slot data (fallback - but should have location from fetched data)
          clinicMap.set(slot.clinic_id, {
            clinic_id: slot.clinic_id,
            name: slot.clinic_name,
            is_active: true,
          } as Clinic);
        }
      }
    });
    return Array.from(clinicMap.values());
  }, [slotsData, allClinics]);

  // Determine which clinics to display
  const displayClinics = useMemo(() => {
    if (selectedClinic) {
      return [selectedClinic];
    }
    // If we have slots data (even if empty array), use clinics from slots
    // This ensures we show empty state when search returns no results
    if (slotsData !== undefined) {
      return clinicsFromSlots || [];
    }
    // Only use clinics array if we haven't searched yet (for initial state)
    return clinics;
  }, [selectedClinic, slotsData, clinicsFromSlots, clinics]);

  // Normalize clinic latitude/longitude (handle string to number conversion)
  const normalizedDisplayClinics = useMemo(() => {
    return displayClinics.map((clinic) => ({
      ...clinic,
      latitude: clinic.latitude
        ? typeof clinic.latitude === 'string'
          ? parseFloat(clinic.latitude)
          : clinic.latitude
        : undefined,
      longitude: clinic.longitude
        ? typeof clinic.longitude === 'string'
          ? parseFloat(clinic.longitude)
          : clinic.longitude
        : undefined,
    }));
  }, [displayClinics]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic:
    // 1. If clinic is selected, search by clinic only
    // 2. If location is provided, search by location
    // 3. If clinic type is selected, search by clinic type only
    // 4. Clinic type can be combined with location or clinic
    if (selectedClinic || (location && selectedLocation) || selectedClinicTypeId) {
      searchTriggeredRef.current = true;
      setShowResults(true);
      
      // Invalidate all slots queries to clear cache and force fresh fetch
      await queryClient.invalidateQueries({ queryKey: ['slots', 'list'] });
      // Remove old queries to ensure fresh data
      await queryClient.removeQueries({ queryKey: ['slots', 'list'] });
      
      // Small delay to ensure state is updated before refetch
      setTimeout(async () => {
        // Refetch with current params
        if (refetchSlots) {
          await refetchSlots();
        }
      }, 100);
      
      // Scroll to results section immediately
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
          // Scroll with offset to account for sticky header
          const headerOffset = 80;
          const elementPosition = resultsSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 50);
    }
  };

  const clearSearch = () => {
    setClinicName('');
    setSelectedClinic(null);
    setLocation('');
    setSelectedClinicTypeId('');
    setSelectedLocation(null);
    setShowResults(false);
    setRadiusKm(50); // Reset to default
    setMaxClinics(10); // Reset to default
    searchTriggeredRef.current = false;
  };

  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setClinicName(clinic.name);
    // Clear location when clinic is selected
    setLocation('');
    setSelectedLocation(null);
  };

  // Auto-refetch when clinic type changes and results are already showing
  useEffect(() => {
    // Only auto-refetch if results are already showing (user has clicked search)
    // This prevents auto-fetching when user just selects a type before clicking search
    if (showResults && searchTriggeredRef.current && slotsParams) {
      // Small delay to ensure state is fully updated
      const timeoutId = setTimeout(async () => {
        // Clear cache and force fresh fetch
        await queryClient.invalidateQueries({ queryKey: ['slots', 'list'] });
        await queryClient.removeQueries({ queryKey: ['slots', 'list'] });
        refetchSlots();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinicTypeId, showResults]);

  const handleClinicNameChange = (name: string) => {
    setClinicName(name);
    // Clear selected clinic if user changes the name manually
    if (selectedClinic && name !== selectedClinic.name) {
      setSelectedClinic(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Bar */}
      <PublicHeader />

      {/* Hero Section with Background */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pb-8">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/landing.jpg)',
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-azure-dragon/85 via-azure-dragon/75 to-azure-dragon/85"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
            Find a Healthcare Clinic
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-12">
            Book Your Appointment
          </p>

          {/* Multi-Field Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-5xl mx-auto items-stretch">
            {/* Clinic Name Field */}
            <div className="flex-1 relative flex items-center">
              <MdPerson className="absolute left-4 h-5 w-5 text-azure-dragon/60 z-10" />
              <ClinicAutocomplete
                value={clinicName}
                onChange={handleClinicNameChange}
                onClinicSelect={handleClinicSelect}
                placeholder="Clinic Name or Establishment"
                className="pl-12 pr-4"
              />
            </div>

            {/* Location Field */}
            <div className="flex-1 relative flex items-center">
              <MdLocationOn className="absolute left-4 h-5 w-5 text-azure-dragon/60 z-10" />
              <LocationInput
                value={location}
                onChange={(value) => setLocation(value)}
                onLocationSelect={(locationData) => {
                  // Store the selected location data
                  setSelectedLocation(locationData);
                  
                  // Update the display value
                  const displayValue = locationData.address || 
                                     locationData.city || 
                                     locationData.postal_code || 
                                     '';
                  setLocation(displayValue);
                  
                  // Auto-trigger search when address is selected (if we have lat/lng)
                  if (locationData.latitude && locationData.longitude) {
                    setShowResults(true);
                    // Scroll to results after a brief delay
                    setTimeout(() => {
                      const resultsSection = document.getElementById('search-results');
                      if (resultsSection) {
                        const headerOffset = 80;
                        const elementPosition = resultsSection.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({
                          top: offsetPosition,
                          behavior: 'smooth',
                        });
                      }
                    }, 100);
                  }
                }}
                placeholder="City or Postal Code"
                className="pl-12 pr-4"
                disabled={!!selectedClinic}
              />
            </div>

            {/* Clinic Type Field */}
            <div className="flex-1 relative flex items-center">
              <MdMedicalServices className="absolute left-4 h-5 w-5 text-azure-dragon/60 z-10 pointer-events-none" />
              <select
                value={selectedClinicTypeId}
                onChange={(e) => setSelectedClinicTypeId(e.target.value)}
                className="pl-12 pr-4 py-4 text-base border-0 focus:ring-2 focus:ring-azure-dragon/20 rounded-xl h-full w-full bg-[#f5f5f5] text-carbon appearance-none cursor-pointer"
                style={{ backgroundColor: '#f5f5f5' }}
              >
                <option value="">Clinic Type (Optional)</option>
                {clinicTypes?.map((type) => (
                  <option key={type.clinic_type_id} value={type.clinic_type_id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="px-8 py-4 rounded-xl font-semibold whitespace-nowrap self-stretch flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  Search
                  <MdSearch className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

        </div>
      </section>

      {/* Map and Search Results Section */}
      {(selectedLocation || showResults) && (
        <section id="search-results" className={`${showResults ? 'pt-2 pb-12' : 'py-12'} px-4 sm:px-6 lg:px-8 bg-white-smoke`}>
          <div className="mx-auto max-w-7xl">
            {showResults && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-lg font-semibold text-carbon">
                    {displayClinics.length > 0
                      ? `Found ${displayClinics.length} ${displayClinics.length === 1 ? 'clinic' : 'clinics'}`
                      : 'Search Results'}
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-sm text-carbon/60 hover:text-carbon flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-carbon/5 transition-colors"
                  >
                    <MdClose className="h-4 w-4" />
                    Clear
                  </button>
                </div>
                
                {/* Search Filters - Only show when searching by location */}
                {selectedLocation?.latitude && selectedLocation?.longitude && !selectedClinic && (
                  <div className="bg-white rounded-lg border border-carbon/10 p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-carbon mb-2">
                          Search Radius: {radiusKm} km
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={radiusKm}
                          onChange={(e) => setRadiusKm(Number(e.target.value))}
                          className="w-full h-2 bg-carbon/10 rounded-lg appearance-none cursor-pointer accent-azure-dragon"
                        />
                        <div className="flex justify-between text-xs text-carbon/60 mt-1">
                          <span>1 km</span>
                          <span>100 km</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-carbon mb-2">
                          Max Clinics: {maxClinics}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={maxClinics}
                          onChange={(e) => setMaxClinics(Number(e.target.value))}
                          className="w-full h-2 bg-carbon/10 rounded-lg appearance-none cursor-pointer accent-azure-dragon"
                        />
                        <div className="flex justify-between text-xs text-carbon/60 mt-1">
                          <span>1</span>
                          <span>50</span>
                        </div>
                      </div>
                    </div>
                    {isLoadingSlots && (
                      <div className="mt-3 text-sm text-carbon/60 flex items-center gap-2">
                        <Loading size="sm" />
                        <span>Updating results...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Clinic Slots (only show when there are results) */}
              {showResults && (
                <div className="lg:col-span-2 space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loading size="lg" />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <MdLocalHospital className="h-16 w-16 text-carbon/20 mx-auto mb-4" />
                      <p className="text-carbon/60 text-lg">
                        Unable to search clinics. Please try again later.
                      </p>
                    </div>
                  ) : displayClinics.length > 0 ? (
                    displayClinics.map((clinic) => (
                      <ClinicSlotsDisplay
                        key={clinic.clinic_id}
                        clinic={clinic}
                        onSlotSelect={(slot) => {
                          // Navigate to auth page first (will redirect to booking if already logged in)
                          const slotDate = format(parseISO(slot.slot_date), 'yyyy-MM-dd');
                          navigate(`/book-appointment-auth?clinic_id=${clinic.clinic_id}&slot_id=${slot.slot_id}&slot_date=${slotDate}`);
                        }}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MdLocalHospital className="h-16 w-16 text-carbon/20 mx-auto mb-4" />
                      <p className="text-carbon/60 text-lg">No clinics found. Try a different search.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Right Column: Map (show when location is selected OR when clinics with location data are found) */}
              {(selectedLocation?.latitude && selectedLocation?.longitude) ||
              (showResults && normalizedDisplayClinics.length > 0 && normalizedDisplayClinics.some(c => c.latitude && c.longitude)) ? (
                <div className={showResults ? 'lg:col-span-1' : 'lg:col-span-3'}>
                  <div className="sticky top-4">
                    <ClinicMap
                      clinics={normalizedDisplayClinics.filter(c => c.latitude && c.longitude)}
                      center={
                        selectedLocation?.latitude && selectedLocation?.longitude
                          ? {
                              lat: selectedLocation.latitude,
                              lng: selectedLocation.longitude,
                            }
                          : normalizedDisplayClinics.find(c => c.latitude && c.longitude)
                            ? {
                                lat: normalizedDisplayClinics.find(c => c.latitude && c.longitude)!.latitude!,
                                lng: normalizedDisplayClinics.find(c => c.latitude && c.longitude)!.longitude!,
                              }
                            : undefined
                      }
                      userLocation={
                        selectedLocation?.latitude && selectedLocation?.longitude
                          ? {
                              lat: selectedLocation.latitude,
                              lng: selectedLocation.longitude,
                            }
                          : undefined
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {/* Quick Features Section - Only show when no search results */}
      {!showResults && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-azure-dragon/10 mb-3">
                <MdLocalHospital className="h-6 w-6 text-azure-dragon" />
              </div>
              <h3 className="text-base font-semibold text-carbon mb-1">
                Find Trusted Clinics
              </h3>
              <p className="text-sm text-carbon/60">
                Connect with verified healthcare providers
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-azure-dragon/10 mb-3">
                <MdCalendarToday className="h-6 w-6 text-azure-dragon" />
              </div>
              <h3 className="text-base font-semibold text-carbon mb-1">
                Easy Booking
              </h3>
              <p className="text-sm text-carbon/60">
                Schedule appointments in just a few clicks
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-azure-dragon/10 mb-3">
                <MdPeople className="h-6 w-6 text-azure-dragon" />
              </div>
              <h3 className="text-base font-semibold text-carbon mb-1">
                Complete Care
              </h3>
              <p className="text-sm text-carbon/60">
                Manage your health records all in one place
              </p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Features Section - Only show when no search results */}
      {!showResults && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white-smoke">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-carbon mb-4">
              Everything You Need for Better Healthcare
            </h2>
            <p className="text-lg text-carbon/70 max-w-2xl mx-auto">
              Our comprehensive platform connects patients with healthcare providers, making healthcare management simple and accessible.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<MdLocalHospital className="h-8 w-8" />}
              title="Find Clinics"
              description="Search and discover healthcare clinics near you. Filter by location, clinic type, and availability."
            />
            <FeatureCard
              icon={<MdCalendarToday className="h-8 w-8" />}
              title="Book Appointments"
              description="Schedule appointments online with ease. View available slots and book instantly."
            />
            <FeatureCard
              icon={<MdPeople className="h-8 w-8" />}
              title="Patient Management"
              description="Manage your health records, view medical history, and track your appointments all in one place."
            />
            <FeatureCard
              icon={<MdNotifications className="h-8 w-8" />}
              title="Smart Reminders"
              description="Receive timely reminders for appointments, medications, and important health checkups."
            />
            <FeatureCard
              icon={<MdSecurity className="h-8 w-8" />}
              title="Secure & Private"
              description="Your health data is protected with enterprise-grade security and privacy controls."
            />
            <FeatureCard
              icon={<MdAccessibility className="h-8 w-8" />}
              title="Easy Access"
              description="Access your healthcare information anytime, anywhere. Available on all devices."
            />
          </div>
        </div>
      </section>
      )}

      {/* CTA Section - Only show when no search results */}
      {!showResults && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-azure-dragon to-azure-dragon/80">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust H360 for their healthcare needs. Register today and take control of your health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-azure-dragon hover:bg-white/90 border-white"
            >
              Create Account
              <MdArrowForward className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate('/login')}
              className="text-white border-white hover:bg-white/10"
            >
              Already have an account? Login
            </Button>
          </div>
        </div>
      </section>
      )}

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-azure-dragon mb-4">{icon}</div>
      <h3 className="text-xl font-heading font-semibold text-carbon mb-2">{title}</h3>
      <p className="text-carbon/70 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

