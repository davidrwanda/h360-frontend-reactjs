import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateUser } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdPerson } from 'react-icons/md';
import type { User } from '@/api/users';
import { useTranslation, USERS } from '@/i18n';

interface EditClinicAdminFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'Other';
  role: 'MANAGER' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'Operator';
}

interface EditClinicAdminFormProps {
  adminId: string;
  admin: User;
  clinicName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditClinicAdminForm = ({
  adminId,
  admin,
  clinicName,
  onSuccess,
  onCancel,
}: EditClinicAdminFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateUser();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

  const editClinicAdminSchema = useMemo(() => z.object({
    first_name: z.string().min(1, t(USERS.FIRST_NAME_REQUIRED)),
    last_name: z.string().min(1, t(USERS.LAST_NAME_REQUIRED)),
    email: z.string().email(t(USERS.EMAIL_INVALID)).min(1, t(USERS.EMAIL_REQUIRED)),
    phone: z.string().min(1, t(USERS.PHONE_REQUIRED)),
    date_of_birth: z.string().min(1, t(USERS.DATE_OF_BIRTH_REQUIRED)),
    gender: z.enum(['M', 'F', 'Other'], { required_error: t(USERS.GENDER_REQUIRED) }),
    role: z.enum(['MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'Operator'], {
      required_error: t(USERS.ROLE_REQUIRED),
    }),
  }), [t]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<EditClinicAdminFormData>({
    resolver: zodResolver(editClinicAdminSchema),
  });

  // Check if user is a Doctor (role cannot be changed)
  const isDoctor = admin?.role?.toUpperCase() === 'DOCTOR';

  // Normalize role to match schema format
  const normalizeRole = (role?: string): 'MANAGER' | 'DOCTOR' | 'NURSE' | 'RECEPTIONIST' | 'Operator' | undefined => {
    if (!role) return undefined;
    const upperRole = role.toUpperCase();
    if (upperRole === 'OPERATOR') return 'Operator';
    if (upperRole === 'MANAGER') return 'MANAGER';
    if (upperRole === 'DOCTOR') return 'DOCTOR';
    if (upperRole === 'NURSE') return 'NURSE';
    if (upperRole === 'RECEPTIONIST') return 'RECEPTIONIST';
    return undefined;
  };

  // Update form when admin data loads
  useEffect(() => {
    if (admin) {
      const normalizedRole = normalizeRole(admin.role);
      reset({
        first_name: admin.first_name || '',
        last_name: admin.last_name || '',
        email: admin.email || '',
        phone: admin.phone || '',
        date_of_birth: admin.date_of_birth || '',
        gender: (admin.gender as 'M' | 'F' | 'Other') || 'M',
        role: normalizedRole || 'MANAGER',
      });
    }
  }, [admin, reset]);

  const onSubmit = async (data: EditClinicAdminFormData) => {
    setError(null);

    try {
      await updateMutation.mutateAsync({
        id: adminId,
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          role: data.role,
        },
      });

      showSuccess(t(USERS.USER_UPDATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(USERS.FAILED_UPDATE_USER);
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
            {t(USERS.EDIT_USER)}
            {clinicName && (
              <span className="text-sm font-normal text-carbon/60 ml-2">
                {t(USERS.FOR_CLINIC, { clinicName })}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-carbon mb-4">{t(USERS.BASIC_INFORMATION)}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label={t(USERS.FIRST_NAME)}
                  required={true}
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />

                <Input
                  label={t(USERS.LAST_NAME)}
                  required={true}
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />

                <Input
                  label={t(USERS.EMAIL)}
                  type="email"
                  required={true}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label={t(USERS.PHONE)}
                  type="tel"
                  required={true}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-carbon/80 mb-1">
                        {t(USERS.GENDER)} <span className="text-smudged-lips ml-0.5">*</span>
                      </label>
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon"
                      >
                        <option value="">{t(USERS.SELECT_GENDER)}</option>
                        <option value="M">{t(USERS.MALE)}</option>
                        <option value="F">{t(USERS.FEMALE)}</option>
                        <option value="Other">{t(USERS.OTHER)}</option>
                      </select>
                      {errors.gender && (
                        <p className="text-xs text-smudged-lips mt-1">{errors.gender.message}</p>
                      )}
                    </div>
                  )}
                />

                <Input
                  label={t(USERS.DATE_OF_BIRTH)}
                  type="date"
                  required={true}
                  error={errors.date_of_birth?.message}
                  {...register('date_of_birth')}
                />

                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-carbon/80 mb-1">
                        {t(USERS.ROLE)} <span className="text-smudged-lips ml-0.5">*</span>
                      </label>
                      <select
                        {...field}
                        disabled={isDoctor}
                        className={`w-full px-3 py-2 border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon ${
                          isDoctor ? 'bg-carbon/5 text-carbon/50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDoctor ? (
                          <option value="DOCTOR">{t(USERS.DOCTOR)}</option>
                        ) : (
                          <>
                            <option value="">{t(USERS.SELECT_ROLE)}</option>
                            <option value="MANAGER">{t(USERS.MANAGER)}</option>
                            <option value="Operator">{t(USERS.OPERATOR)}</option>
                          </>
                        )}
                      </select>
                      {isDoctor && (
                        <p className="text-xs text-carbon/60 mt-1">
                          {t(USERS.DOCTOR_ROLE_CANNOT_CHANGE)}
                        </p>
                      )}
                      {errors.role && (
                        <p className="text-xs text-smudged-lips mt-1">{errors.role.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? t(USERS.UPDATING) : t(USERS.UPDATE_USER)}
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
