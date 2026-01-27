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

// Schema will be created dynamically based on whether user is SYSTEM ADMIN
const createBaseUserSchema = (isSystemAdmin: boolean) => z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().min(1, 'Phone number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'Other'], { required_error: 'Gender is required' }),
  role: z.enum(['Operator', 'Manager'], {
    required_error: 'Role is required'
  }).default('Operator'),
  clinic_id: z.string().optional(),
  // Employment fields are optional for SYSTEM ADMIN, required for others
  department: isSystemAdmin ? z.string().optional() : z.string().min(1, 'Department is required'),
  position: isSystemAdmin ? z.string().optional() : z.string().min(1, 'Position is required'),
  hire_date: isSystemAdmin ? z.string().optional() : z.string().min(1, 'Hire date is required'),
}).refine((data) => {
  // Clinic ID is required for Manager role
  if (data.role === 'Manager' && !data.clinic_id) {
    return false;
  }
  return true;
}, {
  message: 'Clinic is required for Manager role',
  path: ['clinic_id'],
});

export const CreateUserPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const createUserMutation = useCreateUser();
  const { success: showSuccess, error: showError } = useToastStore();

  // Check if current user is SYSTEM ADMIN
  const isSystemAdmin = user?.user_type === 'SYSTEM' || role === 'ADMIN' || user?.permissions === 'ALL';

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
  const userSchema = useMemo(() => createBaseUserSchema(isSystemAdmin), [isSystemAdmin]);
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
      
      const userData: any = {
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

      await createUserMutation.mutateAsync(userData);
      showSuccess('User created successfully!');
      navigate('/users');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user. Please try again.';
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
              Create New User
            </h1>
            <p className="text-body text-carbon/60 font-ui">
              Add a new user to the system
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
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Input
                    label="First Name"
                    required={true}
                    error={errors.first_name?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('first_name')}
                  />

                  <Input
                    label="Last Name"
                    required={true}
                    error={errors.last_name?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('last_name')}
                  />

                  <Input
                    label="Email"
                    type="email"
                    required={true}
                    error={errors.email?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('email')}
                  />

                  <Input
                    label="Username"
                    required={true}
                    error={errors.username?.message}
                    className={isSystemAdmin ? "[&_input]:px-2 [&_input]:py-1.5 [&_input]:text-sm" : ""}
                    {...register('username')}
                  />

                  <Input
                    label="Phone"
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
                          Gender <span className="text-smudged-lips ml-0.5">*</span>
                        </label>
                        <select
                          {...field}
                          className={cn(
                            "w-full border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon text-carbon bg-white",
                            isSystemAdmin ? "px-2 py-1.5 text-sm" : "px-3 py-2"
                          )}
                        >
                          <option value="">Select gender</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="text-xs text-smudged-lips mt-1">{errors.gender.message}</p>
                        )}
                      </div>
                    )}
                  />

                  <Input
                    label="Date of Birth"
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
                          Role <span className="text-smudged-lips ml-0.5">*</span>
                        </label>
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Clear clinic_id when role changes to Operator
                            if (e.target.value === 'Operator') {
                              setValue('clinic_id', '');
                            }
                          }}
                          className={cn(
                            "w-full border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon text-carbon bg-white",
                            isSystemAdmin ? "px-2 py-1.5 text-sm" : "px-3 py-2"
                          )}
                        >
                          <option value="Operator">Operator</option>
                          <option value="Manager">Manager</option>
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
                            Clinic {selectedRole === 'Manager' && <span className="text-smudged-lips ml-0.5">*</span>}
                          </label>
                          <select
                            {...field}
                            className={cn(
                              "w-full border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon text-carbon bg-white",
                              isSystemAdmin ? "px-2 py-1.5 text-sm" : "px-3 py-2"
                            )}
                          >
                            <option value="">Select a clinic</option>
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
                  <CardTitle className="text-lg">Employment Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <DepartmentInput
                      label="Department"
                      required={true}
                      error={errors.department?.message}
                      value={watch('department') || ''}
                      onChange={(value) => setValue('department', value)}
                      onBlur={() => trigger('department')}
                    />

                    <Input
                      label="Position"
                      required={true}
                      error={errors.position?.message}
                      {...register('position')}
                    />

                    <Input
                      label="Hire Date"
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
              {createUserMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/users')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};