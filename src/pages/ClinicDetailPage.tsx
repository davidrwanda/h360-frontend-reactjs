import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinic, useDeactivateClinic, useActivateClinic } from '@/hooks/useClinics';
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
          <h2 className="text-lg font-medium text-smudged-lips mb-2">Clinic Not Found</h2>
          <p className="text-sm text-carbon/60 mb-4">
            The clinic you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/clinics">
            <Button variant="outline">Back to Clinics</Button>
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
            <p className="text-sm text-carbon/60">Clinic Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {clinic.is_active && (
            <Link to={`/clinics/${clinic.clinic_id}/edit`}>
              <Button variant="outline" size="md">
                <MdEdit className="h-4 w-4 mr-2" />
                Edit
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
              Deactivate
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleActivateClick}
              disabled={activateMutation.isPending}
            >
              Activate
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
          title="Deactivate Clinic"
          message="Are you sure you want to deactivate this clinic? The clinic will be marked as inactive and will not be available for new appointments."
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
          title="Activate Clinic"
          message="Are you sure you want to activate this clinic? The clinic will be available for appointments and operations."
          itemName={clinic.name}
          isLoading={activateMutation.isPending}
          actionLabel="Activate"
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
              {(clinic.latitude || clinic.longitude) && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Coordinates</label>
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
              {clinic.fax && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Fax</label>
                  <p className="text-sm text-carbon mt-1">{clinic.fax}</p>
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
                {clinic.reminder_hours_before && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-carbon/60">Reminder Hours Before</span>
                    <span className="text-carbon">{clinic.reminder_hours_before} hours</span>
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
              Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clinic.established_date && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Established Date</label>
                  <p className="text-sm text-carbon mt-1">
                    {format(new Date(clinic.established_date), 'PPP')}
                  </p>
                </div>
              )}
              {clinic.license_number && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">License Number</label>
                  <p className="text-sm text-carbon mt-1">{clinic.license_number}</p>
                </div>
              )}
              {clinic.license_expiry_date && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">License Expiry</label>
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
                Financial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinic.tax_id && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Tax ID</label>
                    <p className="text-sm text-carbon mt-1">{clinic.tax_id}</p>
                  </div>
                )}
                {clinic.registration_number && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Registration Number</label>
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
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clinic.notes && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Notes</label>
                    <p className="text-sm text-carbon mt-1 whitespace-pre-wrap">{clinic.notes}</p>
                  </div>
                )}
                {clinic.logo_url && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Logo URL</label>
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
                    <label className="text-xs font-medium text-carbon/60">Image URL</label>
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
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">Clinic ID</label>
                <p className="text-sm text-carbon font-mono mt-1">{clinic.clinic_id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Created At</label>
                <p className="text-sm text-carbon mt-1">
                  {format(new Date(clinic.created_at), 'PPpp')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Last Updated</label>
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
