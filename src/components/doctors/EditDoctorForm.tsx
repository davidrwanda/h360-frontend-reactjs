import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateDoctor } from '@/hooks/useDoctors';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { DoctorSpecialtyInput } from './DoctorSpecialtyInput';
import { MdLocalHospital } from 'react-icons/md';
import type { Doctor } from '@/api/doctors';
import { useTranslation, DOCTOR } from '@/i18n';

interface EditDoctorFormData {
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
  doctor_number?: string;
  bio?: string;
  profile_image_url?: string;
}

interface EditDoctorFormProps {
  doctor: Doctor;
  isSelfEdit?: boolean; // True when doctor is editing their own profile (reserved for future use)
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditDoctorForm = ({
  doctor,
  isSelfEdit: _isSelfEdit = false,
  onSuccess,
  onCancel,
}: EditDoctorFormProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateDoctor();
  const { success: showSuccess, error: showError } = useToastStore();

  const editDoctorSchema = useMemo(() => z.object({
    first_name: z.string().min(1, t(DOCTOR.FIRST_NAME_REQUIRED)),
    last_name: z.string().min(1, t(DOCTOR.LAST_NAME_REQUIRED)),
    date_of_birth: z.string().optional(),
    gender: z.enum(['M', 'F', 'Other']).optional(),
    email: z.string().email(t(DOCTOR.INVALID_EMAIL)).optional().or(z.literal('')),
    phone: z.string().optional(),
    alternate_phone: z.string().optional().or(z.literal('')),
    specialty: z.string().optional().or(z.literal('')),
    specialty_ids: z.array(z.string()).optional(),
    license_number: z.string().optional(),
    license_expiry_date: z.string().optional(),
    medical_school: z.string().optional(),
    years_of_experience: z.number().min(0).optional(),
    qualifications: z.string().optional(),
    doctor_number: z.string().optional(),
    bio: z.string().optional(),
    profile_image_url: z.string().url(t(DOCTOR.INVALID_URL)).optional().or(z.literal('')),
    // Note: Clinic-specific fields (appointment_duration_minutes, max_daily_patients,
    // accepts_new_patients, consultation_fee, notes) must be updated via relationship endpoints
  }), [t]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EditDoctorFormData>({
    resolver: zodResolver(editDoctorSchema),
  });

  useEffect(() => {
    if (doctor) {
      reset({
        first_name: doctor.first_name,
        last_name: doctor.last_name,
        date_of_birth: doctor.date_of_birth || '',
        gender: doctor.gender,
        email: doctor.email || '',
        phone: doctor.phone || '',
        alternate_phone: doctor.alternate_phone || '',
        specialty: doctor.specialty || '',
        specialty_ids: doctor.specialty_ids ?? [],
        license_number: doctor.license_number || '',
        license_expiry_date: doctor.license_expiry_date || '',
        medical_school: doctor.medical_school || '',
        years_of_experience: doctor.years_of_experience,
        qualifications: doctor.qualifications || '',
        doctor_number: doctor.doctor_number || '',
        bio: doctor.bio || '',
        profile_image_url: doctor.profile_image_url || '',
        // Note: Clinic-specific fields are not included as they must be updated via relationship endpoints
      });
    }
  }, [doctor, reset]);

  const onSubmit = async (data: EditDoctorFormData) => {
    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: doctor.doctor_id,
        data: {
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
          years_of_experience: data.years_of_experience,
          qualifications: data.qualifications || undefined,
          doctor_number: data.doctor_number || undefined,
          bio: data.bio || undefined,
          profile_image_url: data.profile_image_url || undefined,
          // Note: Clinic-specific fields are not included as they must be updated via relationship endpoints
        },
      });

      showSuccess(t(DOCTOR.UPDATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(DOCTOR.UPDATE_FAILED);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdLocalHospital className="h-5 w-5 text-azure-dragon" />
            {t(DOCTOR.EDIT_DOCTOR)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

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
              label={t(DOCTOR.DOCTOR_NUMBER)}
              placeholder={t(DOCTOR.DOCTOR_NUMBER_PLACEHOLDER)}
              error={errors.doctor_number?.message}
              readOnly
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

            <div className="md:col-span-2 rounded-md bg-azure-dragon/5 border border-azure-dragon/20 p-4">
              <p className="text-xs text-carbon/70">
                <strong>{t(DOCTOR.NOTES)}:</strong> {t(DOCTOR.CLINIC_FIELDS_NOTE)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-carbon/10">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t(DOCTOR.UPDATING) : t(DOCTOR.UPDATE_DOCTOR)}
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
