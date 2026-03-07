import { useNavigate } from 'react-router-dom';
import { CreateOrganizationForm } from '@/components/organizations/CreateOrganizationForm';
import { useTranslation, ORGANIZATION } from '@/i18n';

export const CreateOrganizationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-2">
          {t(ORGANIZATION.CREATE_ORGANIZATION)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(ORGANIZATION.MANAGE_ORGANIZATIONS)}
        </p>
      </div>

      <CreateOrganizationForm
        onSuccess={() => navigate('/organizations')}
        onCancel={() => navigate('/organizations')}
      />
    </div>
  );
};
