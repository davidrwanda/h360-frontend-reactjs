import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientAppointments } from '@/hooks/useAppointments';
import { AppointmentCard } from '@/components/appointments/AppointmentCard';
import { AppointmentDetailModal } from '@/components/appointments/AppointmentDetailModal';
import { Loading, Button } from '@/components/ui';
import { useTranslation, APPOINTMENT } from '@/i18n';
import { MdEvent, MdInfo, MdSearch } from 'react-icons/md';
import { cn } from '@/utils/cn';
import type { Appointment } from '@/api/appointments';

type TabKey = 'all' | 'upcoming' | 'completed' | 'cancelled';

export const MyAppointmentsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const patientId = user?.patient?.patient_id || '';

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const { data, isLoading } = usePatientAppointments(patientId, {
    limit: 100,
    sortBy: 'appointment_date',
    sortOrder: 'DESC',
  });

  const appointments = data?.data || [];

  const filteredAppointments = useMemo(() => {
    if (activeTab === 'all') return appointments;
    if (activeTab === 'upcoming') {
      return appointments.filter(
        (a) => a.status === 'booked' || a.status === 'checked_in' || a.status === 'in_progress'
      );
    }
    if (activeTab === 'completed') {
      return appointments.filter((a) => a.status === 'completed');
    }
    if (activeTab === 'cancelled') {
      return appointments.filter((a) => a.status === 'cancelled' || a.status === 'no_show');
    }
    return appointments;
  }, [appointments, activeTab]);

  const counts = useMemo(() => ({
    all: appointments.length,
    upcoming: appointments.filter(
      (a) => a.status === 'booked' || a.status === 'checked_in' || a.status === 'in_progress'
    ).length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled' || a.status === 'no_show').length,
  }), [appointments]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'all', label: t(APPOINTMENT.TAB_ALL), count: counts.all },
    { key: 'upcoming', label: t(APPOINTMENT.TAB_UPCOMING), count: counts.upcoming },
    { key: 'completed', label: t(APPOINTMENT.TAB_COMPLETED), count: counts.completed },
    { key: 'cancelled', label: t(APPOINTMENT.TAB_CANCELLED), count: counts.cancelled },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(APPOINTMENT.MY_APPOINTMENTS)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(APPOINTMENT.VIEW_MANAGE_APPOINTMENTS)}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-azure-dragon text-white'
                : 'bg-carbon/5 text-carbon/70 hover:bg-carbon/10'
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loading size="md" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {appointments.length === 0 ? (
            <>
              <MdEvent className="h-16 w-16 text-carbon/20 mb-4" />
              <h3 className="text-lg font-heading font-medium text-carbon mb-2">
                {t(APPOINTMENT.NO_APPOINTMENTS)}
              </h3>
              <p className="text-sm text-carbon/60 max-w-sm mb-6">
                {t(APPOINTMENT.NO_APPOINTMENTS_DESC)}
              </p>
              <Link to="/">
                <Button variant="primary">
                  <MdSearch className="h-4 w-4 mr-2" />
                  {t(APPOINTMENT.FIND_CLINICS)}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <MdInfo className="h-12 w-12 text-carbon/20 mb-4" />
              <p className="text-sm text-carbon/60">
                {t(APPOINTMENT.NO_APPOINTMENTS_FOUND)}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => (
            <AppointmentCard
              key={apt.appointment_id}
              appointment={apt}
              onClick={setSelectedAppointment}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AppointmentDetailModal
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};
