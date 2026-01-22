import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAssignDoctorToService } from '@/hooks/useServices';
import { useServices } from '@/hooks/useServices';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Select, Modal } from '@/components/ui';
import { MdAdd } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';

const assignServiceSchema = z.object({
  service_id: z.string().min(1, 'Service is required'),
  custom_price: z.string().optional(),
  custom_duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  notes: z.string().optional(),
});

type AssignServiceFormData = z.infer<typeof assignServiceSchema>;

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
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const assignMutation = useAssignDoctorToService();
  const { success: showSuccess, error: showError } = useToastStore();

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
      showSuccess('Doctor assigned to service successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign doctor to service. Please try again.';
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
        Assign Service
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          reset();
          if (onCancel) onCancel();
        }}
        title="Assign Service to Doctor"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Select
              label="Service"
              required
              options={[
                { value: '', label: 'Select a service' },
                ...(servicesData?.data || []).map((service) => ({
                  value: service.service_id,
                  label: `${service.name} (${service.service_code})`,
                })),
              ]}
              error={errors.service_id?.message}
              {...register('service_id')}
            />

            <Input
              label="Custom Price (Optional)"
              placeholder="e.g., $175.00"
              error={errors.custom_price?.message}
              {...register('custom_price')}
            />

            <Input
              label="Custom Duration (minutes, Optional)"
              type="number"
              placeholder="45"
              error={errors.custom_duration_minutes?.message}
              {...register('custom_duration_minutes', { valueAsNumber: true })}
            />

            <Input
              label="Notes (Optional)"
              placeholder="Specialist consultation"
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
                {assignMutation.isPending ? 'Assigning...' : 'Assign Service'}
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
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};
