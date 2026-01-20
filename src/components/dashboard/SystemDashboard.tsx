import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { useDashboardStats } from '@/hooks/useDashboard';
import { MdBusiness, MdPerson, MdCheckCircle, MdPeople } from 'react-icons/md';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

export const SystemDashboard = () => {
  const { stats, isLoading } = useDashboardStats();
  const { user, role } = useAuth();

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
        <p className="text-xs text-carbon/50 mt-1">
          Manage clinics and users across the system
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clinics"
          value={stats.totalClinics}
          icon={<MdBusiness className="h-6 w-6" />}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title="Active Clinics"
          value={stats.activeClinics}
          icon={<MdCheckCircle className="h-6 w-6" />}
          variant="success"
          loading={isLoading}
        />
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<MdPerson className="h-6 w-6" />}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees}
          icon={<MdPeople className="h-6 w-6" />}
          variant="success"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* System Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-carbon/60">User Type:</span>
                <span className="font-medium text-carbon capitalize">{user?.user_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon/60">Permissions:</span>
                <span className="font-medium text-carbon">
                  {user?.permissions === 'ALL' ? 'Full Access' : user?.permissions || 'N/A'}
                </span>
              </div>
              {user?.email && (
                <div className="flex justify-between">
                  <span className="text-carbon/60">Email:</span>
                  <span className="font-medium text-carbon text-xs">{user.email}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-carbon/10">
              <div className="rounded-md bg-azure-dragon/10 p-2.5">
                <p className="text-xs font-medium text-azure-dragon">
                  {user?.user_type === 'SYSTEM' 
                    ? 'System User - Full system access'
                    : role === 'ADMIN'
                    ? 'Admin User - Full system access'
                    : 'Full system access'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Recent activity will be displayed here once Activity Logs module is implemented.
              </p>
              <Link to="/activity-logs">
                <button className="text-xs text-azure-dragon hover:underline font-medium">
                  View Activity Logs →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
