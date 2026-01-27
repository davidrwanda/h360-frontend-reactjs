import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateClinic } from '@/hooks/useClinicFlow';
import { useClinicTypes } from '@/hooks/useClinicTypes';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { timezones, currencies, languages, DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_TIMEZONE } from '@/config/clinicOptions';
import { AddressInput } from './AddressInput';
import { MdBusiness } from 'react-icons/md';

// Custom URL validation that accepts domains without protocol
const urlOrDomainSchema = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val === '') return true;
      // Check if it's a valid URL with protocol
      try {
        new URL(val);
        return true;
      } catch {
        // Check if it's a valid domain (www.example.com or example.com)
        const domainPattern = /^(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
        return domainPattern.test(val);
      }
    },
    { message: 'Invalid URL or domain' }
  );

const createClinicSchema = z.object({
  clinic_name: z.string().min(1, 'Clinic name is required'),
  clinic_code: z.string().min(1, 'Clinic code is required').max(20),
  clinic_address: z.string().min(1, 'Address is required').optional().or(z.literal('')),
  clinic_city: z.string().min(1, 'City is required').optional().or(z.literal('')),
  clinic_state: z.string().optional(),
  clinic_postal_code: z.string().optional(),
  clinic_country: z.string().optional(),
  clinic_phone: z.string().min(1, 'Phone number is required').optional().or(z.literal('')),
  clinic_email: z.string().email('Invalid email').min(1, 'Email is required').optional().or(z.literal('')),
  clinic_website: urlOrDomainSchema,
  clinic_timezone: z.string().optional().or(z.literal('')),
  clinic_currency: z.string().optional().or(z.literal('')),
  clinic_language: z.string().optional().or(z.literal('')),
  clinic_type_ids: z.array(z.string()).min(1, 'At least one clinic type is required').optional(),
});

type CreateClinicFormData = z.infer<typeof createClinicSchema>;

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
  const createMutation = useCreateClinic();
  const { success: showSuccess, error: showError } = useToastStore();
  const { data: clinicTypes, isLoading: isLoadingTypes } = useClinicTypes({ include_inactive: false });

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
        clinic_code: data.clinic_code,
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
      showSuccess('Clinic created successfully!');
      reset();

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? (err.message || 'Failed to create clinic. Please try again.')
        : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MdBusiness className="h-5 w-5 text-azure-dragon" />
          Create Clinic
        </CardTitle>
        <p className="text-xs text-carbon/60 mt-1">
          Create a new clinic. Clinic managers are created separately via Users.
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
                ✅ Clinic created successfully!
              </p>
            </div>
          )}

          {/* Clinic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-carbon/10">
              <MdBusiness className="h-4 w-4 text-azure-dragon" />
              <h3 className="text-sm font-medium text-carbon">Clinic Information</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Clinic Name"
                placeholder="Enter clinic name"
                error={errors.clinic_name?.message}
                required
                {...register('clinic_name')}
              />

              <Input
                label="Clinic Code"
                placeholder="e.g., CLINIC001"
                error={errors.clinic_code?.message}
                required
                {...register('clinic_code')}
              />

              <AddressInput
                label="Address"
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
                label="City"
                placeholder="City"
                error={errors.clinic_city?.message}
                required
                {...register('clinic_city')}
              />

              <Input
                label="State"
                placeholder="State/Province"
                error={errors.clinic_state?.message}
                {...register('clinic_state')}
              />

              <Input
                label="Postal Code"
                placeholder="Postal code"
                error={errors.clinic_postal_code?.message}
                {...register('clinic_postal_code')}
              />

              <Input
                label="Country"
                placeholder="Country"
                error={errors.clinic_country?.message}
                {...register('clinic_country')}
              />

              <Input
                label="Phone"
                type="tel"
                placeholder="+1234567890"
                error={errors.clinic_phone?.message}
                required
                {...register('clinic_phone')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="clinic@example.com"
                error={errors.clinic_email?.message}
                required
                {...register('clinic_email')}
              />

              <Input
                label="Website"
                type="url"
                placeholder="www.example.com"
                error={errors.clinic_website?.message}
                {...register('clinic_website')}
              />

              <Select
                label="Timezone"
                error={errors.clinic_timezone?.message}
                options={timezones}
                {...register('clinic_timezone')}
              />

              <Select
                label="Currency"
                error={errors.clinic_currency?.message}
                options={currencies}
                {...register('clinic_currency')}
              />

              <Select
                label="Language"
                error={errors.clinic_language?.message}
                options={languages}
                {...register('clinic_language')}
              />

              {/* Clinic Types Multi-Select */}
              <div className="md:col-span-2">
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  Clinic Types <span className="text-smudged-lips ml-0.5">*</span>
                </label>
                {isLoadingTypes ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loading size="sm" />
                    <span className="text-xs text-carbon/60">Loading clinic types...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-3 border border-carbon/15 rounded-md bg-white">
                    <Controller
                      name="clinic_type_ids"
                      control={control}
                      render={({ field }) => (
                        <>
                          {clinicTypes?.map((type) => (
                            <label
                              key={type.clinic_type_id}
                              className="flex items-center gap-2 cursor-pointer hover:bg-carbon/5 p-2 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                value={type.clinic_type_id}
                                checked={field.value?.includes(type.clinic_type_id) || false}
                                onChange={(e) => {
                                  const currentValue = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentValue, type.clinic_type_id]);
                                  } else {
                                    field.onChange(currentValue.filter((id) => id !== type.clinic_type_id));
                                  }
                                }}
                                className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon/30"
                              />
                              <span className="text-xs text-carbon">{type.name}</span>
                            </label>
                          ))}
                        </>
                      )}
                    />
                  </div>
                )}
                {errors.clinic_type_ids && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">
                    {errors.clinic_type_ids.message}
                  </p>
                )}
              </div>
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
                Cancel
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
              Create Clinic
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
