import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { MdEvent, MdPeople, MdQueue, MdCheckCircle } from 'react-icons/md';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-carbon/60">
          Welcome back, <span className="font-medium">{user?.username || user?.email}</span>!
        </p>
        {user?.clinic_id && (
          <p className="text-xs text-carbon/50 mt-1">Front Desk Operations</p>
        )}
      </div>

      {/* Statistics Cards - Receptionist-specific stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Queue Length"
          value="—"
          icon={<MdQueue className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Today's Appointments"
          value="—"
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Checked In"
          value="—"
          icon={<MdCheckCircle className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="New Patients"
          value="—"
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* Receptionist Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Queue Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Manage patient check-ins and queue positions.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-carbon/50">
                  • Check-in patients
                </div>
                <div className="text-xs text-carbon/50">
                  • Monitor queue
                </div>
                <div className="text-xs text-carbon/50">
                  • Appointment booking
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Queue */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Current Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Active queue will be displayed here once the Queue module is implemented.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
