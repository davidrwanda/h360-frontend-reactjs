import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization, useOrgMembers } from '@/hooks/useOrganizations';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui';
import { MdEdit, MdBusiness, MdPerson, MdSettings as MdSettingsIcon } from 'react-icons/md';

const orgTypeLabelKey: Record<string, string> = {
  single_clinic: 'org.typeSingleClinic',
  multi_branch: 'org.typeMultiBranch',
  health_network: 'org.typeHealthNetwork',
};

export const MyOrganizationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.organization_id || user?.employee?.organization_id || '';

  const { data: org, isLoading, error } = useOrganization(orgId);
  const { data: membersData } = useOrgMembers(orgId, { limit: 1 }, { enabled: !!orgId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-3">
          <p className="text-sm text-smudged-lips">{t(ORGANIZATION.FAILED_LOAD)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon">{org.name}</h1>
          <p className="text-sm text-carbon/60">{t(ORGANIZATION.ORGANIZATION_DETAILS)}</p>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate('/my-organization/edit')}>
          <MdEdit className="h-4 w-4 mr-2" />
          {t(COMMON.EDIT)}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Organization Details */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(ORGANIZATION.ORGANIZATION_DETAILS)}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.NAME)}</dt>
                <dd className="text-sm font-medium text-carbon">{org.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.TYPE)}</dt>
                <dd className="text-sm text-carbon">{t(orgTypeLabelKey[org.type] || org.type)}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.SLUG)}</dt>
                <dd className="text-sm text-carbon font-mono">{org.slug}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.CONTACT_EMAIL)}</dt>
                <dd className="text-sm text-carbon">{org.contact_email}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.CONTACT_PHONE)}</dt>
                <dd className="text-sm text-carbon">{org.contact_phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(COMMON.STATUS)}</dt>
                <dd>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      org.is_active ? 'bg-verdant/10 text-verdant' : 'bg-smudged-lips/10 text-smudged-lips'
                    }`}
                  >
                    {org.is_active ? t(COMMON.ACTIVE) : t(COMMON.INACTIVE)}
                  </span>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Address */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(ORGANIZATION.ADDRESS)}</CardTitle>
          </CardHeader>
          <CardContent>
            {org.address ? (
              <dl className="space-y-3">
                {org.address.line1 && (
                  <div>
                    <dt className="text-xs text-carbon/50">{t(ORGANIZATION.ADDRESS_LINE1)}</dt>
                    <dd className="text-sm text-carbon">{org.address.line1}</dd>
                  </div>
                )}
                {org.address.line2 && (
                  <div>
                    <dt className="text-xs text-carbon/50">{t(ORGANIZATION.ADDRESS_LINE2)}</dt>
                    <dd className="text-sm text-carbon">{org.address.line2}</dd>
                  </div>
                )}
                {org.address.city && (
                  <div>
                    <dt className="text-xs text-carbon/50">{t(ORGANIZATION.CITY)}</dt>
                    <dd className="text-sm text-carbon">{org.address.city}</dd>
                  </div>
                )}
                {org.address.province && (
                  <div>
                    <dt className="text-xs text-carbon/50">{t(ORGANIZATION.PROVINCE)}</dt>
                    <dd className="text-sm text-carbon">{org.address.province}</dd>
                  </div>
                )}
                {org.address.country && (
                  <div>
                    <dt className="text-xs text-carbon/50">{t(ORGANIZATION.COUNTRY)}</dt>
                    <dd className="text-sm text-carbon">{org.address.country}</dd>
                  </div>
                )}
                {org.address.postal_code && (
                  <div>
                    <dt className="text-xs text-carbon/50">{t(ORGANIZATION.POSTAL_CODE)}</dt>
                    <dd className="text-sm text-carbon">{org.address.postal_code}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm text-carbon/50">{t(COMMON.NO_DATA)}</p>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdSettingsIcon className="h-4 w-4" />
              {t(ORGANIZATION.SETTINGS)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.DEFAULT_LANGUAGE)}</dt>
                <dd className="text-sm text-carbon">{org.settings?.default_language || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.DEFAULT_TIMEZONE)}</dt>
                <dd className="text-sm text-carbon">{org.settings?.default_timezone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-carbon/50">{t(ORGANIZATION.DEFAULT_CURRENCY)}</dt>
                <dd className="text-sm text-carbon">{org.settings?.default_currency || '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Clinics Summary */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdBusiness className="h-4 w-4" />
              {t(ORGANIZATION.CLINIC_COUNT)} ({org.clinics?.length || org.clinic_count || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/60 mb-4">
              {t(ORGANIZATION.CLINIC_COUNT)}: {org.clinics?.length || org.clinic_count || 0}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/my-organization/clinics')}
            >
              <MdBusiness className="h-3.5 w-3.5 mr-1.5" />
              {t(COMMON.VIEW)}
            </Button>
          </CardContent>
        </Card>

        {/* Members Summary */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPerson className="h-4 w-4" />
              {t(ORGANIZATION.ORG_MEMBERS)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-carbon/60 mb-4">
              {t(ORGANIZATION.TOTAL_MEMBERS)}: {membersData?.total || 0}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/my-organization/members')}
            >
              <MdPerson className="h-3.5 w-3.5 mr-1.5" />
              {t(COMMON.VIEW)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
