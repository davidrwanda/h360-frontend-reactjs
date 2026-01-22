import { useState } from 'react';
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

const createDoctorSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional(),
  gender: z.enum(['M', 'F', 'Other']).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(1, 'Phone number is required'),
  alternate_phone: z.string().optional(),
  specialty: z.string().optional(),
  sub_specialty: z.string().optional(),
  license_number: z.string().optional(),
  license_expiry_date: z.string().optional(),
  medical_school: z.string().optional(),
  years_of_experience: z.number().min(0).optional(),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  clinic_id: z.string().min(1, 'Clinic is required'),
  doctor_number: z.string().optional(),
  profile_image_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  // Clinic-specific fields
  hire_date: z.string().optional(),
  appointment_duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  max_daily_patients: z.number().min(1, 'Max daily patients must be at least 1').optional(),
  accepts_new_patients: z.boolean().optional(),
  consultation_fee: z.string().optional(),
  notes: z.string().optional(),
});

const subscribeDoctorSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic is required'),
  employment_status: z.enum(['active', 'inactive', 'on_leave']).optional(),
  hire_date: z.string().optional(),
  appointment_duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  max_daily_patients: z.number().min(1, 'Max daily patients must be at least 1').optional(),
  accepts_new_patients: z.boolean().optional(),
  consultation_fee: z.string().optional(),
  notes: z.string().optional(),
});

