import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdatePatient } from '@/hooks/usePatients';
import { useCountries, DEFAULT_COUNTRY } from '@/hooks/useCountries';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { MdPerson } from 'react-icons/md';
import type { Patient } from '@/api/patients';
import { useTranslation, PATIENT } from '@/i18n';

interface EditPatientFormData {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender: 'M' | 'F' | 'Other';
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

interface EditPatientFormProps {
  patientId: string;
  patient: Patient;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditPatientForm = ({
  patientId,
  patient,
  onSuccess,
  onCancel,
}: EditPatientFormProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdatePatient();
  const { countries, isLoading: countriesLoading } = useCountries();
  const { success: showSuccess, error: showError } = useToastStore();

  const editPatientSchema = useMemo(() => z.object({
    first_name: z.string().min(1, t(PATIENT.FIRST_NAME_REQUIRED)),
    last_name: z.string().min(1, t(PATIENT.LAST_NAME_REQUIRED)),
    email: z.string().email(t(PATIENT.INVALID_EMAIL)).optional().or(z.literal('')),
    phone: z.string().optional(),
    date_of_birth: z.string().optional(),
    gender: z.enum(['M', 'F', 'Other'], { required_error: t(PATIENT.GENDER_REQUIRED) }),
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
    control,
    formState: { errors },
    reset,
  } = useForm<EditPatientFormData>({
    resolver: zodResolver(editPatientSchema),
  });

  // Update form when patient data loads
  useEffect(() => {
    if (patient) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || 'M', // Default to 'M' if not set (required field)
        address: patient.address || '',
        city: patient.city || '',
        state: patient.state || '',
        postal_code: patient.postal_code || '',
        country: patient.country || DEFAULT_COUNTRY,
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relationship: patient.emergency_contact_relationship || '',
      });
    }
  }, [patient, reset]);

  const onSubmit = async (data: EditPatientFormData) => {
    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: patientId,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email || undefined,
          phone: data.phone || undefined,
          date_of_birth: data.date_of_birth || undefined,
          gender: data.gender as 'M' | 'F' | 'Other',
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

      showSuccess(t(PATIENT.UPDATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(PATIENT.UPDATE_FAILED);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdPerson className="h-5 w-5 text-azure-dragon" />
            {t(PATIENT.EDIT_PATIENT)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-medium text-carbon mb-3">{t(PATIENT.BASIC_INFORMATION)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t(PATIENT.FIRST_NAME)}
                  placeholder={t(PATIENT.FIRST_NAME_PLACEHOLDER)}
                  error={errors.first_name?.message}
                  required
                  {...register('first_name')}
                />

                <Input
                  label={t(PATIENT.LAST_NAME)}
                  placeholder={t(PATIENT.LAST_NAME_PLACEHOLDER)}
                  error={errors.last_name?.message}
                  required
                  {...register('last_name')}
                />

                <Input
                  label={t(PATIENT.EMAIL)}
                  type="email"
                  placeholder={t(PATIENT.EMAIL_PLACEHOLDER)}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label={t(PATIENT.PHONE)}
                  type="tel"
                  placeholder={t(PATIENT.PHONE_PLACEHOLDER)}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label={t(PATIENT.DATE_OF_BIRTH)}
                  type="date"
                  error={errors.date_of_birth?.message}
                  {...register('date_of_birth')}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t(PATIENT.GENDER)}
                      error={errors.gender?.message}
                      required
                      options={[
                        { value: '', label: t(PATIENT.SELECT_GENDER) },
                        { value: 'M', label: t(PATIENT.MALE) },
                        { value: 'F', label: t(PATIENT.FEMALE) },
                        { value: 'Other', label: t(PATIENT.OTHER_GENDER) },
                      ]}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-sm font-medium text-carbon mb-3">{t(PATIENT.ADDRESS_INFORMATION)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t(PATIENT.ADDRESS)}
                  placeholder={t(PATIENT.ADDRESS_PLACEHOLDER)}
                  error={errors.address?.message}
                  {...register('address')}
                />

                <Input
                  label={t(PATIENT.CITY)}
                  placeholder={t(PATIENT.CITY_PLACEHOLDER)}
                  error={errors.city?.message}
                  {...register('city')}
                />

                <Input
                  label={t(PATIENT.STATE)}
                  placeholder={t(PATIENT.STATE_PLACEHOLDER)}
                  error={errors.state?.message}
                  {...register('state')}
                />

                <Input
                  label={t(PATIENT.POSTAL_CODE)}
                  placeholder={t(PATIENT.POSTAL_CODE_PLACEHOLDER)}
                  error={errors.postal_code?.message}
                  {...register('postal_code')}
                />

                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t(PATIENT.COUNTRY)}
                      error={errors.country?.message}
                      disabled={countriesLoading}
                      options={[
                        { value: '', label: t(PATIENT.COUNTRY_PLACEHOLDER) },
                        ...countries,
                      ]}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-medium text-carbon mb-3">{t(PATIENT.EMERGENCY_CONTACT)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t(PATIENT.EMERGENCY_CONTACT_NAME)}
                  placeholder={t(PATIENT.EMERGENCY_CONTACT_NAME_PLACEHOLDER)}
                  error={errors.emergency_contact_name?.message}
                  {...register('emergency_contact_name')}
                />

                <Input
                  label={t(PATIENT.EMERGENCY_CONTACT_PHONE)}
                  type="tel"
                  placeholder={t(PATIENT.EMERGENCY_CONTACT_PHONE_PLACEHOLDER)}
                  error={errors.emergency_contact_phone?.message}
                  {...register('emergency_contact_phone')}
                />

                <Input
                  label={t(PATIENT.RELATIONSHIP)}
                  placeholder={t(PATIENT.RELATIONSHIP_PLACEHOLDER)}
                  error={errors.emergency_contact_relationship?.message}
                  {...register('emergency_contact_relationship')}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? t(PATIENT.UPDATING) : t(PATIENT.UPDATE_PATIENT)}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={updateMutation.isPending}
                >
                  {t(PATIENT.CANCEL)}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
