import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useForgotPassword } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent, LanguageSwitcher } from '@/components/ui';
import { MdArrowBack, MdEmail } from 'react-icons/md';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, AUTH, COMMON } from '@/i18n';

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotSchema>>;

function createForgotSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t(AUTH.INVALID_EMAIL)),
  });
}

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');
  const forgotPasswordMutation = useForgotPassword();
  const { success: showSuccess, error: showError } = useToastStore();

  const forgotPasswordSchema = useMemo(() => createForgotSchema(t), [t]);

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
      showSuccess(t(AUTH.OTP_SENT_MESSAGE));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(AUTH.SEND_FAILED);
      showError(errorMessage);
    }
  };

  const handleResendOTP = async () => {
    if (emailSent) {
      try {
        await forgotPasswordMutation.mutateAsync(emailSent);
        showSuccess(t(AUTH.OTP_RESENT));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : t(AUTH.RESEND_FAILED);
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
        <div className="absolute inset-0 bg-gradient-to-br from-azure-dragon/85 via-azure-dragon/75 to-azure-dragon/85"></div>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher variant="light" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo/Brand */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-heading font-semibold text-white mb-1.5 tracking-tight">
            {t(COMMON.APP_NAME)}
          </h1>
          <p className="text-xs text-white/75 font-ui font-normal">
            {t(AUTH.RESET_YOUR_PASSWORD)}
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
                    {t(AUTH.CHECK_YOUR_EMAIL)}
                  </h2>
                  <p className="text-sm text-carbon/70 font-ui leading-relaxed">
                    {t(AUTH.OTP_SENT_MESSAGE)}
                  </p>
                  <p className="text-xs text-carbon/60 font-ui mt-3">
                    {t(AUTH.OTP_EXPIRES)}
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => navigate(`/reset-password?email=${encodeURIComponent(emailSent)}`)}
                  >
                    {t(AUTH.ENTER_OTP_CODE)}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={() => navigate('/login')}
                    >
                      {t(COMMON.BACK_TO_LOGIN)}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="flex-1"
                      onClick={handleResendOTP}
                      disabled={forgotPasswordMutation.isPending}
                    >
                      {forgotPasswordMutation.isPending ? t(AUTH.SENDING) : t(AUTH.RESEND_OTP)}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="mb-2">
                  <p className="text-sm text-carbon/70 font-ui leading-relaxed">
                    {t(AUTH.FORGOT_INSTRUCTIONS)}
                  </p>
                </div>

                <div>
                  <Input
                    label={t(AUTH.EMAIL_ADDRESS)}
                    type="email"
                    placeholder={t(AUTH.EMAIL_PLACEHOLDER)}
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
                  {t(AUTH.SEND_RESET_CODE)}
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
            {t(COMMON.BACK_TO_LOGIN)}
          </button>
        </div>
      </div>
    </div>
  );
};
