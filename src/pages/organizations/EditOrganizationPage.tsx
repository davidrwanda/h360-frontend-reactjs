import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useOrganization } from '@/hooks/useOrganizations';
import { useAuth } from '@/hooks/useAuth';
import { EditOrganizationForm } from '@/components/organizations/EditOrganizationForm';
import { useTranslation, ORGANIZATION } from '@/i18n';
import { Loading } from '@/components/ui';

export const EditOrganizationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Use route param if available, otherwise use ORG_OWNER's own org ID
  const orgId = id || user?.organization_id || user?.employee?.organization_id || '';
  const isOrgOwnerRoute = location.pathname.startsWith('/my-organization');

  const { data: organization, isLoading, error } = useOrganization(orgId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-md bg-smudged-lips/10 border border-smudged-lips/25 px-4 py-3">
          <p className="text-sm text-smudged-lips">{t(ORGANIZATION.FAILED_LOAD)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-2">
          {t(ORGANIZATION.EDIT_ORGANIZATION)}
        </h1>
        <p className="text-sm text-carbon/60">{organization.name}</p>
      </div>

      <EditOrganizationForm
        organization={organization}
        onSuccess={() => navigate(isOrgOwnerRoute ? '/my-organization' : `/organizations/${id}`)}
        onCancel={() => navigate(isOrgOwnerRoute ? '/my-organization' : `/organizations/${id}`)}
      />
    </div>
  );
};
