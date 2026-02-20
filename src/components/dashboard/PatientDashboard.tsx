import { useAuth } from '@/hooks/useAuth';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { MdEvent, MdBusiness } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useTranslation, COMMON, DASHBOARD } from '@/i18n';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const firstName = user?.patient?.first_name
    || user?.patient?.full_name?.split(' ')[0]
    || user?.first_name
    || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-carbon font-heading font-semibold mb-2">
          {t(COMMON.WELCOME_BACK, { name: firstName })}
        </h1>
        <p className="text-body text-carbon/60 font-ui">
          {t(DASHBOARD.MANAGE_PROFILE_DESC)}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title={t(DASHBOARD.UPCOMING_APPOINTMENTS_STAT)}
          value="0"
          icon={<MdEvent className="h-6 w-6" />}
        />
        <StatCard
          title={t(DASHBOARD.ACTIVE_CLINICS)}
          value={user?.patient?.clinics?.filter(c => c.subscription_status === 'active').length || 0}
          icon={<MdBusiness className="h-6 w-6" />}
        />
      </div>

      {/* Next Appointment Card */}
      <Card variant="elevated" className="border-azure-dragon/20 bg-azure-dragon/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MdEvent className="h-5 w-5 text-azure-dragon" />
            {t(DASHBOARD.NEXT_APPOINTMENT)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MdEvent className="h-12 w-12 text-carbon/30 mb-4" />
            <h3 className="text-h4 text-carbon font-heading font-medium mb-2">
              {t(DASHBOARD.NO_UPCOMING_TITLE)}
            </h3>
            <p className="text-body text-carbon/60 font-ui max-w-md mb-4">
              {t(DASHBOARD.NO_UPCOMING_DESC)}
            </p>
            <button
              onClick={() => navigate('/my-appointments')}
              className="px-4 py-2 bg-azure-dragon text-white rounded-md hover:bg-azure-dragon-dark transition-colors text-sm font-medium"
            >
              {t(DASHBOARD.BOOK_APPOINTMENT)}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};
