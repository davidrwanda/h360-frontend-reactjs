import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useClinics } from '@/hooks/useClinics';
import { Button, Input, Loading } from '@/components/ui';
import { LocationInput } from '@/components/clinics/LocationInput';
import { ClinicAutocomplete } from '@/components/clinics/ClinicAutocomplete';
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
  MdPhone,
  MdEmail,
  MdArrowForward,
  MdClose,
  MdMenu,
  MdPerson,
  MdMedicalServices,
} from 'react-icons/md';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [clinicName, setClinicName] = useState('');
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [location, setLocation] = useState('');
  const [service, setService] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
  } | null>(null);

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

  const clinics = clinicsData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic:
    // 1. If clinic is selected, search by clinic only
    // 2. If no clinic, require address (location) to search
    // 3. Service type is optional but works with address
    if (selectedClinic || (location && selectedLocation)) {
      setShowResults(true);
      // Scroll to results section
      setTimeout(() => {
        const resultsSection = document.getElementById('search-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleClinicClick = (clinicId: string) => {
    navigate(`/register?clinic_id=${clinicId}`);
  };

  const clearSearch = () => {
    setClinicName('');
    setSelectedClinic(null);
    setLocation('');
    setService('');
    setSelectedLocation(null);
    setShowResults(false);
  };

  const handleClinicSelect = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setClinicName(clinic.name);
    // Clear location when clinic is selected
    setLocation('');
    setSelectedLocation(null);
  };

  const handleClinicNameChange = (name: string) => {
    setClinicName(name);
    // Clear selected clinic if user changes the name manually
    if (selectedClinic && name !== selectedClinic.name) {
      setSelectedClinic(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-carbon/10 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <MdLocalHospital className="h-8 w-8 text-azure-dragon" />
              <div>
                <span className="text-xl font-heading font-bold text-azure-dragon">H360</span>
                <p className="text-xs text-carbon/60 -mt-1">Your healthcare appointment in one click</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-carbon hover:text-azure-dragon"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </div>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-carbon hover:text-azure-dragon"
            >
              <MdMenu className="h-6 w-6" />
            </button>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-carbon/10">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate('/login');
                    setShowMobileMenu(false);
                  }}
                  className="w-full justify-start"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    navigate('/register');
                    setShowMobileMenu(false);
                  }}
                  className="w-full"
                >
                  Register
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section with Background */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
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
                  
                  // Don't auto-trigger search - let user click Search button
                  // This allows users to finish selecting address before searching
                }}
                placeholder="City or Postal Code"
                className="pl-12 pr-4"
                disabled={!!selectedClinic}
              />
            </div>

            {/* Service Field */}
            <div className="flex-1 relative flex items-center">
              <MdMedicalServices className="absolute left-4 h-5 w-5 text-azure-dragon/60 z-10" />
              <Input
                type="text"
                placeholder="Service Type (Optional)"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="pl-12 pr-4 py-4 text-base border-0 focus:ring-2 focus:ring-azure-dragon/20 rounded-xl h-full"
                style={{ backgroundColor: '#f5f5f5' }}
              />
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

          {/* Search Results */}
          {showResults && (
            <div id="search-results" className="mt-8 max-w-5xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-h-[500px] overflow-y-auto">
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
                ) : clinics.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-lg font-semibold text-carbon">
                        Found {clinics.length} {clinics.length === 1 ? 'clinic' : 'clinics'}
                      </p>
                      <button
                        onClick={clearSearch}
                        className="text-sm text-carbon/60 hover:text-carbon flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-carbon/5 transition-colors"
                      >
                        <MdClose className="h-4 w-4" />
                        Clear
                      </button>
                    </div>
                    <div className="space-y-4">
                      {clinics.map((clinic) => (
                        <ClinicCard
                          key={clinic.clinic_id}
                          clinic={clinic}
                          onClick={() => handleClinicClick(clinic.clinic_id)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <MdLocalHospital className="h-16 w-16 text-carbon/20 mx-auto mb-4" />
                    <p className="text-carbon/60 text-lg">No clinics found. Try a different search.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Features Section */}
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

      {/* Features Section */}
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
              description="Search and discover healthcare clinics near you. Filter by location, services, and availability."
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

      {/* CTA Section */}
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

      {/* Footer */}
      <footer className="bg-carbon text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MdLocalHospital className="h-6 w-6" />
                <span className="text-lg font-heading font-bold">H360</span>
              </div>
              <p className="text-white/70 text-sm">
                Your trusted healthcare management platform. Connecting patients with quality healthcare providers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <Link to="/register" className="hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <MdEmail className="h-4 w-4" />
                  <span>support@h360.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MdPhone className="h-4 w-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/60">
            <p>&copy; {new Date().getFullYear()} H360. All rights reserved.</p>
          </div>
        </div>
      </footer>
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

interface ClinicCardProps {
  clinic: Clinic;
  onClick: () => void;
}

const ClinicCard = ({ clinic, onClick }: ClinicCardProps) => {
  const getFullAddress = () => {
    const parts = [
      clinic.address,
      clinic.city,
      clinic.state,
      clinic.postal_code,
      clinic.country,
    ].filter(Boolean);
    return parts.join(', ') || 'Address not available';
  };

  return (
    <div
      className="bg-white border border-carbon/10 rounded-xl p-5 cursor-pointer hover:shadow-lg hover:border-azure-dragon/30 transition-all"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-azure-dragon/10 p-2 rounded-lg">
              <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-carbon">{clinic.name}</h3>
          </div>
          {clinic.description && (
            <p className="text-sm text-carbon/70 mb-3 line-clamp-2">{clinic.description}</p>
          )}
          <div className="space-y-2 text-sm text-carbon/60">
            <div className="flex items-center gap-2">
              <MdLocationOn className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{getFullAddress()}</span>
            </div>
            {clinic.phone && (
              <div className="flex items-center gap-2">
                <MdPhone className="h-4 w-4 shrink-0" />
                <span>{clinic.phone}</span>
              </div>
            )}
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="shrink-0"
        >
          Select
          <MdArrowForward className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
