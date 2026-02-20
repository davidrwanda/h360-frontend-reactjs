import { useNavigate } from 'react-router-dom';
import { CreateClinicWithAdminForm } from '@/components/clinics/CreateClinicWithAdminForm';
import { useTranslation, CLINIC } from '@/i18n';

export const CreateClinicPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to clinics list after successful creation
    navigate('/clinics');
  };

  const handleCancel = () => {
    navigate('/clinics');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-2">
          {t(CLINIC.CREATE_NEW_CLINIC)}
        </h1>
        <p className="text-sm text-carbon/60">
          {t(CLINIC.CREATE_CLINIC_DESC)}
        </p>
      </div>

      <CreateClinicWithAdminForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};
