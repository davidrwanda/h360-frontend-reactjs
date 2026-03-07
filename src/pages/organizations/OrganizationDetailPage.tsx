import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrganization, useOrgMembers, useInviteOrgMember, useResendOrgInvitation } from '@/hooks/useOrganizations';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Card, CardHeader, CardTitle, CardContent, Loading, Input, Modal } from '@/components/ui';
import { MdEdit, MdArrowBack, MdBusiness, MdPerson, MdSend, MdRefresh } from 'react-icons/md';

const orgTypeLabelKey: Record<string, string> = {
  single_clinic: 'org.typeSingleClinic',
  multi_branch: 'org.typeMultiBranch',
  health_network: 'org.typeHealthNetwork',
};

export const OrganizationDetailPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { success: showSuccess, error: showError } = useToastStore();

  const { data: org, isLoading, error } = useOrganization(id || '');

  // Owner members
  const { data: ownerMembers, isLoading: ownersLoading } = useOrgMembers(
    id || '',
    { role: 'ORG_OWNER', limit: 5 },
    { enabled: !!id }
  );
  const inviteMutation = useInviteOrgMember();
  const resendMutation = useResendOrgInvitation();

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const owner = ownerMembers?.data?.[0];

  const handleInviteOwner = async () => {
    if (!id || !inviteEmail) return;
    try {
      await inviteMutation.mutateAsync({
        orgId: id,
        data: { email: inviteEmail, role: 'ORG_OWNER' },
      });
      showSuccess(t(ORGANIZATION.OWNER_INVITED));
      setShowInviteModal(false);
      setInviteEmail('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(ORGANIZATION.FAILED_RESEND);
      showError(msg);
    }
  };

  const handleResendInvitation = async () => {
    if (!id || !owner) return;
    try {
      await resendMutation.mutateAsync({ orgId: id, memberId: owner.id });
      showSuccess(t(ORGANIZATION.INVITATION_RESENT));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(ORGANIZATION.FAILED_RESEND);
      showError(msg);
    }
  };

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/organizations')}>
            <MdArrowBack className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-semibold text-azure-dragon">{org.name}</h1>
            <p className="text-sm text-carbon/60">{t(ORGANIZATION.ORGANIZATION_DETAILS)}</p>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={() => navigate(`/organizations/${id}/edit`)}>
          <MdEdit className="h-4 w-4 mr-2" />
          {t(COMMON.EDIT)}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Info */}
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

        {/* Organization Owner */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MdPerson className="h-4 w-4" />
              {t(ORGANIZATION.ASSIGN_OWNER)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ownersLoading ? (
              <div className="h-16 bg-carbon/5 rounded-md animate-pulse" />
            ) : owner ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-azure-dragon/10 flex items-center justify-center">
                      <MdPerson className="h-5 w-5 text-azure-dragon" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-carbon">
                        {owner.first_name && owner.last_name
                          ? `${owner.first_name} ${owner.last_name}`
                          : owner.email}
                      </p>
                      <p className="text-xs text-carbon/60">{owner.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      owner.status === 'active'
                        ? 'bg-verdant/10 text-verdant'
                        : owner.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-smudged-lips/10 text-smudged-lips'
                    }`}
                  >
                    {owner.status === 'active'
                      ? t(ORGANIZATION.OWNER_STATUS_ACTIVE)
                      : owner.status === 'pending'
                        ? t(ORGANIZATION.OWNER_STATUS_PENDING)
                        : t(ORGANIZATION.OWNER_STATUS_SUSPENDED)}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 pt-2 border-t border-carbon/10">
                  {owner.joined_at && (
                    <div>
                      <dt className="text-xs text-carbon/50">{t(ORGANIZATION.OWNER_JOINED)}</dt>
                      <dd className="text-xs text-carbon">{new Date(owner.joined_at).toLocaleDateString()}</dd>
                    </div>
                  )}
                  {owner.invited_at && (
                    <div>
                      <dt className="text-xs text-carbon/50">{t(ORGANIZATION.OWNER_INVITED_AT)}</dt>
                      <dd className="text-xs text-carbon">{new Date(owner.invited_at).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
                {owner.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendInvitation}
                    disabled={resendMutation.isPending}
                    className="mt-2"
                  >
                    <MdRefresh className="h-3.5 w-3.5 mr-1.5" />
                    {resendMutation.isPending ? t(COMMON.SAVING) : t(ORGANIZATION.RESEND_INVITATION)}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <MdPerson className="h-10 w-10 text-carbon/20 mx-auto mb-2" />
                <p className="text-sm text-carbon/60 mb-1">{t(ORGANIZATION.NO_OWNER_ASSIGNED)}</p>
                <p className="text-xs text-carbon/40 mb-4">{t(ORGANIZATION.NO_OWNER_HINT)}</p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowInviteModal(true)}
                >
                  <MdSend className="h-3.5 w-3.5 mr-1.5" />
                  {t(ORGANIZATION.INVITE_OWNER)}
                </Button>
              </div>
            )}
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
              <p className="text-sm text-carbon/50">No address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>{t(ORGANIZATION.SETTINGS)}</CardTitle>
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

        {/* Clinics */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>
              {t(ORGANIZATION.CLINIC_COUNT)} ({org.clinics?.length || org.clinic_count || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {org.clinics && org.clinics.length > 0 ? (
              <div className="space-y-2">
                {org.clinics.map((clinic) => (
                  <div
                    key={clinic.id}
                    className="flex items-center justify-between rounded-md border border-carbon/10 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <MdBusiness className="h-4 w-4 text-carbon/40" />
                      <span className="text-sm font-medium text-carbon">{clinic.facility_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {clinic.plan_name && (
                        <span className="text-xs text-carbon/50">{clinic.plan_name}</span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          clinic.is_active ? 'bg-verdant/10 text-verdant' : 'bg-smudged-lips/10 text-smudged-lips'
                        }`}
                      >
                        {clinic.is_active ? t(COMMON.ACTIVE) : t(COMMON.INACTIVE)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-carbon/50">{t(COMMON.NO_DATA)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Invite Owner Modal */}
      {showInviteModal && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => { setShowInviteModal(false); setInviteEmail(''); }}
          title={t(ORGANIZATION.INVITE_OWNER)}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-carbon/60">
              {t(ORGANIZATION.OWNER_INVITE_DESCRIPTION)}
            </p>
            <Input
              label={t(ORGANIZATION.OWNER_EMAIL)}
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="owner@organization.com"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowInviteModal(false); setInviteEmail(''); }}
              >
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                onClick={handleInviteOwner}
                disabled={!inviteEmail || inviteMutation.isPending}
              >
                <MdSend className="h-3.5 w-3.5 mr-1.5" />
                {inviteMutation.isPending ? t(COMMON.SAVING) : t(ORGANIZATION.INVITE_OWNER)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
