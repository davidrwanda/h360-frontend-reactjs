import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClinic, useUpdateClinic } from '@/hooks/useClinics';
import { useClinicTypes } from '@/hooks/useClinicTypes';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, CLINIC } from '@/i18n';
import { Input, Select, MultiSelect, Card, CardHeader, CardTitle, CardContent, Button, Loading } from '@/components/ui';
import { timezones, currencies, languages, DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_TIMEZONE } from '@/config/clinicOptions';
import { OperatingHoursEditor } from '@/components/clinics/OperatingHoursEditor';
import { AddressInput } from '@/components/clinics/AddressInput';
import { AddClinicTypeModal } from '@/components/clinics/AddClinicTypeModal';
import {
  MdArrowBack,
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdSchedule,
  MdSettings,
  MdInfo,
  MdAttachMoney,
  MdAdd,
} from 'react-icons/md';
import type { OperatingHours } from '@/api/clinics';

interface ClinicFormData {
  name: string;
  clinic_code: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  operating_hours?: OperatingHours;
  appointment_slot_duration?: number | null;
  max_daily_appointments?: number | null;
  allow_online_booking?: boolean;
  send_sms_reminders?: boolean;
  send_email_reminders?: boolean;
  reminder_hours_before?: number | null;
  is_active: boolean;
  established_date?: string;
  license_number?: string;
  license_expiry_date?: string;
  notes?: string;
  logo_url?: string;
  image_url?: string;
  tax_id?: string;
  registration_number?: string;
  type_ids?: string[];
}

