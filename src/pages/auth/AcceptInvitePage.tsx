import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAcceptInvitation } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Button, Input, Card, CardContent, LanguageSwitcher } from '@/components/ui';
import { MdArrowBack, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, AUTH, COMMON } from '@/i18n';

function createAcceptInviteSchema(t: (key: string) => string) {
  return z
    .object({
      first_name: z.string().min(1, t(AUTH.FIRST_NAME_REQUIRED)),
      last_name: z.string().min(1, t(AUTH.LAST_NAME_REQUIRED)),
      password: z
        .string()
        .min(8, t(AUTH.PASSWORD_MIN_LENGTH))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t(AUTH.PASSWORD_COMPLEXITY_SHORT),
        ),
      confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: t(AUTH.PASSWORDS_DONT_MATCH),
      path: ['confirm_password'],
    });
}

type AcceptInviteFormData = z.infer<ReturnType<typeof createAcceptInviteSchema>>;

export const AcceptInvitePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const acceptMutation = useAcceptInvitation();
  const { login } = useAuthStore();
  const { success: showSuccess, error: showError } = useToastStore();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const schema = useMemo(() => createAcceptInviteSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(schema),
  });

  // If no token or email, show invalid invite message
  if (!token || !email) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/landing.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-azure-dragon/85 via-azure-dragon/75 to-azure-dragon/85"></div>
        </div>
        <div className="relative z-10 w-full max-w-[400px]">
          <Card className="w-full shadow-2xl border-0 rounded-xl" variant="elevated">
            <CardContent className="p-7 md:p-8 text-center">
              <h2 className="text-lg font-heading font-semibold text-carbon mb-2">
                {t(AUTH.INVITE_INVALID)}
              </h2>
              <p className="text-sm text-carbon/60 mb-6">
                {t(AUTH.INVITE_EXPIRED)}
              </p>
              <Button variant="primary" size="md" onClick={() => navigate('/login')}>
                {t(COMMON.BACK_TO_LOGIN)}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: AcceptInviteFormData) => {
    try {
      const result = await acceptMutation.mutateAsync({
        token,
        email: decodeURIComponent(email),
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });

      // Server returns JWT — log user in immediately
      const accessToken = result.access_token;
      localStorage.setItem('access_token', accessToken);

      login(
        {
          user_id: result.user.id,
          email: result.user.email,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          username: result.user.email,
          full_name: `${result.user.first_name} ${result.user.last_name}`,
        } as never, // minimal user; /auth/me will hydrate fully
        accessToken,
        '', // no refresh token from this endpoint
      );

      showSuccess(t(AUTH.INVITE_ACCEPTED));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(AUTH.INVITE_ACCEPT_FAILED);
      showError(errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/landing.jpg)' }}
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
            {t(AUTH.ACCEPT_INVITE_SUBTITLE)}
          </p>
        </div>

        {/* Accept Invite Card */}
        <Card className="w-full shadow-2xl border-0 rounded-xl" variant="elevated">
          <CardContent className="p-7 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="mb-2">
                <p className="text-sm text-carbon/70 font-ui leading-relaxed">
                  {t(AUTH.ACCEPT_INVITE_INSTRUCTIONS)}
                </p>
                <p className="text-sm font-medium text-carbon mt-2">{decodeURIComponent(email)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t(AUTH.FIRST_NAME)}
                  error={errors.first_name?.message}
                  autoComplete="given-name"
                  {...register('first_name')}
                />
                <Input
                  label={t(AUTH.LAST_NAME)}
                  error={errors.last_name?.message}
                  autoComplete="family-name"
                  {...register('last_name')}
                />
              </div>

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  {t(AUTH.PASSWORD)}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t(AUTH.NEW_PASSWORD_PLACEHOLDER)}
                    autoComplete="new-password"
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 pr-10 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 focus-visible:border-azure-dragon/60"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon/40 hover:text-carbon transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? t(AUTH.HIDE_PASSWORD) : t(AUTH.SHOW_PASSWORD)}
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-5 w-5" />
                    ) : (
                      <MdVisibility className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.password.message}</p>
                )}
                <p className="text-xs text-carbon/50 mt-1.5">
                  {t(AUTH.PASSWORD_HELPER)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  {t(AUTH.CONFIRM_PASSWORD)}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t(AUTH.CONFIRM_PASSWORD_PLACEHOLDER)}
                    autoComplete="new-password"
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 pr-10 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 focus-visible:border-azure-dragon/60"
                    {...register('confirm_password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-carbon/40 hover:text-carbon transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? t(AUTH.HIDE_PASSWORD) : t(AUTH.SHOW_PASSWORD)}
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
                isLoading={acceptMutation.isPending}
                disabled={acceptMutation.isPending}
              >
                {t(AUTH.ACCEPT_AND_JOIN)}
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
            {t(COMMON.BACK_TO_LOGIN)}
          </button>
        </div>
      </div>
    </div>
  );
};
