import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { MdPeople, MdEvent, MdLocalHospital, MdMedicalServices } from 'react-icons/md';

export const ClinicAdminDashboard = () => {
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
          <p className="text-xs text-carbon/50 mt-1">Clinic Administrator</p>
        )}
      </div>

      {/* Statistics Cards - Clinic-specific stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value="—"
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Today's Appointments"
          value="—"
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title="Active Doctors"
          value="—"
          icon={<MdLocalHospital className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title="Services"
          value="—"
          icon={<MdMedicalServices className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* Clinic Admin Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Clinic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-carbon/60">Role:</span>
                <span className="font-medium text-carbon capitalize">{user?.role || 'ADMIN'}</span>
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
            <div className="mt-4 pt-4 border-t border-carbon/10">
              <div className="rounded-md bg-azure-dragon/10 p-2.5">
                <p className="text-xs font-medium text-azure-dragon">
                  Clinic Administrator - Full clinic management access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinic Management Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Clinic Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                Manage your clinic's patients, doctors, services, and appointments.
              </p>
              <div className="space-y-2">
                <div className="text-xs text-carbon/50">
                  • Patient management
                </div>
                <div className="text-xs text-carbon/50">
                  • Doctor schedules
                </div>
                <div className="text-xs text-carbon/50">
                  • Service configuration
                </div>
                <div className="text-xs text-carbon/50">
                  • Appointment oversight
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
