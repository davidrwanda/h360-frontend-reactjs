import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpdateDoctorClinic } from '@/hooks/useDoctors';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, DOCTOR } from '@/i18n';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdBusiness } from 'react-icons/md';
import type { DoctorClinicRelationship } from '@/api/doctors';

interface EditDoctorClinicFormData {
  max_daily_patients?: number;
  appointment_duration_minutes?: number;
  accepts_new_patients?: boolean;
  consultation_fee?: string;
  notes?: string;
}

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
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const updateMutation = useUpdateDoctorClinic();
  const { success: showSuccess, error: showError } = useToastStore();

  const editDoctorClinicSchema = useMemo(() => z.object({
    max_daily_patients: z.number().min(1, t(DOCTOR.MAX_DAILY_MIN_ERROR)).optional(),
    appointment_duration_minutes: z.number().min(1, t(DOCTOR.DURATION_MIN_ERROR)).optional(),
    accepts_new_patients: z.boolean().optional(),
    consultation_fee: z.string().optional(),
    notes: z.string().optional(),
  }), [t]);

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

      showSuccess(t(DOCTOR.CLINIC_UPDATED_SUCCESS));
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t(DOCTOR.CLINIC_UPDATE_FAILED);
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
            {t(DOCTOR.EDIT_CLINIC_RELATIONSHIP)} - {relationship.clinic_name}
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
              label={t(DOCTOR.APPOINTMENT_DURATION_LABEL)}
              type="number"
              placeholder="30"
              error={errors.appointment_duration_minutes?.message}
              {...register('appointment_duration_minutes', { valueAsNumber: true })}
            />

            <Input
              label={t(DOCTOR.MAX_DAILY_PATIENTS)}
              type="number"
              placeholder="20"
              error={errors.max_daily_patients?.message}
              {...register('max_daily_patients', { valueAsNumber: true })}
            />

            <Input
              label={t(DOCTOR.CONSULTATION_FEE)}
              placeholder={t(DOCTOR.CONSULTATION_FEE_PLACEHOLDER)}
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
                <span className="text-sm text-carbon">{t(DOCTOR.ACCEPTS_NEW_PATIENTS)}</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <Input
                label={t(DOCTOR.NOTES)}
                placeholder={t(DOCTOR.CLINIC_NOTES_PLACEHOLDER)}
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
              {updateMutation.isPending ? t(DOCTOR.UPDATING) : t(DOCTOR.UPDATE_CLINIC_SETTINGS)}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onCancel}
              >
                {t(DOCTOR.CANCEL)}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
