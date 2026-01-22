import { useClinic } from '@/hooks/useClinics';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Loading, Button } from '@/components/ui';
import { OperatingHoursDisplay } from '@/components/clinics/OperatingHoursDisplay';
import { useNavigate } from 'react-router-dom';
import {
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdSchedule,
  MdSettings,
  MdEdit,
} from 'react-icons/md';

/**
 * Clinic Info Page - Shows the logged-in clinic admin's clinic information
 * Read-only view of their clinic details
 */
export const ClinicInfoPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get clinic_id from storage (fallback to user object)
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      // Try to get from localStorage directly (Zustand persist)
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch (error) {
      console.warn('Failed to get clinic_id from localStorage:', error);
    }

    // Fallback to user object from auth hook
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  const clinicId = getClinicIdFromStorage();

  // Fetch clinic data
  const { data: clinic, isLoading, error } = useClinic(clinicId || undefined);

  if (!clinicId) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">No Clinic Assigned</h2>
          <p className="text-sm text-carbon/60">
            You are not assigned to any clinic. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">Clinic Not Found</h2>
          <p className="text-sm text-carbon/60">
            Unable to load clinic information. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {clinic.name}
          </h1>
          <p className="text-sm text-carbon/60">Clinic Information</p>
        </div>
        {clinic.is_active && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/clinics/${clinic.clinic_id}/edit`)}
          >
            <MdEdit className="h-4 w-4 mr-2" />
            Edit Clinic Info
          </Button>
        )}
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
            clinic.is_active
              ? 'bg-bright-halo/20 text-azure-dragon'
              : 'bg-carbon/10 text-carbon/60'
          }`}
        >
          {clinic.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Clinic Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="h-5 w-5 text-azure-dragon" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">Clinic Name</label>
                <p className="text-sm text-carbon font-medium mt-1">{clinic.name}</p>
              </div>
              {clinic.clinic_code && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Clinic Code</label>
                  <p className="text-sm text-carbon mt-1">{clinic.clinic_code}</p>
                </div>
              )}
              {clinic.description && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Description</label>
                  <p className="text-sm text-carbon mt-1">{clinic.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdLocationOn className="h-5 w-5 text-azure-dragon" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.address && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Address</label>
                  <p className="text-sm text-carbon mt-1">{clinic.address}</p>
                </div>
              )}
              {(clinic.city || clinic.state || clinic.postal_code || clinic.country) && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Location</label>
                  <p className="text-sm text-carbon mt-1">
                    {[clinic.city, clinic.state, clinic.postal_code, clinic.country]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPhone className="h-5 w-5 text-azure-dragon" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.phone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Phone</label>
                  <p className="text-sm text-carbon mt-1">{clinic.phone}</p>
                </div>
              )}
              {clinic.email && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Email</label>
                  <p className="text-sm text-carbon mt-1">{clinic.email}</p>
                </div>
              )}
              {clinic.website && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Website</label>
                  <a
                    href={
                      clinic.website.startsWith('http://') || clinic.website.startsWith('https://')
                        ? clinic.website
                        : `https://${clinic.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-azure-dragon hover:underline mt-1 block"
                  >
                    {clinic.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Operational Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSchedule className="h-5 w-5 text-azure-dragon" />
              Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.timezone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Timezone</label>
                  <p className="text-sm text-carbon mt-1">{clinic.timezone}</p>
                </div>
              )}
              {clinic.currency && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Currency</label>
                  <p className="text-sm text-carbon mt-1">{clinic.currency}</p>
                </div>
              )}
              {clinic.language && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Language</label>
                  <p className="text-sm text-carbon mt-1">{clinic.language}</p>
                </div>
              )}
              {clinic.operating_hours && (
                <div>
                  <label className="text-xs font-medium text-carbon/60 mb-2 block">
                    Operating Hours
                  </label>
                  <OperatingHoursDisplay operatingHours={clinic.operating_hours} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings & Configuration */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSettings className="h-5 w-5 text-azure-dragon" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.appointment_slot_duration && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Slot Duration</label>
                  <p className="text-sm text-carbon mt-1">{clinic.appointment_slot_duration} minutes</p>
                </div>
              )}
              {clinic.max_daily_appointments && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Max Daily Appointments</label>
                  <p className="text-sm text-carbon mt-1">{clinic.max_daily_appointments}</p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">Online Booking</span>
                  <span className="text-carbon">
                    {clinic.allow_online_booking ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">SMS Reminders</span>
                  <span className="text-carbon">
                    {clinic.send_sms_reminders ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">Email Reminders</span>
                  <span className="text-carbon">
                    {clinic.send_email_reminders ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
