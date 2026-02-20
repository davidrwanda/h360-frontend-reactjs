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
  MdCalendarToday,
  MdPerson,
  MdPlayArrow,
} from 'react-icons/md';
import { useTranslation, CLINIC } from '@/i18n';

/**
 * Clinic Info Page - Shows the logged-in clinic admin's clinic information
 * Read-only view of their clinic details
 */
export const ClinicInfoPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(CLINIC.NO_CLINIC_ASSIGNED)}</h2>
          <p className="text-sm text-carbon/60">
            {t(CLINIC.NO_CLINIC_ASSIGNED_DESC)}
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
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(CLINIC.CLINIC_NOT_FOUND)}</h2>
          <p className="text-sm text-carbon/60">
            {t(CLINIC.UNABLE_LOAD_CLINIC)}
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
          <p className="text-sm text-carbon/60">{t(CLINIC.CLINIC_INFORMATION)}</p>
        </div>
        {clinic.is_active && (
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(`/clinics/${clinic.clinic_id}/edit`)}
          >
            <MdEdit className="h-4 w-4 mr-2" />
            {t(CLINIC.EDIT_CLINIC_INFO)}
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
          {clinic.is_active ? t(CLINIC.ACTIVE) : t(CLINIC.INACTIVE)}
        </span>
      </div>

      {/* Clinic Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.BASIC_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(CLINIC.CLINIC_NAME)}</label>
                <p className="text-sm text-carbon font-medium mt-1">{clinic.name}</p>
              </div>
              {clinic.clinic_code && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.CLINIC_CODE)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.clinic_code}</p>
                </div>
              )}
              {clinic.description && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.DESCRIPTION)}</label>
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
              {t(CLINIC.LOCATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.address && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.ADDRESS)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.address}</p>
                </div>
              )}
              {(clinic.city || clinic.state || clinic.postal_code || clinic.country) && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.LOCATION)}</label>
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
              {t(CLINIC.CONTACT)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.phone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.PHONE)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.phone}</p>
                </div>
              )}
              {clinic.email && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.EMAIL)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.email}</p>
                </div>
              )}
              {clinic.website && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.WEBSITE)}</label>
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
              {t(CLINIC.OPERATIONAL)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.timezone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.TIMEZONE)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.timezone}</p>
                </div>
              )}
              {clinic.currency && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.CURRENCY)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.currency}</p>
                </div>
              )}
              {clinic.language && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.LANGUAGE)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.language}</p>
                </div>
              )}
              {clinic.operating_hours && (
                <div>
                  <label className="text-xs font-medium text-carbon/60 mb-2 block">
                    {t(CLINIC.OPERATING_HOURS)}
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
              {t(CLINIC.SETTINGS_CONFIG)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.appointment_slot_duration && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.SLOT_DURATION)}</label>
                  <p className="text-sm text-carbon mt-1">{t(CLINIC.MINUTES, { count: String(clinic.appointment_slot_duration) })}</p>
                </div>
              )}
              {clinic.max_daily_appointments && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.MAX_DAILY_APPOINTMENTS)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.max_daily_appointments}</p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">{t(CLINIC.ONLINE_BOOKING)}</span>
                  <span className="text-carbon">
                    {clinic.allow_online_booking ? t(CLINIC.ENABLED) : t(CLINIC.DISABLED)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">{t(CLINIC.SMS_REMINDERS)}</span>
                  <span className="text-carbon">
                    {clinic.send_sms_reminders ? t(CLINIC.ENABLED) : t(CLINIC.DISABLED)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">{t(CLINIC.EMAIL_REMINDERS)}</span>
                  <span className="text-carbon">
                    {clinic.send_email_reminders ? t(CLINIC.ENABLED) : t(CLINIC.DISABLED)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timetable Section */}
      <div className="mt-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdCalendarToday className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.TIMETABLE)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/60 mb-4">
              {t(CLINIC.TIMETABLE_SECTION_DESC)}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/clinic-calendar')}
                className="justify-start h-auto py-3"
              >
                <MdCalendarToday className="h-5 w-5 mr-2 text-azure-dragon" />
                <div className="text-left">
                  <div className="font-medium text-carbon">{t(CLINIC.CLINIC_TIMETABLE)}</div>
                  <div className="text-xs text-carbon/60">{t(CLINIC.CONFIGURE_CLINIC_SCHEDULE)}</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/doctor-calendar')}
                className="justify-start h-auto py-3"
              >
                <MdPerson className="h-5 w-5 mr-2 text-azure-dragon" />
                <div className="text-left">
                  <div className="font-medium text-carbon">{t(CLINIC.DOCTOR_TIMETABLE)}</div>
                  <div className="text-xs text-carbon/60">{t(CLINIC.MANAGE_DOCTOR_SCHEDULES)}</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/slot-generation')}
                className="justify-start h-auto py-3"
              >
                <MdPlayArrow className="h-5 w-5 mr-2 text-azure-dragon" />
                <div className="text-left">
                  <div className="font-medium text-carbon">{t(CLINIC.SLOT_GENERATION)}</div>
                  <div className="text-xs text-carbon/60">{t(CLINIC.GENERATE_APPOINTMENT_SLOTS)}</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
