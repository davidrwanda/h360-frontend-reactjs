import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient } from '@/hooks/usePatients';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { MdPerson, MdAccountCircle } from 'react-icons/md';
import { useTranslation, PATIENT } from '@/i18n';

interface CreatePatientFormData {
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
  create_account?: boolean;
}

interface CreatePatientFormProps {
  clinicId: string;
  clinicName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreatePatientForm = ({
  clinicId,
  clinicName,
  onSuccess,
  onCancel,
}: CreatePatientFormProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreatePatient();
  const { success: showSuccess, error: showError } = useToastStore();

  const createPatientSchema = useMemo(() => z.object({
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
    create_account: z.boolean().optional(),
  }), [t]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreatePatientFormData>({
    resolver: zodResolver(createPatientSchema),
  });

  const formData = watch();

  const onSubmit = async (data: CreatePatientFormData) => {
    setError(null);

    try {
      await createMutation.mutateAsync({
        clinic_id: clinicId,
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
        create_account: data.create_account || false,
      });

      reset();
      showSuccess(t(PATIENT.CREATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(PATIENT.CREATE_FAILED);
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
            {t(PATIENT.PATIENT_INFORMATION)}
            {clinicName && (
              <span className="text-sm font-normal text-carbon/60 ml-2">
                {t(PATIENT.FOR_CLINIC, { clinicName })}
              </span>
            )}
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

                <Input
                  label={t(PATIENT.COUNTRY)}
                  placeholder={t(PATIENT.COUNTRY_PLACEHOLDER)}
                  error={errors.country?.message}
                  {...register('country')}
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

            {/* Account Creation */}
            {formData.email && (
              <div>
                <h3 className="text-sm font-medium text-carbon mb-3">{t(PATIENT.ACCOUNT_OPTIONS)}</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create_account"
                    {...register('create_account')}
                    className="h-4 w-4 rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                  />
                  <label htmlFor="create_account" className="text-sm text-carbon/70 flex items-center gap-2">
                    <MdAccountCircle className="h-4 w-4 text-azure-dragon" />
                    {t(PATIENT.CREATE_ACCOUNT_CHECKBOX)}
                  </label>
                </div>
                <p className="text-xs text-carbon/50 mt-1 ml-6">
                  {t(PATIENT.CREATE_ACCOUNT_NOTE)}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? t(PATIENT.CREATING) : t(PATIENT.CREATE_PATIENT)}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={createMutation.isPending}
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
