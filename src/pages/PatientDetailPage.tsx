import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePatient, useRemovePatientFromClinic, useCreatePatientAccount } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent, Button, Loading, DeleteConfirmationModal, Modal } from '@/components/ui';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, PATIENT } from '@/i18n';
import {
  MdEdit,
  MdArrowBack,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdInfo,
  MdBusiness,
  MdClose,
  MdAccountCircle,
  MdLock,
} from 'react-icons/md';
import { format } from 'date-fns';

export const PatientDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id);
  const { user, role } = useAuth();
  const removeFromClinicMutation = useRemovePatientFromClinic();
  const createAccountMutation = useCreatePatientAccount();
  const { success: showSuccess, error: showError } = useToastStore();
  const [clinicToRemove, setClinicToRemove] = useState<{ patientId: string; clinicId: string; clinicName: string } | null>(null);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const normalizedRole = role?.toUpperCase();
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  const isManager = normalizedRole === 'MANAGER';
  const isReceptionist = normalizedRole === 'RECEPTIONIST';
  const canRemoveFromClinic = isSystemAdmin || isManager || isReceptionist;
  const canCreateAccount = isSystemAdmin || isManager || isReceptionist;

  // Determine clinic_id for account creation
  // For clinic managers, use their clinic_id
  // For system admins, use patient's primary clinic_id or first clinic
  const getClinicIdForAccount = (): string | undefined => {
    if (!patient) return undefined;
    if (isManager && user?.clinic_id) {
      return user.clinic_id;
    }
    if (patient.clinic_id) {
      return patient.clinic_id;
    }
    if (patient.clinics && patient.clinics.length > 0 && patient.clinics[0]) {
      return patient.clinics[0].clinic_id;
    }
    return undefined;
  };

  const handleRemoveFromClinic = async () => {
    if (!clinicToRemove) return;

    try {
      await removeFromClinicMutation.mutateAsync({
        id: clinicToRemove.patientId,
        clinicId: clinicToRemove.clinicId,
      });
      showSuccess(t(PATIENT.REMOVED_SUCCESS, { clinicName: clinicToRemove.clinicName }));
      setClinicToRemove(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(PATIENT.REMOVE_FAILED);
      showError(errorMessage);
    }
  };

  const handleCreateAccount = async () => {
    if (!patient || !patient.patient_id) return;

    const clinicId = getClinicIdForAccount();
    if (!clinicId) {
      showError(t(PATIENT.NO_CLINIC_ERROR));
      return;
    }

    if (!patient.email) {
      showError(t(PATIENT.NO_EMAIL_ERROR));
      return;
    }

    try {
      const result = await createAccountMutation.mutateAsync({
        id: patient.patient_id,
        data: {
          clinic_id: clinicId,
          send_email: true,
        },
      });

      setGeneratedPassword(result.password);
      setShowCreateAccountModal(true);
      showSuccess(t(PATIENT.ACCOUNT_CREATED_SUCCESS));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(PATIENT.ACCOUNT_CREATE_FAILED);
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
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(PATIENT.PATIENT_NOT_FOUND)}</h2>
          <p className="text-sm text-carbon/60 mb-4">
            {t(PATIENT.PATIENT_NOT_FOUND_DESC)}
          </p>
          <Link to="/patients">
            <Button variant="outline">{t(PATIENT.BACK_TO_PATIENTS)}</Button>
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
      M: t(PATIENT.MALE),
      F: t(PATIENT.FEMALE),
      Other: t(PATIENT.OTHER_GENDER),
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
            <p className="text-sm text-carbon/60">{t(PATIENT.PATIENT_DETAILS)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {patient.is_active !== false && (
            <Link to={`/patients/${patient.patient_id}/edit`}>
              <Button variant="outline" size="md">
                <MdEdit className="h-4 w-4 mr-2" />
                {t(PATIENT.EDIT)}
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
          {patient.is_active !== false ? t(PATIENT.ACTIVE) : t(PATIENT.INACTIVE)}
        </span>
      </div>

      {/* Patient Information Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPerson className="h-5 w-5 text-azure-dragon" />
              {t(PATIENT.BASIC_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.PATIENT_NUMBER)}</label>
                <p className="text-sm text-carbon font-medium mt-1">
                  {patient.patient_number || '—'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.FULL_NAME)}</label>
                <p className="text-sm text-carbon font-medium mt-1">
                  {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.DATE_OF_BIRTH)}</label>
                <p className="text-sm text-carbon mt-1">{formatDate(patient.date_of_birth)}</p>
              </div>
              {patient.age !== undefined && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(PATIENT.AGE)}</label>
                  <p className="text-sm text-carbon mt-1">{t(PATIENT.AGE_YEARS, { age: String(patient.age) })}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.GENDER)}</label>
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
              {t(PATIENT.CONTACT)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patient.email && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(PATIENT.EMAIL)}</label>
                  <p className="text-sm text-carbon mt-1">{patient.email}</p>
                </div>
              )}
              {patient.phone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(PATIENT.PHONE)}</label>
                  <p className="text-sm text-carbon mt-1">{patient.phone}</p>
                </div>
              )}
              {patient.alternate_phone && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(PATIENT.ALTERNATE_PHONE)}</label>
                  <p className="text-sm text-carbon mt-1">{patient.alternate_phone}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.HAS_ACCOUNT)}</label>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-carbon">
                    {patient.has_account ? t(PATIENT.YES) : t(PATIENT.NO)}
                  </p>
                  {!patient.has_account && canCreateAccount && patient.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateAccount}
                      disabled={createAccountMutation.isPending}
                      className="text-xs"
                    >
                      <MdAccountCircle className="h-3 w-3 mr-1" />
                      {t(PATIENT.CREATE_ACCOUNT)}
                    </Button>
                  )}
                </div>
              </div>
              {patient.username && (
                <div>
                  <label className="text-xs font-medium text-carbon/60">{t(PATIENT.USERNAME)}</label>
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
                {t(PATIENT.ADDRESS)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.address && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(PATIENT.STREET_ADDRESS)}</label>
                    <p className="text-sm text-carbon mt-1">{patient.address}</p>
                  </div>
                )}
                {(patient.city || patient.state || patient.postal_code || patient.country) && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(PATIENT.LOCATION)}</label>
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
                {t(PATIENT.EMERGENCY_CONTACT)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patient.emergency_contact_name && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(PATIENT.CONTACT_NAME)}</label>
                    <p className="text-sm text-carbon mt-1">{patient.emergency_contact_name}</p>
                  </div>
                )}
                {patient.emergency_contact_phone && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(PATIENT.CONTACT_PHONE)}</label>
                    <p className="text-sm text-carbon mt-1">{patient.emergency_contact_phone}</p>
                  </div>
                )}
                {patient.emergency_contact_relationship && (
                  <div>
                    <label className="text-xs font-medium text-carbon/60">{t(PATIENT.RELATIONSHIP)}</label>
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
                {t(PATIENT.CLINIC_SUBSCRIPTIONS)}
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
                                {t(PATIENT.SUBSCRIBED, { date: format(new Date(clinic.subscribed_at), 'MMM d, yyyy') })}
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
                            {t(PATIENT.REMOVE)}
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
            title={t(PATIENT.REMOVE_FROM_CLINIC_TITLE)}
            message={t(PATIENT.REMOVE_FROM_CLINIC_MESSAGE, { clinicName: clinicToRemove.clinicName })}
            confirmText={t(PATIENT.REMOVE_FROM_CLINIC_CONFIRM)}
            isLoading={removeFromClinicMutation.isPending}
          />
        )}

        {/* Create Account Password Modal */}
        {showCreateAccountModal && generatedPassword && (
          <Modal
            isOpen={showCreateAccountModal}
            onClose={() => {
              setShowCreateAccountModal(false);
              setGeneratedPassword(null);
            }}
            title={t(PATIENT.ACCOUNT_CREATED_TITLE)}
            size="md"
          >
            <div className="space-y-4">
              <div className="rounded-md bg-bright-halo/10 border border-bright-halo/20 px-4 py-3">
                <p className="text-sm text-carbon/80">
                  {t(PATIENT.ACCOUNT_CREATED_DESC, { name: patient.full_name || `${patient.first_name} ${patient.last_name}` })}
                  {patient.email && (
                    <span className="block mt-1" dangerouslySetInnerHTML={{ __html: t(PATIENT.CREDENTIALS_SENT, { email: `<strong>${patient.email}</strong>` }) }} />
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-carbon/60 flex items-center gap-2">
                  <MdLock className="h-4 w-4" />
                  {t(PATIENT.GENERATED_PASSWORD)}
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-carbon/5 border border-carbon/10 rounded text-sm font-mono text-carbon break-all">
                    {generatedPassword}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      showSuccess(t(PATIENT.PASSWORD_COPIED));
                    }}
                    title="Copy password"
                  >
                    {t(PATIENT.COPY)}
                  </Button>
                </div>
                <p className="text-xs text-carbon/50">
                  {t(PATIENT.SHARE_PASSWORD_NOTE)}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowCreateAccountModal(false);
                    setGeneratedPassword(null);
                  }}
                >
                  {t(PATIENT.CLOSE)}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Metadata */}
        <Card variant="elevated" className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>{t(PATIENT.METADATA)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.PATIENT_ID)}</label>
                <p className="text-sm text-carbon font-mono mt-1">{patient.patient_id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.REGISTRATION_TYPE)}</label>
                <p className="text-sm text-carbon mt-1 capitalize">{patient.registration_type}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.CREATED_AT)}</label>
                <p className="text-sm text-carbon mt-1">
                  {format(new Date(patient.created_at), 'PPpp')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-carbon/60">{t(PATIENT.LAST_UPDATED)}</label>
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
