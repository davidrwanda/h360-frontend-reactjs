import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useCreateUser } from '@/hooks/useUsers';
import { useClinics } from '@/hooks/useClinics';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { DepartmentInput } from '@/components/departments';
import { MdArrowBack } from 'react-icons/md';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { USERS } from '@/i18n/keys/users.keys';

// Schema will be created dynamically based on whether user is SYSTEM ADMIN
const createBaseUserSchema = (isSystemAdmin: boolean, t: (key: string) => string) => z.object({
  first_name: z.string().min(1, t(USERS.FIRST_NAME_REQUIRED)),
  last_name: z.string().min(1, t(USERS.LAST_NAME_REQUIRED)),
  email: z.string().email(t(USERS.EMAIL_INVALID)).min(1, t(USERS.EMAIL_REQUIRED)),
  username: z.string().min(3, t(USERS.USERNAME_MIN_LENGTH)),
  phone: z.string().min(1, t(USERS.PHONE_REQUIRED)),
  date_of_birth: z.string().min(1, t(USERS.DATE_OF_BIRTH_REQUIRED)),
  gender: z.enum(['M', 'F', 'Other'], { required_error: t(USERS.GENDER_REQUIRED) }),
  role: z.enum(['Operator', 'Manager'], {
    required_error: t(USERS.ROLE_REQUIRED)
  }).default('Operator'),
  clinic_id: z.string().optional(),
  // Employment fields are optional for SYSTEM ADMIN, required for others
  department: isSystemAdmin ? z.string().optional() : z.string().min(1, t(USERS.DEPARTMENT_REQUIRED)),
  position: isSystemAdmin ? z.string().optional() : z.string().min(1, t(USERS.POSITION_REQUIRED)),
  hire_date: isSystemAdmin ? z.string().optional() : z.string().min(1, t(USERS.HIRE_DATE_REQUIRED)),
}).refine((data) => {
  // Clinic ID is required for Manager role
  if (data.role === 'Manager' && !data.clinic_id) {
    return false;
  }
  return true;
}, {
  message: t(USERS.CLINIC_REQUIRED_FOR_MANAGER),
  path: ['clinic_id'],
});

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const createUserMutation = useCreateUser();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();

  // Check if current user is SYSTEM ADMIN
  const isSystemAdmin = user?.user_type === 'SYSTEM' || role === 'ADMIN' || user?.permissions === 'ALL';

  // SYSTEM users should not create clinic-level users — redirect to users page
  // They manage organizations and assign owners, not clinic staff
  const isSystemUser = user?.user_type === 'SYSTEM';
  useEffect(() => {
    if (isSystemUser) {
      navigate('/users', { replace: true });
    }
  }, [isSystemUser, navigate]);

  // Fetch active clinics for selection
  const { data: clinicsData } = useClinics({
    is_active: true,
    limit: 100,
  });

  const clinics = useMemo(() => clinicsData?.data || [], [clinicsData]);

  // Get clinic_id from storage (fallback to user object)
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      // Try to get from localStorage directly (Zustand persist)
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch (error) {
      console.warn('Failed to get clinic_id from localStorage:', error);
    }

    // Fallback to user object from auth hook
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  // Create schema based on whether user is SYSTEM ADMIN
  const userSchema = useMemo(() => createBaseUserSchema(isSystemAdmin, t), [isSystemAdmin, t]);
  type CreateUserFormData = z.infer<typeof userSchema>;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'Operator',
    },
  });

  const selectedRole = watch('role');

  // Trigger clinic_id validation when role changes
  useEffect(() => {
    if (selectedRole === 'Manager') {
      trigger('clinic_id');
    }
  }, [selectedRole, trigger]);

  const onSubmit = async (data: CreateUserFormData) => {
    setError(null);

    try {
      // Use selected clinic_id if provided, otherwise fall back to storage (for Operator role)
      const clinicId = data.clinic_id || (selectedRole === 'Operator' ? getClinicIdFromStorage() : undefined);
      
      const userData = {
        ...data,
        clinic_id: clinicId,
        password: 'TempPass123!', // Temporary password that user will change later
      };

      // For SYSTEM ADMIN, employment fields are optional - only include if provided
      if (isSystemAdmin) {
        if (!data.department) delete userData.department;
        if (!data.position) delete userData.position;
        if (!data.hire_date) delete userData.hire_date;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createUserMutation.mutateAsync(userData as any);
      showSuccess(t(USERS.USER_CREATED_SUCCESS));
      navigate('/users');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(USERS.FAILED_CREATE_USER);
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/users')}
            className="p-2"
          >
            <MdArrowBack className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-h1 text-carbon font-heading font-semibold">
              {t(USERS.CREATE_NEW_USER)}
            </h1>
            <p className="text-body text-carbon/60 font-ui">
              {t(USERS.ADD_NEW_USER_DESC)}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t(USERS.BASIC_INFORMATION)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label={t(USERS.FIRST_NAME)}
                    required={true}
                    error={errors.first_name?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('first_name')}
                  />

                  <Input
                    label={t(USERS.LAST_NAME)}
                    required={true}
                    error={errors.last_name?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('last_name')}
                  />

                  <Input
                    label={t(USERS.EMAIL)}
                    type="email"
                    required={true}
                    error={errors.email?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('email')}
                  />

                  <Input
                    label={t(USERS.USERNAME)}
                    required={true}
                    error={errors.username?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('username')}
                  />

                  <Input
                    label={t(USERS.PHONE)}
                    type="tel"
                    required={true}
                    error={errors.phone?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('phone')}
                  />

                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className={cn("block font-medium text-carbon/80 mb-1", isSystemAdmin ? "text-xs" : "text-sm")}>
                          {t(USERS.GENDER)} <span className="text-smudged-lips ml-0.5">*</span>
                        </label>
                        <select
                          {...field}
                          className={cn(
                            "w-full border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon text-carbon bg-white",
                            isSystemAdmin ? "px-2 py-1.5 text-sm" : "px-3 py-2"
                          )}
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
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('date_of_birth')}
                  />

                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <label className={cn("block font-medium text-carbon/80 mb-1", isSystemAdmin ? "text-xs" : "text-sm")}>
                          {t(USERS.ROLE)} <span className="text-smudged-lips ml-0.5">*</span>
                        </label>
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Clear clinic_id when role changes to Operator
                            if (e.target.value === 'Operator') {
                              setValue('clinic_id', '');
                            }
                            // Trigger validation after role change
                            setTimeout(() => trigger('clinic_id'), 0);
                          }}
                          className={cn(
                            "w-full border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon text-carbon bg-white",
                            isSystemAdmin ? "px-2 py-1.5 text-sm" : "px-3 py-2"
                          )}
                        >
                          <option value="Operator">{t(USERS.OPERATOR)}</option>
                          <option value="Manager">{t(USERS.MANAGER)}</option>
                        </select>
                        {errors.role && (
                          <p className="text-xs text-smudged-lips mt-1">{errors.role.message}</p>
                        )}
                      </div>
                    )}
                  />

                  {(selectedRole === 'Manager' || isSystemAdmin) && (
                    <Controller
                      name="clinic_id"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <label className={cn("block font-medium text-carbon/80 mb-1", isSystemAdmin ? "text-xs" : "text-sm")}>
                            {t(USERS.CLINIC)} {selectedRole === 'Manager' && <span className="text-smudged-lips ml-0.5">*</span>}
                          </label>
                          <select
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              // Trigger validation when clinic changes
                              setTimeout(() => trigger('clinic_id'), 0);
                            }}
                            className={cn(
                              "w-full border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon text-carbon bg-white",
                              isSystemAdmin ? "px-2 py-1.5 text-sm" : "px-3 py-2"
                            )}
                          >
                            <option value="">{t(USERS.SELECT_CLINIC_FILTER)}</option>
                            {clinics.map((clinic) => (
                              <option key={clinic.clinic_id} value={clinic.clinic_id}>
                                {clinic.name}
                                {clinic.city ? ` - ${clinic.city}` : ''}
                              </option>
                            ))}
                          </select>
                          {errors.clinic_id && (
                            <p className="text-xs text-smudged-lips mt-1">{errors.clinic_id.message}</p>
                          )}
                        </div>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employment Information - Hidden for SYSTEM ADMIN */}
            {!isSystemAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t(USERS.EMPLOYMENT_INFORMATION)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <DepartmentInput
                      label={t(USERS.DEPARTMENT)}
                      required={true}
                      error={errors.department?.message}
                      value={watch('department') || ''}
                      onChange={(value) => setValue('department', value)}
                      onBlur={() => trigger('department')}
                    />

                    <Input
                      label={t(USERS.POSITION)}
                      required={true}
                      error={errors.position?.message}
                      {...register('position')}
                    />

                    <Input
                      label={t(USERS.HIRE_DATE)}
                      type="date"
                      required={true}
                      error={errors.hire_date?.message}
                      {...register('hire_date')}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t border-carbon/10">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? t(USERS.CREATING) : t(USERS.CREATE_USER)}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/users')}
            >
              {t(USERS.CANCEL)}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};