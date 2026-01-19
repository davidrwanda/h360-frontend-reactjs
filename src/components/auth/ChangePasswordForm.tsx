import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePassword } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setError(null);
    setSuccess(false);
    try {
      await changePasswordMutation.mutateAsync(data);
      setSuccess(true);
      reset();
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to change password. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-smudged-lips/10 border-2 border-smudged-lips p-3">
              <p className="text-body text-smudged-lips">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-bright-halo/20 border-2 border-bright-halo p-3">
              <p className="text-body text-azure-dragon">
                Password changed successfully!
              </p>
            </div>
          )}

          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            error={errors.current_password?.message}
            autoComplete="current-password"
            {...register('current_password')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            error={errors.new_password?.message}
            autoComplete="new-password"
            helperText="Must be at least 8 characters with uppercase, lowercase, and number"
            {...register('new_password')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            error={errors.confirm_password?.message}
            autoComplete="new-password"
            {...register('confirm_password')}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full"
            isLoading={changePasswordMutation.isPending}
            disabled={changePasswordMutation.isPending}
          >
            Change Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
