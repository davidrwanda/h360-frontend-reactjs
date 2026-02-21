import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssignDoctorToService } from '@/hooks/useServices';
import { useServices } from '@/hooks/useServices';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, DOCTOR } from '@/i18n';
import { Button, Input, Select, Modal } from '@/components/ui';
import { MdAdd } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';

interface AssignServiceFormData {
  service_id: string;
  custom_price?: string;
  custom_duration_minutes?: number;
  notes?: string;
}

interface AssignServiceFormProps {
  doctorId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const AssignServiceForm = ({
  doctorId,
  onSuccess,
  onCancel,
}: AssignServiceFormProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const assignMutation = useAssignDoctorToService();
  const { success: showSuccess, error: showError } = useToastStore();

  const assignServiceSchema = useMemo(() => z.object({
    service_id: z.string().min(1, t(DOCTOR.SELECT_SERVICE)),
    custom_price: z.string().optional(),
    custom_duration_minutes: z.number().min(1, t(DOCTOR.DURATION_MIN_ERROR)).optional(),
    notes: z.string().optional(),
  }), [t]);

  // Get clinic_id from user context
  const clinicId = user?.clinic_id || user?.employee?.clinic_id;

  // Fetch services for the clinic
  const { data: servicesData } = useServices({
    clinic_id: clinicId,
    is_active: true,
    limit: 100,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssignServiceFormData>({
    resolver: zodResolver(assignServiceSchema),
  });

  const onSubmit = async (data: AssignServiceFormData) => {
    try {
      await assignMutation.mutateAsync({
        serviceId: data.service_id,
        data: {
          doctor_id: doctorId,
          custom_price: data.custom_price || undefined,
          custom_duration_minutes: data.custom_duration_minutes || undefined,
          notes: data.notes || undefined,
        },
      });

      reset();
      setIsOpen(false);
      showSuccess(t(DOCTOR.ASSIGN_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(DOCTOR.ASSIGN_FAILED);
      showError(errorMessage);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <MdAdd className="h-4 w-4" />
        {t(DOCTOR.ASSIGN_SERVICE)}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          reset();
          if (onCancel) onCancel();
        }}
        title={t(DOCTOR.ASSIGN_SERVICE_TITLE)}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Select
              label={t(DOCTOR.SERVICE)}
              required
              options={[
                { value: '', label: t(DOCTOR.SELECT_SERVICE) },
                ...(servicesData?.data || []).map((service) => ({
                  value: service.service_id,
                  label: `${service.name} (${service.service_code})`,
                })),
              ]}
              error={errors.service_id?.message}
              {...register('service_id')}
            />

            <Input
              label={t(DOCTOR.CUSTOM_PRICE)}
              placeholder={t(DOCTOR.CUSTOM_PRICE_PLACEHOLDER)}
              error={errors.custom_price?.message}
              {...register('custom_price')}
            />

            <Input
              label={t(DOCTOR.CUSTOM_DURATION)}
              type="number"
              placeholder="45"
              error={errors.custom_duration_minutes?.message}
              {...register('custom_duration_minutes', { valueAsNumber: true })}
            />

            <Input
              label={t(DOCTOR.NOTES_OPTIONAL)}
              placeholder={t(DOCTOR.NOTES_PLACEHOLDER)}
              error={errors.notes?.message}
              {...register('notes')}
            />

            <div className="flex gap-3 pt-4 border-t border-carbon/10">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={assignMutation.isPending}
                className="flex-1"
              >
                {assignMutation.isPending ? t(DOCTOR.ASSIGNING) : t(DOCTOR.ASSIGN_SERVICE)}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  setIsOpen(false);
                  reset();
                  if (onCancel) onCancel();
                }}
              >
                {t(DOCTOR.CANCEL)}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
