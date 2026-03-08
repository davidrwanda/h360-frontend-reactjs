import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateSystemAdmin } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdPerson } from 'react-icons/md';
import type { SystemAdmin } from '@/types/organization';
import { useTranslation, USERS } from '@/i18n';

interface EditSystemAdminFormData {
  name: string;
  email: string;
}

interface EditSystemAdminFormProps {
  admin: SystemAdmin;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditSystemAdminForm = ({
  admin,
  onSuccess,
  onCancel,
}: EditSystemAdminFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateSystemAdmin();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

  const editSystemAdminSchema = useMemo(() => z.object({
    name: z.string().min(1, t(USERS.FIRST_NAME_REQUIRED)),
    email: z.string().email(t(USERS.EMAIL_INVALID)).min(1, t(USERS.EMAIL_REQUIRED)),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditSystemAdminFormData>({
    resolver: zodResolver(editSystemAdminSchema),
  });

  useEffect(() => {
    if (admin) {
      reset({
        name: admin.name || '',
        email: admin.email,
      });
    }
  }, [admin, reset]);

  const onSubmit = async (data: EditSystemAdminFormData) => {
    setError(null);

    try {
      // ISD §7.6 PATCH: only name, password, is_active accepted
      await updateMutation.mutateAsync({
        id: admin.id,
        data: { name: data.name },
      });

      showSuccess(t(USERS.SYSTEM_ADMIN_UPDATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(USERS.FAILED_UPDATE_SYSTEM_ADMIN);
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
            {t(USERS.EDIT_SYSTEM_ADMIN)}
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
                label={t(USERS.TH_NAME)}
                placeholder={t(USERS.ENTER_FIRST_NAME)}
                error={errors.name?.message}
                required
                className="md:col-span-2"
                {...register('name')}
              />

              <Input
                label={t(USERS.EMAIL)}
                type="email"
                placeholder={t(USERS.ENTER_EMAIL)}
                error={errors.email?.message}
                required
                disabled
                className="md:col-span-2"
                {...register('email')}
              />
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? t(USERS.UPDATING) : t(USERS.UPDATE_SYSTEM_ADMIN)}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={updateMutation.isPending}
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
