import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic, useDeactivateClinic, useActivateClinic } from '@/hooks/useClinics';
import { useTranslation, CLINIC } from '@/i18n';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, DeleteConfirmationModal } from '@/components/ui';
import { OperatingHoursDisplay } from '@/components/clinics/OperatingHoursDisplay';
import {
  MdEdit,
  MdDelete,
  MdArrowBack,
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdSchedule,
  MdSettings,
  MdInfo,
  MdAttachMoney,
} from 'react-icons/md';
import { format } from 'date-fns';

export const ClinicDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: clinic, isLoading, error } = useClinic(id);
  const deactivateMutation = useDeactivateClinic();
  const activateMutation = useActivateClinic();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const handleDeactivateClick = () => {
    setShowDeactivateModal(true);
  };

  const handleActivateClick = () => {
    setShowActivateModal(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!clinic) return;

    try {
      await deactivateMutation.mutateAsync(clinic.clinic_id);
      setShowDeactivateModal(false);
    } catch (error) {
      console.error('Failed to deactivate clinic:', error);
      // Error is handled by the mutation, modal will stay open
    }
  };

  const handleActivateConfirm = async () => {
    if (!clinic) return;

    try {
      await activateMutation.mutateAsync(clinic.clinic_id);
      setShowActivateModal(false);
    } catch (error) {
      console.error('Failed to activate clinic:', error);
      // Error is handled by the mutation, modal will stay open
    }
  };

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
          <p className="text-sm text-carbon/60 mb-4">
            {t(CLINIC.CLINIC_NOT_FOUND_DESC)}
          </p>
          <Link to="/clinics">
            <Button variant="outline">{t(CLINIC.BACK_TO_CLINICS)}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/clinics">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MdArrowBack className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              {clinic.name}
            </h1>
            <p className="text-sm text-carbon/60">{t(CLINIC.CLINIC_DETAILS)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {clinic.is_active && (
            <Link to={`/clinics/${clinic.clinic_id}/edit`}>
              <Button variant="outline" size="md">
                <MdEdit className="h-4 w-4 mr-2" />
                {t(CLINIC.EDIT)}
              </Button>
            </Link>
          )}
          {clinic.is_active ? (
            <Button
              variant="outline"
              size="md"
              onClick={handleDeactivateClick}
              className="text-smudged-lips border-smudged-lips/30 hover:bg-smudged-lips/10"
              disabled={deactivateMutation.isPending}
            >
              <MdDelete className="h-4 w-4 mr-2" />
              {t(CLINIC.DEACTIVATE)}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleActivateClick}
              disabled={activateMutation.isPending}
            >
              {t(CLINIC.ACTIVATE)}
            </Button>
          )}
        </div>
      </div>

      {/* Deactivate Confirmation Modal */}
      {clinic && showDeactivateModal && (
        <DeleteConfirmationModal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          onConfirm={handleDeactivateConfirm}
          title={t(CLINIC.DEACTIVATE_CLINIC)}
          message={t(CLINIC.DEACTIVATE_CLINIC_MSG)}
          itemName={clinic.name}
          isLoading={deactivateMutation.isPending}
          variant="deactivate"
        />
      )}

      {/* Activate Confirmation Modal */}
      {clinic && showActivateModal && (
        <DeleteConfirmationModal
          isOpen={showActivateModal}
          onClose={() => setShowActivateModal(false)}
          onConfirm={handleActivateConfirm}
          title={t(CLINIC.ACTIVATE_CLINIC)}
          message={t(CLINIC.ACTIVATE_CLINIC_MSG)}
          itemName={clinic.name}
          isLoading={activateMutation.isPending}
          actionLabel={t(CLINIC.ACTIVATE)}
          variant="delete"
        />
      )}

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
              {(clinic.latitude || clinic.longitude) && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.COORDINATES)}</label>
                  <p className="text-sm text-carbon mt-1">
                    {clinic.latitude && clinic.longitude
                      ? `${clinic.latitude}, ${clinic.longitude}`
                      : clinic.latitude
                        ? `Lat: ${clinic.latitude}`
                        : clinic.longitude
                          ? `Lng: ${clinic.longitude}`
                          : '—'}
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
              {clinic.fax && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.FAX)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.fax}</p>
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
                {clinic.reminder_hours_before && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-carbon/60">{t(CLINIC.REMINDER_HOURS_BEFORE)}</span>
                    <span className="text-carbon">{t(CLINIC.HOURS, { count: String(clinic.reminder_hours_before) })}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Management */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdInfo className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.MANAGEMENT)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.established_date && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.ESTABLISHED_DATE)}</label>
                  <p className="text-sm text-carbon mt-1">
                    {format(new Date(clinic.established_date), 'PPP')}
                  </p>
                </div>
              )}
              {clinic.license_number && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.LICENSE_NUMBER)}</label>
                  <p className="text-sm text-carbon mt-1">{clinic.license_number}</p>
                </div>
              )}
              {clinic.license_expiry_date && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(CLINIC.LICENSE_EXPIRY)}</label>
                  <p className="text-sm text-carbon mt-1">
                    {format(new Date(clinic.license_expiry_date), 'PPP')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        {(clinic.tax_id || clinic.registration_number) && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdAttachMoney className="h-5 w-5 text-azure-dragon" />
                {t(CLINIC.FINANCIAL)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinic.tax_id && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.TAX_ID)}</label>
                    <p className="text-sm text-carbon mt-1">{clinic.tax_id}</p>
                  </div>
                )}
                {clinic.registration_number && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.REGISTRATION_NUMBER)}</label>
                    <p className="text-sm text-carbon mt-1">{clinic.registration_number}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Information */}
        {(clinic.notes || clinic.logo_url || clinic.image_url) && (
          <Card variant="elevated" className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>{t(CLINIC.ADDITIONAL_INFORMATION)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinic.notes && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.NOTES)}</label>
                    <p className="text-sm text-carbon mt-1 whitespace-pre-wrap">{clinic.notes}</p>
                  </div>
                )}
                {clinic.logo_url && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.LOGO_URL)}</label>
                    <a
                      href={clinic.logo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-azure-dragon hover:underline mt-1 block"
                    >
                      {clinic.logo_url}
                    </a>
                  </div>
                )}
                {clinic.image_url && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(CLINIC.IMAGE_URL)}</label>
                    <a
                      href={clinic.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-azure-dragon hover:underline mt-1 block"
                    >
                      {clinic.image_url}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card variant="elevated" className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>{t(CLINIC.METADATA)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(CLINIC.CLINIC_ID)}</label>
                <p className="text-sm text-carbon font-mono mt-1">{clinic.clinic_id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(CLINIC.CREATED_AT)}</label>
                <p className="text-sm text-carbon mt-1">
                  {format(new Date(clinic.created_at), 'PPpp')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(CLINIC.LAST_UPDATED)}</label>
                <p className="text-sm text-carbon mt-1">
                  {format(new Date(clinic.updated_at), 'PPpp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
