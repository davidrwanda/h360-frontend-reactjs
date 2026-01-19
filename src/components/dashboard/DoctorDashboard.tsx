import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { MdEvent, MdPeople, MdSchedule, MdLocalHospital } from 'react-icons/md';

export const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-carbon/60">
          Welcome back, Dr. <span className="font-medium">{user?.username || user?.email}</span>!
        </p>
        {user?.clinic_id && (
          <p className="text-xs text-carbon/50 mt-1">Medical Professional</p>
        )}
      </div>

      {/* Statistics Cards - Doctor-specific stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value="—"
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Patients Today"
          value="—"
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Upcoming This Week"
          value="—"
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

        {/* Upcoming Appointments */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Your next appointments will be displayed here once the Appointments module is
                implemented.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
