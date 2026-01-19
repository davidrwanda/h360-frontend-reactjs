import { useNavigate } from 'react-router-dom';
import { CreateClinicWithAdminForm } from '@/components/clinics/CreateClinicWithAdminForm';

export const CreateClinicPage = () => {
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
          Create New Clinic
        </h1>
        <p className="text-sm text-carbon/60">
          Create a clinic and assign an administrator to manage it
        </p>
      </div>

      <CreateClinicWithAdminForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};
