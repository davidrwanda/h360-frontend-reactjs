import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { MdArrowBack, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useToastStore } from '@/store/toastStore';

const resetPasswordSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    otp_code: z.string().length(6, 'OTP code must be 6 digits'),
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain uppercase, lowercase, and number'
      ),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const resetPasswordMutation = useResetPassword();
  const { success: showSuccess, error: showError } = useToastStore();

  const emailFromQuery = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: data.email,
        otp_code: data.otp_code,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      showSuccess('Password has been reset successfully. Please login with your new password.');
      // Navigation to login happens in the hook
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden">
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
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo/Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-heading font-semibold text-white mb-1.5 tracking-tight">
            H360 Clinic CRM
          </h1>
          <p className="text-xs text-white/75 font-ui font-normal">
            Reset your password
          </p>
        </div>

        {/* Reset Password Card */}
        <Card className="w-full shadow-2xl border-0 rounded-xl" variant="elevated">
          <CardContent className="p-7 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="mb-2">
                <p className="text-sm text-carbon/70 font-ui leading-relaxed">
                  Enter your email, the 6-digit OTP code sent to your email, and your new password.
                </p>
              </div>

              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  autoComplete="email"
                  {...register('email')}
                />
              </div>

              <div>
                <Input
                  label="OTP Code"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  error={errors.otp_code?.message}
                  maxLength={6}
                  {...register('otp_code')}
                />
                <p className="text-xs text-carbon/50 mt-1.5">
                  Check your email for the 6-digit code (expires in 15 minutes)
                </p>
              </div>

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 pr-10 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 focus-visible:border-azure-dragon/60"
                    {...register('new_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon/40 hover:text-carbon transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.new_password && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.new_password.message}</p>
                )}
                <p className="text-xs text-carbon/50 mt-1.5">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 pr-10 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 focus-visible:border-azure-dragon/60"
                    {...register('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon/40 hover:text-carbon transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.confirm_password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-5 h-11 text-sm font-medium"
                isLoading={resetPasswordMutation.isPending}
                disabled={resetPasswordMutation.isPending}
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
          >
            <MdArrowBack className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
