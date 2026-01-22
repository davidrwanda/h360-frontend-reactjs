import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateUser } from '@/hooks/useUsers';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { DepartmentInput } from '@/components/departments';
import { MdPerson } from 'react-icons/md';
import type { User } from '@/api/users';

const editClinicAdminSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'Other'], { required_error: 'Gender is required' }),
  role: z.enum(['MANAGER', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'Operator'], {
    required_error: 'Role is required',
  }),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  hire_date: z.string().min(1, 'Hire date is required'),
});

type EditClinicAdminFormData = z.infer<typeof editClinicAdminSchema>;

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

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
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
        department: admin.department || '',
        position: admin.position || '',
        hire_date: admin.hire_date || '',
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
          department: data.department,
          position: data.position,
          hire_date: data.hire_date,
        },
      });

      showSuccess('User updated successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user. Please try again.';
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
            Edit User
            {clinicName && (
              <span className="text-sm font-normal text-carbon/60 ml-2">
                for {clinicName}
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
              <h3 className="text-lg font-semibold text-carbon mb-4">Basic Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="First Name"
                  required={true}
                  error={errors.first_name?.message}
                  {...register('first_name')}
                />

                <Input
                  label="Last Name"
                  required={true}
                  error={errors.last_name?.message}
                  {...register('last_name')}
                />

                <Input
                  label="Email"
                  type="email"
                  required={true}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Phone"
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
                        Gender <span className="text-smudged-lips ml-0.5">*</span>
                      </label>
                      <select
                        {...field}
                        className="w-full px-3 py-2 border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon"
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
                  {...register('date_of_birth')}
                />

                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-carbon/80 mb-1">
                        Role <span className="text-smudged-lips ml-0.5">*</span>
                      </label>
                      <select
                        {...field}
                        disabled={isDoctor}
                        className={`w-full px-3 py-2 border border-carbon/20 rounded-md focus:outline-none focus:ring-2 focus:ring-azure-dragon/20 focus:border-azure-dragon ${
                          isDoctor ? 'bg-carbon/5 text-carbon/50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isDoctor ? (
                          <option value="DOCTOR">Doctor</option>
                        ) : (
                          <>
                            <option value="">Select role</option>
                            <option value="MANAGER">Manager</option>
                            <option value="Operator">Operator</option>
                          </>
                        )}
                      </select>
                      {isDoctor && (
                        <p className="text-xs text-carbon/60 mt-1">
                          Doctor role cannot be changed
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

            {/* Employment Information */}
            <div>
              <h3 className="text-lg font-semibold text-carbon mb-4">Employment Information</h3>
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
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onCancel}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
