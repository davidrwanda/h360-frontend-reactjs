import { useAuth } from '@/hooks/useAuth';
import { SystemDashboard } from '@/components/dashboard/SystemDashboard';
import { ClinicAdminDashboard } from '@/components/dashboard/ClinicAdminDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { ReceptionistDashboard } from '@/components/dashboard/ReceptionistDashboard';
import { NurseDashboard } from '@/components/dashboard/NurseDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';

export const DashboardPage = () => {
  const { user, role } = useAuth();

  // Show different dashboard based on user type and role
  if (user?.user_type === 'SYSTEM' || user?.permissions === 'ALL') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <SystemDashboard />
      </div>
    );
  }

  // Role-based dashboards for EMPLOYEE users
  if (role === 'ADMIN' || role === 'MANAGER') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <ClinicAdminDashboard />
      </div>
    );
  }

  if (role === 'DOCTOR') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <DoctorDashboard />
      </div>
    );
  }

  if (role === 'RECEPTIONIST') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <ReceptionistDashboard />
      </div>
    );
  }

  if (role === 'NURSE') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <NurseDashboard />
      </div>
    );
  }

  // Fallback to generic employee dashboard
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <EmployeeDashboard />
    </div>
  );
};
