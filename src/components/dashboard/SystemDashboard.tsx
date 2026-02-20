import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { useDashboardStats } from '@/hooks/useDashboard';
import { MdBusiness, MdPerson, MdCheckCircle, MdPeople } from 'react-icons/md';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';

export const SystemDashboard = () => {
  const { stats, isLoading } = useDashboardStats();
  const { user, role } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(COMMON.DASHBOARD)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(COMMON.WELCOME_BACK, { name: user?.username || user?.email || '' })}
        </p>
        <p className="text-xs text-carbon/50 mt-1">
          {t(DASHBOARD.MANAGE_SUBTITLE)}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t(DASHBOARD.TOTAL_CLINICS)}
          value={stats.totalClinics}
          icon={<MdBusiness className="h-6 w-6" />}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.ACTIVE_CLINICS)}
          value={stats.activeClinics}
          icon={<MdCheckCircle className="h-6 w-6" />}
          variant="success"
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.TOTAL_EMPLOYEES)}
          value={stats.totalEmployees}
          icon={<MdPerson className="h-6 w-6" />}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.ACTIVE_EMPLOYEES)}
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
            <CardTitle>{t(DASHBOARD.SYSTEM_INFORMATION)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-carbon/60">{t(DASHBOARD.USER_TYPE)}</span>
                <span className="font-medium text-carbon capitalize">{user?.user_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon/60">{t(DASHBOARD.PERMISSIONS)}</span>
                <span className="font-medium text-carbon">
                  {user?.permissions === 'ALL' ? t(COMMON.FULL_ACCESS) : user?.permissions || 'N/A'}
                </span>
              </div>
              {user?.email && (
                <div className="flex justify-between">
                  <span className="text-carbon/60">{t(COMMON.EMAIL)}</span>
                  <span className="font-medium text-carbon text-xs">{user.email}</span>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-carbon/10">
              <div className="rounded-md bg-azure-dragon/10 p-2.5">
                <p className="text-xs font-medium text-azure-dragon">
                  {user?.user_type === 'SYSTEM'
                    ? t(DASHBOARD.SYSTEM_USER_ACCESS)
                    : role === 'ADMIN'
                    ? t(DASHBOARD.ADMIN_USER_ACCESS)
                    : t(DASHBOARD.FULL_SYSTEM_ACCESS)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(DASHBOARD.RECENT_ACTIVITY)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                {t(DASHBOARD.ACTIVITY_PLACEHOLDER)}
              </p>
              <Link to="/activity-logs">
                <button className="text-xs text-azure-dragon hover:underline font-medium">
                  {t(DASHBOARD.VIEW_ACTIVITY_LOGS)} →
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
