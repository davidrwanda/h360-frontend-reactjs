import { useState } from 'react';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent, Loading, Modal } from '@/components/ui';
import { AppointmentsCalendar } from '@/components/doctors/AppointmentsCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors } from '@/hooks/useDoctors';
import { useAppointments } from '@/hooks/useAppointments';
import { MdEvent, MdPeople, MdSchedule, MdLocalHospital, MdAccessTime, MdPerson } from 'react-icons/md';
import { format, isToday, isThisWeek, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/utils/cn';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Fetch doctors filtered by user_id to get the doctor record
  const { data: doctorsData } = useDoctors({
    user_id: user?.user_id,
    limit: 1,
  });
  
  const doctor = doctorsData?.data?.[0];
  
  // Fetch appointments for this doctor
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    doctor_id: doctor?.doctor_id,
    limit: 50,
    sortBy: 'appointment_date',
    sortOrder: 'ASC',
  });

  const appointments = appointmentsData?.data || [];
  
  // Filter appointments
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
    .slice(0, 5); // Show next 5 upcoming appointments

  // Get appointments for selected date
  const selectedDateAppointments = selectedDate
    ? appointments.filter((apt) => {
        const aptDate = parseISO(apt.appointment_date);
        return isSameDay(aptDate, selectedDate);
      })
    : [];

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-carbon/60">
          Welcome back, Dr. <span className="font-medium">
            {user?.employee?.first_name || 
             user?.employee?.full_name?.split(' ')[0] ||
             user?.first_name ||
             user?.username || 
             user?.email}
          </span>!
        </p>
        {user?.clinic_id && (
          <p className="text-xs text-carbon/50 mt-1">Medical Professional</p>
        )}
      </div>

      {/* Statistics Cards - Doctor-specific stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length.toString()}
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Patients Today"
          value={todayAppointments.length.toString()}
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Upcoming This Week"
          value={upcomingThisWeek.length.toString()}
          icon={<MdSchedule className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Available Slots"
          value="—"
          icon={<MdLocalHospital className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Calendar and Upcoming Appointments */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Calendar View */}
        <AppointmentsCalendar appointments={appointments} onDateClick={handleDateClick} />

        {/* Upcoming Appointments List */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdEvent className="h-5 w-5 text-azure-dragon" />
              Upcoming Appointments
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
                  const appointmentDateTime = parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`);
                  const isTodayAppt = isToday(appointmentDateTime);
                  
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
                              {appointment.patient_name || appointment.guest_name || 'Unknown Patient'}
                            </span>
                            {appointment.is_guest_booking && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-carbon/10 text-carbon/60">
                                Guest
                              </span>
                            )}
                          </div>
                          <div className="grid gap-2 md:grid-cols-2 text-xs text-carbon/70 ml-6">
                            <div className="flex items-center gap-1">
                              <MdAccessTime className="h-3 w-3" />
                              <span className="font-medium">Date: </span>
                              {format(appointmentDateTime, 'MMM dd, yyyy')}
                              {isTodayAppt && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-azure-dragon/10 text-azure-dragon ml-1">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <MdSchedule className="h-3 w-3" />
                              <span className="font-medium">Time: </span>
                              {format(appointmentDateTime, 'hh:mm a')}
                            </div>
                            {appointment.service_name && (
                              <div>
                                <span className="font-medium">Service: </span>
                                {appointment.service_name}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Status: </span>
                              <span
                                className={cn(
                                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                                  appointment.status === 'booked'
                                    ? 'bg-bright-halo/20 text-azure-dragon'
                                    : appointment.status === 'checked_in'
                                    ? 'bg-blue-500/20 text-blue-600'
                                    : appointment.status === 'in_progress'
                                    ? 'bg-yellow-500/20 text-yellow-600'
                                    : 'bg-carbon/10 text-carbon/60'
                                )}
                              >
                                {appointment.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                              </span>
                            </div>
                          </div>
                          {appointment.notes && (
                            <div className="mt-2 ml-6 text-xs text-carbon/60">
                              <span className="font-medium">Notes: </span>
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
                <p>No upcoming appointments scheduled.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Date Appointments Modal */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={`Appointments for ${selectedDate ? format(selectedDate, 'MMMM dd, yyyy') : ''}`}
      >
        <div className="space-y-3">
          {selectedDateAppointments.length > 0 ? (
            selectedDateAppointments.map((appointment) => {
              const appointmentDateTime = parseISO(`${appointment.appointment_date}T${appointment.appointment_time}`);
              
              return (
                <div
                  key={appointment.appointment_id}
                  className="rounded-md border border-carbon/10 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MdPerson className="h-4 w-4 text-azure-dragon" />
                      <span className="text-sm font-medium text-carbon">
                        {appointment.patient_name || appointment.guest_name || 'Unknown Patient'}
                      </span>
                      {appointment.is_guest_booking && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-carbon/10 text-carbon/60">
                          Guest
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
                          : 'bg-carbon/10 text-carbon/60'
                      )}
                    >
                      {appointment.status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 text-xs text-carbon/70 ml-6">
                    <div className="flex items-center gap-1">
                      <MdAccessTime className="h-3 w-3" />
                      <span className="font-medium">Time: </span>
                      {format(appointmentDateTime, 'hh:mm a')}
                    </div>
                    {appointment.service_name && (
                      <div>
                        <span className="font-medium">Service: </span>
                        {appointment.service_name}
                      </div>
                    )}
                    {appointment.is_guest_booking ? (
                      <>
                        {appointment.guest_phone && (
                          <div>
                            <span className="font-medium">Phone: </span>
                            {appointment.guest_phone}
                          </div>
                        )}
                        {appointment.guest_email && (
                          <div>
                            <span className="font-medium">Email: </span>
                            {appointment.guest_email}
                          </div>
                        )}
                      </>
                    ) : (
                      appointment.patient_id && (
                        <div>
                          <span className="font-medium">Patient ID: </span>
                          {appointment.patient_id}
                        </div>
                      )
                    )}
                  </div>
                  {appointment.notes && (
                    <div className="mt-2 ml-6 text-xs text-carbon/60">
                      <span className="font-medium">Notes: </span>
                      {appointment.notes}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-sm text-carbon/60">
              <MdEvent className="h-8 w-8 mx-auto mb-2 text-carbon/30" />
              <p>No appointments scheduled for this date.</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* Doctor Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Your Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                View and manage your appointments and schedule.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-carbon/50">
                  • Today's appointments
                </div>
                <div className="text-xs text-carbon/50">
                  • Upcoming patients
                </div>
                <div className="text-xs text-carbon/50">
                  • Schedule management
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
