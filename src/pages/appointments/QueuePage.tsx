import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors } from '@/hooks/useDoctors';
import { useDoctorQueue } from '@/hooks/useQueue';
import { useStartAppointment, useCompleteAppointment, useNoShowAppointment } from '@/hooks/useAppointments';
import { QueueStatsCards } from '@/components/queue/QueueStatsCards';
import { QueueTable } from '@/components/queue/QueueTable';
import { Card, CardContent, Select, Loading } from '@/components/ui';
import { useTranslation, QUEUE } from '@/i18n';
import type { QueueItem } from '@/api/queue';

export const QueuePage = () => {
  const { t } = useTranslation();
  const { user, role } = useAuth();

  const isDoctor = role === 'DOCTOR';
  const clinicId = user?.clinic_id || user?.employee?.clinic_id || undefined;

  // For doctors: look up their doctor_id via useDoctors
  const { data: doctorsData } = useDoctors(
    isDoctor ? { user_id: user?.user_id, limit: 1 } : { clinic_id: clinicId, limit: 100 }
  );

  const currentDoctor = isDoctor ? doctorsData?.data?.[0] : null;
  const allDoctors = doctorsData?.data || [];

  // Doctor selector state — doctors see their own queue, staff can pick
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  const activeDoctorId = isDoctor
    ? currentDoctor?.doctor_id || ''
    : selectedDoctorId;

  const { data: queueData, isLoading: isLoadingQueue } = useDoctorQueue(activeDoctorId);

  const queue = queueData?.queue || [];

  const startMutation = useStartAppointment();
  const completeMutation = useCompleteAppointment();
  const noShowMutation = useNoShowAppointment();

  // Doctor filter options for non-doctor roles
  const doctorOptions = useMemo(() => {
    const options = [{ value: '', label: t(QUEUE.ALL_DOCTORS) }];
    allDoctors.forEach((doc) => {
      options.push({
        value: doc.doctor_id,
        label: doc.full_name || `${doc.first_name} ${doc.last_name}`,
      });
    });
    return options;
  }, [allDoctors, t]);

  const handleStartConsultation = (item: QueueItem) => {
    startMutation.mutate(item.appointment_id);
  };

  const handleComplete = (item: QueueItem) => {
    completeMutation.mutate(item.appointment_id);
  };

  const handleMarkNoShow = (item: QueueItem) => {
    noShowMutation.mutate(item.appointment_id);
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(QUEUE.QUEUE_MANAGEMENT)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(QUEUE.MANAGE_QUEUE_DESC)}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6">
        <QueueStatsCards doctorId={activeDoctorId} />
      </div>

      {/* Doctor Filter (non-doctor roles only) */}
      {!isDoctor && (
        <div className="mb-6 max-w-xs">
          <Select
            label={t(QUEUE.SELECT_DOCTOR)}
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            options={doctorOptions}
          />
        </div>
      )}

      {/* Queue Table */}
      <Card variant="elevated">
        <CardContent className="p-0">
          {isDoctor && !currentDoctor ? (
            <div className="flex items-center justify-center py-16">
              <Loading size="md" />
            </div>
          ) : (
            <QueueTable
              queue={queue}
              isLoading={isLoadingQueue}
              userRole={role}
              onStartConsultation={handleStartConsultation}
              onComplete={handleComplete}
              onMarkNoShow={handleMarkNoShow}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
