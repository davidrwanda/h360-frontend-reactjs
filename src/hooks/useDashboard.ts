import { useQuery } from '@tanstack/react-query';
import { clinicsApi } from '@/api/clinics';
import { usersApi } from '@/api/users';
import { organizationsApi } from '@/api/organizations';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalClinics: number;
  totalEmployees: number;
  activeClinics: number;
  activeEmployees: number;
}

interface SystemDashboardStats {
  totalOrganizations: number;
  activeOrganizations: number;
  orgOwners: number;
  systemAdmins: number;
}

/**
 * Hook to fetch dashboard statistics
 * For Admin role (non-SYSTEM): Shows clinics and employees stats
 */
export const useDashboardStats = () => {
  const { user, role } = useAuth();

  const isSystemUser = user?.user_type === 'SYSTEM' || user?.permissions === 'ALL';

  // Fetch clinics stats (for non-SYSTEM admin users)
  const { data: clinicsData, isLoading: clinicsLoading } = useQuery({
    queryKey: ['clinics', 'stats'],
    queryFn: () => clinicsApi.list({ limit: 1, page: 1 }),
    enabled: !isSystemUser && role === 'ADMIN',
  });

  // Fetch users stats (for non-SYSTEM admin users)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => usersApi.list({ limit: 1, page: 1 }),
    enabled: !isSystemUser && role === 'ADMIN',
  });

  const isLoading = clinicsLoading || usersLoading;

  const stats: DashboardStats = {
    totalClinics: clinicsData?.total || 0,
    totalEmployees: usersData?.total || 0,
    activeClinics:
      clinicsData?.data.filter((c) => c.is_active).length || 0,
    activeEmployees:
      usersData?.data.filter((e) => e.is_active).length || 0,
  };

  return {
    stats,
    isLoading,
  };
};

/**
 * Hook to fetch dashboard statistics for SYSTEM users (organization-focused)
 */
export const useSystemDashboardStats = () => {
  const { user } = useAuth();

  const isSystemUser = user?.user_type === 'SYSTEM' || user?.permissions === 'ALL';

  // Fetch organizations
  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations', 'dashboard-stats'],
    queryFn: () => organizationsApi.list({ limit: 100, page: 1 }),
    enabled: isSystemUser,
  });

  // Fetch org owners
  const { data: orgOwnersData, isLoading: ownersLoading } = useQuery({
    queryKey: ['users', 'org-owners-stats'],
    queryFn: () => usersApi.list({ role: 'ORG_OWNER', limit: 1, page: 1 }),
    enabled: isSystemUser,
  });

  // Fetch system admins
  const { data: sysAdminsData, isLoading: adminsLoading } = useQuery({
    queryKey: ['users', 'system-admins-stats'],
    queryFn: () => usersApi.list({ role: 'Admin', limit: 1, page: 1 }),
    enabled: isSystemUser,
  });

  const isLoading = orgsLoading || ownersLoading || adminsLoading;

  const stats: SystemDashboardStats = {
    totalOrganizations: orgsData?.total || 0,
    activeOrganizations: orgsData?.data?.filter((o) => o.is_active).length || 0,
    orgOwners: orgOwnersData?.total || 0,
    systemAdmins: sysAdminsData?.total || 0,
  };

  return {
    stats,
    isLoading,
  };
};
