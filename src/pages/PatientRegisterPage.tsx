import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatientSelfRegistration } from '@/hooks/usePatients';
import { useClinics } from '@/hooks/useClinics';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Select, Loading } from '@/components/ui';
import { MdPerson, MdArrowBack } from 'react-icons/md';

const registerSchema = z.object({
  clinic_id: z.string().min(1, 'Clinic is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const PatientRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const registerMutation = usePatientSelfRegistration();
  const { success: showSuccess, error: showError } = useToastStore();
  
  // Get clinic_id from URL params if provided
  const clinicIdFromUrl = searchParams.get('clinic_id');
  
  // Fetch active clinics for selection
  const { data: clinicsData, isLoading: clinicsLoading } = useClinics({ 
    limit: 100, 
    is_active: true 
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      clinic_id: clinicIdFromUrl || '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);

    try {
      await registerMutation.mutateAsync({
        clinic_id: data.clinic_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.username,
        password: data.password,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
      });

      reset();
      showSuccess('Registration successful! You can now log in with your credentials.');
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  if (clinicsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/landing.jpg)',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-azure-dragon/85 via-azure-dragon/75 to-azure-dragon/85"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <Card variant="elevated" className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdPerson className="h-6 w-6 text-azure-dragon" />
            Patient Self-Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Clinic Selection */}
            <Controller
              name="clinic_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Select Clinic"
                  error={errors.clinic_id?.message}
                  required
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

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-carbon">Personal Information</h3>
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
                  required
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
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-carbon">Account Information</h3>
              <div className="space-y-4">
                <Input
                  label="Username"
                  placeholder="Choose a username"
                  error={errors.username?.message}
                  required
                  {...register('username')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a password (min. 8 characters)"
                  error={errors.password?.message}
                  required
                  {...register('password')}
                />
                <p className="text-xs text-carbon/50">
                  Password must be at least 8 characters long.
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={registerMutation.isPending}
                className="w-full"
              >
                {registerMutation.isPending ? 'Registering...' : 'Register'}
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-carbon/60">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-azure-dragon hover:underline font-medium"
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Back to Home Link */}
      <div className="mt-6 text-center">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
        >
          <MdArrowBack className="h-4 w-4" />
          Back to Home
        </button>
      </div>
      </div>
    </div>
  );
};
