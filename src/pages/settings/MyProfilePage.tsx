import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePatient } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Loading } from '@/components/ui';
import { useToastStore } from '@/store/toastStore';
import { MdAccountCircle, MdEmail, MdPhone, MdCalendarToday, MdPerson, MdInfo, MdBusiness, MdBadge, MdEdit, MdClose } from 'react-icons/md';
import { useTranslation, PROFILE } from '@/i18n';

interface EditPatientFormData {
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export const MyProfilePage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdatePatient();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

  const normalizedRole = role?.toUpperCase();
  const isDoctor = normalizedRole === 'DOCTOR';

  // For doctors, fetch their doctor record
  const { data: doctorsData, isLoading: isLoadingDoctor } = useDoctors({
    user_id: user?.user_id,
    limit: 1,
  });

  const doctor = doctorsData?.data?.[0];

  const editPatientSchema = useMemo(() => z.object({
    first_name: z.string().min(1, t(PROFILE.FIRST_NAME_REQUIRED)),
    last_name: z.string().min(1, t(PROFILE.LAST_NAME_REQUIRED)),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    emergency_contact_name: z.string().optional(),
    emergency_contact_phone: z.string().optional(),
    emergency_contact_relationship: z.string().optional(),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  // Get patient data from user object (from /api/auth/me)
  const patient = user?.patient;

  // Update form when patient data loads
  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relationship: patient.emergency_contact_relationship || '',
      });
    }
  }, [patient, reset]);

  // Redirect doctors to their doctor detail page
  useEffect(() => {
    if (isDoctor && doctor?.doctor_id && !isLoadingDoctor) {
      navigate(`/doctors/${doctor.doctor_id}`, { replace: true });
    }
  }, [isDoctor, doctor?.doctor_id, navigate, isLoadingDoctor]);

  // Show loading while redirecting doctors
  if (isDoctor) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading />
      </div>
    );
  }

  const onSubmit = async (data: EditPatientFormData) => {
    if (!patient?.patient_id) return;

    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: patient.patient_id,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || undefined,
          date_of_birth: data.date_of_birth || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          postal_code: data.postal_code || undefined,
          country: data.country || undefined,
          emergency_contact_name: data.emergency_contact_name || undefined,
          emergency_contact_phone: data.emergency_contact_phone || undefined,
          emergency_contact_relationship: data.emergency_contact_relationship || undefined,
        },
      });

      // Invalidate auth query to refresh user data
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      setIsEditing(false);
      showSuccess(t(PROFILE.UPDATED_SUCCESS));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(PROFILE.UPDATE_FAILED);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
              {t(PROFILE.MY_PROFILE)}
            </h1>
            <p className="text-body text-carbon/60 font-ui">
              {t(PROFILE.VIEW_MANAGE_INFO)}
            </p>
          </div>
          {patient && !isEditing && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsEditing(true)}
            >
              <MdEdit className="h-4 w-4 mr-2" />
              {t(PROFILE.EDIT_PROFILE)}
            </Button>
          )}
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MdAccountCircle className="h-5 w-5 text-azure-dragon" />
                {t(PROFILE.PERSONAL_INFORMATION)}
              </CardTitle>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                    setError(null);
                  }}
                >
                  <MdClose className="h-4 w-4 mr-2" />
                  {t(PROFILE.CANCEL)}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient ? (
              isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                      <p className="text-xs text-smudged-lips">{error}</p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Patient Number - Read Only */}
                    {patient.patient_number && (
                      <div>
                        <label className="block text-xs font-medium text-carbon/60 mb-1.5">
                          {t(PROFILE.PATIENT_NUMBER)}
                        </label>
                        <p className="text-sm text-carbon font-ui font-medium bg-white-smoke px-3 py-2 rounded-md">
                          {patient.patient_number}
                        </p>
                        <p className="text-xs text-carbon/50 mt-1">{t(PROFILE.CANNOT_BE_CHANGED)}</p>
                      </div>
                    )}

                    <Input
                      label={t(PROFILE.FIRST_NAME)}
                      {...register('first_name')}
                      error={errors.first_name?.message}
                      required
                    />

                    <Input
                      label={t(PROFILE.LAST_NAME)}
                      {...register('last_name')}
                      error={errors.last_name?.message}
                      required
                    />

                    <Input
                      label={t(PROFILE.PHONE)}
                      type="tel"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />

                    <Input
                      label={t(PROFILE.DATE_OF_BIRTH)}
                      type="date"
                      {...register('date_of_birth')}
                      error={errors.date_of_birth?.message}
                    />

                    <Input
                      label={t(PROFILE.ADDRESS)}
                      {...register('address')}
                      error={errors.address?.message}
                    />

                    <Input
                      label={t(PROFILE.CITY)}
                      {...register('city')}
                      error={errors.city?.message}
                    />

                    <Input
                      label={t(PROFILE.STATE)}
                      {...register('state')}
                      error={errors.state?.message}
                    />

                    <Input
                      label={t(PROFILE.POSTAL_CODE)}
                      {...register('postal_code')}
                      error={errors.postal_code?.message}
                    />

                    <Input
                      label={t(PROFILE.COUNTRY)}
                      {...register('country')}
                      error={errors.country?.message}
                    />
                  </div>

                  {/* Emergency Contact Section */}
                  <div className="pt-4 border-t border-carbon/10">
                    <h3 className="text-sm font-medium text-carbon mb-4">{t(PROFILE.EMERGENCY_CONTACT)}</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label={t(PROFILE.EMERGENCY_CONTACT_NAME)}
                        {...register('emergency_contact_name')}
                        error={errors.emergency_contact_name?.message}
                      />

                      <Input
                        label={t(PROFILE.EMERGENCY_CONTACT_PHONE)}
                        type="tel"
                        {...register('emergency_contact_phone')}
                        error={errors.emergency_contact_phone?.message}
                      />

                      <Input
                        label={t(PROFILE.RELATIONSHIP)}
                        {...register('emergency_contact_relationship')}
                        error={errors.emergency_contact_relationship?.message}
                        placeholder={t(PROFILE.RELATIONSHIP_PLACEHOLDER)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-carbon/10">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? t(PROFILE.SAVING) : t(PROFILE.SAVE_CHANGES)}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                        setError(null);
                      }}
                    >
                      {t(PROFILE.CANCEL)}
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    {patient.patient_number && (
                      <div className="flex items-start gap-3">
                        <MdBadge className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.PATIENT_NUMBER)}</p>
                          <p className="text-sm text-carbon font-ui font-medium">
                            {patient.patient_number}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.FULL_NAME)}</p>
                        <p className="text-sm text-carbon font-ui">
                          {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                        </p>
                      </div>
                    </div>

                    {patient.date_of_birth && (
                      <div className="flex items-start gap-3">
                        <MdCalendarToday className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.DATE_OF_BIRTH)}</p>
                          <p className="text-sm text-carbon font-ui">
                            {new Date(patient.date_of_birth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.age !== undefined && patient.age > 0 && (
                      <div className="flex items-start gap-3">
                        <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.AGE)}</p>
                          <p className="text-sm text-carbon font-ui">{t(PROFILE.AGE_YEARS, { age: patient.age })}</p>
                        </div>
                      </div>
                    )}

                    {patient.phone && (
                      <div className="flex items-start gap-3">
                        <MdPhone className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.PHONE)}</p>
                          <p className="text-sm text-carbon font-ui">{patient.phone}</p>
                        </div>
                      </div>
                    )}

                    {patient.address && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MdInfo className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.ADDRESS)}</p>
                          <p className="text-sm text-carbon font-ui">
                            {patient.address}
                            {patient.city && `, ${patient.city}`}
                            {patient.state && `, ${patient.state}`}
                            {patient.postal_code && ` ${patient.postal_code}`}
                            {patient.country && `, ${patient.country}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {patient.emergency_contact_name && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.EMERGENCY_CONTACT)}</p>
                          <p className="text-sm text-carbon font-ui">
                            {patient.emergency_contact_name}
                            {patient.emergency_contact_phone && ` - ${patient.emergency_contact_phone}`}
                            {patient.emergency_contact_relationship && ` (${patient.emergency_contact_relationship})`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                {/* Clinics Section */}
                {patient.clinics && patient.clinics.length > 0 && (
                  <div className="pt-4 border-t border-carbon/10">
                    <p className="text-xs font-medium text-carbon/60 mb-3">{t(PROFILE.SUBSCRIBED_CLINICS)}</p>
                    <div className="space-y-2">
                      {patient.clinics.map((clinic) => (
                        <div
                          key={clinic.clinic_id}
                          className="flex items-center justify-between p-3 rounded-md bg-white-smoke"
                        >
                          <div className="flex items-center gap-2">
                            <MdBusiness className="h-4 w-4 text-azure-dragon" />
                            <span className="text-sm font-medium text-carbon">{clinic.clinic_name}</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              clinic.subscription_status === 'active'
                                ? 'bg-bright-halo/20 text-azure-dragon'
                                : 'bg-carbon/10 text-carbon/60'
                            }`}
                          >
                            {clinic.subscription_status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                </>
              )
            ) : (
              <div className="text-center py-8">
                <p className="text-body text-carbon/60 font-ui">
                  {t(PROFILE.NO_PROFILE)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdAccountCircle className="h-5 w-5 text-azure-dragon" />
              {t(PROFILE.ACCOUNT_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <MdEmail className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.EMAIL)}</p>
                  <p className="text-sm text-carbon font-ui">{user?.email || 'N/A'}</p>
                  <p className="text-xs text-carbon/50 mt-1">{t(PROFILE.EMAIL_CANNOT_CHANGE)}</p>
                </div>
              </div>

              {user?.username && (
                <div className="flex items-start gap-3">
                  <MdPerson className="h-5 w-5 text-carbon/40 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.USERNAME)}</p>
                    <p className="text-sm text-carbon font-ui">{user.username}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MdInfo className="h-5 w-5 text-carbon/40 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-carbon/60 mb-1">{t(PROFILE.ACCOUNT_STATUS)}</p>
                  <p className="text-sm text-carbon font-ui">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      {user?.is_active ? t(PROFILE.ACTIVE) : t(PROFILE.INACTIVE)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-carbon/10">
              <p className="text-xs text-carbon/60">
                {t(PROFILE.CHANGE_PASSWORD_NOTE).split(t(PROFILE.SETTINGS))[0]}
                <a href="/settings" className="text-azure-dragon hover:underline">
                  {t(PROFILE.SETTINGS)}
                </a>
                {t(PROFILE.CHANGE_PASSWORD_NOTE).split(t(PROFILE.SETTINGS))[1]}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
