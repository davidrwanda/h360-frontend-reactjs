import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateUser } from '@/hooks/useUsers';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdPerson } from 'react-icons/md';
import type { User } from '@/api/users';

const editClinicAdminSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditClinicAdminFormData>({
    resolver: zodResolver(editClinicAdminSchema),
  });

  // Update form when admin data loads
  useEffect(() => {
    if (admin) {
      reset({
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
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
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to update clinic admin. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdPerson className="h-5 w-5 text-azure-dragon" />
            Edit Clinic Admin
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

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                placeholder="Enter first name"
                error={errors.first_name?.message}
                required
                {...register('first_name')}
              />

              <Input
                label="Last Name"
                placeholder="Enter last name"
                error={errors.last_name?.message}
                required
                {...register('last_name')}
              />

              <Input
                label="Email"
                type="email"
                placeholder="Enter email address"
                error={errors.email?.message}
                required
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
                {updateMutation.isPending ? 'Updating...' : 'Update Clinic Admin'}
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
