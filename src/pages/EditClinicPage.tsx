import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClinic, useUpdateClinic } from '@/hooks/useClinics';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { Input, Select, Card, CardHeader, CardTitle, CardContent, Button, Loading } from '@/components/ui';
import { timezones, currencies, languages, DEFAULT_CURRENCY, DEFAULT_LANGUAGE, DEFAULT_TIMEZONE } from '@/config/clinicOptions';
import { OperatingHoursEditor } from '@/components/clinics/OperatingHoursEditor';
import { AddressInput } from '@/components/clinics/AddressInput';
import {
  MdArrowBack,
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdSchedule,
  MdSettings,
  MdInfo,
  MdAttachMoney,
} from 'react-icons/md';
import type { OperatingHours } from '@/api/clinics';

// Custom URL validation that accepts domains without protocol
const urlOrDomainSchema = z
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
    { message: 'Invalid URL or domain' }
  );

const operatingHoursSchema: z.ZodType<OperatingHours> = z.object({
  monday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
  tuesday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
  wednesday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
  thursday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
  friday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
  saturday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
  sunday: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
      closed: z.boolean().optional(),
    })
    .optional(),
});

const clinicSchema = z.object({
  // Basic Information
  name: z.string().min(1, 'Clinic name is required').max(100),
  clinic_code: z.string().min(1, 'Clinic code is required').max(20),
  description: z.string().optional().or(z.literal('')),

  // Location Information
  address: z.string().min(1, 'Address is required').or(z.literal('')),
  city: z.string().max(100).min(1, 'City is required').or(z.literal('')),
  state: z.string().max(50).optional().or(z.literal('')),
  postal_code: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(50).optional().or(z.literal('')),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),

  // Contact Information
  phone: z.string().min(1, 'Phone number is required').max(20).or(z.literal('')),
  fax: z.string().max(20).optional().or(z.literal('')),
  email: z.string().email('Invalid email').max(150).min(1, 'Email is required').or(z.literal('')),
  website: urlOrDomainSchema,

  // Operational Information
  timezone: z.string().max(50).optional().or(z.literal('')),
  currency: z.string().max(10).optional().or(z.literal('')),
  language: z.string().max(10).optional().or(z.literal('')),
  operating_hours: operatingHoursSchema
    .refine(
      (hours) => {
        if (!hours) return false;
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
        return days.some((day) => {
          const dayHours = hours[day];
          return dayHours && !dayHours.closed && dayHours.open && dayHours.close;
        });
      },
      { message: 'At least one day with operating hours must be configured' }
    )
    .optional(),

  // Settings & Configuration
  appointment_slot_duration: z.number().min(5).max(120).optional().nullable(),
  max_daily_appointments: z.number().min(1).optional().nullable(),
  allow_online_booking: z.boolean().optional(),
  send_sms_reminders: z.boolean().optional(),
  send_email_reminders: z.boolean().optional(),
  reminder_hours_before: z.number().min(1).max(168).optional().nullable(),

  // Status & Management
  is_active: z.boolean(),
  established_date: z.string().optional().or(z.literal('')),
  license_number: z.string().max(50).optional().or(z.literal('')),
  license_expiry_date: z.string().optional().or(z.literal('')),

  // Additional Information
  notes: z.string().optional().or(z.literal('')),
  logo_url: urlOrDomainSchema,
  image_url: urlOrDomainSchema,

  // Financial Information
  tax_id: z.string().max(100).optional().or(z.literal('')),
  registration_number: z.string().max(100).optional().or(z.literal('')),
});

type ClinicFormData = z.infer<typeof clinicSchema>;

