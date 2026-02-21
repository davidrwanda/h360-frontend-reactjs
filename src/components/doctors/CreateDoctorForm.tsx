import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDoctor, useDoctors, useSubscribeDoctor } from '@/hooks/useDoctors';
import { useClinics } from '@/hooks/useClinics';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { DoctorSpecialtyInput } from './DoctorSpecialtyInput';
import { MdLocalHospital, MdSearch, MdCheckCircle, MdPerson } from 'react-icons/md';
import type { Doctor } from '@/api/doctors';
import { useTranslation, DOCTOR } from '@/i18n';

interface CreateDoctorFormData {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'Other';
  email?: string;
  phone?: string;
  alternate_phone?: string;
  specialty?: string;
  specialty_ids?: string[];
  license_number?: string;
  license_expiry_date?: string;
  medical_school?: string;
  years_of_experience?: number;
  qualifications?: string;
  bio?: string;
  clinic_id: string;
  doctor_number?: string;
  profile_image_url?: string;
  hire_date?: string;
  appointment_duration_minutes?: number;
  max_daily_patients?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
}

interface SubscribeDoctorFormData {
  clinic_id: string;
  employment_status?: 'active' | 'inactive' | 'on_leave';
  hire_date?: string;
  appointment_duration_minutes?: number;
  max_daily_patients?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
}

