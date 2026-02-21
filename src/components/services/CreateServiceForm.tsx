import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateService } from '@/hooks/useServices';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, SERVICE } from '@/i18n';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { ServiceCategoryInput } from './ServiceCategoryInput';
import { MdMedicalServices } from 'react-icons/md';

interface CreateServiceFormData {
  name: string;
  service_code: string;
  description?: string;
  category?: string;
  clinic_id: string;
  price: string;
  duration_minutes: number;
  requires_appointment: boolean;
  is_walk_in_allowed: boolean;
  max_daily_capacity?: number;
}

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
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const createMutation = useCreateService();
  const { success: showSuccess, error: showError } = useToastStore();

  const createServiceSchema = useMemo(() => z.object({
    name: z.string().min(1, t(SERVICE.SERVICE_NAME_REQUIRED)),
    service_code: z.string().min(1, t(SERVICE.SERVICE_CODE_REQUIRED)),
    description: z.string().optional(),
    category: z.string().optional(),
    clinic_id: z.string().min(1, t(SERVICE.CLINIC_REQUIRED)),
    price: z.string().min(1, t(SERVICE.PRICE_REQUIRED)),
    duration_minutes: z.number().min(1, t(SERVICE.DURATION_MIN_ERROR)),
    requires_appointment: z.boolean(),
    is_walk_in_allowed: z.boolean(),
    max_daily_capacity: z.number().min(1).optional(),
  }), [t]);

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
      showSuccess(t(SERVICE.CREATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(SERVICE.CREATE_FAILED);
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
            {t(SERVICE.SERVICE_INFORMATION)}
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
              label={t(SERVICE.SERVICE_NAME)}
              placeholder={t(SERVICE.SERVICE_NAME_PLACEHOLDER)}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label={t(SERVICE.SERVICE_CODE_LABEL)}
              placeholder={t(SERVICE.SERVICE_CODE_PLACEHOLDER)}
              error={errors.service_code?.message}
              required
              {...register('service_code')}
            />

            <div className="md:col-span-2">
              <Input
                label={t(SERVICE.DESCRIPTION)}
                placeholder={t(SERVICE.DESCRIPTION_PLACEHOLDER)}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <ServiceCategoryInput
                  label={t(SERVICE.CATEGORY)}
                  placeholder={t(SERVICE.CATEGORY_SELECT_PLACEHOLDER)}
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.category?.message}
                />
              )}
            />

            <Input
              label={t(SERVICE.PRICE)}
              placeholder={t(SERVICE.PRICE_PLACEHOLDER)}
              error={errors.price?.message}
              required
              {...register('price')}
            />

            <Input
              label={t(SERVICE.DURATION_LABEL)}
              type="number"
              placeholder="30"
              error={errors.duration_minutes?.message}
              required
              {...register('duration_minutes', { valueAsNumber: true })}
            />

            <Input
              label={t(SERVICE.MAX_DAILY_CAPACITY_LABEL)}
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
                <span className="text-sm text-carbon">{t(SERVICE.REQUIRES_APPOINTMENT)}</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_walk_in_allowed')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm text-carbon">{t(SERVICE.WALK_IN_ALLOWED)}</span>
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
              {createMutation.isPending ? t(SERVICE.CREATING) : t(SERVICE.CREATE_SERVICE)}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
              >
                {t(SERVICE.CANCEL)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
