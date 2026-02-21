import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateClinicType } from '@/hooks/useClinicTypes';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, CLINIC } from '@/i18n';
import { Modal, Button, Input } from '@/components/ui';

interface AddClinicTypeFormData {
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_active: boolean;
  fr_name?: string;
  fr_description?: string;
  rw_name?: string;
  rw_description?: string;
}

interface AddClinicTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (clinicTypeId: string) => void;
}

export const AddClinicTypeModal = ({
  isOpen,
  onClose,
  onCreated,
}: AddClinicTypeModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const createMutation = useCreateClinicType();
  const { success: showSuccess, error: showError } = useToastStore();

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t(CLINIC.TYPE_NAME_REQUIRED)),
    code: z.string().min(1, t(CLINIC.TYPE_CODE_REQUIRED)),
    description: z.string().optional().or(z.literal('')),
    icon: z.string().optional().or(z.literal('')),
    color: z.string().optional().or(z.literal('')),
    display_order: z.coerce.number().min(0).optional(),
    is_active: z.boolean(),
    fr_name: z.string().optional().or(z.literal('')),
    fr_description: z.string().optional().or(z.literal('')),
    rw_name: z.string().optional().or(z.literal('')),
    rw_description: z.string().optional().or(z.literal('')),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddClinicTypeFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      icon: '',
      color: '#2563eb',
      display_order: 1,
      is_active: true,
      fr_name: '',
      fr_description: '',
      rw_name: '',
      rw_description: '',
    },
  });

  const handleClose = () => {
    setError(null);
    reset();
    onClose();
  };

  const onSubmit = async (data: AddClinicTypeFormData) => {
    setError(null);
    try {
      const translations: Record<string, { name?: string; description?: string }> = {};

      if (data.fr_name || data.fr_description) {
        translations.fr = {
          name: data.fr_name || undefined,
          description: data.fr_description || undefined,
        };
      }

      if (data.rw_name || data.rw_description) {
        translations.rw = {
          name: data.rw_name || undefined,
          description: data.rw_description || undefined,
        };
      }

      const result = await createMutation.mutateAsync({
        name: data.name,
        code: data.code,
        description: data.description || undefined,
        icon: data.icon || undefined,
        color: data.color || undefined,
        display_order: data.display_order ?? undefined,
        is_active: data.is_active,
        translations: Object.keys(translations).length > 0 ? translations : undefined,
      });
      showSuccess(t(CLINIC.TYPE_CREATED));
      reset();
      onCreated?.(result.clinic_type_id);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(CLINIC.TYPE_CREATE_FAILED);
      setError(msg);
      showError(msg);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t(CLINIC.CREATE_CLINIC_TYPE)} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {error && (
          <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
            <p className="text-xs text-smudged-lips font-ui">{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t(CLINIC.TYPE_NAME)}
            placeholder={t(CLINIC.TYPE_NAME_PLACEHOLDER)}
            error={errors.name?.message}
            required
            {...register('name')}
          />

          <Input
            label={t(CLINIC.TYPE_CODE)}
            placeholder={t(CLINIC.TYPE_CODE_PLACEHOLDER)}
            error={errors.code?.message}
            required
            {...register('code')}
          />
        </div>

        <Input
          label={t(CLINIC.TYPE_DESCRIPTION)}
          placeholder={t(CLINIC.TYPE_DESCRIPTION_PLACEHOLDER)}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t(CLINIC.TYPE_ICON)}
            placeholder={t(CLINIC.TYPE_ICON_PLACEHOLDER)}
            {...register('icon')}
          />

          <div>
            <label className="block text-xs font-ui font-medium text-carbon/80 mb-1.5 tracking-wide">
              {t(CLINIC.TYPE_COLOR)}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                className="h-10 w-14 rounded-md border border-carbon/15 cursor-pointer p-1"
                {...register('color')}
              />
              <Input
                placeholder="#2563eb"
                className="flex-1"
                {...register('color')}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t(CLINIC.TYPE_DISPLAY_ORDER)}
            type="number"
            placeholder="1"
            error={errors.display_order?.message}
            {...register('display_order', { valueAsNumber: true })}
          />

          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('is_active')}
                className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon/30"
              />
              <span className="text-sm font-ui text-carbon">{t(CLINIC.TYPE_ACTIVE)}</span>
            </label>
          </div>
        </div>

        {/* Translations */}
        <div className="space-y-3 pt-2 border-t border-carbon/10">
          <h4 className="text-xs font-medium text-carbon/60 uppercase tracking-wider">
            {t(CLINIC.TYPE_TRANSLATIONS)}
          </h4>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label={t(CLINIC.TYPE_FR_NAME)}
              placeholder="e.g. Dentaire"
              {...register('fr_name')}
            />
            <Input
              label={t(CLINIC.TYPE_FR_DESCRIPTION)}
              placeholder="e.g. Services de soins dentaires"
              {...register('fr_description')}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label={t(CLINIC.TYPE_RW_NAME)}
              placeholder="e.g. Ubuvuzi bw'amenyo"
              {...register('rw_name')}
            />
            <Input
              label={t(CLINIC.TYPE_RW_DESCRIPTION)}
              placeholder="e.g. Serivisi z'ubuvuzi bw'amenyo"
              {...register('rw_description')}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-carbon/10">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            {t(CLINIC.CANCEL)}
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            isLoading={createMutation.isPending}
            disabled={createMutation.isPending}
          >
            {t(CLINIC.CREATE_CLINIC_TYPE)}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