interface CreateDoctorFormProps {
  clinicId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateDoctorForm = ({
  clinicId,
  onSuccess,
  onCancel,
}: CreateDoctorFormProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [foundDoctor, setFoundDoctor] = useState<Doctor | null>(null);
  const [isSearchingDoctor, setIsSearchingDoctor] = useState(false);
  const createMutation = useCreateDoctor();
  const subscribeMutation = useSubscribeDoctor();
  const { success: showSuccess, error: showError } = useToastStore();

  // Fetch clinics for selection (only if clinicId is not provided)
  const { data: clinicsData } = useClinics({ limit: 100 });

  // Search for existing doctors
  const { refetch: searchDoctors } = useDoctors({
    search: searchQuery || undefined,
    limit: 10,
    is_active: true,
  });

  const createDoctorSchema = useMemo(() => z.object({
    first_name: z.string().min(1, t(DOCTOR.FIRST_NAME_REQUIRED)),
    last_name: z.string().min(1, t(DOCTOR.LAST_NAME_REQUIRED)),
    date_of_birth: z.string().optional(),
    gender: z.enum(['M', 'F', 'Other']).optional(),
    email: z.string().email(t(DOCTOR.INVALID_EMAIL)).optional().or(z.literal('')),
    phone: z.string().optional(),
    alternate_phone: z.string().optional().or(z.literal('')),
    /** Optional name; backend uses existing id or creates new specialty. */
    specialty: z.string().optional().or(z.literal('')),
    /** Optional UUIDs from GET /api/doctor-specialties; merged with specialty. */
    specialty_ids: z.array(z.string()).optional(),
    license_number: z.string().optional(),
    license_expiry_date: z.string().optional(),
    medical_school: z.string().optional(),
    years_of_experience: z.number().min(0).optional(),
    qualifications: z.string().optional(),
    bio: z.string().optional(),
    clinic_id: z.string().min(1, t(DOCTOR.CLINIC_REQUIRED)),
    doctor_number: z.string().optional(),
    profile_image_url: z.string().url(t(DOCTOR.INVALID_URL)).optional().or(z.literal('')),
    // Clinic-specific fields
    hire_date: z.string().optional(),
    appointment_duration_minutes: z.number().min(1, t(DOCTOR.DURATION_MIN_ERROR)).optional(),
    max_daily_patients: z.number().min(1, t(DOCTOR.MAX_DAILY_MIN_ERROR)).optional(),
    accepts_new_patients: z.boolean().optional(),
    consultation_fee: z.string().optional(),
    notes: z.string().optional(),
  }), [t]);

  const subscribeDoctorSchema = useMemo(() => z.object({
    clinic_id: z.string().min(1, t(DOCTOR.CLINIC_REQUIRED)),
    employment_status: z.enum(['active', 'inactive', 'on_leave']).optional(),
    hire_date: z.string().optional(),
    appointment_duration_minutes: z.number().min(1, t(DOCTOR.DURATION_MIN_ERROR)).optional(),
    max_daily_patients: z.number().min(1, t(DOCTOR.MAX_DAILY_MIN_ERROR)).optional(),
    accepts_new_patients: z.boolean().optional(),
    consultation_fee: z.string().optional(),
    notes: z.string().optional(),
  }), [t]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      clinic_id: clinicId || '',
      specialty: '',
      specialty_ids: [],
      appointment_duration_minutes: 30,
    },
  });

  const {
    register: registerSubscribe,
    handleSubmit: handleSubscribeSubmit,
    control: controlSubscribe,
    formState: { errors: subscribeErrors },
    reset: resetSubscribe,
  } = useForm<SubscribeDoctorFormData>({
    resolver: zodResolver(subscribeDoctorSchema),
    defaultValues: {
      clinic_id: clinicId || '',
      appointment_duration_minutes: 30,
      accepts_new_patients: true,
    },
  });

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      showError(t(DOCTOR.SEARCH_MIN_CHARS));
      return;
    }

    setIsSearchingDoctor(true);
    try {
      const result = await searchDoctors();
      const doctors = result.data?.data || [];

      // Try to find exact match by email, phone, or doctor_number
      const exactMatch = doctors.find(
        (doc) =>
          doc.email?.toLowerCase() === searchQuery.toLowerCase() ||
          doc.phone === searchQuery ||
          doc.doctor_number === searchQuery
      );

      if (exactMatch) {
        setFoundDoctor(exactMatch);
        // Pre-fill subscribe form with clinic-specific fields
        resetSubscribe({
          clinic_id: clinicId || '',
          appointment_duration_minutes: 30,
          accepts_new_patients: true,
        });
      } else if (doctors.length > 0 && doctors[0]) {
        // Show first result if multiple found
        setFoundDoctor(doctors[0]);
        resetSubscribe({
          clinic_id: clinicId || '',
          appointment_duration_minutes: 30,
          accepts_new_patients: true,
        });
      } else {
        setFoundDoctor(null);
        showError(t(DOCTOR.NO_DOCTOR_FOUND));
      }
    } catch (err) {
      setFoundDoctor(null);
      showError(t(DOCTOR.SEARCH_FAILED));
    } finally {
      setIsSearchingDoctor(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFoundDoctor(null);
    reset();
    resetSubscribe();
  };

  const onSubmit = async (data: CreateDoctorFormData) => {
    setError(null);

    try {
      await createMutation.mutateAsync({
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender,
        email: data.email || undefined,
        phone: data.phone || undefined,
        alternate_phone: data.alternate_phone || undefined,
        specialty: data.specialty?.trim() || undefined,
        specialty_ids: data.specialty_ids?.length ? data.specialty_ids : undefined,
        license_number: data.license_number || undefined,
        license_expiry_date: data.license_expiry_date || undefined,
        medical_school: data.medical_school || undefined,
        years_of_experience: data.years_of_experience || undefined,
        qualifications: data.qualifications || undefined,
        bio: data.bio || undefined,
        doctor_number: data.doctor_number || undefined,
        profile_image_url: data.profile_image_url || undefined,
        clinicData: {
          clinic_id: data.clinic_id,
          clinic_ids: data.clinic_id ? [data.clinic_id] : undefined,
          employment_status: 'active',
          hire_date: data.hire_date || undefined,
          appointment_duration_minutes: data.appointment_duration_minutes ?? undefined,
          max_daily_patients: data.max_daily_patients ?? undefined,
          accepts_new_patients: data.accepts_new_patients ?? true,
          consultation_fee: data.consultation_fee || undefined,
          notes: data.notes || undefined,
        },
      });

      reset();
      showSuccess(t(DOCTOR.CREATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(DOCTOR.CREATE_FAILED);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const onSubscribeSubmit = async (data: SubscribeDoctorFormData) => {
    if (!foundDoctor || !foundDoctor.doctor_number) {
      showError(t(DOCTOR.DOCTOR_CODE_REQUIRED));
      return;
    }

    setError(null);

    try {
      // Subscribe existing doctor to clinic using doctor code
      await subscribeMutation.mutateAsync({
        doctorCode: foundDoctor.doctor_number,
        data: {
          clinic_id: data.clinic_id,
          employment_status: data.employment_status || 'active',
          hire_date: data.hire_date,
          appointment_duration_minutes: data.appointment_duration_minutes,
          max_daily_patients: data.max_daily_patients,
          accepts_new_patients: data.accepts_new_patients,
          notes: data.notes,
        },
      });

      resetSubscribe();
      setFoundDoctor(null);
      setSearchQuery('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(DOCTOR.SUBSCRIBE_FAILED);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  // If doctor found, show subscribe form
  if (foundDoctor) {
    return (
      <form onSubmit={handleSubscribeSubmit(onSubscribeSubmit)}>
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdCheckCircle className="h-5 w-5 text-azure-dragon" />
              {t(DOCTOR.SUBSCRIBE_EXISTING)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
                <p className="text-xs text-smudged-lips">{error}</p>
              </div>
            )}

            {/* Found Doctor Info */}
            <div className="rounded-md bg-azure-dragon/5 border border-azure-dragon/20 p-4">
              <div className="flex items-start gap-3">
                <MdPerson className="h-5 w-5 text-azure-dragon mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-carbon">{foundDoctor.full_name}</p>
                  {foundDoctor.email && (
                    <p className="text-xs text-carbon/60 mt-1">{foundDoctor.email}</p>
                  )}
                  <p className="text-xs text-carbon/60">{foundDoctor.phone}</p>
                  {(foundDoctor.specialty || (foundDoctor.specialty_ids && foundDoctor.specialty_ids.length > 0)) && (
                    <p className="text-xs text-carbon/60 mt-1">
                      {t(DOCTOR.SPECIALTY)}: {foundDoctor.specialty ?? (foundDoctor.specialty_ids?.length ? `${foundDoctor.specialty_ids.length} selected` : '')}
                    </p>
                  )}
                  {foundDoctor.doctor_number && (
                    <p className="text-xs text-carbon/60">{t(DOCTOR.CODE)}: {foundDoctor.doctor_number}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs"
                >
                  {t(DOCTOR.CHANGE)}
                </Button>
              </div>
            </div>

            <p className="text-xs text-carbon/60">
              {t(DOCTOR.DOCTOR_EXISTS_DESC)}
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="clinic_id"
                control={controlSubscribe}
                render={({ field }) => (
                  <Select
                    label={t(DOCTOR.CLINIC)}
                    error={subscribeErrors.clinic_id?.message}
                    required
                    disabled={!!clinicId}
                    options={[
                      { value: '', label: t(DOCTOR.SELECT_CLINIC) },
                      ...(clinicsData?.data || []).map((clinic) => ({
                        value: clinic.clinic_id,
                        label: clinic.name,
                      })),
                    ]}
                    {...field}
                  />
                )}
              />

              <Controller
                name="employment_status"
                control={controlSubscribe}
                render={({ field }) => (
                  <Select
                    label={t(DOCTOR.EMPLOYMENT_STATUS)}
                    error={subscribeErrors.employment_status?.message}
                    options={[
                      { value: '', label: t(DOCTOR.SELECT_STATUS) },
                      { value: 'active', label: t(DOCTOR.ACTIVE) },
                      { value: 'inactive', label: t(DOCTOR.INACTIVE) },
                      { value: 'on_leave', label: t(DOCTOR.ON_LEAVE) },
                    ]}
                    {...field}
                  />
                )}
              />

              <Input
                label={t(DOCTOR.HIRE_DATE)}
                type="date"
                error={subscribeErrors.hire_date?.message}
                {...registerSubscribe('hire_date')}
              />

              <Input
                label={t(DOCTOR.APPOINTMENT_DURATION_LABEL)}
                type="number"
                placeholder="30"
                error={subscribeErrors.appointment_duration_minutes?.message}
                {...registerSubscribe('appointment_duration_minutes', { valueAsNumber: true })}
              />

              <Input
                label={t(DOCTOR.MAX_DAILY_PATIENTS)}
                type="number"
                placeholder="20"
                error={subscribeErrors.max_daily_patients?.message}
                {...registerSubscribe('max_daily_patients', { valueAsNumber: true })}
              />

              <Input
                label={t(DOCTOR.CONSULTATION_FEE)}
                placeholder={t(DOCTOR.CONSULTATION_FEE_PLACEHOLDER)}
                error={subscribeErrors.consultation_fee?.message}
                {...registerSubscribe('consultation_fee')}
              />

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...registerSubscribe('accepts_new_patients')}
                    className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                  />
                  <span className="text-sm text-carbon">{t(DOCTOR.ACCEPTS_NEW_PATIENTS)}</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <Input
                  label={t(DOCTOR.NOTES)}
                  placeholder={t(DOCTOR.CLINIC_NOTES_PLACEHOLDER)}
                  error={subscribeErrors.notes?.message}
                  {...registerSubscribe('notes')}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={subscribeMutation.isPending}
              >
                {subscribeMutation.isPending ? t(DOCTOR.SUBSCRIBING) : t(DOCTOR.SUBSCRIBE_DOCTOR)}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                >
                  {t(DOCTOR.CANCEL)}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    );
  }

  // Default create form
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
            {t(DOCTOR.CREATE_NEW_DOCTOR)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          {/* Search for Existing Doctor */}
          <div className="rounded-md border border-carbon/15 p-4 bg-white-smoke/50">
            <label className="block text-xs font-medium text-carbon/80 mb-2">
              {t(DOCTOR.SEARCH_EXISTING_LABEL)}
            </label>
            <p className="text-xs text-carbon/60 mb-3">
              {t(DOCTOR.SEARCH_EXISTING_DESC)}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={t(DOCTOR.SEARCH_PLACEHOLDER_EXISTING)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleSearch}
                disabled={isSearchingDoctor || !searchQuery.trim() || searchQuery.length < 3}
              >
                <MdSearch className="h-4 w-4 mr-2" />
                {isSearchingDoctor ? t(DOCTOR.SEARCHING) : t(DOCTOR.SEARCH)}
              </Button>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-azure-dragon mb-4">{t(DOCTOR.BASIC_INFORMATION)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t(DOCTOR.FIRST_NAME)}
                  placeholder={t(DOCTOR.FIRST_NAME_PLACEHOLDER)}
                  error={errors.first_name?.message}
                  required
                  {...register('first_name')}
                />

                <Input
                  label={t(DOCTOR.LAST_NAME)}
                  placeholder={t(DOCTOR.LAST_NAME_PLACEHOLDER)}
                  error={errors.last_name?.message}
                  required
                  {...register('last_name')}
                />

                <Input
                  label={t(DOCTOR.EMAIL)}
                  type="email"
                  placeholder={t(DOCTOR.EMAIL_PLACEHOLDER)}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label={t(DOCTOR.PHONE)}
                  placeholder={t(DOCTOR.PHONE_PLACEHOLDER)}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label={t(DOCTOR.ALTERNATE_PHONE)}
                  placeholder={t(DOCTOR.ALTERNATE_PHONE_PLACEHOLDER)}
                  error={errors.alternate_phone?.message}
                  {...register('alternate_phone')}
                />

                <Input
                  label={t(DOCTOR.DATE_OF_BIRTH)}
                  type="date"
                  error={errors.date_of_birth?.message}
                  {...register('date_of_birth')}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t(DOCTOR.GENDER)}
                      error={errors.gender?.message}
                      options={[
                        { value: '', label: t(DOCTOR.SELECT_GENDER) },
                        { value: 'M', label: t(DOCTOR.MALE) },
                        { value: 'F', label: t(DOCTOR.FEMALE) },
                        { value: 'Other', label: t(DOCTOR.OTHER_GENDER) },
                      ]}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="specialty_ids"
                  control={control}
                  render={({ field }) => (
                    <DoctorSpecialtyInput
                      label={t(DOCTOR.SPECIALTIES)}
                      placeholder={t(DOCTOR.SPECIALTIES_PLACEHOLDER)}
                      value={field.value || []}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.specialty_ids?.message}
                      clinicId={clinicId || watch('clinic_id') || undefined}
                    />
                  )}
                />

                <Input
                  label={t(DOCTOR.CUSTOM_SPECIALTY)}
                  placeholder={t(DOCTOR.CUSTOM_SPECIALTY_PLACEHOLDER)}
                  error={errors.specialty?.message}
                  {...register('specialty')}
                />

                <Input
                  label={t(DOCTOR.LICENSE_NUMBER)}
                  placeholder={t(DOCTOR.LICENSE_NUMBER_PLACEHOLDER)}
                  error={errors.license_number?.message}
                  {...register('license_number')}
                />

                <Input
                  label={t(DOCTOR.LICENSE_EXPIRY_DATE)}
                  type="date"
                  error={errors.license_expiry_date?.message}
                  {...register('license_expiry_date')}
                />

                <Input
                  label={t(DOCTOR.MEDICAL_SCHOOL)}
                  placeholder={t(DOCTOR.MEDICAL_SCHOOL_PLACEHOLDER)}
                  error={errors.medical_school?.message}
                  {...register('medical_school')}
                />

                <Input
                  label={t(DOCTOR.YEARS_OF_EXPERIENCE)}
                  type="number"
                  placeholder="15"
                  error={errors.years_of_experience?.message}
                  {...register('years_of_experience', { valueAsNumber: true })}
                />

                <Input
                  label={t(DOCTOR.QUALIFICATIONS)}
                  placeholder={t(DOCTOR.QUALIFICATIONS_PLACEHOLDER)}
                  error={errors.qualifications?.message}
                  {...register('qualifications')}
                />

                <Input
                  label={t(DOCTOR.DOCTOR_NUMBER_LABEL)}
                  placeholder={t(DOCTOR.DOCTOR_NUMBER_PLACEHOLDER)}
                  error={errors.doctor_number?.message}
                  {...register('doctor_number')}
                />

                <Input
                  label={t(DOCTOR.PROFILE_IMAGE_URL)}
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  error={errors.profile_image_url?.message}
                  {...register('profile_image_url')}
                />

                <div className="md:col-span-2">
                  <Input
                    label={t(DOCTOR.BIO)}
                    placeholder={t(DOCTOR.BIO_PLACEHOLDER)}
                    error={errors.bio?.message}
                    {...register('bio')}
                  />
                </div>
              </div>
            </div>

            {/* Clinic Information Section */}
            <div className="pt-6 border-t border-carbon/10">
              <h3 className="text-sm font-semibold text-azure-dragon mb-4">{t(DOCTOR.CLINIC_INFORMATION)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="clinic_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label={t(DOCTOR.CLINIC)}
                      error={errors.clinic_id?.message}
                      required
                      disabled={!!clinicId}
                      options={[
                        { value: '', label: t(DOCTOR.SELECT_CLINIC) },
                        ...(clinicsData?.data || []).map((clinic) => ({
                          value: clinic.clinic_id,
                          label: clinic.name,
                        })),
                      ]}
                      {...field}
                    />
                  )}
                />

                <Input
                  label={t(DOCTOR.HIRE_DATE)}
                  type="date"
                  error={errors.hire_date?.message}
                  {...register('hire_date')}
                />

                <Input
                  label={t(DOCTOR.APPOINTMENT_DURATION_LABEL)}
                  type="number"
                  placeholder="30"
                  error={errors.appointment_duration_minutes?.message}
                  {...register('appointment_duration_minutes', { valueAsNumber: true })}
                />

                <Input
                  label={t(DOCTOR.MAX_DAILY_PATIENTS)}
                  type="number"
                  placeholder="20"
                  error={errors.max_daily_patients?.message}
                  {...register('max_daily_patients', { valueAsNumber: true })}
                />

                <Input
                  label={t(DOCTOR.CONSULTATION_FEE)}
                  placeholder={t(DOCTOR.CONSULTATION_FEE_PLACEHOLDER)}
                  error={errors.consultation_fee?.message}
                  {...register('consultation_fee')}
                />

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('accepts_new_patients')}
                      className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                    />
                    <span className="text-sm text-carbon">{t(DOCTOR.ACCEPTS_NEW_PATIENTS)}</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label={t(DOCTOR.NOTES)}
                    placeholder={t(DOCTOR.CLINIC_NOTES_PLACEHOLDER)}
                    error={errors.notes?.message}
                    {...register('notes')}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-carbon/10">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t(DOCTOR.CREATING) : t(DOCTOR.CREATE_DOCTOR)}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
              >
                {t(DOCTOR.CANCEL)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
