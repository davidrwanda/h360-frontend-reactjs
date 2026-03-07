import { useMemo } from 'react';
import { format, parseISO, isValid } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { usePatientAppointments } from '@/hooks/useAppointments';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdEvent, MdBusiness, MdAccessTime, MdLocalHospital, MdPerson, MdMedicalServices } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';
import { AppointmentStatusBadge } from '@/components/appointments/AppointmentStatusBadge';
import type { Appointment } from '@/api/appointments';

const formatAppointmentTime = (apt: Appointment): string => {
  if (apt.formatted_time_slot) return apt.formatted_time_slot;
  if (apt.start_time) {
    const h = String(apt.start_time.hours).padStart(2, '0');
    const m = String(apt.start_time.minutes).padStart(2, '0');
    let time = `${h}:${m}`;
    if (apt.end_time) {
      const eh = String(apt.end_time.hours).padStart(2, '0');
      const em = String(apt.end_time.minutes).padStart(2, '0');
      time += ` - ${eh}:${em}`;
    }
    return time;
  }
  if (!apt.appointment_time) return '—';
  const parsed = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
  return isValid(parsed) ? format(parsed, 'hh:mm a') : apt.appointment_time;
};

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const patientId = user?.patient?.patient_id || '';
  const { data: appointmentsData, isLoading } = usePatientAppointments(patientId);

  const firstName = user?.patient?.first_name
    || user?.patient?.full_name?.split(' ')[0]
    || user?.first_name
    || '';

  const upcomingAppointments = useMemo(() => {
    if (!appointmentsData?.data) return [];
    const today = format(new Date(), 'yyyy-MM-dd');
    return appointmentsData.data
      .filter(apt => apt.appointment_date >= today && (apt.status === 'booked' || apt.status === 'checked_in'))
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
  }, [appointmentsData]);

  const nextAppointment = upcomingAppointments[0] || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
          {t(COMMON.WELCOME_BACK, { name: firstName })}
        </h1>
        <p className="text-body text-carbon/60 font-ui">
          {t(DASHBOARD.MANAGE_PROFILE_DESC)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title={t(DASHBOARD.UPCOMING_APPOINTMENTS_STAT)}
          value={upcomingAppointments.length}
          icon={<MdEvent className="h-6 w-6" />}
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.ACTIVE_CLINICS)}
          value={user?.patient?.clinics?.filter(c => c.subscription_status === 'active').length || 0}
          icon={<MdBusiness className="h-6 w-6" />}
        />
      </div>

      {/* Next Appointment Card */}
      <Card variant="elevated" className="border-azure-dragon/20 bg-azure-dragon/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdEvent className="h-5 w-5 text-azure-dragon" />
            {t(DASHBOARD.NEXT_APPOINTMENT)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3 py-4">
              <div className="h-4 w-48 bg-carbon/10 rounded animate-pulse" />
              <div className="h-4 w-36 bg-carbon/10 rounded animate-pulse" />
              <div className="h-4 w-40 bg-carbon/10 rounded animate-pulse" />
            </div>
          ) : nextAppointment ? (
            <div className="py-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-carbon">
                  <MdEvent className="h-4 w-4 text-azure-dragon" />
                  {isValid(parseISO(nextAppointment.appointment_date))
                    ? format(parseISO(nextAppointment.appointment_date), 'EEEE, MMM d, yyyy')
                    : nextAppointment.appointment_date}
                </div>
                <AppointmentStatusBadge status={nextAppointment.status} />
              </div>
              <div className="flex items-center gap-2 text-sm text-carbon/70">
                <MdAccessTime className="h-4 w-4 text-carbon/40" />
                {formatAppointmentTime(nextAppointment)}
              </div>
              {nextAppointment.clinic_name && (
                <div className="flex items-center gap-2 text-sm text-carbon/70">
                  <MdLocalHospital className="h-4 w-4 text-carbon/40" />
                  {nextAppointment.clinic_name}
                </div>
              )}
              {nextAppointment.doctor_name && (
                <div className="flex items-center gap-2 text-sm text-carbon/70">
                  <MdPerson className="h-4 w-4 text-carbon/40" />
                  {nextAppointment.doctor_name}
                </div>
              )}
              {nextAppointment.service_name && (
                <div className="flex items-center gap-2 text-sm text-carbon/70">
                  <MdMedicalServices className="h-4 w-4 text-carbon/40" />
                  {nextAppointment.service_name}
                </div>
              )}
              <button
                onClick={() => navigate('/my-appointments')}
                className="mt-2 px-4 py-2 bg-azure-dragon text-white rounded-md hover:bg-azure-dragon-dark transition-colors text-sm font-medium"
              >
                {t(DASHBOARD.MY_APPOINTMENTS)}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MdEvent className="h-12 w-12 text-carbon/30 mb-4" />
              <h3 className="text-h4 text-carbon font-heading font-medium mb-2">
                {t(DASHBOARD.NO_UPCOMING_TITLE)}
              </h3>
              <p className="text-body text-carbon/60 font-ui max-w-md mb-4">
                {t(DASHBOARD.NO_UPCOMING_DESC)}
              </p>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-azure-dragon text-white rounded-md hover:bg-azure-dragon-dark transition-colors text-sm font-medium"
              >
                {t(DASHBOARD.BOOK_APPOINTMENT)}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};
