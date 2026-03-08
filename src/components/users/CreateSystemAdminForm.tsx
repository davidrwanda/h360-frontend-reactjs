import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSystemAdmin } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdPerson, MdRefresh, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useTranslation, USERS } from '@/i18n';

interface CreateSystemAdminFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface CreateSystemAdminFormProps {
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

export const CreateSystemAdminForm = ({
  onSuccess,
  onCancel,
}: CreateSystemAdminFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const createMutation = useCreateSystemAdmin();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

  const createSystemAdminSchema = useMemo(() => z.object({
    first_name: z.string().min(1, t(USERS.FIRST_NAME_REQUIRED)),
    last_name: z.string().min(1, t(USERS.LAST_NAME_REQUIRED)),
    email: z.string().email(t(USERS.EMAIL_INVALID)).min(1, t(USERS.EMAIL_REQUIRED)),
    password: z
      .string()
      .min(8, t(USERS.PASSWORD_MIN_LENGTH))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        t(USERS.PASSWORD_COMPLEXITY)
      ),
    confirm_password: z.string(),
  }).refine((data) => data.password === data.confirm_password, {
    message: t(USERS.PASSWORDS_DONT_MATCH),
    path: ['confirm_password'],
  }), [t]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CreateSystemAdminFormData>({
    resolver: zodResolver(createSystemAdminSchema),
  });

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setValue('password', newPassword, { shouldValidate: true });
    setValue('confirm_password', newPassword, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateSystemAdminFormData) => {
    setError(null);

    try {
      // ISD §7.6: only email, password, name are accepted
      await createMutation.mutateAsync({
        email: data.email,
        password: data.password,
        name: `${data.first_name} ${data.last_name}`.trim(),
      });

      reset();
      showSuccess(t(USERS.SYSTEM_ADMIN_CREATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(USERS.FAILED_CREATE_SYSTEM_ADMIN);
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
            {t(USERS.SYSTEM_ADMIN_INFORMATION)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label={t(USERS.FIRST_NAME)}
                placeholder={t(USERS.ENTER_FIRST_NAME)}
                error={errors.first_name?.message}
                required
                {...register('first_name')}
              />

              <Input
                label={t(USERS.LAST_NAME)}
                placeholder={t(USERS.ENTER_LAST_NAME)}
                error={errors.last_name?.message}
                required
                {...register('last_name')}
              />

              <Input
                label={t(USERS.EMAIL)}
                type="email"
                placeholder={t(USERS.ENTER_EMAIL)}
                error={errors.email?.message}
                required
                className="md:col-span-2"
                {...register('email')}
              />

              <div>
                <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
                  {t(USERS.PASSWORD)}<span className="text-smudged-lips ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t(USERS.ENTER_PASSWORD)}
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
                      title={t(USERS.GENERATE_PASSWORD)}
                      aria-label={t(USERS.GENERATE_PASSWORD)}
                    >
                      <MdRefresh className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1.5 rounded-md hover:bg-white-smoke transition-colors text-carbon/60 hover:text-carbon"
                      title={showPassword ? t(USERS.HIDE_PASSWORD) : t(USERS.SHOW_PASSWORD)}
                      aria-label={showPassword ? t(USERS.HIDE_PASSWORD) : t(USERS.SHOW_PASSWORD)}
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
                  {t(USERS.CONFIRM_PASSWORD)}<span className="text-smudged-lips ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t(USERS.CONFIRM_PASSWORD_PLACEHOLDER)}
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
                      title={showConfirmPassword ? t(USERS.HIDE_PASSWORD) : t(USERS.SHOW_PASSWORD)}
                      aria-label={showConfirmPassword ? t(USERS.HIDE_PASSWORD) : t(USERS.SHOW_PASSWORD)}
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
                {createMutation.isPending ? t(USERS.CREATING) : t(USERS.CREATE_SYSTEM_ADMIN)}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={createMutation.isPending}
                >
                  {t(USERS.CANCEL)}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
