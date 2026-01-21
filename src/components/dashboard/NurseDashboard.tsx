import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { MdEvent, MdPeople, MdQueue, MdLocalHospital } from 'react-icons/md';

export const NurseDashboard = () => {
  const { user } = useAuth();

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
        {user?.clinic_id && (
          <p className="text-xs text-carbon/50 mt-1">Nursing Staff</p>
        )}
      </div>

      {/* Statistics Cards - Nurse-specific stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Patients Today"
          value="—"
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Appointments"
          value="—"
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Queue Status"
          value="—"
          icon={<MdQueue className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Assigned Patients"
          value="—"
          icon={<MdLocalHospital className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* Nurse Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Patient Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Manage patient care and assist with appointments.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-carbon/50">
                  • Patient records
                </div>
                <div className="text-xs text-carbon/50">
                  • Appointment assistance
                </div>
                <div className="text-xs text-carbon/50">
                  • Queue monitoring
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Your schedule will be displayed here once the Appointments module is implemented.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
