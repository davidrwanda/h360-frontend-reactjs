import { useNavigate, useParams } from 'react-router-dom';
import { useClinic } from '@/hooks/useClinics';
import { useUser } from '@/hooks/useUsers';
import { EditClinicAdminForm } from '@/components/users/EditClinicAdminForm';
import { Loading, Button } from '@/components/ui';
import { MdArrowBack } from 'react-icons/md';

export const EditClinicAdminPage = () => {
  const navigate = useNavigate();
  const { id: clinicId, adminId } = useParams<{ id: string; adminId: string }>();
  const { data: clinic, isLoading: clinicLoading } = useClinic(clinicId);
  const { data: admin, isLoading: adminLoading } = useUser(
    adminId || '',
    { enabled: !!adminId }
  );

  const isLoading = clinicLoading || adminLoading;

  const handleSuccess = () => {
    // Navigate back to users page
    navigate('/users');
  };

  const handleCancel = () => {
    navigate('/users');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!clinicId || !adminId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">Invalid Parameters</h1>
          <p className="text-body text-carbon/70 mb-4">
            Clinic ID or Admin ID is missing from the URL.
          </p>
          <Button variant="outline" onClick={() => navigate('/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">Clinic Admin Not Found</h1>
          <p className="text-body text-carbon/70 mb-4">
            The clinic admin you're looking for doesn't exist.
          </p>
          <Button variant="outline" onClick={() => navigate('/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/users')}
          className="h-8 w-8 p-0"
        >
          <MdArrowBack className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            Edit Clinic Admin
          </h1>
          <p className="text-sm text-carbon/60">
            {clinic
              ? `Update administrator information for ${clinic.name}`
              : 'Update clinic administrator information'}
          </p>
        </div>
      </div>

      <EditClinicAdminForm
        adminId={adminId}
        admin={admin}
        clinicName={clinic?.name}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
