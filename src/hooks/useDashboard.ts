import { useQuery } from '@tanstack/react-query';
import { clinicsApi } from '@/api/clinics';
import { employeesApi } from '@/api/employees';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalClinics: number;
  totalEmployees: number;
  activeClinics: number;
  activeEmployees: number;
}

/**
 * Hook to fetch dashboard statistics
 * For SYSTEM users: Shows clinics and employees stats
 * For EMPLOYEE users: Will show clinic-specific stats (to be implemented)
 */
export const useDashboardStats = () => {
  const { user } = useAuth();

  // Fetch clinics stats (for SYSTEM users)
  const { data: clinicsData, isLoading: clinicsLoading } = useQuery({
    queryKey: ['clinics', 'stats'],
    queryFn: () => clinicsApi.list({ limit: 1, page: 1 }),
    enabled: user?.user_type === 'SYSTEM',
  });

  // Fetch employees stats (for SYSTEM users)
  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'stats'],
    queryFn: () => employeesApi.list({ limit: 1, page: 1 }),
    enabled: user?.user_type === 'SYSTEM',
  });

  const isLoading = clinicsLoading || employeesLoading;

  const stats: DashboardStats = {
    totalClinics: clinicsData?.total || 0,
    totalEmployees: employeesData?.total || 0,
    activeClinics:
      clinicsData?.data.filter((c) => c.is_active).length || 0,
    activeEmployees:
      employeesData?.data.filter((e) => e.is_active).length || 0,
  };

  return {
    stats,
    isLoading,
  };
};
