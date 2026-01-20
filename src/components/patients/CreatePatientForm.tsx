import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient } from '@/hooks/usePatients';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select } from '@/components/ui';
import { MdPerson, MdAccountCircle } from 'react-icons/md';

const createPatientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(['M', 'F', 'Other'], { required_error: 'Gender is required' }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  create_account: z.boolean().optional(),
});

type CreatePatientFormData = z.infer<typeof createPatientSchema>;

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
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreatePatient();
  const { success: showSuccess, error: showError } = useToastStore();

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
      showSuccess('Patient created successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create patient. Please try again.';
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
            Patient Information
            {clinicName && (
              <span className="text-sm font-normal text-carbon/60 ml-2">
                for {clinicName}
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
              <h3 className="text-sm font-medium text-carbon mb-3">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  error={errors.first_name?.message}
                  required
                  {...register('first_name')}
                />

                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  error={errors.last_name?.message}
                  required
                  {...register('last_name')}
                />

                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Phone"
                  type="tel"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                  {...register('phone')}
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
                      required
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
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-sm font-medium text-carbon mb-3">Address Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Address"
                  placeholder="Enter street address"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <Input
                  label="City"
                  placeholder="Enter city"
                  error={errors.city?.message}
                  {...register('city')}
                />

                <Input
                  label="State"
                  placeholder="Enter state"
                  error={errors.state?.message}
                  {...register('state')}
                />

                <Input
                  label="Postal Code"
                  placeholder="Enter postal code"
                  error={errors.postal_code?.message}
                  {...register('postal_code')}
                />

                <Input
                  label="Country"
                  placeholder="Enter country"
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-sm font-medium text-carbon mb-3">Emergency Contact</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Emergency Contact Name"
                  placeholder="Enter emergency contact name"
                  error={errors.emergency_contact_name?.message}
                  {...register('emergency_contact_name')}
                />

                <Input
                  label="Emergency Contact Phone"
                  type="tel"
                  placeholder="Enter emergency contact phone"
                  error={errors.emergency_contact_phone?.message}
                  {...register('emergency_contact_phone')}
                />

                <Input
                  label="Relationship"
                  placeholder="e.g., Spouse, Parent, etc."
                  error={errors.emergency_contact_relationship?.message}
                  {...register('emergency_contact_relationship')}
                />
              </div>
            </div>

            {/* Account Creation */}
            {formData.email && (
              <div>
                <h3 className="text-sm font-medium text-carbon mb-3">Account Options</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create_account"
                    {...register('create_account')}
                    className="h-4 w-4 rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                  />
                  <label htmlFor="create_account" className="text-sm text-carbon/70 flex items-center gap-2">
                    <MdAccountCircle className="h-4 w-4 text-azure-dragon" />
                    Create account for this patient (password will be sent via email)
                  </label>
                </div>
                <p className="text-xs text-carbon/50 mt-1 ml-6">
                  An account will be created with the email address as username. A secure password will be generated and sent via email.
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
                {createMutation.isPending ? 'Creating...' : 'Create Patient'}
              </Button>
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
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
