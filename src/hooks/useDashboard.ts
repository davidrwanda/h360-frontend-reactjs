import { useQuery } from '@tanstack/react-query';
import { clinicsApi } from '@/api/clinics';
import { usersApi } from '@/api/users';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalClinics: number;
  totalEmployees: number;
  activeClinics: number;
  activeEmployees: number;
}

/**
 * Hook to fetch dashboard statistics
 * For SYSTEM users and Admin role: Shows clinics and employees stats
 * For EMPLOYEE users: Will show clinic-specific stats (to be implemented)
 */
export const useDashboardStats = () => {
  const { user, role } = useAuth();

  // Fetch clinics stats (for SYSTEM users and Admin role)
  const { data: clinicsData, isLoading: clinicsLoading } = useQuery({
    queryKey: ['clinics', 'stats'],
    queryFn: () => clinicsApi.list({ limit: 1, page: 1 }),
    enabled: user?.user_type === 'SYSTEM' || role === 'ADMIN',
  });

  // Fetch users stats (for SYSTEM users and Admin role)
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users', 'stats'],
    queryFn: () => usersApi.list({ limit: 1, page: 1 }),
    enabled: user?.user_type === 'SYSTEM' || role === 'ADMIN',
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
