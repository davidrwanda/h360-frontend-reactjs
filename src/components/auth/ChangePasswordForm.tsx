import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useChangePassword } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useTranslation, AUTH } from '@/i18n';

function createChangePasswordSchema(t: (key: string) => string) {
  return z
    .object({
      current_password: z.string().min(1, t(AUTH.CURRENT_PASSWORD_REQUIRED)),
      new_password: z
        .string()
        .min(8, t(AUTH.PASSWORD_MIN_LENGTH))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          t(AUTH.PASSWORD_COMPLEXITY),
        ),
      confirm_password: z.string().min(1, t(AUTH.CONFIRM_PASSWORD_REQUIRED)),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t(AUTH.PASSWORDS_DONT_MATCH),
      path: ['confirm_password'],
    });
}

type ChangePasswordFormData = z.infer<ReturnType<typeof createChangePasswordSchema>>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export const ChangePasswordForm = ({ onSuccess }: ChangePasswordFormProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const changePasswordMutation = useChangePassword();

  const changePasswordSchema = useMemo(() => createChangePasswordSchema(t), [t]);

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
        setError(err.message || t(AUTH.PASSWORD_CHANGE_FAILED));
      } else {
        setError(t(AUTH.UNEXPECTED_ERROR));
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(AUTH.CHANGE_PASSWORD)}</CardTitle>
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
                {t(AUTH.PASSWORD_CHANGED)}
              </p>
            </div>
          )}

          <Input
            label={t(AUTH.CURRENT_PASSWORD)}
            type="password"
            placeholder={t(AUTH.CURRENT_PASSWORD_PLACEHOLDER)}
            error={errors.current_password?.message}
            autoComplete="current-password"
            {...register('current_password')}
          />

          <Input
            label={t(AUTH.NEW_PASSWORD)}
            type="password"
            placeholder={t(AUTH.NEW_PASSWORD_PLACEHOLDER)}
            error={errors.new_password?.message}
            autoComplete="new-password"
            helperText={t(AUTH.PASSWORD_HELPER)}
            {...register('new_password')}
          />

          <Input
            label={t(AUTH.CONFIRM_PASSWORD)}
            type="password"
            placeholder={t(AUTH.CONFIRM_PASSWORD_PLACEHOLDER)}
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
            {t(AUTH.CHANGE_PASSWORD)}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