export const EditClinicPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { data: clinic, isLoading } = useClinic(id);
  const updateMutation = useUpdateClinic();

  // Get clinic_id from storage (fallback to user object)
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      // Try to get from localStorage directly (Zustand persist)
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

    // Fallback to user object from auth hook
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  // Check if clinic manager is trying to edit their own clinic
  const normalizedRole = role?.toUpperCase();
  const isClinicManager = normalizedRole === 'MANAGER';
  const isSystemAdmin = user?.user_type === 'SYSTEM' || normalizedRole === 'ADMIN';
  const userClinicId = getClinicIdFromStorage();
  
  // Clinic managers can only edit their own clinic
  useEffect(() => {
    if (clinic && isClinicManager && !isSystemAdmin && userClinicId !== clinic.clinic_id) {
      navigate('/clinic-info', { replace: true });
    }
  }, [clinic, isClinicManager, isSystemAdmin, userClinicId, navigate]);

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
      });
    }
  }, [clinic, reset]);

  const onSubmit = async (data: ClinicFormData) => {
    if (!id) return;

    try {
      // Clean up empty strings and null values
      const payload: Record<string, unknown> = {};
      
      Object.entries(data).forEach(([key, value]) => {
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
      useToastStore.getState().success('Clinic updated successfully!');
      navigate(`/clinics/${id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update clinic';
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
          <h2 className="text-lg font-medium text-smudged-lips mb-2">Clinic Not Found</h2>
          <Link to="/clinics">
            <Button variant="outline">Back to Clinics</Button>
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
          Edit Clinic
        </h1>
        <p className="text-sm text-carbon/60">{clinic.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="h-5 w-5 text-azure-dragon" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Clinic Name"
                placeholder="Enter clinic name"
                error={errors.name?.message}
                required
                {...register('name')}
              />
              <Input
                label="Clinic Code"
                placeholder="e.g., CLINIC001"
                error={errors.clinic_code?.message}
                required
                {...register('clinic_code')}
              />
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-carbon/60 mb-1.5">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-azure-dragon/30"
                  placeholder="Clinic description"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdLocationOn className="h-5 w-5 text-azure-dragon" />
              Location Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <AddressInput
                  label="Address"
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
                label="City"
                placeholder="City"
                error={errors.city?.message}
                required
                {...register('city')}
              />
              <Input
                label="State/Province"
                placeholder="State or Province"
                error={errors.state?.message}
                {...register('state')}
              />
              <Input
                label="Postal Code"
                placeholder="Postal code"
                error={errors.postal_code?.message}
                {...register('postal_code')}
              />
              <Input
                label="Country"
                placeholder="Country"
                error={errors.country?.message}
                {...register('country')}
              />
              <Input
                label="Latitude"
                type="number"
                step="any"
                placeholder="e.g., -1.9441"
                error={errors.latitude?.message}
                {...register('latitude', { valueAsNumber: true })}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                placeholder="e.g., 30.0619"
                error={errors.longitude?.message}
                {...register('longitude', { valueAsNumber: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPhone className="h-5 w-5 text-azure-dragon" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Phone"
                type="tel"
                placeholder="+1234567890"
                error={errors.phone?.message}
                required
                {...register('phone')}
              />
              <Input
                label="Fax"
                type="tel"
                placeholder="+1234567890"
                error={errors.fax?.message}
                {...register('fax')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="clinic@example.com"
                error={errors.email?.message}
                required
                {...register('email')}
              />
              <Input
                label="Website"
                placeholder="www.example.com"
                error={errors.website?.message}
                {...register('website')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operational Information */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSchedule className="h-5 w-5 text-azure-dragon" />
              Operational Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Select
                  label="Timezone"
                  error={errors.timezone?.message}
                  options={timezones}
                  {...register('timezone')}
                />
                <Select
                  label="Currency"
                  error={errors.currency?.message}
                  options={currencies}
                  {...register('currency')}
                />
                <Select
                  label="Language"
                  error={errors.language?.message}
                  options={languages}
                  {...register('language')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-carbon/60 mb-2">
                  Operating Hours <span className="text-smudged-lips">*</span>
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
                  At least one day must have operating hours configured
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
              Settings & Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Appointment Slot Duration (minutes)"
                type="number"
                placeholder="30"
                error={errors.appointment_slot_duration?.message}
                {...register('appointment_slot_duration', { valueAsNumber: true })}
              />
              <Input
                label="Max Daily Appointments"
                type="number"
                placeholder="50"
                error={errors.max_daily_appointments?.message}
                {...register('max_daily_appointments', { valueAsNumber: true })}
              />
              <Input
                label="Reminder Hours Before"
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
                <span className="text-sm font-medium text-carbon">Allow Online Booking</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('send_sms_reminders')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm font-medium text-carbon">Send SMS Reminders</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('send_email_reminders')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm font-medium text-carbon">Send Email Reminders</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Status & Management */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdInfo className="h-5 w-5 text-azure-dragon" />
              Status & Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Established Date"
                type="date"
                error={errors.established_date?.message}
                {...register('established_date')}
              />
              <Input
                label="License Number"
                placeholder="License number"
                error={errors.license_number?.message}
                {...register('license_number')}
              />
              <Input
                label="License Expiry Date"
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
                  <span className="text-sm font-medium text-carbon">Active</span>
                </label>
                <p className="text-xs text-carbon/50 mt-1">
                  Inactive clinics will not appear in certain operations
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
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Tax ID"
                placeholder="Tax identification number"
                error={errors.tax_id?.message}
                {...register('tax_id')}
              />
              <Input
                label="Registration Number"
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
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-carbon/60 mb-1.5">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full rounded-md border border-carbon/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-azure-dragon/30"
                  placeholder="Additional notes about the clinic"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Logo URL"
                  placeholder="https://example.com/logo.png"
                  error={errors.logo_url?.message}
                  {...register('logo_url')}
                />
                <Input
                  label="Image URL"
                  placeholder="https://example.com/image.png"
                  error={errors.image_url?.message}
                  {...register('image_url')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to={`/clinics/${clinic.clinic_id}`} className="flex-1">
            <Button type="button" variant="outline" size="md" className="w-full">
              Cancel
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
