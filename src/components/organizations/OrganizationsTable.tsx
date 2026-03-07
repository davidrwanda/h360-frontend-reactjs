import { MdEdit, MdVisibility, MdBlock, MdCheckCircle } from 'react-icons/md';
import { Button, Loading } from '@/components/ui';
import { useTranslation, ORGANIZATION, COMMON } from '@/i18n';
import type { Organization } from '@/types/organization';

interface OrganizationsTableProps {
  organizations: Organization[];
  isLoading: boolean;
  onView: (org: Organization) => void;
  onEdit: (org: Organization) => void;
  onDeactivate: (org: Organization) => void;
}

const orgTypeLabelKey: Record<string, string> = {
  single_clinic: 'org.typeSingleClinic',
  multi_branch: 'org.typeMultiBranch',
  health_network: 'org.typeHealthNetwork',
};

export const OrganizationsTable = ({
  organizations,
  isLoading,
  onView,
  onEdit,
  onDeactivate,
}: OrganizationsTableProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-carbon/60">{t(COMMON.NO_DATA)}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-carbon/10 text-left">
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(ORGANIZATION.NAME)}</th>
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(ORGANIZATION.TYPE)}</th>
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(ORGANIZATION.CONTACT_EMAIL)}</th>
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(ORGANIZATION.CONTACT_PHONE)}</th>
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(ORGANIZATION.CLINIC_COUNT)}</th>
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(COMMON.STATUS)}</th>
            <th className="px-3 py-2.5 font-medium text-carbon/70">{t(COMMON.ACTIONS)}</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr
              key={org.id}
              className="border-b border-carbon/5 hover:bg-white-smoke/50 transition-colors"
            >
              <td className="px-3 py-2.5 font-medium text-carbon">{org.name}</td>
              <td className="px-3 py-2.5 text-carbon/70">
                {t(orgTypeLabelKey[org.type] || org.type)}
              </td>
              <td className="px-3 py-2.5 text-carbon/70">{org.contact_email}</td>
              <td className="px-3 py-2.5 text-carbon/70">{org.contact_phone}</td>
              <td className="px-3 py-2.5 text-carbon/70">{org.clinic_count ?? 0}</td>
              <td className="px-3 py-2.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    org.is_active
                      ? 'bg-verdant/10 text-verdant'
                      : 'bg-smudged-lips/10 text-smudged-lips'
                  }`}
                >
                  {org.is_active ? t(COMMON.ACTIVE) : t(COMMON.INACTIVE)}
                </span>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onView(org)} title={t(COMMON.VIEW)}>
                    <MdVisibility className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(org)} title={t(COMMON.EDIT)}>
                    <MdEdit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeactivate(org)}
                    title={org.is_active ? t(ORGANIZATION.DEACTIVATE) : t(COMMON.ACTIVATE)}
                  >
                    {org.is_active ? (
                      <MdBlock className="h-4 w-4 text-smudged-lips" />
                    ) : (
                      <MdCheckCircle className="h-4 w-4 text-verdant" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
