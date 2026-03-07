import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOrganization, useOrgMembers, useInviteOrgMember, useRemoveOrgMember, useResendOrgInvitation } from '@/hooks/useOrganizations';
import { useToastStore } from '@/store/toastStore';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import { Button, Card, CardHeader, CardTitle, CardContent, Loading, Input, Select, Modal } from '@/components/ui';
import { MdPersonAdd, MdDelete, MdRefresh, MdPerson, MdArrowBack, MdSend, MdBusiness } from 'react-icons/md';
import type { OrgMemberRole } from '@/types/organization';

const statusBadgeClasses: Record<string, string> = {
  active: 'bg-verdant/10 text-verdant',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-smudged-lips/10 text-smudged-lips',
};

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'ORG_OWNER', label: 'Org Owner' },
];

export const MyOrgMembersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToastStore();

  const orgId = user?.organization_id || user?.employee?.organization_id || '';

  // State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgMemberRole>('ADMIN');
  const [inviteClinicIds, setInviteClinicIds] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; email: string } | null>(null);

  // Hooks
  const { data: orgData } = useOrganization(orgId);
  const { data, isLoading, error } = useOrgMembers(orgId, { limit: 50 });
  const inviteMutation = useInviteOrgMember();
  const removeMutation = useRemoveOrgMember();
  const resendMutation = useResendOrgInvitation();

  const members = data?.data || [];

  const orgClinics = orgData?.clinics || [];
  const needsClinic = inviteRole !== 'ORG_OWNER';

  const toggleClinicId = (clinicId: string) => {
    setInviteClinicIds((prev) =>
      prev.includes(clinicId) ? prev.filter((id) => id !== clinicId) : [...prev, clinicId]
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    if (needsClinic && inviteClinicIds.length === 0) return;
    try {
      await inviteMutation.mutateAsync({
        orgId,
        data: {
          email: inviteEmail.trim(),
          role: inviteRole,
          clinic_ids: needsClinic ? inviteClinicIds : undefined,
          message: inviteMessage.trim() || undefined,
        },
      });
      showSuccess(t(ORGANIZATION.MEMBER_INVITED));
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('ADMIN');
      setInviteClinicIds([]);
      setInviteMessage('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(ORGANIZATION.FAILED_INVITE);
      showError(msg);
    }
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    try {
      await removeMutation.mutateAsync({ orgId, memberId: memberToRemove.id });
      showSuccess(t(ORGANIZATION.MEMBER_REMOVED));
      setMemberToRemove(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(ORGANIZATION.FAILED_REMOVE_MEMBER);
      showError(msg);
    }
  };

  const handleResend = async (memberId: string) => {
    try {
      await resendMutation.mutateAsync({ orgId, memberId });
      showSuccess(t(ORGANIZATION.INVITATION_RESENT));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t(ORGANIZATION.FAILED_RESEND);
      showError(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/my-organization')}
        className="mb-4"
      >
        <MdArrowBack className="h-4 w-4 mr-1" />
        {t(COMMON.BACK)}
      </Button>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            {t(ORGANIZATION.ORG_MEMBERS)}
          </h1>
          <p className="text-sm text-carbon/60">
            {t(ORGANIZATION.ORG_MEMBERS_DESC)}
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowInviteModal(true)}>
          <MdPersonAdd className="h-4 w-4 mr-2" />
          {t(ORGANIZATION.INVITE_MEMBER)}
        </Button>
      </div>

      {/* Members Table */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>
            {t(ORGANIZATION.ORG_MEMBERS)} ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-3.5 py-2.5">
              <p className="text-xs text-smudged-lips">Failed to load members.</p>
            </div>
          )}

          {isLoading ? (
            <Loading />
          ) : members.length === 0 ? (
            <div className="py-12 text-center">
              <MdPerson className="h-12 w-12 text-carbon/20 mx-auto mb-4" />
              <p className="text-sm text-carbon/60 mb-2">{t(ORGANIZATION.NO_MEMBERS)}</p>
              <p className="text-xs text-carbon/40">{t(ORGANIZATION.NO_MEMBERS_HINT)}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-carbon/10 text-left">
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Name</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">Email</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">{t(ORGANIZATION.MEMBER_ROLE)}</th>
                    <th className="pb-3 pr-4 font-medium text-carbon/60">{t(ORGANIZATION.MEMBER_STATUS)}</th>
                    <th className="pb-3 font-medium text-carbon/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-b border-carbon/5 hover:bg-carbon/2">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-azure-dragon/10 text-azure-dragon">
                            <MdPerson className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-carbon">
                            {member.first_name || member.last_name
                              ? `${member.first_name} ${member.last_name}`.trim()
                              : member.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-carbon/70">{member.email}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs font-medium text-carbon/80">{member.role}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusBadgeClasses[member.status] || 'bg-carbon/10 text-carbon'
                          }`}
                        >
                          {member.status === 'active'
                            ? t(COMMON.ACTIVE)
                            : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {member.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResend(member.id)}
                              disabled={resendMutation.isPending}
                              title={t(ORGANIZATION.RESEND_INVITATION)}
                            >
                              <MdRefresh className="h-4 w-4 text-azure-dragon" />
                            </Button>
                          )}
                          {member.role !== 'ORG_OWNER' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMemberToRemove({ id: member.id, email: member.email })}
                              title="Remove"
                            >
                              <MdDelete className="h-4 w-4 text-smudged-lips" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title={t(ORGANIZATION.INVITE_MEMBER)}
          size="md"
        >
          <div className="space-y-4">
            <Input
              label={t(ORGANIZATION.OWNER_EMAIL)}
              type="email"
              placeholder="email@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <Select
              label={t(ORGANIZATION.MEMBER_ROLE)}
              value={inviteRole}
              onChange={(e) => {
                setInviteRole(e.target.value as OrgMemberRole);
                // Clear clinic selection when switching to ORG_OWNER
                if (e.target.value === 'ORG_OWNER') setInviteClinicIds([]);
              }}
              options={roleOptions}
            />
            {needsClinic && (
              <div>
                <label className="mb-1 block text-sm font-medium text-carbon">
                  {t(ORGANIZATION.ORG_CLINICS)} *
                </label>
                {orgClinics.length === 0 ? (
                  <p className="text-xs text-carbon/50">{t(ORGANIZATION.NO_CLINICS)}</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto rounded-md border border-carbon/20 p-2">
                    {orgClinics.map((clinic) => (
                      <label
                        key={clinic.id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-carbon/5 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={inviteClinicIds.includes(clinic.id)}
                          onChange={() => toggleClinicId(clinic.id)}
                          className="h-4 w-4 rounded border-carbon/30 text-azure-dragon focus:ring-azure-dragon/30"
                        />
                        <MdBusiness className="h-3.5 w-3.5 text-carbon/40 flex-shrink-0" />
                        <span className="text-sm text-carbon">{clinic.facility_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {inviteClinicIds.length === 0 && (
                  <p className="mt-1 text-xs text-smudged-lips">
                    {t(ORGANIZATION.CLINIC_REQUIRED)}
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-carbon">
                Message (optional)
              </label>
              <textarea
                className="w-full rounded-md border border-carbon/20 px-3 py-2 text-sm focus:border-azure-dragon focus:outline-none focus:ring-1 focus:ring-azure-dragon"
                rows={3}
                placeholder="Add a personal message to the invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setShowInviteModal(false)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || (needsClinic && inviteClinicIds.length === 0) || inviteMutation.isPending}
              >
                {inviteMutation.isPending ? (
                  t(COMMON.SAVING)
                ) : (
                  <>
                    <MdSend className="h-4 w-4 mr-2" />
                    {t(ORGANIZATION.INVITE_MEMBER)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove Member Confirmation Modal */}
      {memberToRemove && (
        <Modal
          isOpen={!!memberToRemove}
          onClose={() => setMemberToRemove(null)}
          title={t(ORGANIZATION.CONFIRM_REMOVE_MEMBER)}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-carbon/70">
              {t(ORGANIZATION.CONFIRM_REMOVE_MEMBER_MSG)}
            </p>
            <p className="text-sm font-medium text-carbon">{memberToRemove.email}</p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={() => setMemberToRemove(null)}>
                {t(COMMON.CANCEL)}
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleRemoveConfirm}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? t(COMMON.SAVING) : t(ORGANIZATION.CONFIRM_REMOVE_MEMBER)}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
