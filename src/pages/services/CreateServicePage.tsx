import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation, SERVICE } from '@/i18n';
import { CreateServiceForm } from '@/components/services/CreateServiceForm';
import { Loading } from '@/components/ui';

export const CreateServicePage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();
  const { t } = useTranslation();

  // Check if user can create services (only managers and admins)
  const normalizedRole = role?.toUpperCase();
  const canCreate = normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(SERVICE.ACCESS_DENIED)}</h1>
          <p className="text-body text-carbon/70">
            {t(SERVICE.ACCESS_DENIED_CREATE)}
          </p>
        </div>
      </div>
    );
  }

  // Get clinic_id from user object (check both direct and nested locations)
  const clinicId = user?.clinic_id || user?.employee?.clinic_id;

  if (!clinicId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(SERVICE.CLINIC_REQUIRED_PAGE)}</h1>
          <p className="text-body text-carbon/70">
            {t(SERVICE.CLINIC_REQUIRED_DESC)}
          </p>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/services');
  };

  const handleCancel = () => {
    navigate('/services');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-2">
          {t(SERVICE.CREATE_NEW_SERVICE)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(SERVICE.ADD_SERVICE_DESC)}
        </p>
      </div>

      <CreateServiceForm
        clinicId={clinicId}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
