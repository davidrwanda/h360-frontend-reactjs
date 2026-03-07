import { Link } from 'react-router-dom';
import { StatCard } from './StatCard';
import { useSystemDashboardStats } from '@/hooks/useDashboard';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';
import {
  MdCorporateFare,
  MdCheckCircle,
  MdPeople,
  MdAdminPanelSettings,
  MdAdd,
  MdArrowForward,
  MdPerson,
  MdHistory,
} from 'react-icons/md';

export const SystemDashboard = () => {
  const { stats, isLoading } = useSystemDashboardStats();
  const { user } = useAuth();
  const { t } = useTranslation();

  const firstName = user?.first_name || user?.username || user?.email?.split('@')[0] || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-carbon font-heading font-semibold mb-1">
          {t(COMMON.WELCOME_BACK, { name: firstName })}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(DASHBOARD.SYSTEM_SUBTITLE)}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t(DASHBOARD.TOTAL_ORGANIZATIONS)}
          value={stats.totalOrganizations}
          icon={<MdCorporateFare className="h-6 w-6" />}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.ACTIVE_ORGANIZATIONS)}
          value={stats.activeOrganizations}
          icon={<MdCheckCircle className="h-6 w-6" />}
          variant="success"
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.ORG_OWNERS)}
          value={stats.orgOwners}
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
          loading={isLoading}
        />
        <StatCard
          title={t(DASHBOARD.SYSTEM_ADMINS)}
          value={stats.systemAdmins}
          icon={<MdAdminPanelSettings className="h-6 w-6" />}
          variant="success"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions + System Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t(COMMON.QUICK_ACTIONS)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/organizations/create" className="block">
                <Button variant="primary" size="md" className="w-full justify-start">
                  <MdAdd className="h-4 w-4" />
                  <div className="ml-2 flex flex-col items-start">
                    <span>{t(DASHBOARD.CREATE_ORGANIZATION)}</span>
                    <span className="text-xs opacity-75 mt-0.5">{t(DASHBOARD.CREATE_ORG_DESC)}</span>
                  </div>
                </Button>
              </Link>
              <Link to="/organizations" className="block">
                <Button variant="outline" size="md" className="w-full justify-start">
                  <MdCorporateFare className="h-4 w-4" />
                  <span className="ml-2">{t(DASHBOARD.MANAGE_ORGANIZATIONS)}</span>
                </Button>
              </Link>
              <Link to="/users" className="block">
                <Button variant="outline" size="md" className="w-full justify-start">
                  <MdPeople className="h-4 w-4" />
                  <div className="ml-2 flex flex-col items-start">
                    <span>{t(DASHBOARD.MANAGE_ORG_OWNERS)}</span>
                    <span className="text-xs text-carbon/60 mt-0.5">{t(DASHBOARD.MANAGE_ORG_OWNERS_DESC)}</span>
                  </div>
                </Button>
              </Link>
              <Link to="/activity-logs" className="block">
                <Button variant="outline" size="md" className="w-full justify-start">
                  <MdHistory className="h-4 w-4" />
                  <span className="ml-2">{t(DASHBOARD.VIEW_ACTIVITY_LOGS)}</span>
                </Button>
              </Link>
            </div>
            <div className="pt-3 mt-3 border-t border-carbon/10">
              <p className="text-xs text-carbon/50">
                {t(DASHBOARD.SYSTEM_ADMIN_FOOTER)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(DASHBOARD.SYSTEM_INFORMATION)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 rounded-md bg-azure-dragon/5 border border-azure-dragon/15 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-azure-dragon/10">
                  <MdPerson className="h-5 w-5 text-azure-dragon" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-carbon text-sm truncate">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.username || user?.email}
                  </p>
                  <p className="text-xs text-carbon/50 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2 pt-1">
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
              </div>
            </div>

            {/* View All Orgs Link */}
            <div className="mt-4 pt-4 border-t border-carbon/10">
              <Link
                to="/organizations"
                className="flex items-center justify-between text-sm text-azure-dragon hover:text-azure-dragon/80 font-medium transition-colors"
              >
                <span>{t(DASHBOARD.VIEW_ALL_ORGANIZATIONS)}</span>
                <MdArrowForward className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
