import { useNavigate, useParams } from 'react-router-dom';
import { useClinic } from '@/hooks/useClinics';
import { CreateClinicAdminForm } from '@/components/users/CreateClinicAdminForm';
import { Loading } from '@/components/ui';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '@/components/ui';

export const CreateClinicAdminPage = () => {
  const navigate = useNavigate();
  const { id: clinicId } = useParams<{ id: string }>();
  const { data: clinic, isLoading } = useClinic(clinicId);

  const handleSuccess = () => {
    // Navigate back to users page or clinic detail
    if (clinicId) {
      navigate(`/users`);
    } else {
      navigate('/users');
    }
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

  if (!clinicId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-h2 text-smudged-lips mb-4">Invalid Clinic</h1>
          <p className="text-body text-carbon/70 mb-4">
            Clinic ID is missing from the URL.
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
            Create Clinic Admin
          </h1>
          <p className="text-sm text-carbon/60">
            {clinic
              ? `Add a new administrator for ${clinic.name}`
              : 'Add a new clinic administrator'}
          </p>
        </div>
      </div>

      <CreateClinicAdminForm
        clinicId={clinicId}
        clinicName={clinic?.name}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
