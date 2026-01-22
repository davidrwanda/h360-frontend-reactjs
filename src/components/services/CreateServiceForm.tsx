import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateService } from '@/hooks/useServices';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ServiceCategoryInput } from './ServiceCategoryInput';
import { MdMedicalServices } from 'react-icons/md';

const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  service_code: z.string().min(1, 'Service code is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  clinic_id: z.string().min(1, 'Clinic is required'),
  price: z.string().min(1, 'Price is required'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  requires_appointment: z.boolean(),
  is_walk_in_allowed: z.boolean(),
  max_daily_capacity: z.number().min(1).optional(),
});

type CreateServiceFormData = z.infer<typeof createServiceSchema>;

interface CreateServiceFormProps {
  clinicId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateServiceForm = ({
  clinicId,
  onSuccess,
  onCancel,
}: CreateServiceFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateService();
  const { success: showSuccess, error: showError } = useToastStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CreateServiceFormData>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      clinic_id: clinicId,
      requires_appointment: true,
      is_walk_in_allowed: false,
      duration_minutes: 30,
    },
  });

  const onSubmit = async (data: CreateServiceFormData) => {
    setError(null);

    try {
      await createMutation.mutateAsync({
        name: data.name,
        service_code: data.service_code,
        description: data.description || undefined,
        category: data.category || undefined,
        clinic_id: data.clinic_id,
        price: data.price,
        duration_minutes: data.duration_minutes,
        requires_appointment: data.requires_appointment,
        is_walk_in_allowed: data.is_walk_in_allowed,
        max_daily_capacity: data.max_daily_capacity || undefined,
      });

      reset();
      showSuccess('Service created successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create service. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdMedicalServices className="h-5 w-5 text-azure-dragon" />
            Service Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">{error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Service Name"
              placeholder="e.g., General Consultation"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Service Code"
              placeholder="e.g., SRV001"
              error={errors.service_code?.message}
              required
              {...register('service_code')}
            />

            <div className="md:col-span-2">
              <Input
                label="Description"
                placeholder="Service description"
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <ServiceCategoryInput
                  label="Category"
                  placeholder="Select or type a category"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.category?.message}
                />
              )}
            />

            <Input
              label="Price"
              placeholder="e.g., $150.00"
              error={errors.price?.message}
              required
              {...register('price')}
            />

            <Input
              label="Duration (minutes)"
              type="number"
              placeholder="30"
              error={errors.duration_minutes?.message}
              required
              {...register('duration_minutes', { valueAsNumber: true })}
            />

            <Input
              label="Max Daily Capacity"
              type="number"
              placeholder="20"
              error={errors.max_daily_capacity?.message}
              {...register('max_daily_capacity', { valueAsNumber: true })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-carbon/10">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('requires_appointment')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm text-carbon">Requires Appointment</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_walk_in_allowed')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm text-carbon">Walk-in Allowed</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-carbon/10">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Service'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
