import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useMyMemberships } from '@/hooks/useAuth';
import { useClinicContextStore } from '@/store/clinicContextStore';
import { SystemDashboard } from '@/components/dashboard/SystemDashboard';
import { OrgOwnerDashboard } from '@/components/dashboard/OrgOwnerDashboard';
import { ClinicAdminDashboard } from '@/components/dashboard/ClinicAdminDashboard';
import { DoctorDashboard } from '@/components/dashboard/DoctorDashboard';
import { ReceptionistDashboard } from '@/components/dashboard/ReceptionistDashboard';
import { NurseDashboard } from '@/components/dashboard/NurseDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { WorkspaceSelectorDashboard } from '@/components/dashboard/WorkspaceSelectorDashboard';
import { Loading } from '@/components/ui';

export const DashboardPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLogin = (location.state as { fromLogin?: boolean } | null)?.fromLogin === true;

  // Always fetch memberships — drives post-login redirect and workspace picker
  const { data: memberships, isLoading: membershipsLoading } = useMyMemberships();
  const { activeClinicId, setActiveClinic } = useClinicContextStore();

  const activeOrgs = memberships ?? [];
  const totalActiveClinics = activeOrgs.reduce(
    (sum, org) => sum + org.memberships.filter((m) => m.status === 'active').length,
    0
  );
  const needsPicker = (activeOrgs.length > 1 || totalActiveClinics > 1) && !activeClinicId;

  useEffect(() => {
    // Only auto-redirect/auto-select right after login
    if (!fromLogin) return;
    if (membershipsLoading || !memberships) return;

    // Multiple orgs or multiple clinics → let picker handle it
    if (activeOrgs.length !== 1) return;

    const org = activeOrgs[0]!;
    const activeClinicMemberships = org.memberships.filter((m) => m.status === 'active');
    if (activeClinicMemberships.length !== 1) return;

    const cm = activeClinicMemberships[0]!;
    const normalizedRole = cm.role.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();

    if (normalizedRole === 'ORG_OWNER') {
      navigate('/my-organization', { replace: true });
      return;
    }

    // Single non-owner clinic: auto-select and stay on dashboard
    setActiveClinic(cm.clinic_id, cm.clinic_name);
  }, [memberships, membershipsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loader while resolving memberships
  if (membershipsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="lg" />
      </div>
    );
  }

  // Show picker only when there are multiple options AND no clinic has been chosen yet
  if (needsPicker) {
    return <WorkspaceSelectorDashboard memberships={activeOrgs} />;
  }

  // Show different dashboard based on user type and role
  // SYSTEM users and Admin role users see SystemDashboard
  if (user?.user_type === 'SYSTEM' || user?.permissions === 'ALL' || role === 'ADMIN') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <SystemDashboard />
      </div>
    );
  }

  // ORG_OWNER sees their organization dashboard
  if (role === 'ORG_OWNER') {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <OrgOwnerDashboard />
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
