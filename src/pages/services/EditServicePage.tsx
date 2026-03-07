import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useService } from '@/hooks/useServices';
import { useTranslation, SERVICE } from '@/i18n';
import { EditServiceForm } from '@/components/services/EditServiceForm';
import { Loading } from '@/components/ui';

export const EditServicePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { role, isLoading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { data: service, isLoading: serviceLoading } = useService(id || '', !!id);

  // Check if user can edit services (only managers and admins)
  const normalizedRole = role?.toUpperCase();
  const canEdit = normalizedRole === 'MANAGER' || normalizedRole === 'ADMIN';

  if (authLoading || serviceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(SERVICE.ACCESS_DENIED)}</h1>
          <p className="text-body text-carbon/70">
            {t(SERVICE.ACCESS_DENIED_EDIT)}
          </p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">{t(SERVICE.SERVICE_NOT_FOUND)}</h1>
          <p className="text-body text-carbon/70">
            {t(SERVICE.SERVICE_NOT_FOUND_DESC)}
          </p>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate(`/services/${service.service_id}`);
  };

  const handleCancel = () => {
    navigate(`/services/${service.service_id}`);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-2">
          {t(SERVICE.EDIT_SERVICE)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(SERVICE.UPDATE_SERVICE_INFO)}
        </p>
      </div>

      <EditServiceForm
        service={service}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
