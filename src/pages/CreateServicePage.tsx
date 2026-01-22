import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { CreateServiceForm } from '@/components/services/CreateServiceForm';
import { Loading } from '@/components/ui';

export const CreateServicePage = () => {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAuth();

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
          <h1 className="text-h2 text-smudged-lips mb-4">Access Denied</h1>
          <p className="text-body text-carbon/70">
            Only Managers and Admins can create services.
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
          <h1 className="text-h2 text-smudged-lips mb-4">Clinic Required</h1>
          <p className="text-body text-carbon/70">
            You must be associated with a clinic to create services.
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
          Create New Service
        </h1>
        <p className="text-sm text-carbon/60">
          Add a new service to your clinic
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
