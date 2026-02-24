import { useState } from 'react';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent, Loading, Modal } from '@/components/ui';
import { AppointmentsCalendar } from '@/components/doctors/AppointmentsCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { MdEvent, MdPeople, MdSchedule, MdLocalHospital, MdAccessTime, MdPerson } from 'react-icons/md';
import { format, isToday, isThisWeek, parseISO, isSameDay, isValid } from 'date-fns';
import { cn } from '@/utils/cn';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';

const STATUS_KEYS: Record<string, string> = {
  booked: DASHBOARD.STATUS_BOOKED,
  checked_in: DASHBOARD.STATUS_CHECKED_IN,
  in_progress: DASHBOARD.STATUS_IN_PROGRESS,
  completed: DASHBOARD.STATUS_COMPLETED,
  cancelled: DASHBOARD.STATUS_CANCELLED,
};

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: doctorsData } = useDoctors({
    user_id: user?.user_id,
    limit: 1,
  });

  const doctor = doctorsData?.data?.[0];

  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    doctor_id: doctor?.doctor_id,
    limit: 50,
    sortBy: 'appointment_date',
    sortOrder: 'ASC',
  });

  const appointments = appointmentsData?.data || [];

  const today = new Date();
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.appointment_date);
    return isToday(aptDate) && apt.status !== 'completed' && apt.status !== 'cancelled';
  });

  const upcomingThisWeek = appointments.filter((apt) => {
    const aptDate = parseISO(apt.appointment_date);
    return isThisWeek(aptDate) && !isToday(aptDate) && apt.status !== 'completed' && apt.status !== 'cancelled';
  });

  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = parseISO(apt.appointment_date);
      return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
    })
    .slice(0, 5);

  const selectedDateAppointments = selectedDate
    ? appointments.filter((apt) => {
        const aptDate = parseISO(apt.appointment_date);
        return isSameDay(aptDate, selectedDate);
      })
    : [];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const translateStatus = (status: string) => {
    const key = STATUS_KEYS[status];
    return key ? t(key) : status.replace('_', ' ');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(COMMON.DASHBOARD)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(COMMON.WELCOME_BACK, {
            name: `${t(COMMON.DR_PREFIX)} ${
              user?.employee?.first_name ||
              user?.employee?.full_name?.split(' ')[0] ||
              user?.first_name ||
              user?.username ||
              user?.email || ''
            }`,
          })}
        </p>
        {user?.clinic_id && (
          <p className="text-xs text-carbon/50 mt-1">{t(DASHBOARD.MEDICAL_PROFESSIONAL)}</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t(DASHBOARD.TODAYS_APPOINTMENTS)}
          value={todayAppointments.length.toString()}
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title={t(DASHBOARD.PATIENTS_TODAY)}
          value={todayAppointments.length.toString()}
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title={t(DASHBOARD.UPCOMING_THIS_WEEK)}
          value={upcomingThisWeek.length.toString()}
          icon={<MdSchedule className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title={t(DASHBOARD.AVAILABLE_SLOTS)}
          value="—"
          icon={<MdLocalHospital className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Calendar and Upcoming Appointments */}
      <div className="grid gap-6 md:grid-cols-2">
        <AppointmentsCalendar appointments={appointments} onDateClick={handleDateClick} />

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdEvent className="h-5 w-5 text-azure-dragon" />
              {t(DASHBOARD.UPCOMING_APPOINTMENTS)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center py-8">
                <Loading />
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => {
                  const appointmentDateTime = appointment.appointment_time
                    ? parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`)
                    : null;
                  const aptDateOnly = parseISO(appointment.appointment_date);
                  const isTodayAppt = isValid(aptDateOnly) && isToday(aptDateOnly);

                  return (
                    <div
                      key={appointment.appointment_id}
                      className="rounded-md border border-carbon/10 p-4 hover:border-azure-dragon/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MdPerson className="h-4 w-4 text-azure-dragon" />
                            <span className="text-sm font-medium text-carbon">
                              {appointment.patient_name || appointment.guest_name || t(DASHBOARD.UNKNOWN_PATIENT)}
                            </span>
                            {appointment.is_guest_booking && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-carbon/10 text-carbon/60">
                                {t(COMMON.GUEST)}
                              </span>
                            )}
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 text-xs text-carbon/70 ml-6">
                            <div className="flex items-center gap-1">
                              <MdAccessTime className="h-3 w-3" />
                              <span className="font-medium">{t(COMMON.DATE)} </span>
                              {appointmentDateTime && isValid(appointmentDateTime)
                                ? format(appointmentDateTime, 'MMM dd, yyyy')
                                : isValid(aptDateOnly)
                                  ? format(aptDateOnly, 'MMM dd, yyyy')
                                  : appointment.appointment_date}
                              {isTodayAppt && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-azure-dragon/10 text-azure-dragon ml-1">
                                  {t(COMMON.TODAY)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MdSchedule className="h-3 w-3" />
                              <span className="font-medium">{t(COMMON.TIME)} </span>
                              {appointmentDateTime && isValid(appointmentDateTime)
                                ? format(appointmentDateTime, 'hh:mm a')
                                : '—'}
                            </div>
                            {appointment.service_name && (
                              <div>
                                <span className="font-medium">{t(COMMON.SERVICE)} </span>
                                {appointment.service_name}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">{t(COMMON.STATUS)} </span>
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                  appointment.status === 'booked'
                                    ? 'bg-bright-halo/20 text-azure-dragon'
                                    : appointment.status === 'checked_in'
                                    ? 'bg-blue-500/20 text-blue-600'
                                    : appointment.status === 'in_progress'
                                    ? 'bg-yellow-500/20 text-yellow-600'
                                    : 'bg-carbon/10 text-carbon/60',
                                )}
                              >
                                {translateStatus(appointment.status)}
                              </span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 ml-6 text-xs text-carbon/60">
                              <span className="font-medium">{t(COMMON.NOTES)} </span>
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-carbon/60">
                <MdEvent className="h-8 w-8 mx-auto mb-2 text-carbon/30" />
                <p>{t(DASHBOARD.NO_APPOINTMENTS_SCHEDULED)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Appointments Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={t(DASHBOARD.APPOINTMENTS_FOR_DATE, { date: selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : '' })}
      >
        <div className="space-y-3">
          {selectedDateAppointments.length > 0 ? (
            selectedDateAppointments.map((appointment) => {
              const appointmentDateTime = appointment.appointment_time
                ? parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`)
                : null;

              return (
                <div
                  key={appointment.appointment_id}
                  className="rounded-md border border-carbon/10 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MdPerson className="h-4 w-4 text-azure-dragon" />
                      <span className="text-sm font-medium text-carbon">
                        {appointment.patient_name || appointment.guest_name || t(DASHBOARD.UNKNOWN_PATIENT)}
                      </span>
                      {appointment.is_guest_booking && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-carbon/10 text-carbon/60">
                          {t(COMMON.GUEST)}
                        </span>
                      )}
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                        appointment.status === 'booked'
                          ? 'bg-bright-halo/20 text-azure-dragon'
                          : appointment.status === 'checked_in'
                          ? 'bg-blue-500/20 text-blue-600'
                          : appointment.status === 'in_progress'
                          ? 'bg-yellow-500/20 text-yellow-600'
                          : 'bg-carbon/10 text-carbon/60',
                      )}
                    >
                      {translateStatus(appointment.status)}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 text-xs text-carbon/70 ml-6">
                    <div className="flex items-center gap-1">
                      <MdAccessTime className="h-3 w-3" />
                      <span className="font-medium">{t(COMMON.TIME)} </span>
                      {appointmentDateTime && isValid(appointmentDateTime)
                        ? format(appointmentDateTime, 'hh:mm a')
                        : '—'}
                    </div>
                    {appointment.service_name && (
                      <div>
                        <span className="font-medium">{t(COMMON.SERVICE)} </span>
                        {appointment.service_name}
                      </div>
                    )}
                    {appointment.is_guest_booking ? (
                      <>
                        {appointment.guest_phone && (
                          <div>
                            <span className="font-medium">{t(COMMON.PHONE)} </span>
                            {appointment.guest_phone}
                          </div>
                        )}
                        {appointment.guest_email && (
                          <div>
                            <span className="font-medium">{t(COMMON.EMAIL)} </span>
                            {appointment.guest_email}
                          </div>
                        )}
                      </>
                    ) : (
                      appointment.patient_id && (
                        <div>
                          <span className="font-medium">{t(COMMON.PATIENT_ID)} </span>
                          {appointment.patient_id}
                        </div>
                      )
                    )}
                  </div>
                  {appointment.notes && (
                    <div className="mt-2 ml-6 text-xs text-carbon/60">
                      <span className="font-medium">{t(COMMON.NOTES)} </span>
                      {appointment.notes}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-sm text-carbon/60">
              <MdEvent className="h-8 w-8 mx-auto mb-2 text-carbon/30" />
              <p>{t(DASHBOARD.NO_APPOINTMENTS_FOR_THIS_DATE)}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(DASHBOARD.YOUR_SCHEDULE)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                {t(DASHBOARD.SCHEDULE_DESC)}
              </p>
              <div className="space-y-2">
                <div className="text-xs text-carbon/50">• {t(DASHBOARD.TODAYS_APPOINTMENTS_BULLET)}</div>
                <div className="text-xs text-carbon/50">• {t(DASHBOARD.UPCOMING_PATIENTS_BULLET)}</div>
                <div className="text-xs text-carbon/50">• {t(DASHBOARD.SCHEDULE_MGMT_BULLET)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
