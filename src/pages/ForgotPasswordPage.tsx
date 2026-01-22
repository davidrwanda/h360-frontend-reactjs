import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useForgotPassword } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { MdArrowBack, MdEmail } from 'react-icons/md';
import { useToastStore } from '@/store/toastStore';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');
  const forgotPasswordMutation = useForgotPassword();
  const { success: showSuccess, error: showError } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data.email);
      setEmailSent(data.email);
      setSuccess(true);
      showSuccess('If an account with this email exists, a password reset OTP has been sent to your email.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      showError(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    if (emailSent) {
      try {
        await forgotPasswordMutation.mutateAsync(emailSent);
        showSuccess('A new OTP code has been sent to your email.');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to resend OTP. Please try again.';
        showError(errorMessage);
      }
    } else {
      setSuccess(false);
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

        {/* Forgot Password Card */}
        <Card className="w-full shadow-2xl border-0 rounded-xl" variant="elevated">
          <CardContent className="p-7 md:p-8">
            {success ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-bright-halo/20 rounded-full flex items-center justify-center mb-4">
                    <MdEmail className="h-8 w-8 text-azure-dragon" />
                  </div>
                  <h2 className="text-lg font-heading font-semibold text-carbon mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-sm text-carbon/70 font-ui leading-relaxed">
                    If an account with this email exists, a password reset OTP has been sent to your email.
                  </p>
                  <p className="text-xs text-carbon/60 font-ui mt-3">
                    The OTP code expires in 15 minutes.
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => navigate(`/reset-password?email=${encodeURIComponent(emailSent)}`)}
                  >
                    Enter OTP Code
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => navigate('/login')}
                    >
                      Back to Login
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={handleResendOTP}
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? 'Sending...' : 'Resend OTP'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="mb-2">
                  <p className="text-sm text-carbon/70 font-ui leading-relaxed">
                    Enter your email address and we'll send you a 6-digit OTP code to reset your password.
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

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-5 h-11 text-sm font-medium"
                  isLoading={forgotPasswordMutation.isPending}
                  disabled={forgotPasswordMutation.isPending}
                >
                  Send Reset Code
                </Button>
              </form>
            )}
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