type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;
type SubscribeDoctorFormData = z.infer<typeof subscribeDoctorSchema>;

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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      clinic_id: clinicId || '',
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
      showError('Please enter at least 3 characters to search');
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
        showError('No doctor found with that email, phone, or code');
      }
    } catch (err) {
      setFoundDoctor(null);
      showError('Failed to search for doctor');
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
        phone: data.phone,
        alternate_phone: data.alternate_phone || undefined,
        specialty: data.specialty || undefined,
        sub_specialty: data.sub_specialty || undefined,
        license_number: data.license_number || undefined,
        license_expiry_date: data.license_expiry_date || undefined,
        medical_school: data.medical_school || undefined,
        years_of_experience: data.years_of_experience || undefined,
        qualifications: data.qualifications || undefined,
        bio: data.bio || undefined,
        doctor_number: data.doctor_number || undefined,
        profile_image_url: data.profile_image_url || undefined,
        // Clinic-specific fields nested in clinicData object
        clinicData: {
          clinic_id: data.clinic_id,
          clinic_ids: data.clinic_id ? [data.clinic_id] : undefined,
          employment_status: 'active',
          hire_date: data.hire_date || undefined,
          appointment_duration_minutes: data.appointment_duration_minutes || undefined,
          max_daily_patients: data.max_daily_patients || undefined,
          accepts_new_patients: data.accepts_new_patients,
          consultation_fee: data.consultation_fee || undefined,
          notes: data.notes || undefined,
        },
      });

      reset();
      showSuccess('Doctor created successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create doctor. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const onSubscribeSubmit = async (data: SubscribeDoctorFormData) => {
    if (!foundDoctor || !foundDoctor.doctor_number) {
      showError('Doctor code is required to subscribe');
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe doctor. Please try again.';
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
              Subscribe Existing Doctor
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
                  {foundDoctor.specialty && (
                    <p className="text-xs text-carbon/60 mt-1">Specialty: {foundDoctor.specialty}</p>
                  )}
                  {foundDoctor.doctor_number && (
                    <p className="text-xs text-carbon/60">Code: {foundDoctor.doctor_number}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs"
                >
                  Change
                </Button>
              </div>
            </div>

            <p className="text-xs text-carbon/60">
              This doctor already exists in the system. Please provide clinic-specific information below.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="clinic_id"
                control={controlSubscribe}
                render={({ field }) => (
                  <Select
                    label="Clinic"
                    error={subscribeErrors.clinic_id?.message}
                    required
                    disabled={!!clinicId}
                    options={[
                      { value: '', label: 'Select a clinic' },
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
                    label="Employment Status"
                    error={subscribeErrors.employment_status?.message}
                    options={[
                      { value: '', label: 'Select status' },
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'on_leave', label: 'On Leave' },
                    ]}
                    {...field}
                  />
                )}
              />

              <Input
                label="Hire Date"
                type="date"
                error={subscribeErrors.hire_date?.message}
                {...registerSubscribe('hire_date')}
              />

              <Input
                label="Appointment Duration (minutes)"
                type="number"
                placeholder="30"
                error={subscribeErrors.appointment_duration_minutes?.message}
                {...registerSubscribe('appointment_duration_minutes', { valueAsNumber: true })}
              />

              <Input
                label="Max Daily Patients"
                type="number"
                placeholder="20"
                error={subscribeErrors.max_daily_patients?.message}
                {...registerSubscribe('max_daily_patients', { valueAsNumber: true })}
              />

              <Input
                label="Consultation Fee"
                placeholder="e.g., $150.00"
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
                  <span className="text-sm text-carbon">Accepts New Patients</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <Input
                  label="Notes"
                  placeholder="Additional notes (optional)"
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
                {subscribeMutation.isPending ? 'Subscribing...' : 'Subscribe Doctor'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                >
                  Cancel
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
            Create New Doctor
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
              Search for Existing Doctor (Optional)
            </label>
            <p className="text-xs text-carbon/60 mb-3">
              Search by email, phone number, or doctor code to subscribe an existing doctor to this clinic
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Email, phone, or doctor code"
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
                {isSearchingDoctor ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-azure-dragon mb-4">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  placeholder="e.g., John"
                  error={errors.first_name?.message}
                  required
                  {...register('first_name')}
                />

                <Input
                  label="Last Name"
                  placeholder="e.g., Smith"
                  error={errors.last_name?.message}
                  required
                  {...register('last_name')}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="e.g., john.smith@clinic.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Phone"
                  placeholder="e.g., +250788475841"
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />

                <Input
                  label="Alternate Phone"
                  placeholder="e.g., +250788475842"
                  error={errors.alternate_phone?.message}
                  {...register('alternate_phone')}
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  error={errors.date_of_birth?.message}
                  {...register('date_of_birth')}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Gender"
                      error={errors.gender?.message}
                      options={[
                        { value: '', label: 'Select gender' },
                        { value: 'M', label: 'Male' },
                        { value: 'F', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="specialty"
                  control={control}
                  render={({ field }) => (
                    <DoctorSpecialtyInput
                      label="Specialty"
                      placeholder="Select or type a specialty"
                      value={field.value || ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors.specialty?.message}
                    />
                  )}
                />

                <Input
                  label="Sub-Specialty"
                  placeholder="e.g., Interventional Cardiology"
                  error={errors.sub_specialty?.message}
                  {...register('sub_specialty')}
                />

                <Input
                  label="License Number"
                  placeholder="e.g., MD-LIC-2024-001"
                  error={errors.license_number?.message}
                  {...register('license_number')}
                />

                <Input
                  label="License Expiry Date"
                  type="date"
                  error={errors.license_expiry_date?.message}
                  {...register('license_expiry_date')}
                />

                <Input
                  label="Medical School"
                  placeholder="e.g., Harvard Medical School"
                  error={errors.medical_school?.message}
                  {...register('medical_school')}
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  placeholder="15"
                  error={errors.years_of_experience?.message}
                  {...register('years_of_experience', { valueAsNumber: true })}
                />

                <Input
                  label="Qualifications"
                  placeholder="e.g., Board Certified"
                  error={errors.qualifications?.message}
                  {...register('qualifications')}
                />

                <Input
                  label="Doctor Number"
                  placeholder="e.g., H260D-001 (auto-generated if empty)"
                  error={errors.doctor_number?.message}
                  {...register('doctor_number')}
                />

                <Input
                  label="Profile Image URL"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  error={errors.profile_image_url?.message}
                  {...register('profile_image_url')}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Bio"
                    placeholder="Doctor biography"
                    error={errors.bio?.message}
                    {...register('bio')}
                  />
                </div>
              </div>
            </div>

            {/* Clinic Information Section */}
            <div className="pt-6 border-t border-carbon/10">
              <h3 className="text-sm font-semibold text-azure-dragon mb-4">Clinic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Controller
                  name="clinic_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Clinic"
                      error={errors.clinic_id?.message}
                      required
                      disabled={!!clinicId}
                      options={[
                        { value: '', label: 'Select a clinic' },
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
                  label="Hire Date"
                  type="date"
                  error={errors.hire_date?.message}
                  {...register('hire_date')}
                />

                <Input
                  label="Appointment Duration (minutes)"
                  type="number"
                  placeholder="30"
                  error={errors.appointment_duration_minutes?.message}
                  {...register('appointment_duration_minutes', { valueAsNumber: true })}
                />

                <Input
                  label="Max Daily Patients"
                  type="number"
                  placeholder="20"
                  error={errors.max_daily_patients?.message}
                  {...register('max_daily_patients', { valueAsNumber: true })}
                />

                <Input
                  label="Consultation Fee"
                  placeholder="e.g., $150.00"
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
                    <span className="text-sm text-carbon">Accepts New Patients</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Notes"
                    placeholder="Clinic-specific notes"
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
              {createMutation.isPending ? 'Creating...' : 'Create Doctor'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
