import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePatient, useRemovePatientFromClinic } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, DeleteConfirmationModal } from '@/components/ui';
import { useToastStore } from '@/store/toastStore';
import {
  MdEdit,
  MdArrowBack,
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdInfo,
  MdCalendarToday,
  MdBusiness,
  MdClose,
} from 'react-icons/md';
import { format } from 'date-fns';

export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id);
  const { user, role } = useAuth();
  const removeFromClinicMutation = useRemovePatientFromClinic();
  const { success: showSuccess, error: showError } = useToastStore();
  const [clinicToRemove, setClinicToRemove] = useState<{ patientId: string; clinicId: string; clinicName: string } | null>(null);

  const normalizedRole = role?.toUpperCase();
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  const isManager = normalizedRole === 'MANAGER';
  const isReceptionist = normalizedRole === 'RECEPTIONIST';
  const canRemoveFromClinic = isSystemAdmin || isManager || isReceptionist;

  const handleRemoveFromClinic = async () => {
    if (!clinicToRemove) return;

    try {
      await removeFromClinicMutation.mutateAsync({
        id: clinicToRemove.patientId,
        clinicId: clinicToRemove.clinicId,
      });
      showSuccess(`Patient removed from ${clinicToRemove.clinicName} successfully`);
      setClinicToRemove(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove patient from clinic';
      showError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">Patient Not Found</h2>
          <p className="text-sm text-carbon/60 mb-4">
            The patient you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/patients">
            <Button variant="outline">Back to Patients</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return dateString;
    }
  };

  const formatGender = (gender?: string) => {
    if (!gender) return '—';
    const genderMap: Record<string, string> = {
      M: 'Male',
      F: 'Female',
      Other: 'Other',
    };
    return genderMap[gender] || gender;
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/patients">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MdArrowBack className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
              {patient.full_name || `${patient.first_name} ${patient.last_name}`}
            </h1>
            <p className="text-sm text-carbon/60">Patient Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          {patient.is_active !== false && (
            <Link to={`/patients/${patient.patient_id}/edit`}>
              <Button variant="outline" size="md">
                <MdEdit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
            patient.is_active !== false
              ? 'bg-bright-halo/20 text-azure-dragon'
              : 'bg-carbon/10 text-carbon/60'
          }`}
        >
          {patient.is_active !== false ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Patient Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPerson className="h-5 w-5 text-azure-dragon" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">Patient Number</label>
                <p className="text-sm text-carbon font-medium mt-1">
                  {patient.patient_number || '—'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Full Name</label>
                <p className="text-sm text-carbon font-medium mt-1">
                  {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Date of Birth</label>
                <p className="text-sm text-carbon mt-1">{formatDate(patient.date_of_birth)}</p>
              </div>
              {patient.age !== undefined && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Age</label>
                  <p className="text-sm text-carbon mt-1">{patient.age} years</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-carbon/60">Gender</label>
                <p className="text-sm text-carbon mt-1">{formatGender(patient.gender)}</p>
              </div>
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
              {patient.email && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Email</label>
                  <p className="text-sm text-carbon mt-1">{patient.email}</p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Phone</label>
                  <p className="text-sm text-carbon mt-1">{patient.phone}</p>
                </div>
              )}
              {patient.alternate_phone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Alternate Phone</label>
                  <p className="text-sm text-carbon mt-1">{patient.alternate_phone}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-carbon/60">Has Account</label>
                <p className="text-sm text-carbon mt-1">
                  {patient.has_account ? 'Yes' : 'No'}
                </p>
              </div>
              {patient.username && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">Username</label>
                  <p className="text-sm text-carbon mt-1">{patient.username}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        {(patient.address || patient.city || patient.state || patient.postal_code || patient.country) && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdLocationOn className="h-5 w-5 text-azure-dragon" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.address && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Street Address</label>
                    <p className="text-sm text-carbon mt-1">{patient.address}</p>
                  </div>
                )}
                {(patient.city || patient.state || patient.postal_code || patient.country) && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Location</label>
                    <p className="text-sm text-carbon mt-1">
                      {[patient.city, patient.state, patient.postal_code, patient.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Contact */}
        {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdInfo className="h-5 w-5 text-azure-dragon" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.emergency_contact_name && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Contact Name</label>
                    <p className="text-sm text-carbon mt-1">{patient.emergency_contact_name}</p>
                  </div>
                )}
                {patient.emergency_contact_phone && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Contact Phone</label>
                    <p className="text-sm text-carbon mt-1">{patient.emergency_contact_phone}</p>
                  </div>
                )}
                {patient.emergency_contact_relationship && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">Relationship</label>
                    <p className="text-sm text-carbon mt-1">{patient.emergency_contact_relationship}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Multi-Clinic Support */}
        {patient.clinics && patient.clinics.length > 0 && (
          <Card variant="elevated" className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MdBusiness className="h-5 w-5 text-azure-dragon" />
                Clinic Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.clinics.map((clinic) => {
                  // For clinic managers, only allow removal if it's not their own clinic
                  // For system admins, allow removal from any clinic
                  const canRemove = canRemoveFromClinic && (
                    isSystemAdmin || (isManager && clinic.clinic_id !== user?.clinic_id)
                  );
                  
                  return (
                    <div key={clinic.clinic_id} className="border-b border-carbon/10 pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-carbon">{clinic.clinic_name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              clinic.subscription_status === 'active'
                                ? 'bg-bright-halo/20 text-azure-dragon'
                                : clinic.subscription_status === 'pending'
                                ? 'bg-carbon/10 text-carbon/60'
                                : 'bg-smudged-lips/20 text-smudged-lips'
                            }`}>
                              {clinic.subscription_status}
                            </span>
                            <span className="text-xs text-carbon/60 capitalize">
                              {clinic.registration_type}
                            </span>
                            {clinic.subscribed_at && (
                              <span className="text-xs text-carbon/50">
                                Subscribed: {format(new Date(clinic.subscribed_at), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                        </div>
                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setClinicToRemove({
                              patientId: patient.patient_id,
                              clinicId: clinic.clinic_id,
                              clinicName: clinic.clinic_name,
                            })}
                            className="text-smudged-lips hover:text-smudged-lips hover:bg-smudged-lips/10"
                          >
                            <MdClose className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Remove from Clinic Confirmation Modal */}
        {clinicToRemove && (
          <DeleteConfirmationModal
            isOpen={!!clinicToRemove}
            onClose={() => setClinicToRemove(null)}
            onConfirm={handleRemoveFromClinic}
            title="Remove Patient from Clinic"
            message={`Are you sure you want to remove this patient from ${clinicToRemove.clinicName}? The patient will remain active in other clinics and can still log in if they have an account.`}
            confirmText="Remove from Clinic"
            isLoading={removeFromClinicMutation.isPending}
          />
        )}

        {/* Metadata */}
        <Card variant="elevated" className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">Patient ID</label>
                <p className="text-sm text-carbon font-mono mt-1">{patient.patient_id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Registration Type</label>
                <p className="text-sm text-carbon mt-1 capitalize">{patient.registration_type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Created At</label>
                <p className="text-sm text-carbon mt-1">
                  {format(new Date(patient.created_at), 'PPpp')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">Last Updated</label>
                <p className="text-sm text-carbon mt-1">
                  {format(new Date(patient.updated_at), 'PPpp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
