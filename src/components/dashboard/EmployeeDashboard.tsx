import { useState } from 'react';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent, Loading, Modal } from '@/components/ui';
import { AppointmentsCalendar } from '@/components/doctors/AppointmentsCalendar';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { MdEvent, MdPeople, MdQueue, MdLocalHospital, MdAccessTime, MdPerson } from 'react-icons/md';
import { format, isToday, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/utils/cn';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get clinic_id from storage (fallback to user object)
  const getClinicIdFromStorage = (): string | undefined => {
    try {
      const authStorage = localStorage.getItem('h360-auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        if (parsed.state?.user?.clinic_id) {
          return parsed.state.user.clinic_id;
        }
      }
    } catch (error) {
      console.warn('Failed to get clinic_id from localStorage:', error);
    }
    return user?.clinic_id || user?.employee?.clinic_id;
  };

  const clinicId = getClinicIdFromStorage();

  // Fetch appointments for the clinic
  const { data: appointmentsData, isLoading: isLoadingAppointments } = useAppointments({
    clinic_id: clinicId,
    limit: 100,
    sortBy: 'appointment_date',
    sortOrder: 'ASC',
  });

  const appointments = appointmentsData?.data || [];

  // Filter upcoming appointments
  const today = new Date();
  const upcomingAppointments = appointments
    .filter((apt) => {
      const aptDate = parseISO(apt.appointment_date);
      return aptDate >= today && apt.status !== 'completed' && apt.status !== 'cancelled';
    })
    .slice(0, 10); // Show next 10 upcoming appointments

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.appointment_date);
    return isToday(aptDate) && apt.status !== 'completed' && apt.status !== 'cancelled';
  });

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
          Welcome back, <span className="font-medium">
            {user?.employee?.first_name || 
             user?.employee?.full_name?.split(' ')[0] ||
             user?.first_name ||
             user?.username || 
             user?.email}
          </span>!
        </p>
      </div>

      {/* Statistics Cards */}
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
          title="Queue Position"
          value="—"
          icon={<MdQueue className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Available Doctors"
          value="—"
          icon={<MdLocalHospital className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Clinic Calendar and Upcoming Appointments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar - Takes 2 columns */}
        <div className="lg:col-span-2">
          <AppointmentsCalendar
            appointments={appointments}
            onDateClick={handleDateClick}
            title="Clinic Calendar"
          />
        </div>

        {/* Upcoming Appointments - Takes 1 column */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdAccessTime className="h-5 w-5 text-azure-dragon" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="flex items-center justify-center py-8">
                <Loading size="sm" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-carbon/60">No upcoming appointments</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {upcomingAppointments.map((apt) => {
                  const aptDate = parseISO(apt.appointment_date);
                  const aptDateTime = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
                  return (
                    <div
                      key={apt.appointment_id}
                      className="p-3 rounded-lg border border-carbon/10 hover:border-azure-dragon/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MdPerson className="h-4 w-4 text-carbon/60 flex-shrink-0" />
                            <p className="text-sm font-medium text-carbon truncate">
                              {apt.patient_name || apt.guest_name || 'Unknown'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-carbon/60 mb-1">
                            <MdEvent className="h-3.5 w-3.5" />
                            <span>{format(aptDate, 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-carbon/60 mb-2">
                            <MdAccessTime className="h-3.5 w-3.5" />
                            <span>{format(aptDateTime, 'hh:mm a')}</span>
                          </div>
                          {apt.doctor_name && (
                            <p className="text-xs text-carbon/50">Dr. {apt.doctor_name}</p>
                          )}
                          {apt.service_name && (
                            <p className="text-xs text-carbon/50">{apt.service_name}</p>
                          )}
                        </div>
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
                            apt.status === 'booked'
                              ? 'bg-azure-dragon/20 text-azure-dragon'
                              : apt.status === 'checked_in'
                              ? 'bg-blue-500/20 text-blue-600'
                              : apt.status === 'in_progress'
                              ? 'bg-yellow-500/20 text-yellow-600'
                              : 'bg-carbon/10 text-carbon/70'
                          )}
                        >
                          {apt.status.replace('_', ' ')}
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="text-xs text-carbon/60 mt-2 line-clamp-2">{apt.notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* User Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-carbon/60">Role:</span>
                <span className="font-medium text-carbon capitalize">
                  {user?.role || user?.user_type || 'N/A'}
                </span>
              </div>
              {user?.email && (
                <div className="flex justify-between">
                  <span className="text-carbon/60">Email:</span>
                  <span className="font-medium text-carbon text-xs">{user.email}</span>
                </div>
              )}
              {clinicId && (
                <div className="flex justify-between">
                  <span className="text-carbon/60">Clinic ID:</span>
                  <span className="font-medium text-carbon text-xs">{clinicId}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Selection Modal */}
      {selectedDate && (
        <Modal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          title={`Appointments for ${format(selectedDate, 'MMMM d, yyyy')}`}
        >
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDateAppointments.length === 0 ? (
              <p className="text-sm text-carbon/60 text-center py-4">No appointments for this date</p>
            ) : (
              selectedDateAppointments.map((apt) => {
                const aptDateTime = parseISO(`${apt.appointment_date}T${apt.appointment_time}`);
                return (
                  <div
                    key={apt.appointment_id}
                    className="p-3 rounded-lg border border-carbon/10"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-carbon">
                          {apt.patient_name || apt.guest_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-carbon/60 mt-1">
                          {format(aptDateTime, 'hh:mm a')}
                        </p>
                        {apt.doctor_name && (
                          <p className="text-xs text-carbon/50 mt-1">Dr. {apt.doctor_name}</p>
                        )}
                        {apt.service_name && (
                          <p className="text-xs text-carbon/50">{apt.service_name}</p>
                        )}
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          apt.status === 'booked'
                            ? 'bg-azure-dragon/20 text-azure-dragon'
                            : apt.status === 'checked_in'
                            ? 'bg-blue-500/20 text-blue-600'
                            : apt.status === 'in_progress'
                            ? 'bg-yellow-500/20 text-yellow-600'
                            : 'bg-carbon/10 text-carbon/70'
                        )}
                      >
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>
                    {apt.notes && (
                      <p className="text-xs text-carbon/60 mt-2">{apt.notes}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