export const EditClinicPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { t } = useTranslation();
  const { data: clinic, isLoading } = useClinic(id);
  const updateMutation = useUpdateClinic();
  const { data: clinicTypes, isLoading: isLoadingTypes } = useClinicTypes({ include_inactive: false });
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  // Get clinic_id from storage (fallback to user object)
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch (error) {
      console.warn('Failed to get clinic_id from localStorage:', error);
    }
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  const normalizedRole = role?.toUpperCase();
  const isClinicManager = normalizedRole === 'MANAGER';
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  const userClinicId = getClinicIdFromStorage();

  useEffect(() => {
    if (clinic && isClinicManager && !isSystemAdmin && userClinicId !== clinic.clinic_id) {
      navigate('/clinic-info', { replace: true });
    }
  }, [clinic, isClinicManager, isSystemAdmin, userClinicId, navigate]);

  const urlOrDomainSchema = useMemo(() => z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val || val === '') return true;
        try { new URL(val); return true; } catch {
          const domainPattern = /^(www\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
          return domainPattern.test(val);
        }
      },
      { message: t(CLINIC.INVALID_URL) }
    ), [t]);

  const daySchema = useMemo(() => z.object({
    open: z.string().optional(),
    close: z.string().optional(),
    closed: z.boolean().optional(),
  }).optional(), []);

  const baseFields = useMemo(() => ({
    name: z.string().min(1, t(CLINIC.CLINIC_NAME_REQUIRED)).max(100),
    clinic_code: z.string().min(1, t(CLINIC.CLINIC_CODE_REQUIRED)).max(20),
    address: z.string().min(1, t(CLINIC.ADDRESS_REQUIRED)).or(z.literal('')),
    city: z.string().max(100).min(1, t(CLINIC.CITY_REQUIRED)).or(z.literal('')),
    state: z.string().max(50).optional().or(z.literal('')),
    postal_code: z.string().max(20).optional().or(z.literal('')),
    country: z.string().max(50).optional().or(z.literal('')),
    phone: z.string().min(1, t(CLINIC.PHONE_REQUIRED)).max(20).or(z.literal('')),
    email: z.string().email(t(CLINIC.INVALID_EMAIL)).max(150).min(1, t(CLINIC.EMAIL_REQUIRED)).or(z.literal('')),
    website: urlOrDomainSchema,
    timezone: z.string().max(50).optional().or(z.literal('')),
    currency: z.string().max(10).optional().or(z.literal('')),
    language: z.string().max(10).optional().or(z.literal('')),
    type_ids: z.array(z.string()).min(1, t(CLINIC.CLINIC_TYPE_REQUIRED)).optional(),
  }), [t, urlOrDomainSchema]);

  const clinicSchema = useMemo(() => {
    if (isSystemAdmin) {
      return z.object(baseFields).passthrough();
    }

    return z.object({
      ...baseFields,
      description: z.string().optional().or(z.literal('')),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
      fax: z.string().max(20).optional().or(z.literal('')),
      operating_hours: z.object({
        monday: daySchema, tuesday: daySchema, wednesday: daySchema, thursday: daySchema,
        friday: daySchema, saturday: daySchema, sunday: daySchema,
      }).refine(
        (hours) => {
          if (!hours) return false;
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
          return days.some((day) => {
            const dayHours = hours[day];
            return dayHours && !dayHours.closed && dayHours.open && dayHours.close;
          });
        },
        { message: t(CLINIC.AT_LEAST_ONE_DAY) }
      ).optional(),
      appointment_slot_duration: z.number().min(5).max(120).optional().nullable(),
      max_daily_appointments: z.number().min(1).optional().nullable(),
      allow_online_booking: z.boolean().optional(),
      send_sms_reminders: z.boolean().optional(),
      send_email_reminders: z.boolean().optional(),
      reminder_hours_before: z.number().min(1).max(168).optional().nullable(),
      is_active: z.boolean(),
      established_date: z.string().optional().or(z.literal('')),
      license_number: z.string().max(50).optional().or(z.literal('')),
      license_expiry_date: z.string().optional().or(z.literal('')),
      notes: z.string().optional().or(z.literal('')),
      logo_url: urlOrDomainSchema,
      image_url: urlOrDomainSchema,
      tax_id: z.string().max(100).optional().or(z.literal('')),
      registration_number: z.string().max(100).optional().or(z.literal('')),
    });
  }, [t, baseFields, urlOrDomainSchema, daySchema, isSystemAdmin]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
  });

  const address = watch('address');

  // Update form when clinic data loads
  useEffect(() => {
    if (clinic) {
      reset({
        name: clinic.name,
        clinic_code: clinic.clinic_code || '',
        description: clinic.description || '',
        address: clinic.address || '',
        city: clinic.city || '',
        state: clinic.state || '',
        postal_code: clinic.postal_code || '',
        country: clinic.country || '',
        latitude: clinic.latitude || null,
        longitude: clinic.longitude || null,
        phone: clinic.phone || '',
        fax: clinic.fax || '',
        email: clinic.email || '',
        website: clinic.website || '',
        timezone: clinic.timezone || DEFAULT_TIMEZONE,
        currency: clinic.currency || DEFAULT_CURRENCY,
        language: clinic.language || DEFAULT_LANGUAGE,
        operating_hours: clinic.operating_hours || {},
        appointment_slot_duration: clinic.appointment_slot_duration || null,
        max_daily_appointments: clinic.max_daily_appointments || null,
        allow_online_booking: clinic.allow_online_booking ?? undefined,
        send_sms_reminders: clinic.send_sms_reminders ?? undefined,
        send_email_reminders: clinic.send_email_reminders ?? undefined,
        reminder_hours_before: clinic.reminder_hours_before || null,
        is_active: clinic.is_active,
        established_date: clinic.established_date || '',
        license_number: clinic.license_number || '',
        license_expiry_date: clinic.license_expiry_date || '',
        notes: clinic.notes || '',
        logo_url: clinic.logo_url || '',
        image_url: clinic.image_url || '',
        tax_id: clinic.tax_id || '',
        registration_number: clinic.registration_number || '',
        type_ids: clinic.type_ids || (clinic.types?.map(t => t.clinic_type_id) || clinic.clinic_types?.map(t => t.clinic_type_id) || []),
      });
    }
  }, [clinic, reset]);

  const basicClinicKeys = [
    'name', 'clinic_code', 'address', 'city', 'state', 'postal_code', 'country',
    'phone', 'email', 'website', 'timezone', 'currency', 'language', 'type_ids',
  ] as const;

  const onSubmit = async (data: ClinicFormData) => {
    if (!id) return;

    try {
      const payload: Record<string, unknown> = {};
      const keysToInclude = isSystemAdmin ? basicClinicKeys : (Object.keys(data) as (keyof ClinicFormData)[]);

      keysToInclude.forEach((key) => {
        const value = data[key];
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'latitude' || key === 'longitude') {
            if (value !== null) payload[key] = Number(value);
          } else if (key === 'appointment_slot_duration' || key === 'max_daily_appointments' || key === 'reminder_hours_before') {
            if (value !== null) payload[key] = Number(value);
          } else {
            payload[key] = value;
          }
        }
      });

      await updateMutation.mutateAsync({
        id,
        data: payload,
      });
      useToastStore.getState().success(t(CLINIC.CLINIC_UPDATED));
      navigate(`/clinics/${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t(CLINIC.UPDATE_FAILED);
      console.error('Failed to update clinic:', error);
      useToastStore.getState().error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="text-center py-12">
          <h2 className="text-lg font-medium text-smudged-lips mb-2">{t(CLINIC.CLINIC_NOT_FOUND)}</h2>
          <Link to="/clinics">
            <Button variant="outline">{t(CLINIC.BACK_TO_CLINICS)}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link to={`/clinics/${clinic.clinic_id}`} className="inline-block mb-4">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MdArrowBack className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(CLINIC.EDIT_CLINIC)}
        </h1>
        <p className="text-sm text-carbon/60">{clinic.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Clinic Information (basic info; system admin sees only this) */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="h-5 w-5 text-azure-dragon" />
              {isSystemAdmin ? t(CLINIC.CLINIC_INFORMATION) : t(CLINIC.BASIC_INFORMATION)}
            </CardTitle>
            {isSystemAdmin && (
              <p className="text-xs text-carbon/60 mt-1">
                {t(CLINIC.SYSTEM_ADMIN_HELPER)}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(CLINIC.CLINIC_NAME)}
                placeholder={t(CLINIC.ENTER_CLINIC_NAME)}
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <Input
                label={t(CLINIC.CLINIC_CODE)}
                placeholder={t(CLINIC.CLINIC_CODE_PLACEHOLDER)}
                error={errors.clinic_code?.message}
                required
                disabled
                className="bg-carbon/5 cursor-not-allowed"
                {...register('clinic_code')}
              />
              {!isSystemAdmin && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-carbon/60 mb-1.5">
                    {t(CLINIC.DESCRIPTION)}
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-azure-dragon/30"
                    placeholder="Clinic description"
                  />
                </div>
              )}
              {isSystemAdmin && (
                <>
                  <div className="md:col-span-2">
                    <AddressInput
                      label={t(CLINIC.ADDRESS)}
                      value={address || ''}
                      onChange={(value) => setValue('address', value)}
                      onAddressSelect={(addressData) => {
                        setValue('address', addressData.address);
                        if (addressData.city) setValue('city', addressData.city);
                        if (addressData.state) setValue('state', addressData.state);
                        if (addressData.postal_code) setValue('postal_code', addressData.postal_code);
                        if (addressData.country) setValue('country', addressData.country);
                        if (addressData.latitude !== undefined) setValue('latitude', addressData.latitude);
                        if (addressData.longitude !== undefined) setValue('longitude', addressData.longitude);
                      }}
                      error={errors.address?.message}
                      required
                    />
                  </div>
                  <Input label={t(CLINIC.CITY)} placeholder="City" error={errors.city?.message} required {...register('city')} />
                  <Input label={t(CLINIC.STATE_PROVINCE)} placeholder="State or Province" error={errors.state?.message} {...register('state')} />
                  <Input label={t(CLINIC.POSTAL_CODE)} placeholder="Postal code" error={errors.postal_code?.message} {...register('postal_code')} />
                  <Input label={t(CLINIC.COUNTRY)} placeholder="Country" error={errors.country?.message} {...register('country')} />
                  <Input label={t(CLINIC.PHONE)} type="tel" placeholder="+1234567890" error={errors.phone?.message} required {...register('phone')} />
                  <Input label={t(CLINIC.EMAIL)} type="email" placeholder="clinic@example.com" error={errors.email?.message} required {...register('email')} />
                  <Input label={t(CLINIC.WEBSITE)} placeholder="www.example.com" error={errors.website?.message} {...register('website')} />
                  <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
                    <Select label={t(CLINIC.TIMEZONE)} error={errors.timezone?.message} options={timezones} {...register('timezone')} />
                    <Select label={t(CLINIC.CURRENCY)} error={errors.currency?.message} options={currencies} {...register('currency')} />
                    <Select label={t(CLINIC.LANGUAGE)} error={errors.language?.message} options={languages} {...register('language')} />
                  </div>
                  <div className="md:col-span-2">
                    <Controller
                      name="type_ids"
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
                              label: type.name,
                              color: type.color,
                            }))}
                            value={field.value || []}
                            onChange={field.onChange}
                            error={errors.type_ids?.message}
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
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location Information - hidden for system admin */}
        {!isSystemAdmin && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdLocationOn className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.LOCATION_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <AddressInput
                  label={t(CLINIC.ADDRESS)}
                  value={address || ''}
                  onChange={(value) => setValue('address', value)}
                  onAddressSelect={(addressData) => {
                    setValue('address', addressData.address);
                    if (addressData.city) setValue('city', addressData.city);
                    if (addressData.state) setValue('state', addressData.state);
                    if (addressData.postal_code) setValue('postal_code', addressData.postal_code);
                    if (addressData.country) setValue('country', addressData.country);
                    if (addressData.latitude !== undefined) setValue('latitude', addressData.latitude);
                    if (addressData.longitude !== undefined) setValue('longitude', addressData.longitude);
                  }}
                  error={errors.address?.message}
                  required
                />
              </div>
              <Input
                label={t(CLINIC.CITY)}
                placeholder="City"
                error={errors.city?.message}
                required
                {...register('city')}
              />
              <Input
                label={t(CLINIC.STATE_PROVINCE)}
                placeholder="State or Province"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label={t(CLINIC.POSTAL_CODE)}
                placeholder="Postal code"
                error={errors.postal_code?.message}
                {...register('postal_code')}
              />
              <Input
                label={t(CLINIC.COUNTRY)}
                placeholder="Country"
                error={errors.country?.message}
                {...register('country')}
              />
              <Input
                label={t(CLINIC.LATITUDE)}
                type="number"
                step="any"
                placeholder="Auto-filled from address"
                error={errors.latitude?.message}
                helperText="Automatically generated from selected address"
                readOnly
                className="bg-carbon/5 cursor-not-allowed"
                {...register('latitude', { valueAsNumber: true })}
              />
              <Input
                label={t(CLINIC.LONGITUDE)}
                type="number"
                step="any"
                placeholder="Auto-filled from address"
                error={errors.longitude?.message}
                helperText="Automatically generated from selected address"
                readOnly
                className="bg-carbon/5 cursor-not-allowed"
                {...register('longitude', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>
        )}

        {/* Contact Information - hidden for system admin (phone/email/website in basic flow) */}
        {!isSystemAdmin && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPhone className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.CONTACT_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(CLINIC.PHONE)}
                type="tel"
                placeholder="+1234567890"
                error={errors.phone?.message}
                required
                {...register('phone')}
              />
              <Input
                label={t(CLINIC.FAX)}
                type="tel"
                placeholder="+1234567890"
                error={errors.fax?.message}
                {...register('fax')}
              />
              <Input
                label={t(CLINIC.EMAIL)}
                type="email"
                placeholder="clinic@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Input
                label={t(CLINIC.WEBSITE)}
                placeholder="www.example.com"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>
          </CardContent>
        </Card>
        )}

        {/* Operational Information, Settings, Status, Financial, Additional - hidden for system admin */}
        {!isSystemAdmin && (
        <>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSchedule className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.OPERATIONAL_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  label={t(CLINIC.TIMEZONE)}
                  error={errors.timezone?.message}
                  options={timezones}
                  {...register('timezone')}
                />
                <Select
                  label={t(CLINIC.CURRENCY)}
                  error={errors.currency?.message}
                  options={currencies}
                  {...register('currency')}
                />
                <Select
                  label={t(CLINIC.LANGUAGE)}
                  error={errors.language?.message}
                  options={languages}
                  {...register('language')}
                />
              </div>

              {/* Clinic Types Multi-Select */}
              <div>
                <Controller
                  name="type_ids"
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
                          label: type.name,
                          color: type.color,
                        }))}
                        value={field.value || []}
                        onChange={field.onChange}
                        error={errors.type_ids?.message}
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

              <div>
                <label className="block text-xs font-medium text-carbon/60 mb-2">
                  {t(CLINIC.OPERATING_HOURS)} <span className="text-smudged-lips">*</span>
                </label>
                <Controller
                  name="operating_hours"
                  control={control}
                  render={({ field }) => (
                    <OperatingHoursEditor value={field.value || {}} onChange={field.onChange} />
                  )}
                />
                {errors.operating_hours && (
                  <p className="mt-1.5 text-xs text-smudged-lips">
                    {errors.operating_hours.message}
                  </p>
                )}
                <p className="text-xs text-carbon/50 mt-1">
                  {t(CLINIC.AT_LEAST_ONE_DAY)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings & Configuration */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSettings className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.SETTINGS_CONFIG)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(CLINIC.SLOT_DURATION_LABEL)}
                type="number"
                placeholder="30"
                error={errors.appointment_slot_duration?.message}
                {...register('appointment_slot_duration', { valueAsNumber: true })}
              />
              <Input
                label={t(CLINIC.MAX_DAILY_APPOINTMENTS)}
                type="number"
                placeholder="50"
                error={errors.max_daily_appointments?.message}
                {...register('max_daily_appointments', { valueAsNumber: true })}
              />
              <Input
                label={t(CLINIC.REMINDER_HOURS_BEFORE)}
                type="number"
                placeholder="24"
                error={errors.reminder_hours_before?.message}
                {...register('reminder_hours_before', { valueAsNumber: true })}
              />
            </div>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('allow_online_booking')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm font-medium text-carbon">{t(CLINIC.ALLOW_ONLINE_BOOKING)}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('send_sms_reminders')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm font-medium text-carbon">{t(CLINIC.SEND_SMS_REMINDERS)}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('send_email_reminders')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm font-medium text-carbon">{t(CLINIC.SEND_EMAIL_REMINDERS)}</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Status & Management */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdInfo className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.STATUS_MANAGEMENT)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(CLINIC.ESTABLISHED_DATE)}
                type="date"
                error={errors.established_date?.message}
                {...register('established_date')}
              />
              <Input
                label={t(CLINIC.LICENSE_NUMBER)}
                placeholder="License number"
                error={errors.license_number?.message}
                {...register('license_number')}
              />
              <Input
                label={t(CLINIC.LICENSE_EXPIRY)}
                type="date"
                error={errors.license_expiry_date?.message}
                {...register('license_expiry_date')}
              />
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                  />
                  <span className="text-sm font-medium text-carbon">{t(CLINIC.ACTIVE_CHECKBOX)}</span>
                </label>
                <p className="text-xs text-carbon/50 mt-1">
                  {t(CLINIC.INACTIVE_HELPER)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdAttachMoney className="h-5 w-5 text-azure-dragon" />
              {t(CLINIC.FINANCIAL_INFORMATION)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(CLINIC.TAX_ID)}
                placeholder="Tax identification number"
                error={errors.tax_id?.message}
                {...register('tax_id')}
              />
              <Input
                label={t(CLINIC.REGISTRATION_NUMBER)}
                placeholder="Registration number"
                error={errors.registration_number?.message}
                {...register('registration_number')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(CLINIC.ADDITIONAL_INFORMATION)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-carbon/60 mb-1.5">{t(CLINIC.NOTES)}</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-azure-dragon/30"
                  placeholder="Additional notes about the clinic"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t(CLINIC.LOGO_URL)}
                  placeholder="https://example.com/logo.png"
                  error={errors.logo_url?.message}
                  {...register('logo_url')}
                />
                <Input
                  label={t(CLINIC.IMAGE_URL)}
                  placeholder="https://example.com/image.png"
                  error={errors.image_url?.message}
                  {...register('image_url')}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        </>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/clinics/${clinic.clinic_id}`} className="flex-1">
            <Button type="button" variant="outline" size="md" className="w-full">
              {t(CLINIC.CANCEL)}
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending}
          >
            {t(CLINIC.SAVE_CHANGES)}
          </Button>
        </div>
      </form>
    </div>
  );
};
