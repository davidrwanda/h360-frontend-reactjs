import { useAuth } from '@/hooks/useAuth';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdEvent, MdBusiness } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
          Welcome back{user?.patient?.first_name 
            ? `, ${user.patient.first_name}`
            : user?.patient?.full_name
            ? `, ${user.patient.full_name.split(' ')[0]}`
            : user?.first_name
            ? `, ${user.first_name}`
            : ''}!
        </h1>
        <p className="text-body text-carbon/60 font-ui">
          Manage your appointments and profile information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Upcoming Appointments"
          value="0"
          icon={MdEvent}
          description="No upcoming appointments"
          onClick={() => navigate('/my-appointments')}
        />
        <StatCard
          title="Active Clinics"
          value={user?.patient?.clinics?.filter(c => c.subscription_status === 'active').length || 0}
          icon={MdBusiness}
          description="Clinics you're subscribed to"
        />
      </div>

      {/* Next Appointment Card */}
      <Card variant="elevated" className="border-azure-dragon/20 bg-azure-dragon/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdEvent className="h-5 w-5 text-azure-dragon" />
            Next Appointment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MdEvent className="h-12 w-12 text-carbon/30 mb-4" />
            <h3 className="text-h4 text-carbon font-heading font-medium mb-2">
              No Upcoming Appointments
            </h3>
            <p className="text-body text-carbon/60 font-ui max-w-md mb-4">
              You don't have any upcoming appointments scheduled. Book an appointment to get started.
            </p>
            <button
              onClick={() => navigate('/my-appointments')}
              className="px-4 py-2 bg-azure-dragon text-white rounded-md hover:bg-azure-dragon-dark transition-colors text-sm font-medium"
            >
              Book Appointment
            </button>
          </div>
          {/* TODO: When appointments API is available, display next appointment here:
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MdAccessTime className="h-4 w-4 text-azure-dragon" />
                  <span className="text-sm font-medium text-carbon">
                    {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MdPerson className="h-4 w-4 text-carbon/60" />
                  <span className="text-sm text-carbon/80">Dr. {appointment.doctor_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdLocationOn className="h-4 w-4 text-carbon/60" />
                  <span className="text-sm text-carbon/80">{appointment.clinic_name}</span>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-azure-dragon/10 text-azure-dragon">
                {appointment.status}
              </span>
            </div>
            {appointment.service_name && (
              <div className="pt-3 border-t border-carbon/10">
                <p className="text-xs text-carbon/60">Service:</p>
                <p className="text-sm font-medium text-carbon">{appointment.service_name}</p>
              </div>
            )}
          </div>
          */}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};
