import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization, useOrgMembers } from '@/hooks/useOrganizations';
import { useTranslation, COMMON, ORGANIZATION } from '@/i18n';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StatCard } from './StatCard';
import {
  MdBusiness,
  MdPeople,
  MdCorporateFare,
  MdArrowForward,
  MdPersonAdd,
  MdCheckCircle,
  MdPending,
} from 'react-icons/md';

export const OrgOwnerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const orgId = user?.organization_id || user?.employee?.organization_id || '';

  const { data: orgData, isLoading: orgLoading } = useOrganization(orgId);
  const { data: membersData, isLoading: membersLoading } = useOrgMembers(orgId, { limit: 100 });

  const firstName = user?.first_name || user?.username || user?.email?.split('@')[0] || '';

  const memberStats = useMemo(() => {
    const members = membersData?.data || [];
    return {
      total: membersData?.total || members.length,
      active: members.filter((m) => m.status === 'active').length,
      pending: members.filter((m) => m.status === 'pending').length,
    };
  }, [membersData]);

  const clinics = orgData?.clinics || [];
  const clinicCount = orgData?.clinic_count ?? clinics.length;

  if (!orgId) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <MdCorporateFare className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
        <p className="text-sm text-carbon/60">{t(ORGANIZATION.FAILED_LOAD)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 text-carbon font-heading font-semibold mb-1">
          {t(COMMON.WELCOME_BACK, { name: firstName })}
        </h1>
        {orgData?.name && (
          <p className="text-sm text-carbon/60">{orgData.name}</p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t(ORGANIZATION.TOTAL_CLINICS)}
          value={clinicCount}
          icon={<MdBusiness className="h-6 w-6" />}
          variant="primary"
          loading={orgLoading}
        />
        <StatCard
          title={t(ORGANIZATION.TOTAL_MEMBERS)}
          value={memberStats.total}
          icon={<MdPeople className="h-6 w-6" />}
          variant="primary"
          loading={membersLoading}
        />
        <StatCard
          title={t(ORGANIZATION.ACTIVE_MEMBERS)}
          value={memberStats.active}
          icon={<MdCheckCircle className="h-6 w-6" />}
          variant="success"
          loading={membersLoading}
        />
        <StatCard
          title={t(ORGANIZATION.PENDING_INVITATIONS)}
          value={memberStats.pending}
          icon={<MdPending className="h-6 w-6" />}
          variant="warning"
          loading={membersLoading}
        />
      </div>

      {/* Clinics List + Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Clinics List */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MdBusiness className="h-5 w-5 text-azure-dragon" />
                {t(ORGANIZATION.ORG_CLINICS)}
              </CardTitle>
              <Link
                to="/my-organization/clinics"
                className="flex items-center gap-1 text-sm text-azure-dragon hover:text-azure-dragon/80 font-medium transition-colors"
              >
                <span>View All</span>
                <MdArrowForward className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {orgLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-carbon/5 rounded animate-pulse" />
                ))}
              </div>
            ) : clinics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MdBusiness className="h-12 w-12 text-carbon/20 mb-3" />
                <p className="text-sm text-carbon/60">{t(ORGANIZATION.NO_CLINICS)}</p>
              </div>
            ) : (
              <div className="divide-y divide-carbon/10">
                {clinics.map((clinic) => (
                  <Link
                    key={clinic.id}
                    to={`/clinics/${clinic.id}`}
                    className="flex items-center justify-between py-3 px-1 hover:bg-carbon/5 rounded transition-colors -mx-1 px-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-azure-dragon/10 flex-shrink-0">
                        <MdBusiness className="h-5 w-5 text-azure-dragon" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-carbon truncate">
                          {clinic.facility_name}
                        </p>
                        {clinic.plan_name && (
                          <p className="text-xs text-carbon/50">{clinic.plan_name}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        clinic.is_active
                          ? 'bg-verdant/10 text-verdant'
                          : 'bg-carbon/10 text-carbon/60'
                      }`}
                    >
                      {clinic.is_active ? t(COMMON.ACTIVE) : t(COMMON.INACTIVE)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(COMMON.QUICK_ACTIONS)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                to="/my-organization"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-azure-dragon/5 border border-carbon/10 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-azure-dragon/10 flex-shrink-0">
                  <MdCorporateFare className="h-5 w-5 text-azure-dragon" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-carbon">
                    {t(ORGANIZATION.MY_ORGANIZATION)}
                  </p>
                  <p className="text-xs text-carbon/50 truncate">
                    {t(ORGANIZATION.MY_ORGANIZATION_DESC)}
                  </p>
                </div>
                <MdArrowForward className="h-4 w-4 text-carbon/40 flex-shrink-0" />
              </Link>

              <Link
                to="/my-organization/clinics"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-azure-dragon/5 border border-carbon/10 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-azure-dragon/10 flex-shrink-0">
                  <MdBusiness className="h-5 w-5 text-azure-dragon" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-carbon">
                    {t(ORGANIZATION.ORG_CLINICS)}
                  </p>
                  <p className="text-xs text-carbon/50 truncate">
                    {t(ORGANIZATION.ORG_CLINICS_DESC)}
                  </p>
                </div>
                <MdArrowForward className="h-4 w-4 text-carbon/40 flex-shrink-0" />
              </Link>

              <Link
                to="/my-organization/members"
                className="flex items-center gap-3 p-3 rounded-md hover:bg-azure-dragon/5 border border-carbon/10 transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-azure-dragon/10 flex-shrink-0">
                  <MdPersonAdd className="h-5 w-5 text-azure-dragon" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-carbon">
                    {t(ORGANIZATION.ORG_MEMBERS)}
                  </p>
                  <p className="text-xs text-carbon/50 truncate">
                    {t(ORGANIZATION.ORG_MEMBERS_DESC)}
                  </p>
                </div>
                <MdArrowForward className="h-4 w-4 text-carbon/40 flex-shrink-0" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
