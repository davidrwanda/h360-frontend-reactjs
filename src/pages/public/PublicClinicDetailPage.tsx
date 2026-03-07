import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useClinic } from '@/hooks/useClinics';
import { useTranslation, LANDING, CLINIC } from '@/i18n';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading } from '@/components/ui';
import { PublicHeader, PublicFooter } from '@/components/layout';
import { OperatingHoursDisplay } from '@/components/clinics/OperatingHoursDisplay';
import { ClinicSlotsDisplay } from '@/components/clinics/ClinicSlotsDisplay';
import {
  MdArrowBack,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdLanguage,
  MdSchedule,
  MdLocalHospital,
  MdBookmarkBorder,
  MdOpenInNew,
} from 'react-icons/md';

export const PublicClinicDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: clinic, isLoading, error } = useClinic(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loading size="lg" />
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="flex min-h-screen flex-col bg-white-smoke">
        <PublicHeader />
        <div className="flex-1 mx-auto max-w-4xl w-full px-4 py-8">
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <MdLocalHospital className="h-16 w-16 text-carbon/20 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-smudged-lips mb-4">
                {t(LANDING.CLINIC_NOT_FOUND_PUBLIC)}
              </h2>
              <p className="text-carbon/60 mb-6">
                {t(LANDING.CLINIC_NOT_FOUND_DESC_PUBLIC)}
              </p>
              <Link to="/">
                <Button variant="primary">{t(LANDING.BACK_TO_SEARCH)}</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const fullAddress = [clinic.address, clinic.city, clinic.state, clinic.postal_code, clinic.country]
    .filter(Boolean)
    .join(', ');

  const bookingModeLabel = clinic.booking_mode
    ? {
        both_required: t(CLINIC.BOOKING_MODE_BOTH_REQUIRED),
        doctor_required: t(CLINIC.BOOKING_MODE_DOCTOR_REQUIRED),
        service_required: t(CLINIC.BOOKING_MODE_SERVICE_REQUIRED),
        flexible: t(CLINIC.BOOKING_MODE_FLEXIBLE),
        time_slot_only: t(CLINIC.BOOKING_MODE_TIME_SLOT_ONLY),
      }[clinic.booking_mode] || clinic.booking_mode
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-white-smoke">
      <PublicHeader />
      <div className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-carbon/60 hover:text-carbon transition-colors mb-6"
        >
          <MdArrowBack className="h-4 w-4" />
          {t(LANDING.BACK_TO_SEARCH)}
        </Link>

        {/* Clinic Header */}
        <div className="bg-white rounded-xl shadow-lg border border-carbon/10 overflow-hidden mb-6">
          <div className="bg-azure-dragon/5 p-6 border-b border-carbon/10">
            <div className="flex items-start gap-4">
              {clinic.logo_url ? (
                <img
                  src={clinic.logo_url}
                  alt={clinic.name}
                  className="h-16 w-16 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="bg-azure-dragon/10 p-3 rounded-lg shrink-0">
                  <MdLocalHospital className="h-8 w-8 text-azure-dragon" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-heading font-semibold text-carbon mb-1">
                  {clinic.name}
                </h1>
                {fullAddress && (
                  <p className="text-sm text-carbon/70 flex items-center gap-1.5 mb-2">
                    <MdLocationOn className="h-4 w-4 shrink-0" />
                    {fullAddress}
                  </p>
                )}
                {clinic.description && (
                  <p className="text-sm text-carbon/60 mt-2">{clinic.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick contact actions */}
          <div className="p-4 flex flex-wrap gap-3">
            {clinic.phone && (
              <a
                href={`tel:${clinic.phone}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-azure-dragon bg-azure-dragon/10 hover:bg-azure-dragon/20 rounded-lg transition-colors"
              >
                <MdPhone className="h-4 w-4" />
                {t(LANDING.CALL_CLINIC)}
              </a>
            )}
            {clinic.email && (
              <a
                href={`mailto:${clinic.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-azure-dragon bg-azure-dragon/10 hover:bg-azure-dragon/20 rounded-lg transition-colors"
              >
                <MdEmail className="h-4 w-4" />
                {t(LANDING.EMAIL_CLINIC)}
              </a>
            )}
            {clinic.website && (
              <a
                href={
                  clinic.website.startsWith('http://') || clinic.website.startsWith('https://')
                    ? clinic.website
                    : `https://${clinic.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-azure-dragon bg-azure-dragon/10 hover:bg-azure-dragon/20 rounded-lg transition-colors"
              >
                <MdLanguage className="h-4 w-4" />
                {t(LANDING.VISIT_WEBSITE)}
                <MdOpenInNew className="h-3 w-3" />
              </a>
            )}
            {clinic.latitude && clinic.longitude && (
              <a
                href={`https://www.google.com/maps?q=${clinic.latitude},${clinic.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-azure-dragon bg-azure-dragon/10 hover:bg-azure-dragon/20 rounded-lg transition-colors"
              >
                <MdLocationOn className="h-4 w-4" />
                {t(LANDING.VIEW_ON_MAP)}
                <MdOpenInNew className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Operating Hours */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdSchedule className="h-5 w-5 text-azure-dragon" />
                {t(LANDING.OPERATING_HOURS)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OperatingHoursDisplay operatingHours={clinic.operating_hours} />
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdBookmarkBorder className="h-5 w-5 text-azure-dragon" />
                {t(LANDING.BOOKING_INFO)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinic.appointment_slot_duration && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.SLOT_DURATION)}</label>
                    <p className="text-sm text-carbon mt-1">
                      {t(LANDING.SLOT_DURATION_INFO, { count: String(clinic.appointment_slot_duration) })}
                    </p>
                  </div>
                )}
                {bookingModeLabel && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.BOOKING_MODE_LABEL)}</label>
                    <p className="text-sm text-carbon mt-1">{bookingModeLabel}</p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-carbon/60">{t(CLINIC.ONLINE_BOOKING)}</span>
                  <span className="text-carbon">
                    {clinic.allow_online_booking ? t(CLINIC.ENABLED) : t(CLINIC.DISABLED)}
                  </span>
                </div>
                {clinic.auto_assign_doctor !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-carbon/60">{t(CLINIC.AUTO_ASSIGN_DOCTOR)}</span>
                    <span className="text-carbon">
                      {clinic.auto_assign_doctor ? t(CLINIC.ENABLED) : t(CLINIC.DISABLED)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Appointments */}
        <div className="mb-6">
          <h2 className="text-lg font-heading font-semibold text-carbon mb-4 flex items-center gap-2">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
            {t(LANDING.AVAILABLE_APPOINTMENTS)}
          </h2>
          <ClinicSlotsDisplay
            clinic={clinic}
            onSlotSelect={(slot) => {
              const slotDate = format(parseISO(slot.slot_date), 'yyyy-MM-dd');
              navigate(
                `/book-appointment-auth?clinic_id=${clinic.clinic_id}&slot_id=${slot.slot_id}&slot_date=${slotDate}`
              );
            }}
          />
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};
