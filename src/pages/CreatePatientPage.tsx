import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClinic } from '@/hooks/useClinics';
import { CreatePatientForm } from '@/components/patients';
import { Loading, Button } from '@/components/ui';
import { MdArrowBack } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';

export const CreatePatientPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, role } = useAuth();
  
  // Get clinic_id from URL params or user's clinic_id for clinic managers
  const normalizedRole = role?.toUpperCase();
  const isClinicManager = normalizedRole === 'MANAGER' && user?.clinic_id;
  const clinicIdFromUrl = searchParams.get('clinic_id');
  const clinicId = clinicIdFromUrl || (isClinicManager ? user?.clinic_id : undefined);
  
  const { data: clinic, isLoading } = useClinic(clinicId || undefined);

  const handleSuccess = () => {
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
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
            Clinic ID is missing. Please select a clinic first.
          </p>
          <Button variant="outline" onClick={() => navigate('/patients')}>
            Back to Patients
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
          onClick={() => navigate('/patients')}
          className="h-8 w-8 p-0"
        >
          <MdArrowBack className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-heading font-semibold text-azure-dragon mb-1">
            Create Patient
          </h1>
          <p className="text-sm text-carbon/60">
            {clinic
              ? `Add a new patient for ${clinic.name}`
              : 'Add a new patient'}
          </p>
        </div>
      </div>

      <CreatePatientForm
        clinicId={clinicId}
        clinicName={clinic?.name}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
