import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateClinic } from '@/hooks/useClinicFlow';
import { useClinicTypes } from '@/hooks/useClinicTypes';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, CLINIC } from '@/i18n';
import { Button, Input, Select, MultiSelect, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { timezones, currencies, languages, DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_TIMEZONE } from '@/config/clinicOptions';
import { AddressInput } from './AddressInput';
import { AddClinicTypeModal } from './AddClinicTypeModal';
import { MdBusiness, MdAdd } from 'react-icons/md';

interface CreateClinicFormData {
  clinic_name: string;
  clinic_address?: string;
  clinic_city?: string;
  clinic_state?: string;
  clinic_postal_code?: string;
  clinic_country?: string;
  clinic_phone?: string;
  clinic_email?: string;
  clinic_website?: string;
  clinic_timezone?: string;
  clinic_currency?: string;
  clinic_language?: string;
  clinic_type_ids?: string[];
}

interface CreateClinicWithAdminFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateClinicWithAdminForm = ({
  onSuccess,
  onCancel,
}: CreateClinicWithAdminFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const createMutation = useCreateClinic();
  const { t } = useTranslation();
  const { success: showSuccess, error: showError } = useToastStore();
  const { data: clinicTypes, isLoading: isLoadingTypes } = useClinicTypes({ include_inactive: false });

  const urlOrDomainSchema = useMemo(() => z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        try {
          new URL(val);
          return true;
        } catch {
          const domainPattern = /^(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
          return domainPattern.test(val);
        }
      },
      { message: t(CLINIC.INVALID_URL) }
    ), [t]);

  const createClinicSchema = useMemo(() => z.object({
    clinic_name: z.string().min(1, t(CLINIC.CLINIC_NAME_REQUIRED)),
    clinic_address: z.string().min(1, t(CLINIC.ADDRESS_REQUIRED)).optional().or(z.literal('')),
    clinic_city: z.string().min(1, t(CLINIC.CITY_REQUIRED)).optional().or(z.literal('')),
    clinic_state: z.string().optional(),
    clinic_postal_code: z.string().optional(),
    clinic_country: z.string().optional(),
    clinic_phone: z.string().min(1, t(CLINIC.PHONE_REQUIRED)).optional().or(z.literal('')),
    clinic_email: z.string().email(t(CLINIC.INVALID_EMAIL)).min(1, t(CLINIC.EMAIL_REQUIRED)).optional().or(z.literal('')),
    clinic_website: urlOrDomainSchema,
    clinic_timezone: z.string().optional().or(z.literal('')),
    clinic_currency: z.string().optional().or(z.literal('')),
    clinic_language: z.string().optional().or(z.literal('')),
    clinic_type_ids: z.array(z.string()).min(1, t(CLINIC.CLINIC_TYPE_REQUIRED)).optional(),
  }), [t, urlOrDomainSchema]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateClinicFormData>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: {
      clinic_timezone: DEFAULT_TIMEZONE,
      clinic_currency: DEFAULT_CURRENCY,
      clinic_language: DEFAULT_LANGUAGE,
      clinic_type_ids: [],
    },
  });

  const clinicAddress = watch('clinic_address');

  const onSubmit = async (data: CreateClinicFormData) => {
    setError(null);
    setSuccess(false);

    try {
      await createMutation.mutateAsync({
        name: data.clinic_name,
        address: data.clinic_address,
        city: data.clinic_city,
        state: data.clinic_state,
        postal_code: data.clinic_postal_code,
        country: data.clinic_country,
        phone: data.clinic_phone,
        email: data.clinic_email || undefined,
        website: data.clinic_website || undefined,
        timezone: data.clinic_timezone || DEFAULT_TIMEZONE,
        currency: data.clinic_currency || DEFAULT_CURRENCY,
        language: data.clinic_language || DEFAULT_LANGUAGE,
        type_ids: data.clinic_type_ids && data.clinic_type_ids.length > 0 ? data.clinic_type_ids : undefined,
      });

      setSuccess(true);
      showSuccess(t(CLINIC.CLINIC_CREATED));
      reset();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error
        ? (err.message || t(CLINIC.CREATE_FAILED))
        : t(CLINIC.CREATE_FAILED);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MdBusiness className="h-5 w-5 text-azure-dragon" />
          {t(CLINIC.CREATE_CLINIC)}
        </CardTitle>
        <p className="text-xs text-carbon/60 mt-1">
          {t(CLINIC.CREATE_CLINIC_HELPER)}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips font-ui">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-bright-halo/20 border border-bright-halo/30 px-3.5 py-2.5">
              <p className="text-xs text-azure-dragon font-ui">
                {t(CLINIC.CLINIC_CREATED_BANNER)}
              </p>
            </div>
          )}

          {/* Clinic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-carbon/10">
              <MdBusiness className="h-4 w-4 text-azure-dragon" />
              <h3 className="text-sm font-medium text-carbon">{t(CLINIC.CLINIC_INFORMATION)}</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label={t(CLINIC.CLINIC_NAME)}
                  placeholder={t(CLINIC.ENTER_CLINIC_NAME)}
                  error={errors.clinic_name?.message}
                  required
                  {...register('clinic_name')}
                />
              </div>

              {/* Clinic Types Multi-Select */}
              <div className="md:col-span-2">
                <Controller
                  name="clinic_type_ids"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <MultiSelect
                        label={t(CLINIC.CLINIC_TYPES)}
                        placeholder={t(CLINIC.SELECT_CLINIC_TYPES)}
                        required
                        isLoading={isLoadingTypes}
                        loadingText={t(CLINIC.LOADING_CLINIC_TYPES)}
                        options={(clinicTypes || []).map((type) => ({
                          value: type.clinic_type_id,
                          label: typeof type.name === 'string' ? type.name : type.name.en,
                          color: type.color,
                        }))}
                        value={field.value || []}
                        onChange={field.onChange}
                        error={errors.clinic_type_ids?.message}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAddTypeModal(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-ui text-azure-dragon hover:text-azure-dragon/80 transition-colors"
                      >
                        <MdAdd className="h-4 w-4" />
                        {t(CLINIC.ADD_NEW_TYPE)}
                      </button>
                      <AddClinicTypeModal
                        isOpen={showAddTypeModal}
                        onClose={() => setShowAddTypeModal(false)}
                        onCreated={(newTypeId) => {
                          const currentIds = field.value || [];
                          field.onChange([...currentIds, newTypeId]);
                        }}
                      />
                    </div>
                  )}
                />
              </div>

              <AddressInput
                label={t(CLINIC.ADDRESS)}
                value={clinicAddress || ''}
                onChange={(value) => setValue('clinic_address', value)}
                onAddressSelect={(addressData) => {
                  setValue('clinic_address', addressData.address);
                  if (addressData.city) setValue('clinic_city', addressData.city);
                  if (addressData.state) setValue('clinic_state', addressData.state);
                  if (addressData.postal_code) setValue('clinic_postal_code', addressData.postal_code);
                  if (addressData.country) setValue('clinic_country', addressData.country);
                }}
                error={errors.clinic_address?.message}
                required
              />

              <Input
                label={t(CLINIC.CITY)}
                placeholder={t(CLINIC.CITY)}
                error={errors.clinic_city?.message}
                required
                {...register('clinic_city')}
              />

              <Input
                label={t(CLINIC.STATE)}
                placeholder={t(CLINIC.STATE_PROVINCE)}
                error={errors.clinic_state?.message}
                {...register('clinic_state')}
              />

              <Input
                label={t(CLINIC.POSTAL_CODE)}
                placeholder={t(CLINIC.POSTAL_CODE)}
                error={errors.clinic_postal_code?.message}
                {...register('clinic_postal_code')}
              />

              <Input
                label={t(CLINIC.COUNTRY)}
                placeholder={t(CLINIC.COUNTRY)}
                error={errors.clinic_country?.message}
                {...register('clinic_country')}
              />

              <Input
                label={t(CLINIC.PHONE)}
                type="tel"
                placeholder="+1234567890"
                error={errors.clinic_phone?.message}
                required
                {...register('clinic_phone')}
              />

              <Input
                label={t(CLINIC.EMAIL)}
                type="email"
                placeholder="clinic@example.com"
                error={errors.clinic_email?.message}
                required
                {...register('clinic_email')}
              />

              <Input
                label={t(CLINIC.WEBSITE)}
                type="url"
                placeholder="www.example.com"
                error={errors.clinic_website?.message}
                {...register('clinic_website')}
              />

              <Select
                label={t(CLINIC.TIMEZONE)}
                error={errors.clinic_timezone?.message}
                options={timezones}
                {...register('clinic_timezone')}
              />

              <Select
                label={t(CLINIC.CURRENCY)}
                error={errors.clinic_currency?.message}
                options={currencies}
                {...register('clinic_currency')}
              />

              <Select
                label={t(CLINIC.LANGUAGE)}
                error={errors.clinic_language?.message}
                options={languages}
                {...register('clinic_language')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-carbon/10">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
                disabled={createMutation.isPending}
              >
                {t(CLINIC.CANCEL)}
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              isLoading={createMutation.isPending}
              disabled={createMutation.isPending}
            >
              {t(CLINIC.CREATE_CLINIC)}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
