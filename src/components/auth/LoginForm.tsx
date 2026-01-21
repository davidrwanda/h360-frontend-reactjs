import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please check your credentials.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full shadow-2xl border-0 rounded-xl" variant="elevated">
          <CardContent className="p-7 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {error && (
                <div className="rounded-md bg-smudged-lips/8 border border-smudged-lips/25 px-3.5 py-2.5 mb-3">
                  <p className="text-xs text-smudged-lips font-ui leading-relaxed">{error}</p>
                </div>
              )}

              <div>
                <Input
                  label="Username or Email"
                  type="text"
                  placeholder="Enter your username or email"
                  error={errors.username?.message}
                  helperText="Username can contain letters, numbers, underscores, @, dots, and plus signs"
                  autoComplete="username"
                  {...register('username')}
                />
              </div>

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="flex h-10 w-full rounded-md border border-carbon/15 bg-white px-3.5 pr-10 py-2.5 text-sm font-ui text-carbon transition-all duration-150 placeholder:text-carbon/35 placeholder:text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-azure-dragon/30 focus-visible:ring-offset-0 focus-visible:border-azure-dragon/60"
                    {...register('password')}
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
                {errors.password && (
                  <p className="mt-1.5 text-xs text-smudged-lips font-ui">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-5 h-11 text-sm font-medium"
                isLoading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-5 pt-5 border-t border-carbon/8">
              <p className="text-[11px] text-center text-carbon/45 font-ui leading-relaxed">
                Use your employee credentials or system user credentials to sign in
              </p>
            </div>
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
