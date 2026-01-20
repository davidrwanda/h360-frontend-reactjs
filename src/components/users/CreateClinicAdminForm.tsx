import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateUser } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdPerson, MdRefresh, MdVisibility, MdVisibilityOff } from 'react-icons/md';

const createClinicAdminSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type CreateClinicAdminFormData = z.infer<typeof createClinicAdminSchema>;

interface CreateClinicAdminFormProps {
  clinicId: string;
  clinicName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Generate a secure random password
const generatePassword = (): string => {
  const length = 12;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = lowercase + uppercase + numbers + special;

  // Helper to get random character from string
  const getRandomChar = (str: string): string => {
    return str[Math.floor(Math.random() * str.length)] || '';
  };

  // Ensure at least one character from each required set
  let password = 
    getRandomChar(lowercase) +
    getRandomChar(uppercase) +
    getRandomChar(numbers) +
    getRandomChar(special);

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += getRandomChar(allChars);
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

export const CreateClinicAdminForm = ({
  clinicId,
  clinicName,
  onSuccess,
  onCancel,
}: CreateClinicAdminFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const createMutation = useCreateUser();
  const { success: showSuccess, error: showError } = useToastStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateClinicAdminFormData>({
    resolver: zodResolver(createClinicAdminSchema),
  });

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setValue('password', newPassword, { shouldValidate: true });
    setValue('confirm_password', newPassword, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateClinicAdminFormData) => {
    setError(null);

    try {
      await createMutation.mutateAsync({
        clinic_id: clinicId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        username: data.username,
        password: data.password,
        role: 'MANAGER', // Clinic admins are Managers
      });

      reset();
      showSuccess('User created successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user. Please try again.';
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
            User Information
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
                label="Username"
                placeholder="Enter username"
                error={errors.username?.message}
                required
                {...register('username')}
              />

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  Password<span className="text-smudged-lips ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className={`flex h-10 w-full rounded-md border bg-white pl-3.5 pr-24 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 ${
                      errors.password
                        ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
                        : 'border-carbon/15 focus-visible:border-azure-dragon/60'
                    }`}
                    {...register('password')}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="p-1.5 rounded-md hover:bg-white-smoke transition-colors text-azure-dragon hover:text-azure-dragon-dark"
                      title="Generate secure password"
                      aria-label="Generate password"
                    >
                      <MdRefresh className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-md hover:bg-white-smoke transition-colors text-carbon/60 hover:text-carbon"
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <MdVisibilityOff className="h-4 w-4" />
                      ) : (
                        <MdVisibility className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  Confirm Password<span className="text-smudged-lips ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className={`flex h-10 w-full rounded-md border bg-white pl-3.5 pr-12 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 ${
                      errors.confirm_password
                        ? 'border-smudged-lips/40 focus-visible:border-smudged-lips focus-visible:ring-smudged-lips/30'
                        : 'border-carbon/15 focus-visible:border-azure-dragon/60'
                    }`}
                    {...register('confirm_password')}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 rounded-md hover:bg-white-smoke transition-colors text-carbon/60 hover:text-carbon"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <MdVisibilityOff className="h-4 w-4" />
                      ) : (
                        <MdVisibility className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Creating...' : 'Create User'}
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
