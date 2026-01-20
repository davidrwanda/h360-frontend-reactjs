import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useAuth';
import { Button, Input, Card, CardContent } from '@/components/ui';

const loginSchema = z.object({
  username: z.string().min(1, 'Username or email is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [error, setError] = useState<string | null>(null);
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-azure-dragon via-azure-dragon-dark to-azure-dragon p-4 md:p-6">
      <div className="w-full max-w-[400px]">
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
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  autoComplete="current-password"
                  {...register('password')}
                />
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
      </div>
    </div>
  );
};
