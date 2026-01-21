import { useAuth } from '@/hooks/useAuth';
import { SystemDashboard } from '@/components/dashboard/SystemDashboard';
import { ClinicAdminDashboard } from '@/components/dashboard/ClinicAdminDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { ReceptionistDashboard } from '@/components/dashboard/ReceptionistDashboard';
import { NurseDashboard } from '@/components/dashboard/NurseDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';

export const DashboardPage = () => {
  const { user, role } = useAuth();

  // Show different dashboard based on user type and role
  // SYSTEM users and Admin role users see SystemDashboard
  if (user?.user_type === 'SYSTEM' || user?.permissions === 'ALL' || role === 'ADMIN') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <SystemDashboard />
      </div>
    );
  }

  // Role-based dashboards for EMPLOYEE users
  // Note: ADMIN is already handled above, so this only checks MANAGER
  if (role === 'MANAGER') {
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

  if (role === 'PATIENT') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <PatientDashboard />
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
