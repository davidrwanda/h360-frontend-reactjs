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
  color?: string;
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
    color: z.string().optional().or(z.literal('')),
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
      color: '#2563eb',
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
      // Build translations object
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
        color: data.color || undefined,
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
    <Modal isOpen={isOpen} onClose={handleClose} title={t(CLINIC.CREATE_CLINIC_TYPE)} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
            <p className="text-xs text-smudged-lips font-ui">{error}</p>
          </div>
        )}

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

        <Input
          label={t(CLINIC.TYPE_DESCRIPTION)}
          placeholder={t(CLINIC.TYPE_DESCRIPTION_PLACEHOLDER)}
          error={errors.description?.message}
          {...register('description')}
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

        {/* French Translations */}
        <div className="space-y-3 pt-2 border-t border-carbon/10">
          <h4 className="text-xs font-medium text-carbon/80">French Translation (Français)</h4>
          <Input
            label="Nom (French Name)"
            placeholder="e.g., Dentaire"
            {...register('fr_name')}
          />
          <Input
            label="Description (French)"
            placeholder="e.g., Services de soins dentaires"
            {...register('fr_description')}
          />
        </div>

        {/* Kinyarwanda Translations */}
        <div className="space-y-3 pt-2 border-t border-carbon/10">
          <h4 className="text-xs font-medium text-carbon/80">Kinyarwanda Translation</h4>
          <Input
            label="Izina (Kinyarwanda Name)"
            placeholder="e.g., Ubuvuzi bw'amenyo"
            {...register('rw_name')}
          />
          <Input
            label="Ibisobanuro (Kinyarwanda Description)"
            placeholder="e.g., Serivisi z'ubuvuzi bw'amenyo"
            {...register('rw_description')}
          />
        </div>

        <div className="flex gap-3 pt-2">
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
