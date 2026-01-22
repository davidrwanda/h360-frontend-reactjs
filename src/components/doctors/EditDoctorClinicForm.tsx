import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateDoctorClinic } from '@/hooks/useDoctors';
import { useToastStore } from '@/store/toastStore';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdBusiness } from 'react-icons/md';
import type { DoctorClinicRelationship } from '@/api/doctors';

const editDoctorClinicSchema = z.object({
  max_daily_patients: z.number().min(1, 'Max daily patients must be at least 1').optional(),
  appointment_duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  accepts_new_patients: z.boolean().optional(),
  consultation_fee: z.string().optional(),
  notes: z.string().optional(),
});

type EditDoctorClinicFormData = z.infer<typeof editDoctorClinicSchema>;

interface EditDoctorClinicFormProps {
  doctorId: string;
  relationship: DoctorClinicRelationship;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EditDoctorClinicForm = ({
  doctorId,
  relationship,
  onSuccess,
  onCancel,
}: EditDoctorClinicFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateDoctorClinic();
  const { success: showSuccess, error: showError } = useToastStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditDoctorClinicFormData>({
    resolver: zodResolver(editDoctorClinicSchema),
  });

  useEffect(() => {
    if (relationship) {
      reset({
        max_daily_patients: relationship.max_daily_patients,
        appointment_duration_minutes: relationship.appointment_duration_minutes,
        accepts_new_patients: relationship.accepts_new_patients,
        consultation_fee: relationship.consultation_fee,
        notes: relationship.notes,
      });
    }
  }, [relationship, reset]);

  const onSubmit = async (data: EditDoctorClinicFormData) => {
    setError(null);

    try {
      await updateMutation.mutateAsync({
        doctorId,
        clinicId: relationship.clinic_id,
        data: {
          max_daily_patients: data.max_daily_patients,
          appointment_duration_minutes: data.appointment_duration_minutes,
          accepts_new_patients: data.accepts_new_patients,
          consultation_fee: data.consultation_fee,
          notes: data.notes,
        },
      });

      showSuccess('Clinic relationship updated successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update clinic relationship. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdBusiness className="h-5 w-5 text-azure-dragon" />
            Edit Clinic Relationship - {relationship.clinic_name}
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
              label="Appointment Duration (minutes)"
              type="number"
              placeholder="30"
              error={errors.appointment_duration_minutes?.message}
              {...register('appointment_duration_minutes', { valueAsNumber: true })}
            />

            <Input
              label="Max Daily Patients"
              type="number"
              placeholder="20"
              error={errors.max_daily_patients?.message}
              {...register('max_daily_patients', { valueAsNumber: true })}
            />

            <Input
              label="Consultation Fee"
              placeholder="e.g., $150.00"
              error={errors.consultation_fee?.message}
              {...register('consultation_fee')}
            />

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('accepts_new_patients')}
                  className="rounded border-carbon/20 text-azure-dragon focus:ring-azure-dragon"
                />
                <span className="text-sm text-carbon">Accepts New Patients</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <Input
                label="Notes"
                placeholder="Clinic-specific notes"
                error={errors.notes?.message}
                {...register('notes')}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-carbon/10">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Clinic Settings'}
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
