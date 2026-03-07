import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateOrganization, useInviteOrgMember } from '@/hooks/useOrganizations';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { OrganizationType } from '@/types/organization';

type OwnerMode = 'none' | 'create' | 'invite';

const createOrgSchema = z.object({
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
  // Owner fields
  owner_first_name: z.string().optional(),
  owner_last_name: z.string().optional(),
  owner_email: z.string().email('Invalid email').optional().or(z.literal('')),
  owner_password: z.string().min(8, 'Min 8 characters').optional().or(z.literal('')),
  owner_phone: z.string().optional(),
});

type CreateOrgFormValues = z.infer<typeof createOrgSchema>;

interface CreateOrganizationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateOrganizationForm = ({ onSuccess, onCancel }: CreateOrganizationFormProps) => {
  const { t } = useTranslation();
  const createMutation = useCreateOrganization();
  const inviteMutation = useInviteOrgMember();
  const { success: showSuccess, error: showError } = useToastStore();
  const [showAddress, setShowAddress] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [ownerMode, setOwnerMode] = useState<OwnerMode>('none');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrgFormValues>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      type: 'single_clinic',
    },
  });

  const onSubmit = async (values: CreateOrgFormValues) => {
    // Validate owner fields based on mode
    if (ownerMode === 'create') {
      if (!values.owner_email || !values.owner_password || !values.owner_first_name || !values.owner_last_name) {
        showError('Owner first name, last name, email, and password are required');
        return;
      }
    }
    if (ownerMode === 'invite' && !values.owner_email) {
      showError('Owner email is required for invitation');
      return;
    }

    try {
      // Step 1: Create the organization (with owner if mode is 'create')
      const org = await createMutation.mutateAsync({
        name: values.name,
        type: values.type as OrganizationType,
        contact_email: values.contact_email,
        contact_phone: values.contact_phone,
        address: showAddress
          ? {
              line1: values.address_line1,
              line2: values.address_line2,
              city: values.city,
              province: values.province,
              country: values.country,
              postal_code: values.postal_code,
            }
          : undefined,
        settings: showSettings
          ? {
              default_language: values.default_language,
              default_timezone: values.default_timezone,
              default_currency: values.default_currency,
            }
          : undefined,
        owner: ownerMode === 'create' && values.owner_email && values.owner_password && values.owner_first_name && values.owner_last_name
          ? {
              first_name: values.owner_first_name,
              last_name: values.owner_last_name,
              email: values.owner_email,
              password: values.owner_password,
              phone: values.owner_phone || undefined,
            }
          : undefined,
      });

      // Step 2: If invite mode, send invitation after org is created
      if (ownerMode === 'invite' && values.owner_email) {
        try {
          await inviteMutation.mutateAsync({
            orgId: org.id,
            data: {
              email: values.owner_email,
              role: 'ORG_OWNER',
              message: `You have been invited as the owner of ${values.name}.`,
            },
          });
          showSuccess(t(ORGANIZATION.OWNER_INVITED));
        } catch (inviteError) {
          const msg = inviteError instanceof Error ? inviteError.message : 'Failed to send invitation';
          showError(`${t(ORGANIZATION.CREATED_SUCCESS)} — ${msg}`);
          onSuccess();
          return;
        }
      }

      showSuccess(t(ORGANIZATION.CREATED_SUCCESS));
      onSuccess();
    } catch (error) {
      const msg = error instanceof Error ? error.message : t(ORGANIZATION.FAILED_CREATE);
      showError(msg);
    }
  };

  const isPending = createMutation.isPending || inviteMutation.isPending;

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

      {/* Owner */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t(ORGANIZATION.ASSIGN_OWNER)}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOwnerMode(ownerMode === 'none' ? 'create' : 'none')}
            >
              {ownerMode !== 'none' ? t(COMMON.HIDE) : t(COMMON.SHOW)}
            </Button>
          </div>
        </CardHeader>
        {ownerMode !== 'none' && (
          <CardContent>
            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={ownerMode === 'create' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setOwnerMode('create')}
              >
                {t(ORGANIZATION.OWNER_MODE_CREATE)}
              </Button>
              <Button
                type="button"
                variant={ownerMode === 'invite' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setOwnerMode('invite')}
              >
                {t(ORGANIZATION.OWNER_MODE_INVITE)}
              </Button>
            </div>

            <p className="text-sm text-carbon/60 mb-4">
              {ownerMode === 'create'
                ? t(ORGANIZATION.OWNER_CREATE_DESCRIPTION)
                : t(ORGANIZATION.OWNER_INVITE_DESCRIPTION)}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              {ownerMode === 'create' && (
                <>
                  <Input
                    label={t(ORGANIZATION.OWNER_FIRST_NAME)}
                    {...register('owner_first_name')}
                  />
                  <Input
                    label={t(ORGANIZATION.OWNER_LAST_NAME)}
                    {...register('owner_last_name')}
                  />
                </>
              )}
              <Input
                label={t(ORGANIZATION.OWNER_EMAIL)}
                type="email"
                {...register('owner_email')}
                error={errors.owner_email?.message}
              />
              {ownerMode === 'create' && (
                <>
                  <Input
                    label={t(ORGANIZATION.OWNER_PASSWORD)}
                    type="password"
                    {...register('owner_password')}
                    error={errors.owner_password?.message}
                  />
                  <Input
                    label={t(ORGANIZATION.OWNER_PHONE)}
                    {...register('owner_phone')}
                  />
                </>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Address (collapsible) */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t(ORGANIZATION.ADDRESS)}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddress(!showAddress)}
            >
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

      {/* Settings (collapsible) */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t(ORGANIZATION.SETTINGS)}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
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
        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? t(COMMON.SAVING) : t(ORGANIZATION.CREATE_ORGANIZATION)}
        </Button>
      </div>
    </form>
  );
};
