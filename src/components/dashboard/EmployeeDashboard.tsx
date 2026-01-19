import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { MdEvent, MdPeople, MdQueue, MdLocalHospital } from 'react-icons/md';

export const EmployeeDashboard = () => {
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
      </div>

      {/* Statistics Cards - Placeholder for future modules */}
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
              {user?.clinic_id && (
                <div className="flex justify-between">
                  <span className="text-carbon/60">Clinic ID:</span>
                  <span className="font-medium text-carbon text-xs">{user.clinic_id}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments Placeholder */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Upcoming appointments will be displayed here once the Appointments module is
                implemented.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
