import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateOrganization } from '@/hooks/useOrganizations';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Organization, OrganizationType } from '@/types/organization';

const editOrgSchema = z.object({
  name: z.string().min(1, 'Required'),
  type: z.enum(['single_clinic', 'multi_branch', 'health_network']),
  contact_email: z.string().email('Invalid email'),
  contact_phone: z.string().min(1, 'Required'),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  default_language: z.string().optional(),
  default_timezone: z.string().optional(),
  default_currency: z.string().optional(),
});

type EditOrgFormValues = z.infer<typeof editOrgSchema>;

interface EditOrganizationFormProps {
  organization: Organization;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditOrganizationForm = ({ organization, onSuccess, onCancel }: EditOrganizationFormProps) => {
  const { t } = useTranslation();
  const updateMutation = useUpdateOrganization();
  const { success: showSuccess, error: showError } = useToastStore();
  const [showAddress, setShowAddress] = useState(!!organization.address?.line1);
  const [showSettings, setShowSettings] = useState(!!organization.settings?.default_language);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditOrgFormValues>({
    resolver: zodResolver(editOrgSchema),
    defaultValues: {
      name: organization.name,
      type: organization.type,
      contact_email: organization.contact_email,
      contact_phone: organization.contact_phone,
      address_line1: organization.address?.line1 || '',
      address_line2: organization.address?.line2 || '',
      city: organization.address?.city || '',
      province: organization.address?.province || '',
      country: organization.address?.country || '',
      postal_code: organization.address?.postal_code || '',
      default_language: organization.settings?.default_language || '',
      default_timezone: organization.settings?.default_timezone || '',
      default_currency: organization.settings?.default_currency || '',
    },
  });

  const onSubmit = async (values: EditOrgFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: organization.id,
        data: {
          name: values.name,
          type: values.type as OrganizationType,
          contact_email: values.contact_email,
          contact_phone: values.contact_phone,
          address: {
            line1: values.address_line1,
            line2: values.address_line2,
            city: values.city,
            province: values.province,
            country: values.country,
            postal_code: values.postal_code,
          },
          settings: {
            default_language: values.default_language,
            default_timezone: values.default_timezone,
            default_currency: values.default_currency,
          },
        },
      });
      showSuccess(t(ORGANIZATION.UPDATED_SUCCESS));
      onSuccess();
    } catch (error) {
      const msg = error instanceof Error ? error.message : t(ORGANIZATION.FAILED_UPDATE);
      showError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>{t(ORGANIZATION.ORGANIZATION_DETAILS)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label={t(ORGANIZATION.NAME)}
              {...register('name')}
              error={errors.name?.message ? t(ORGANIZATION.NAME_REQUIRED) : undefined}
            />
            <Select
              label={t(ORGANIZATION.TYPE)}
              {...register('type')}
              error={errors.type?.message ? t(ORGANIZATION.TYPE_REQUIRED) : undefined}
              options={[
                { value: 'single_clinic', label: t(ORGANIZATION.TYPE_SINGLE_CLINIC) },
                { value: 'multi_branch', label: t(ORGANIZATION.TYPE_MULTI_BRANCH) },
                { value: 'health_network', label: t(ORGANIZATION.TYPE_HEALTH_NETWORK) },
              ]}
            />
            <Input
              label={t(ORGANIZATION.CONTACT_EMAIL)}
              type="email"
              {...register('contact_email')}
              error={errors.contact_email?.message ? t(ORGANIZATION.EMAIL_REQUIRED) : undefined}
            />
            <Input
              label={t(ORGANIZATION.CONTACT_PHONE)}
              {...register('contact_phone')}
              error={errors.contact_phone?.message ? t(ORGANIZATION.PHONE_REQUIRED) : undefined}
            />
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t(ORGANIZATION.ADDRESS)}</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddress(!showAddress)}>
              {showAddress ? t(COMMON.HIDE) : t(COMMON.SHOW)}
            </Button>
          </div>
        </CardHeader>
        {showAddress && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label={t(ORGANIZATION.ADDRESS_LINE1)} {...register('address_line1')} />
              <Input label={t(ORGANIZATION.ADDRESS_LINE2)} {...register('address_line2')} />
              <Input label={t(ORGANIZATION.CITY)} {...register('city')} />
              <Input label={t(ORGANIZATION.PROVINCE)} {...register('province')} />
              <Input label={t(ORGANIZATION.COUNTRY)} {...register('country')} />
              <Input label={t(ORGANIZATION.POSTAL_CODE)} {...register('postal_code')} />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Settings */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t(ORGANIZATION.SETTINGS)}</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
              {showSettings ? t(COMMON.HIDE) : t(COMMON.SHOW)}
            </Button>
          </div>
        </CardHeader>
        {showSettings && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Select
                label={t(ORGANIZATION.DEFAULT_LANGUAGE)}
                {...register('default_language')}
                options={[
                  { value: '', label: '—' },
                  { value: 'en', label: 'English' },
                  { value: 'fr', label: 'Français' },
                  { value: 'rw', label: 'Kinyarwanda' },
                ]}
              />
              <Select
                label={t(ORGANIZATION.DEFAULT_TIMEZONE)}
                {...register('default_timezone')}
                options={[
                  { value: '', label: '—' },
                  { value: 'Africa/Kigali', label: 'Africa/Kigali (CAT)' },
                  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT)' },
                  { value: 'UTC', label: 'UTC' },
                ]}
              />
              <Select
                label={t(ORGANIZATION.DEFAULT_CURRENCY)}
                {...register('default_currency')}
                options={[
                  { value: '', label: '—' },
                  { value: 'RWF', label: 'RWF' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t(COMMON.CANCEL)}
        </Button>
        <Button type="submit" variant="primary" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? t(COMMON.SAVING) : t(COMMON.SAVE)}
        </Button>
      </div>
    </form>
  );
};
