import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { MdEvent, MdPeople, MdQueue, MdCheckCircle } from 'react-icons/md';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
          {t(COMMON.DASHBOARD)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(COMMON.WELCOME_BACK, {
            name: user?.employee?.first_name ||
              user?.employee?.full_name?.split(' ')[0] ||
              user?.first_name ||
              user?.username ||
              user?.email || '',
          })}
        </p>
        {user?.clinic_id && (
          <p className="text-xs text-carbon/50 mt-1">{t(DASHBOARD.FRONT_DESK_OPERATIONS)}</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t(DASHBOARD.QUEUE_LENGTH)}
          value="—"
          icon={<MdQueue className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title={t(DASHBOARD.TODAYS_APPOINTMENTS)}
          value="—"
          icon={<MdEvent className="h-6 w-6" />}
          variant="primary"
        />
        <StatCard
          title={t(DASHBOARD.CHECKED_IN)}
          value="—"
          icon={<MdCheckCircle className="h-6 w-6" />}
          variant="success"
        />
        <StatCard
          title={t(DASHBOARD.NEW_PATIENTS)}
          value="—"
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
        />
      </div>

      {/* Quick Actions and Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <QuickActions />

        {/* Receptionist Info Card */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(DASHBOARD.QUEUE_MANAGEMENT)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                {t(DASHBOARD.QUEUE_MGMT_DESC)}
              </p>
              <div className="space-y-2">
                <div className="text-xs text-carbon/50">
                  • {t(DASHBOARD.CHECK_IN_PATIENTS_BULLET)}
                </div>
                <div className="text-xs text-carbon/50">
                  • {t(DASHBOARD.MONITOR_QUEUE_BULLET)}
                </div>
                <div className="text-xs text-carbon/50">
                  • {t(DASHBOARD.APPOINTMENT_BOOKING_BULLET)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Queue */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(DASHBOARD.CURRENT_QUEUE)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-carbon/60">
                {t(DASHBOARD.QUEUE_PLACEHOLDER)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
